import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse, Workplace, WorkplaceRequest, WorkplaceBrandingView } from "../types";

export const workplaceService = {
  getAll: async (countryCode?: string): Promise<Workplace[]> => {
    const endpoint = countryCode
      ? `${API_ENDPOINTS.WORKPLACES.LIST}?countryCode=${encodeURIComponent(countryCode)}`
      : API_ENDPOINTS.WORKPLACES.LIST;
    const res = await api.get<ApiResponse<Workplace[]>>(endpoint);
    return res.data;
  },

  getById: async (id: number): Promise<Workplace> => {
    const res = await api.get<ApiResponse<Workplace>>(API_ENDPOINTS.WORKPLACES.DETAILS(id));
    return res.data;
  },

  create: async (data: WorkplaceRequest): Promise<Workplace> => {
    const res = await api.post<ApiResponse<Workplace>>(API_ENDPOINTS.WORKPLACES.CREATE, data);
    return res.data;
  },

  update: async (id: number, data: WorkplaceRequest): Promise<Workplace> => {
    const res = await api.patch<ApiResponse<Workplace>>(API_ENDPOINTS.WORKPLACES.UPDATE(id), data);
    return res.data;
  },

  getBranding: async (id: number): Promise<WorkplaceBrandingView[]> => {
    const res = await api.get<ApiResponse<WorkplaceBrandingView[]>>(
      API_ENDPOINTS.WORKPLACES.BRANDING_LIST(id)
    );
    return res.data;
  },

  saveBranding: async (
    id: number,
    imageType: "header" | "footer" | string,
    imageFile: File
  ): Promise<WorkplaceBrandingView> => {
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    const res = await api.put<ApiResponse<WorkplaceBrandingView>>(
      API_ENDPOINTS.WORKPLACES.BRANDING_SAVE(id, imageType),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  deleteBranding: async (
    id: number,
    imageType: "header" | "footer" | string
  ): Promise<boolean> => {
    const res = await api.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.WORKPLACES.BRANDING_DELETE(id, imageType)
    );
    return res.data;
  },
};
