"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accessControlService } from "../services/accessControlService";
import {
  PermissionRequest,
  PermissionView,
  RoleCreateRequest,
  RolePermissionsRequest,
  RoleUpdateRequest,
  RoleView,
} from "../types";
import {
  permissionSchema,
  roleCreateSchema,
  rolePermissionsSchema,
  roleUpdateSchema,
} from "../schemas/accessControlSchemas";

export const ACCESS_CONTROL_KEYS = {
  all: ["access-control"] as const,
  permissions: () => [...ACCESS_CONTROL_KEYS.all, "permissions"] as const,
  roles: () => [...ACCESS_CONTROL_KEYS.all, "roles"] as const,
};

// 1. Permissions Queries & Mutations
export function usePermissionsQuery() {
  return useQuery<PermissionView[]>({
    queryKey: ACCESS_CONTROL_KEYS.permissions(),
    queryFn: () => accessControlService.getPermissions(),
  });
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PermissionRequest) => {
      const validated = permissionSchema.parse(payload);
      return accessControlService.createPermission(validated as PermissionRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.permissions() });
    },
  });
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: PermissionRequest }) => {
      const validated = permissionSchema.parse(payload);
      return accessControlService.updatePermission(id, validated as PermissionRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.all });
    },
  });
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return accessControlService.deletePermission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.all });
    },
  });
}

// 2. Roles Queries & Mutations
export function useRolesQuery() {
  return useQuery<RoleView[]>({
    queryKey: ACCESS_CONTROL_KEYS.roles(),
    queryFn: () => accessControlService.getRoles(),
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RoleCreateRequest) => {
      const validated = roleCreateSchema.parse(payload);
      return accessControlService.createRole(validated as RoleCreateRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.roles() });
    },
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RoleUpdateRequest }) => {
      const validated = roleUpdateSchema.parse(payload);
      return accessControlService.updateRole(id, validated as RoleUpdateRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.roles() });
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return accessControlService.deleteRole(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.roles() });
    },
  });
}

export function useReplaceRolePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RolePermissionsRequest }) => {
      const validated = rolePermissionsSchema.parse(payload);
      return accessControlService.replaceRolePermissions(id, validated as RolePermissionsRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_KEYS.roles() });
    },
  });
}
