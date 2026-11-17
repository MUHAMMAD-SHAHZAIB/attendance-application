export interface PermissionView {
  id: number;
  code: string;
  module: string;
  name: string;
  description?: string | null;
  assignedRoleCount: number;
}

export interface PermissionRequest {
  code: string;
  module: string;
  name: string;
  description?: string | null;
}

export interface RoleView {
  id: number;
  roleName: string;
  name: string;
  description?: string | null;
  systemRole: boolean;
  active: boolean;
  createdByUserId?: number | null;
  createdByRole?: string | null;
  permissions: PermissionView[];
}

export interface RoleCreateRequest {
  name: string;
  description?: string | null;
  permissionIds: number[];
}

export interface RoleUpdateRequest {
  name: string;
  description?: string | null;
  active: boolean;
  permissionIds?: number[];
}

export interface RolePermissionsRequest {
  permissionIds: number[];
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}
