export interface WorkPatternDayRequest {
  weekday: number; // 1 = Monday, ..., 7 = Sunday
  workingDay: boolean;
}

export interface WorkPatternDayView {
  weekday: number;
  dayName: string; // "MONDAY", "TUESDAY", ...
  workingDay: boolean;
}

export interface WorkPatternRequest {
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  days: WorkPatternDayRequest[];
}

export interface WorkPatternView {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  days: WorkPatternDayView[];
}

export interface DayExceptionRequest {
  workplaceId: number;
  workDate: string; // YYYY-MM-DD
  exceptionType: "OFF" | "WORK" | "SHIFT_OVERRIDE";
  shiftId?: number | null;
  reason?: string | null;
}

export interface DayExceptionView {
  id: number;
  employeeId: number;
  workplaceId: number;
  workplaceName?: string | null;
  workDate: string;
  exceptionType: "OFF" | "WORK" | "SHIFT_OVERRIDE" | string;
  shiftId?: number | null;
  shiftName?: string | null;
  reason?: string | null;
}

export interface DailyScheduleOverrideRequest {
  workplaceId: number;
  workDate: string; // YYYY-MM-DD
  dutyStart: string; // HH:mm:ss or HH:mm
  dutyFinish: string; // HH:mm:ss or HH:mm
  breakStart?: string | null;
  breakEnd?: string | null;
  allowedBreakMinutes?: number | null;
  crossesMidnight?: boolean;
  reason?: string | null;
}

export interface DailyScheduleOverrideView {
  id: number;
  employeeId: number;
  workplaceId: number;
  workplaceName?: string | null;
  workDate: string;
  dutyStart: string;
  dutyFinish: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  allowedBreakMinutes: number;
  crossesMidnight: boolean;
  reason?: string | null;
}

export interface HolidaySaveRequest {
  workplaceId?: number | null;
  holidayDate: string; // YYYY-MM-DD
  name: string;
}

export interface HolidayView {
  id: number;
  workplaceId?: number | null;
  workplaceName?: string | null;
  global: boolean;
  holidayDate: string;
  name: string;
}
