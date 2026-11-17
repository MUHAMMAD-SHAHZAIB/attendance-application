import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const mfaVerifySchema = z.object({
  code: z
    .string()
    .length(6, "MFA code must be exactly 6 digits")
    .regex(/^\d{6}$/, "MFA code must contain only numbers"),
});

export type MfaVerifySchemaType = z.infer<typeof mfaVerifySchema>;
