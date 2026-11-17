import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse, Shift, ShiftRequest } from "../types";

export const shiftService = {
  getAll: async (workplaceId?: number): Promise<Shift[]> => {
    const endpoint = workplaceId
      ? `${API_ENDPOINTS.SHIFTS.LIST}?workplaceId=${workplaceId}`
      : API_ENDPOINTS.SHIFTS.LIST;
    const res = await api.get<ApiResponse<Shift[]>>(endpoint);
    return res.data;
  },

  getById: async (id: number): Promise<Shift> => {
    const res = await api.get<ApiResponse<Shift>>(API_ENDPOINTS.SHIFTS.DETAILS(id));
    return res.data;
  },

  create: async (data: ShiftRequest): Promise<Shift> => {
    const res = await api.post<ApiResponse<Shift>>(API_ENDPOINTS.SHIFTS.CREATE, data);
    return res.data;
  },

  update: async (id: number, data: ShiftRequest): Promise<Shift> => {
    const res = await api.patch<ApiResponse<Shift>>(API_ENDPOINTS.SHIFTS.UPDATE(id), data);
    return res.data;
  },
};
