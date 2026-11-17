"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "../services/authService";
import { loginSchema, mfaVerifySchema } from "../schemas/authSchemas";
import { LoginRequest } from "../types";

export function useAuthLogic() {
  const {
    hasHydrated,
    isAuthenticated,
    accessToken,
    user,
    step,
    pendingAuthData,
    error,
    setAuthenticated,
    setPendingMfa,
    resetToLogin,
    logout,
    setError,
  } = useAuthStore();

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // 1. Validate with Zod
      const validation = loginSchema.safeParse(credentials);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Invalid credentials");
      }
      setError(null);
      // 2. Call Service
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      if (data.message === "AUTHENTICATED" && data.accessToken) {
        setAuthenticated(data.accessToken, {
          userId: data.userId,
          username: data.username,
          email: data.email,
          roles: data.roles || [],
        });
      } else if (data.message === "SCAN_QR") {
        setPendingMfa(data, "SCAN_QR");
      } else if (data.message === "MFA_REQUIRED") {
        setPendingMfa(data, "MFA_REQUIRED");
      } else {
        setError("Unexpected response received from authentication server.");
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to login. Please check your credentials.");
    },
  });

  // Verify MFA Mutation
  const verifyMfaMutation = useMutation({
    mutationFn: async (code: string) => {
      // 1. Validate with Zod
      const validation = mfaVerifySchema.safeParse({ code });
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "MFA code must be 6 digits");
      }

      if (!pendingAuthData?.userId) {
        throw new Error("No pending session found. Please log in again.");
      }

      setError(null);
      // 2. Call Service
      return authService.verifyMfa({
        userId: pendingAuthData.userId,
        code,
      });
    },
    onSuccess: (data) => {
      if (data.accessToken) {
        setAuthenticated(data.accessToken, {
          userId: data.userId,
          username: data.username,
          email: data.email,
          roles: data.roles || [],
        });
      } else {
        setError("Authentication succeeded but access token was not received.");
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Invalid verification code. Please try again.");
    },
  });

  const isSubmitting = loginMutation.isPending || verifyMfaMutation.isPending;

  return {
    // State
    hasHydrated,
    isAuthenticated,
    accessToken,
    user,
    step,
    pendingAuthData,
    error,
    isSubmitting,

    // Actions
    login: (credentials: LoginRequest) => loginMutation.mutate(credentials),
    verifyMfa: (code: string) => verifyMfaMutation.mutate(code),
    resetToLogin,
    logout,
    clearError: () => setError(null),
  };
}
