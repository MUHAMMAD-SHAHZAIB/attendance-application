import { api } from "@/lib/api/client";
import {
  DailyScheduleOverrideRequest,
  DailyScheduleOverrideView,
  DayExceptionRequest,
  DayExceptionView,
  HolidaySaveRequest,
  HolidayView,
  WorkPatternRequest,
  WorkPatternView,
} from "../types";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export const scheduleService = {
  // 1. Work Patterns
  async getWorkPatterns(status: string = "all"): Promise<WorkPatternView[]> {
    const res = await api.get<ApiResponse<WorkPatternView[]>>(`/api/v1/work-patterns?status=${encodeURIComponent(status)}`);
    return res.data || [];
  },

  async getWorkPattern(id: number): Promise<WorkPatternView> {
    const res = await api.get<ApiResponse<WorkPatternView>>(`/api/v1/work-patterns/${id}`);
    return res.data;
  },

  async createWorkPattern(data: WorkPatternRequest): Promise<WorkPatternView> {
    const res = await api.post<ApiResponse<WorkPatternView>>("/api/v1/work-patterns", data);
    return res.data;
  },

  async updateWorkPattern(id: number, data: WorkPatternRequest): Promise<WorkPatternView> {
    const res = await api.patch<ApiResponse<WorkPatternView>>(`/api/v1/work-patterns/${id}`, data);
    return res.data;
  },

  // 2. Employee Day Exceptions
  async getDayExceptions(employeeId: number, from?: string, to?: string): Promise<DayExceptionView[]> {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<ApiResponse<DayExceptionView[]>>(`/api/v1/admin/employees/${employeeId}/day-exceptions${qs}`);
    return res.data || [];
  },

  async createDayException(employeeId: number, data: DayExceptionRequest): Promise<DayExceptionView> {
    const res = await api.post<ApiResponse<DayExceptionView>>(`/api/v1/admin/employees/${employeeId}/day-exceptions`, data);
    return res.data;
  },

  async updateDayException(employeeId: number, exceptionId: number, data: DayExceptionRequest): Promise<DayExceptionView> {
    const res = await api.put<ApiResponse<DayExceptionView>>(`/api/v1/admin/employees/${employeeId}/day-exceptions/${exceptionId}`, data);
    return res.data;
  },

  async deleteDayException(employeeId: number, exceptionId: number): Promise<boolean> {
    const res = await api.delete<ApiResponse<boolean>>(`/api/v1/admin/employees/${employeeId}/day-exceptions/${exceptionId}`);
    return res.data ?? true;
  },

  // 3. Employee Daily Schedule Overrides
  async getScheduleOverrides(employeeId: number, from?: string, to?: string): Promise<DailyScheduleOverrideView[]> {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<ApiResponse<DailyScheduleOverrideView[]>>(`/api/v1/admin/employees/${employeeId}/schedule-overrides${qs}`);
    return res.data || [];
  },

  async createScheduleOverride(employeeId: number, data: DailyScheduleOverrideRequest): Promise<DailyScheduleOverrideView> {
    const res = await api.post<ApiResponse<DailyScheduleOverrideView>>(`/api/v1/admin/employees/${employeeId}/schedule-overrides`, data);
    return res.data;
  },

  async updateScheduleOverride(employeeId: number, overrideId: number, data: DailyScheduleOverrideRequest): Promise<DailyScheduleOverrideView> {
    const res = await api.put<ApiResponse<DailyScheduleOverrideView>>(`/api/v1/admin/employees/${employeeId}/schedule-overrides/${overrideId}`, data);
    return res.data;
  },

  async deleteScheduleOverride(employeeId: number, overrideId: number): Promise<boolean> {
    const res = await api.delete<ApiResponse<boolean>>(`/api/v1/admin/employees/${employeeId}/schedule-overrides/${overrideId}`);
    return res.data ?? true;
  },

  // 4. Holidays
  async getHolidays(year: number, workplaceId?: number, includeGlobal: boolean = true): Promise<HolidayView[]> {
    const params = new URLSearchParams();
    params.set("year", String(year));
    if (workplaceId) params.set("workplaceId", String(workplaceId));
    params.set("includeGlobal", String(includeGlobal));
    const res = await api.get<ApiResponse<HolidayView[]>>(`/api/v1/holidays?${params.toString()}`);
    return res.data || [];
  },

  async createHoliday(data: HolidaySaveRequest): Promise<HolidayView> {
    const res = await api.post<ApiResponse<HolidayView>>("/api/v1/holidays", data);
    return res.data;
  },

  async updateHoliday(id: number, data: HolidaySaveRequest): Promise<HolidayView> {
    const res = await api.patch<ApiResponse<HolidayView>>(`/api/v1/holidays/${id}`, data);
    return res.data;
  },

  async deleteHoliday(id: number): Promise<boolean> {
    const res = await api.delete<ApiResponse<boolean>>(`/api/v1/holidays/${id}`);
    return res.data ?? true;
  },
};
