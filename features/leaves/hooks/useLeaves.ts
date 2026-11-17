"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "../services/leaveService";
import {
  LeaveRequestView,
  LeaveReviewPayload,
  OvertimeRequestView,
  OvertimeReviewPayload,
} from "../types";

export const LEAVE_REQUESTS_KEY = ["leaveRequests"];
export const OVERTIME_REQUESTS_KEY = ["overtimeRequests"];

export function useLeaveRequestsQuery(status: string = "pending") {
  return useQuery<LeaveRequestView[]>({
    queryKey: [...LEAVE_REQUESTS_KEY, status],
    queryFn: () => leaveService.getLeaveRequests(status),
  });
}

export function useReviewLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leaveId,
      payload,
    }: {
      leaveId: number;
      payload: LeaveReviewPayload;
    }) => {
      return leaveService.reviewLeave(leaveId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUESTS_KEY });
    },
  });
}

export function useOvertimeRequestsQuery(status: string = "pending") {
  return useQuery<OvertimeRequestView[]>({
    queryKey: [...OVERTIME_REQUESTS_KEY, status],
    queryFn: () => leaveService.getOvertimeRequests(status),
  });
}

export function useReviewOvertimeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: OvertimeReviewPayload;
    }) => {
      return leaveService.reviewOvertime(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OVERTIME_REQUESTS_KEY });
    },
  });
}
