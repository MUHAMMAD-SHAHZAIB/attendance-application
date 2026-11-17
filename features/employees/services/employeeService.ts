import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  EmployeeCreatePayload,
  EmployeeDetail,
  EmployeeFilterParams,
  EmployeePage,
  EmployeeUpdatePayload,
  EmployeeView,
  WorkplaceAssignmentView,
} from "../types";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export interface EmployeeDataWrapper {
  employee: EmployeeView;
}

export const employeeService = {
  list: async (params: EmployeeFilterParams = {}): Promise<EmployeePage> => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.workplaceId) query.set("workplaceId", String(params.workplaceId));
    if (params.countryCode) query.set("countryCode", params.countryCode);
    if (params.page) query.set("page", String(params.page));

    const endpoint = `${API_ENDPOINTS.EMPLOYEES.LIST}?${query.toString()}`;
    const res = await api.get<ApiResponse<EmployeePage>>(endpoint);
    return res.data;
  },

  getById: async (id: number): Promise<EmployeeView> => {
    const res = await api.get<ApiResponse<EmployeeDataWrapper>>(API_ENDPOINTS.EMPLOYEES.DETAILS(id));
    return res.data.employee;
  },

  getDetailById: async (id: number): Promise<EmployeeDetail> => {
    const res = await api.get<ApiResponse<EmployeeDetail>>(API_ENDPOINTS.EMPLOYEES.DETAILS(id));
    return res.data;
  },

  create: async (payload: EmployeeCreatePayload): Promise<EmployeeView> => {
    const res = await api.post<ApiResponse<EmployeeDataWrapper>>(API_ENDPOINTS.EMPLOYEES.CREATE, payload);
    return res.data.employee;
  },

  update: async (id: number, payload: EmployeeUpdatePayload): Promise<EmployeeView> => {
    const res = await api.patch<ApiResponse<EmployeeDataWrapper>>(API_ENDPOINTS.EMPLOYEES.UPDATE(id), payload);
    return res.data.employee;
  },

  changeStatus: async (id: number, status: "active" | "inactive"): Promise<EmployeeView> => {
    const res = await api.patch<ApiResponse<EmployeeDataWrapper>>(API_ENDPOINTS.EMPLOYEES.STATUS(id), {
      status,
    });
    return res.data.employee;
  },

  getWorkplaceAssignments: async (id: number): Promise<WorkplaceAssignmentView[]> => {
    const res = await api.get<ApiResponse<WorkplaceAssignmentView[]>>(API_ENDPOINTS.EMPLOYEES.ASSIGNMENTS(id));
    return res.data;
  },

  uploadPhoto: async (id: number, file: File): Promise<EmployeeView> => {
    const formData = new FormData();
    formData.append("photoFile", file);
    const res = await api.post<ApiResponse<EmployeeDataWrapper>>(API_ENDPOINTS.EMPLOYEE_PHOTOS.UPLOAD(id), formData);
    return res.data.employee;
  },

  deletePhoto: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.EMPLOYEE_PHOTOS.DELETE(id));
  },

  getWorkPatterns: async (): Promise<{ id: number; name: string; code: string }[]> => {
    const res = await api.get<ApiResponse<{ id: number; name: string; code: string }[]>>(
      API_ENDPOINTS.SCHEDULES.WORK_PATTERNS
    );
    return res.data || [];
  },
};
