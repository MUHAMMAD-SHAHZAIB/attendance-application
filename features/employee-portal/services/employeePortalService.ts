import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  ApiResponse,
  ApplyLeaveRequest,
  EmployeeAttendanceMonth,
  EmployeeLeaveRequest,
  EmployeeOvertimeRequest,
  EmployeePortalDashboard,
} from "../types";

export const employeePortalService = {
  getDashboard: async (): Promise<EmployeePortalDashboard> => {
    const response = await api.get<ApiResponse<EmployeePortalDashboard>>(API_ENDPOINTS.EMPLOYEE_PORTAL.DASHBOARD);
    return response.data;
  },

  applyLeave: async (payload: ApplyLeaveRequest): Promise<EmployeeLeaveRequest> => {
    const response = await api.post<ApiResponse<EmployeeLeaveRequest>>(
      API_ENDPOINTS.EMPLOYEE_PORTAL.APPLY_LEAVE,
      payload
    );
    return response.data;
  },

  getLeaves: async (status = "all"): Promise<EmployeeLeaveRequest[]> => {
    const query = new URLSearchParams({ status });
    const response = await api.get<ApiResponse<EmployeeLeaveRequest[]>>(
      `${API_ENDPOINTS.EMPLOYEE_PORTAL.OWN_LEAVES}?${query.toString()}`
    );
    return response.data;
  },

  cancelLeave: async (leaveId: number): Promise<EmployeeLeaveRequest> => {
    const response = await api.delete<ApiResponse<EmployeeLeaveRequest>>(
      API_ENDPOINTS.EMPLOYEE_PORTAL.CANCEL_LEAVE(leaveId)
    );
    return response.data;
  },

  getAttendance: async (month: string): Promise<EmployeeAttendanceMonth> => {
    const query = new URLSearchParams({ month });
    const response = await api.get<ApiResponse<EmployeeAttendanceMonth>>(
      `${API_ENDPOINTS.EMPLOYEE_PORTAL.OWN_ATTENDANCE}?${query.toString()}`
    );
    return response.data;
  },

  getOvertime: async (status = "all"): Promise<EmployeeOvertimeRequest[]> => {
    const query = new URLSearchParams({ status });
    const response = await api.get<ApiResponse<EmployeeOvertimeRequest[]>>(
      `${API_ENDPOINTS.EMPLOYEE_PORTAL.OWN_OVERTIME}?${query.toString()}`
    );
    return response.data;
  },
};
