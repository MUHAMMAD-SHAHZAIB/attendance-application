import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  ApiResponse,
  LeaveRequestView,
  LeaveReviewPayload,
  OvertimeRequestView,
  OvertimeReviewPayload,
} from "../types";

export const leaveService = {
  // Leave Requests
  getLeaveRequests: async (status: string = "pending"): Promise<LeaveRequestView[]> => {
    const endpoint = `${API_ENDPOINTS.LEAVES_OVERTIME.LEAVE_REQUESTS}?status=${encodeURIComponent(status)}`;
    const res = await api.get<ApiResponse<LeaveRequestView[]>>(endpoint);
    return res.data;
  },

  reviewLeave: async (
    leaveId: number,
    payload: LeaveReviewPayload
  ): Promise<LeaveRequestView> => {
    const res = await api.patch<ApiResponse<LeaveRequestView>>(
      API_ENDPOINTS.LEAVES_OVERTIME.REVIEW_LEAVE(leaveId),
      payload
    );
    return res.data;
  },

  // Overtime Requests
  getOvertimeRequests: async (status: string = "pending"): Promise<OvertimeRequestView[]> => {
    const endpoint = `${API_ENDPOINTS.LEAVES_OVERTIME.OVERTIME_REQUESTS}?status=${encodeURIComponent(status)}`;
    const res = await api.get<ApiResponse<OvertimeRequestView[]>>(endpoint);
    return res.data;
  },

  reviewOvertime: async (
    id: number,
    payload: OvertimeReviewPayload
  ): Promise<OvertimeRequestView> => {
    const res = await api.patch<ApiResponse<OvertimeRequestView>>(
      API_ENDPOINTS.LEAVES_OVERTIME.REVIEW_OVERTIME(id),
      payload
    );
    return res.data;
  },
};
