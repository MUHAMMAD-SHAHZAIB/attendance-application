export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  roles: Role[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface MfaVerifyRequest {
  userId: number;
  code: string;
}

export type AuthStatus = "AUTHENTICATED" | "SCAN_QR" | "MFA_REQUIRED";
export type AuthStep = "LOGIN" | "SCAN_QR" | "MFA_REQUIRED" | "AUTHENTICATED";

export interface LoginResponse {
  message: AuthStatus | string;
  tokenType?: string | null;
  accessToken?: string | null;
  expiresAt?: string | null;
  userId: number;
  username: string;
  email: string;
  roles: Role[];
  otpauthUri?: string | null;
  qrImageBase64?: string | null;
  remainingAttempts?: number | null;
}
