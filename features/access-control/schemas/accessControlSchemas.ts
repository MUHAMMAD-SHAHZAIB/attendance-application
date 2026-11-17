import { z } from "zod";

export const permissionSchema = z.object({
  code: z
    .string()
    .min(1, "Permission code is required")
    .max(80, "Max 80 characters")
    .regex(/^[A-Za-z][A-Za-z0-9_]*$/, "Must start with a letter and contain only letters, numbers, and underscores")
    .trim(),
  module: z.string().min(1, "Module name is required").max(50, "Max 50 characters").trim(),
  name: z.string().min(1, "Permission name is required").max(150, "Max 150 characters").trim(),
  description: z.string().max(2000, "Max 2000 characters").optional().nullable(),
});

export const roleCreateSchema = z.object({
  name: z.string().min(1, "Role display name is required").max(100, "Max 100 characters").trim(),
  description: z.string().max(2000, "Max 2000 characters").optional().nullable(),
  permissionIds: z.array(z.number().positive()).default([]),
});

export const roleUpdateSchema = z.object({
  name: z.string().min(1, "Role display name is required").max(100, "Max 100 characters").trim(),
  description: z.string().max(2000, "Max 2000 characters").optional().nullable(),
  active: z.boolean(),
  permissionIds: z.array(z.number().positive()).optional(),
});

export const rolePermissionsSchema = z.object({
  permissionIds: z.array(z.number().positive()),
});

export type PermissionFormData = z.infer<typeof permissionSchema>;
export type RoleCreateFormData = z.infer<typeof roleCreateSchema>;
export type RoleUpdateFormData = z.infer<typeof roleUpdateSchema>;
