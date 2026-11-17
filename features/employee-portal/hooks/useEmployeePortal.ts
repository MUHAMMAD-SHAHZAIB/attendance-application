"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeePortalService } from "../services/employeePortalService";
import { ApplyLeaveRequest } from "../types";

export const EMPLOYEE_PORTAL_KEYS = {
  all: ["employee-portal"] as const,
  dashboard: () => [...EMPLOYEE_PORTAL_KEYS.all, "dashboard"] as const,
  leaves: (status: string) => [...EMPLOYEE_PORTAL_KEYS.all, "leaves", status] as const,
  attendance: (month: string) => [...EMPLOYEE_PORTAL_KEYS.all, "attendance", month] as const,
  overtime: (status: string) => [...EMPLOYEE_PORTAL_KEYS.all, "overtime", status] as const,
};

export function useEmployeePortalDashboard() {
  return useQuery({
    queryKey: EMPLOYEE_PORTAL_KEYS.dashboard(),
    queryFn: employeePortalService.getDashboard,
  });
}

export function useEmployeeLeaves(status = "all", enabled = true) {
  return useQuery({
    queryKey: EMPLOYEE_PORTAL_KEYS.leaves(status),
    queryFn: () => employeePortalService.getLeaves(status),
    enabled,
  });
}

export function useEmployeeAttendance(month: string, enabled = true) {
  return useQuery({
    queryKey: EMPLOYEE_PORTAL_KEYS.attendance(month),
    queryFn: () => employeePortalService.getAttendance(month),
    enabled: Boolean(month) && enabled,
  });
}

export function useEmployeeOvertime(status = "all", enabled = true) {
  return useQuery({
    queryKey: EMPLOYEE_PORTAL_KEYS.overtime(status),
    queryFn: () => employeePortalService.getOvertime(status),
    enabled,
  });
}

export function useApplyEmployeeLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyLeaveRequest) => employeePortalService.applyLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_KEYS.all });
    },
  });
}

export function useCancelEmployeeLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: number) => employeePortalService.cancelLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_KEYS.all });
    },
  });
}
