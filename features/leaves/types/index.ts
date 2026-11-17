export type LeaveStatus = "pending" | "approved" | "rejected" | "all";
export type LeavePayType = "paid" | "unpaid";

export interface LeaveRequestView {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType?: string;
  payType: LeavePayType;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedByAdminId?: number | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

export interface LeaveReviewPayload {
  status: "approved" | "rejected";
  payType?: LeavePayType;
  note?: string;
}

export interface OvertimeRequestView {
  id: number;
  attendanceRecordId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  workplaceId: number;
  workplaceName: string;
  workDate: string;
  requestedMinutes: number;
  approvedMinutes?: number | null;
  status: "pending" | "approved" | "rejected";
  reviewedByAdminId?: number | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

export interface OvertimeReviewPayload {
  status: "approved" | "rejected";
  approvedMinutes?: number;
  note?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}
