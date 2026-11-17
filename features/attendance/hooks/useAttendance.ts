"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../services/attendanceService";
import {
  AdminDayUpsertRequest,
  AttendanceCorrectionRequest,
  AttendanceDashboard,
  AttendanceFilterParams,
  AttendancePage,
  BulkAbsencePayRequest,
  PunchHistory,
} from "../types";
import {
  adminDayUpsertSchema,
  attendanceCorrectionSchema,
  bulkAbsencePaySchema,
} from "../schemas/attendanceSchemas";

export const ATTENDANCE_QUERY_KEYS = {
  all: ["attendance"] as const,
  dashboard: () => [...ATTENDANCE_QUERY_KEYS.all, "dashboard"] as const,
  records: (params: AttendanceFilterParams) => [...ATTENDANCE_QUERY_KEYS.all, "records", params] as const,
  punches: (recordId: number) => [...ATTENDANCE_QUERY_KEYS.all, "punches", recordId] as const,
};

export function useAttendanceDashboardQuery() {
  return useQuery<AttendanceDashboard>({
    queryKey: ATTENDANCE_QUERY_KEYS.dashboard(),
    queryFn: () => attendanceService.getDashboard(),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useAttendanceRecordsQuery(params: AttendanceFilterParams = {}) {
  return useQuery<AttendancePage>({
    queryKey: ATTENDANCE_QUERY_KEYS.records(params),
    queryFn: () => attendanceService.getRecords(params),
  });
}

export function usePunchHistoryQuery(recordId: number | null) {
  return useQuery<PunchHistory>({
    queryKey: ATTENDANCE_QUERY_KEYS.punches(recordId || 0),
    queryFn: () => attendanceService.getPunches(recordId!),
    enabled: !!recordId,
  });
}

export function useAttendanceCorrectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AttendanceCorrectionRequest }) => {
      const validated = attendanceCorrectionSchema.parse(payload);
      return attendanceService.correctRecord(id, validated as AttendanceCorrectionRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
    },
  });
}

export function useManualDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminDayUpsertRequest) => {
      const validated = adminDayUpsertSchema.parse(payload);
      return attendanceService.saveManualDay(validated as AdminDayUpsertRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
    },
  });
}

export function useBulkAbsencePayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkAbsencePayRequest) => {
      const validated = bulkAbsencePaySchema.parse(payload);
      return attendanceService.bulkAbsencePay(validated as BulkAbsencePayRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
    },
  });
}
