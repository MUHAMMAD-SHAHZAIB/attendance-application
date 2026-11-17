import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  AdminDayUpsertRequest,
  AttendanceCorrectionRequest,
  AttendanceDashboard,
  AttendanceEntry,
  AttendanceFilterParams,
  AttendancePage,
  BulkAbsencePayRequest,
  BulkAbsencePayResult,
  PunchHistory,
} from "../types";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export const attendanceService = {
  getDashboard: async (): Promise<AttendanceDashboard> => {
    const res = await api.get<ApiResponse<AttendanceDashboard>>(API_ENDPOINTS.ATTENDANCE.DASHBOARD_COUNTERS);
    return res.data;
  },

  getRecords: async (params: AttendanceFilterParams = {}): Promise<AttendancePage> => {
    const query = new URLSearchParams();
    if (params.employeeId) query.set("employeeId", params.employeeId);
    if (params.search) query.set("search", params.search);
    if (params.workplaceId) query.set("workplaceId", String(params.workplaceId));
    if (params.departmentId) query.set("departmentId", String(params.departmentId));
    if (params.countryCode) query.set("countryCode", params.countryCode);
    if (params.dateFilter) query.set("dateFilter", params.dateFilter);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.recordStatus && params.recordStatus !== "all") query.set("recordStatus", params.recordStatus);
    if (params.late !== undefined) query.set("late", String(params.late));
    if (params.includeNotCheckedIn !== undefined) query.set("includeNotCheckedIn", String(params.includeNotCheckedIn));
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));

    const endpoint = `${API_ENDPOINTS.ATTENDANCE.RECORDS}?${query.toString()}`;
    const res = await api.get<ApiResponse<AttendancePage>>(endpoint);
    return res.data;
  },

  getRecordById: async (id: number): Promise<AttendanceEntry> => {
    const res = await api.get<ApiResponse<AttendanceEntry>>(API_ENDPOINTS.ATTENDANCE.RECORD_DETAILS(id));
    return res.data;
  },

  getPunches: async (id: number): Promise<PunchHistory> => {
    const res = await api.get<ApiResponse<PunchHistory>>(API_ENDPOINTS.ATTENDANCE.PUNCHES(id));
    return res.data;
  },

  correctRecord: async (id: number, payload: AttendanceCorrectionRequest): Promise<AttendanceEntry> => {
    const res = await api.patch<ApiResponse<AttendanceEntry>>(
      API_ENDPOINTS.ATTENDANCE.CORRECTION(id),
      payload
    );
    return res.data;
  },

  saveManualDay: async (payload: AdminDayUpsertRequest): Promise<AttendanceEntry> => {
    const res = await api.post<ApiResponse<AttendanceEntry>>(
      API_ENDPOINTS.ATTENDANCE.MANUAL_DAY,
      payload
    );
    return res.data;
  },

  bulkAbsencePay: async (payload: BulkAbsencePayRequest): Promise<BulkAbsencePayResult> => {
    const res = await api.post<ApiResponse<BulkAbsencePayResult>>(
      API_ENDPOINTS.ATTENDANCE.BULK_ABSENCE_PAY,
      payload
    );
    return res.data;
  },
};
