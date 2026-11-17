import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginResponse, AuthStep } from "@/features/auth/types";

interface AuthStoreState {
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  step: AuthStep;
  pendingAuthData: LoginResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPendingMfa: (data: LoginResponse, step: "SCAN_QR" | "MFA_REQUIRED") => void;
  setAuthenticated: (token: string, user: User) => void;
  resetToLogin: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      isAuthenticated: false,
      accessToken: null,
      user: null,
      step: "LOGIN",
      pendingAuthData: null,
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      setPendingMfa: (data, step) =>
        set({
          pendingAuthData: data,
          step,
          isLoading: false,
          error: null,
        }),

      setAuthenticated: (token, user) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("khanhome_access_token", token);
          localStorage.setItem("khanhome_auth_user", JSON.stringify(user));
        }
        set({
          isAuthenticated: true,
          accessToken: token,
          user,
          step: "AUTHENTICATED",
          pendingAuthData: null,
          isLoading: false,
          error: null,
        });
      },

      resetToLogin: () =>
        set((state) => ({
          step: state.isAuthenticated ? "AUTHENTICATED" : "LOGIN",
          pendingAuthData: null,
          error: null,
          isLoading: false,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("khanhome_access_token");
          localStorage.removeItem("khanhome_auth_user");
        }
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          step: "LOGIN",
          pendingAuthData: null,
          isLoading: false,
          error: "Session expired or unauthorized. Please sign in again.",
        });
      },
    }),
    {
      name: "khanhome-auth-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
