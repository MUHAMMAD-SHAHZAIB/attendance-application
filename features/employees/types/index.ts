export interface WorkplaceAssignmentView {
  workplaceId: number;
  workplaceName: string;
  shiftId: number;
  shiftName: string;
  workPatternId: number;
  workPatternName: string;
  primary: boolean;
  validFrom?: string;
  validTo?: string | null;
}

export interface WorkplaceShiftSelection {
  workplaceId: number;
  shiftId: number;
  workPatternId: number;
}

export interface EmployeeView {
  id: number;
  employeeId: string; // Business code (EMP-001)
  name: string;
  email: string;
  phone: string;
  departmentId: number;
  department: string;
  country: string;
  designation: string;
  primaryWorkplaceId: number;
  primaryWorkplace: string;
  workplaces: WorkplaceAssignmentView[];
  workplaceShiftId?: number;
  workplaceShift?: string;
  monthlyBaseSalary: number;
  salaryCurrencyCode: string;
  overtimeHourlyRate: number;
  countOffDayAsOvertime: boolean;
  overtimeAllowed: boolean;
  overtimeAllowedFrom?: string | null;
  overtimeAllowedUntil?: string | null;
  maxDailyOvertimeHours?: number | null;
  joiningDate: string;
  status: "active" | "inactive";
  hasPhoto: boolean;
  photoUrl?: string | null;
}

export interface EmployeePage {
  employees: EmployeeView[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EmployeeCreatePayload {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: number;
  country: string;
  designation: string;
  primaryWorkplaceId: number;
  workplaceAssignments: WorkplaceShiftSelection[];
  monthlyBaseSalary: number;
  salaryCurrencyCode: string;
  overtimeHourlyRate: number;
  countOffDayAsOvertime: boolean;
  overtimeAllowed: boolean;
  overtimeAllowedFrom?: string | null;
  overtimeAllowedUntil?: string | null;
  maxDailyOvertimeHours?: number | null;
  joiningDate: string;
}

export type EmployeeUpdatePayload = EmployeeCreatePayload;

export interface EmployeeFilterParams {
  search?: string;
  status?: string; // "all" | "active" | "inactive"
  workplaceId?: number;
  countryCode?: string;
  page?: number;
}

export interface EmployeeDayExceptionSummary {
  id: number;
  workplaceId: number;
  workplace: string;
  workDate: string;
  exceptionType: string;
  shiftId?: number | null;
  shift?: string | null;
  reason?: string;
}

export interface EmployeeScheduleOverrideSummary {
  id: number;
  workplaceId: number;
  workplace: string;
  workDate: string;
  dutyStart: string;
  dutyFinish: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  allowedBreakMinutes: number;
  crossesMidnight: boolean;
  reason?: string;
}

export interface EmployeeAnnualLeaveSummary {
  id: number;
  startDate: string;
  endDate: string;
  payType: string;
  reason?: string;
  status: string;
}

export interface EmployeeOvertimePolicySummary {
  id: number;
  overtimeAllowed: boolean;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  maxDailyOvertimeHours?: number | null;
}

export interface EmployeeDetail {
  employee: EmployeeView;
  exceptions: EmployeeDayExceptionSummary[];
  scheduleOverrides: EmployeeScheduleOverrideSummary[];
  leaves: EmployeeAnnualLeaveSummary[];
  overtimePolicies: EmployeeOvertimePolicySummary[];
}
