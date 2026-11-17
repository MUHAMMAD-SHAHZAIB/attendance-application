import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse, Department, DepartmentRequest } from "../types";

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const res = await api.get<ApiResponse<Department[]>>(API_ENDPOINTS.DEPARTMENTS.LIST);
    return res.data;
  },

  create: async (data: DepartmentRequest): Promise<Department> => {
    const res = await api.post<ApiResponse<Department>>(API_ENDPOINTS.DEPARTMENTS.CREATE, data);
    return res.data;
  },

  update: async (id: number, data: DepartmentRequest): Promise<Department> => {
    const res = await api.patch<ApiResponse<Department>>(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data);
    return res.data;
  },
};
