import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  ApiResponse,
  PermissionRequest,
  PermissionView,
  RoleCreateRequest,
  RolePermissionsRequest,
  RoleUpdateRequest,
  RoleView,
} from "../types";

export const accessControlService = {
  // 1. Permissions
  getPermissions: async (): Promise<PermissionView[]> => {
    const res = await api.get<ApiResponse<PermissionView[]>>(
      API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS
    );
    return res.data || [];
  },

  getPermissionById: async (id: number): Promise<PermissionView> => {
    const res = await api.get<ApiResponse<PermissionView>>(
      API_ENDPOINTS.ACCESS_CONTROL.PERMISSION_DETAILS(id)
    );
    return res.data;
  },

  createPermission: async (payload: PermissionRequest): Promise<PermissionView> => {
    const res = await api.post<ApiResponse<PermissionView>>(
      API_ENDPOINTS.ACCESS_CONTROL.CREATE_PERMISSION,
      payload
    );
    return res.data;
  },

  updatePermission: async (id: number, payload: PermissionRequest): Promise<PermissionView> => {
    const res = await api.patch<ApiResponse<PermissionView>>(
      API_ENDPOINTS.ACCESS_CONTROL.UPDATE_PERMISSION(id),
      payload
    );
    return res.data;
  },

  deletePermission: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACCESS_CONTROL.DELETE_PERMISSION(id));
  },

  // 2. Roles
  getRoles: async (): Promise<RoleView[]> => {
    const res = await api.get<ApiResponse<RoleView[]>>(
      API_ENDPOINTS.ACCESS_CONTROL.ROLES
    );
    return res.data || [];
  },

  getRoleById: async (id: number): Promise<RoleView> => {
    const res = await api.get<ApiResponse<RoleView>>(
      API_ENDPOINTS.ACCESS_CONTROL.ROLE_DETAILS(id)
    );
    return res.data;
  },

  createRole: async (payload: RoleCreateRequest): Promise<RoleView> => {
    const res = await api.post<ApiResponse<RoleView>>(
      API_ENDPOINTS.ACCESS_CONTROL.CREATE_ROLE,
      payload
    );
    return res.data;
  },

  updateRole: async (id: number, payload: RoleUpdateRequest): Promise<RoleView> => {
    const res = await api.patch<ApiResponse<RoleView>>(
      API_ENDPOINTS.ACCESS_CONTROL.UPDATE_ROLE(id),
      payload
    );
    return res.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACCESS_CONTROL.DELETE_ROLE(id));
  },

  replaceRolePermissions: async (id: number, payload: RolePermissionsRequest): Promise<RoleView> => {
    const res = await api.put<ApiResponse<RoleView>>(
      API_ENDPOINTS.ACCESS_CONTROL.REPLACE_ROLE_PERMISSIONS(id),
      payload
    );
    return res.data;
  },
};
