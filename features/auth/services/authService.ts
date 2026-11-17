import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { LoginRequest, LoginResponse, MfaVerifyRequest } from "../types";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  verifyMfa: async (payload: MfaVerifyRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.VERIFY_MFA, payload);
  },

  resetMfa: async (userId: number | string): Promise<{ message: string; username: string }> => {
    return api.post(API_ENDPOINTS.AUTH.RESET_MFA(userId));
  },
};

export function extractSecretFromOtpauth(otpauthUri?: string | null): string | null {
  if (!otpauthUri) return null;
  try {
    const url = new URL(otpauthUri);
    return url.searchParams.get("secret");
  } catch {
    const match = otpauthUri.match(/[?&]secret=([^&]+)/i);
    return match ? match[1] : null;
  }
}
