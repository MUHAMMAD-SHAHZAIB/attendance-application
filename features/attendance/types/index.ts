export interface AttendanceEntry {
  id: number | null;
  employeeRecordId: number;
  workplaceId?: number | null;
  workplace?: string | null;
  departmentId?: number | null;
  department?: string | null;
  employeeId: string;
  name: string;
  workDate: string; // YYYY-MM-DD
  checkInAt?: string | null; // ISO Instant string
  checkOutAt?: string | null; // ISO Instant string
  open: boolean;
  late: boolean;
  withinAllowedHours?: boolean;
  reviewStatus: "pending" | "approved" | "flagged" | string;
  recordStatus: "all" | "open" | "complete" | "missing_checkout" | "absent" | "not_checked_in" | "leave" | "off" | "present" | "holiday" | "rest" | string;
  absencePayType?: "unpaid" | "paid" | string | null;
  scheduledMinutes: number;
  workedMinutes: number;
  overtimeMinutes: number;
  shortfallMinutes: number;
}

export interface PunchEntry {
  id: number;
  attendanceRecordId: number;
  employeeRecordId: number;
  workplaceId?: number | null;
  workplaceName?: string | null;
  punchType: "check_in" | "check_out" | string;
  requestId?: string | null;
  capturedAt: string;
  punchedAt: string;
  faceScore: number;
  accuracy: number;
  latitude: number;
  longitude: number;
  locationAccuracyMeters?: number | null;
  distanceFromWorkplaceMeters: number;
  allowedRadiusMeters: number;
  mockedLocation: boolean;
  deviceId?: string | null;
  source?: string | null;
}

export interface PunchHistory {
  attendanceRecordId: number;
  punches: PunchEntry[];
}

export interface AttendancePage {
  records: AttendanceEntry[];
  from?: string | null;
  to?: string | null;
  workplaceId?: number | null;
  departmentId?: number | null;
  countryCode?: string | null;
  search?: string | null;
  recordStatus?: string | null;
  late?: boolean | null;
  reviewStatus?: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AttendanceDashboard {
  presentToday: number;
  lateToday: number;
  openShifts: number;
  pendingReview: number;
}

export interface AttendanceCorrectionRequest {
  checkInAt: string; // ISO Instant string
  checkOutAt?: string | null; // ISO Instant string
  reviewStatus: "pending" | "approved" | "flagged";
}

export interface AdminPunch {
  punchType: "check_in" | "check_out";
  at: string; // ISO Instant string
}

export interface AdminDayUpsertRequest {
  employeeId: number;
  workDate: string; // YYYY-MM-DD
  workplaceId?: number | null;
  absent: boolean;
  absencePayType?: "unpaid" | "paid";
  withinAllowedHours?: boolean;
  includeBreakTimeInOvertime?: boolean;
  breakStart?: string | null; // HH:mm:ss
  breakEnd?: string | null; // HH:mm:ss
  punches?: AdminPunch[];
}

export interface BulkAbsencePayRequest {
  employeeId: number;
  dates: string[]; // YYYY-MM-DD
  absencePayType: "unpaid" | "paid";
}

export interface BulkAbsencePayResult {
  updatedOrCreated: number;
  absencePayType: string;
}

export interface AttendanceFilterParams {
  employeeId?: string;
  search?: string;
  workplaceId?: number;
  departmentId?: number;
  countryCode?: string;
  dateFilter?: string;
  from?: string;
  to?: string;
  status?: string;
  recordStatus?: string;
  late?: boolean;
  includeNotCheckedIn?: boolean;
  page?: number;
  pageSize?: number;
}
