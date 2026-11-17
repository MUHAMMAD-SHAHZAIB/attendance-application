export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export interface EmployeePortalSummary {
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  offOrHolidayDays: number;
  workedMinutes: number;
  overtimeMinutes: number;
  approvedOvertimeMinutes: number;
}

export interface CurrentAssignment {
  workplaceId: number;
  workplaceName: string;
  shiftId: number;
  shiftName: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  crossesMidnight: boolean;
}

export interface TodayStatus {
  status: string;
  scheduleStatus: string;
  workingDay: boolean;
  holiday: boolean;
  onLeave: boolean;
  dutyStart: string | null;
  dutyFinish: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  late: boolean;
}

export interface EmployeeLeaveRequest {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  payType: "paid" | "unpaid" | string;
  reason: string | null;
  status: string;
  requestedAt: string;
  reviewedByAdminId: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface UpcomingHoliday {
  id: number;
  workplaceId: number | null;
  workplaceName: string | null;
  global: boolean;
  holidayDate: string;
  name: string;
}

export interface EmployeePortalDashboard {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  date: string;
  month: string;
  currentAssignment: CurrentAssignment;
  today: TodayStatus;
  attendanceSummary: EmployeePortalSummary;
  upcomingHoliday: UpcomingHoliday | null;
  recentLeaveRequests: EmployeeLeaveRequest[];
}

export interface EmployeeAttendanceDay {
  date: string;
  dayOfWeek: number;
  workingDay: boolean;
  holiday: boolean;
  onLeave: boolean;
  dayStatus: string;
  dutyStart: string | null;
  dutyFinish: string | null;
  attendanceRecordId: number | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  late: boolean;
  scheduledMinutes: number;
  workedMinutes: number;
  overtimeMinutes: number;
  shortfallMinutes: number;
  leaveId: number | null;
  leaveType: string | null;
  leavePayType: string | null;
  leaveReason: string | null;
}

export interface EmployeeAttendanceMonth {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  month: string;
  throughDate: string | null;
  workplaceId: number | null;
  workplaceName: string | null;
  days: EmployeeAttendanceDay[];
  summary: EmployeePortalSummary;
}

export interface EmployeeOvertimeRequest {
  id: number;
  attendanceRecordId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  workplaceId: number;
  workplaceName: string;
  workDate: string;
  requestedMinutes: number;
  approvedMinutes: number | null;
  status: string;
  reviewedByAdminId: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface ApplyLeaveRequest {
  startDate: string;
  endDate: string;
  payType: "paid" | "unpaid";
  reason?: string;
}
