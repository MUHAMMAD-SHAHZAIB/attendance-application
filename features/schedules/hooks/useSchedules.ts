"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "../services/scheduleService";
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
import {
  dailyScheduleOverrideSchema,
  dayExceptionSchema,
  holidaySchema,
  workPatternSchema,
} from "../schemas/scheduleSchemas";

export const SCHEDULE_QUERY_KEYS = {
  all: ["schedules"] as const,
  patterns: (status: string = "all") => [...SCHEDULE_QUERY_KEYS.all, "patterns", status] as const,
  pattern: (id: number) => [...SCHEDULE_QUERY_KEYS.all, "pattern", id] as const,
  exceptions: (employeeId: number, from?: string, to?: string) =>
    [...SCHEDULE_QUERY_KEYS.all, "exceptions", employeeId, { from, to }] as const,
  overrides: (employeeId: number, from?: string, to?: string) =>
    [...SCHEDULE_QUERY_KEYS.all, "overrides", employeeId, { from, to }] as const,
  holidays: (year: number, workplaceId?: number, includeGlobal: boolean = true) =>
    [...SCHEDULE_QUERY_KEYS.all, "holidays", year, { workplaceId, includeGlobal }] as const,
};

// 1. Work Patterns Hooks
export function useWorkPatternsQuery(status: string = "all") {
  return useQuery<WorkPatternView[]>({
    queryKey: SCHEDULE_QUERY_KEYS.patterns(status),
    queryFn: () => scheduleService.getWorkPatterns(status),
  });
}

export function useWorkPatternQuery(id: number) {
  return useQuery<WorkPatternView>({
    queryKey: SCHEDULE_QUERY_KEYS.pattern(id),
    queryFn: () => scheduleService.getWorkPattern(id),
    enabled: !!id,
  });
}

export function useCreateWorkPatternMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WorkPatternRequest) => {
      const parsed = workPatternSchema.parse(payload);
      return scheduleService.createWorkPattern(parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
    },
  });
}

export function useUpdateWorkPatternMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: WorkPatternRequest }) => {
      const parsed = workPatternSchema.parse(payload);
      return scheduleService.updateWorkPattern(id, parsed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.pattern(variables.id) });
    },
  });
}

// 2. Employee Day Exceptions Hooks
export function useDayExceptionsQuery(employeeId: number, from?: string, to?: string) {
  return useQuery<DayExceptionView[]>({
    queryKey: SCHEDULE_QUERY_KEYS.exceptions(employeeId, from, to),
    queryFn: () => scheduleService.getDayExceptions(employeeId, from, to),
    enabled: !!employeeId,
  });
}

export function useCreateDayExceptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, payload }: { employeeId: number; payload: DayExceptionRequest }) => {
      const parsed = dayExceptionSchema.parse(payload);
      return scheduleService.createDayException(employeeId, parsed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SCHEDULE_QUERY_KEYS.all, "exceptions", variables.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
}

export function useUpdateDayExceptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      exceptionId,
      payload,
    }: {
      employeeId: number;
      exceptionId: number;
      payload: DayExceptionRequest;
    }) => {
      const parsed = dayExceptionSchema.parse(payload);
      return scheduleService.updateDayException(employeeId, exceptionId, parsed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SCHEDULE_QUERY_KEYS.all, "exceptions", variables.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
}

export function useDeleteDayExceptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, exceptionId }: { employeeId: number; exceptionId: number }) => {
      return scheduleService.deleteDayException(employeeId, exceptionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SCHEDULE_QUERY_KEYS.all, "exceptions", variables.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
}

// 3. Employee Daily Schedule Overrides Hooks
export function useScheduleOverridesQuery(employeeId: number, from?: string, to?: string) {
  return useQuery<DailyScheduleOverrideView[]>({
    queryKey: SCHEDULE_QUERY_KEYS.overrides(employeeId, from, to),
    queryFn: () => scheduleService.getScheduleOverrides(employeeId, from, to),
    enabled: !!employeeId,
  });
}

export function useCreateScheduleOverrideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      payload,
    }: {
      employeeId: number;
      payload: DailyScheduleOverrideRequest;
    }) => {
      const parsed = dailyScheduleOverrideSchema.parse(payload);
      return scheduleService.createScheduleOverride(employeeId, parsed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SCHEDULE_QUERY_KEYS.all, "overrides", variables.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
}

export function useUpdateScheduleOverrideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      overrideId,
      payload,
    }: {
      employeeId: number;
      overrideId: number;
      payload: DailyScheduleOverrideRequest;
    }) => {
      const parsed = dailyScheduleOverrideSchema.parse(payload);
      return scheduleService.updateScheduleOverride(employeeId, overrideId, parsed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SCHEDULE_QUERY_KEYS.all, "overrides", variables.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
}

export function useDeleteScheduleOverrideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, overrideId }: { employeeId: number; overrideId: number }) => {
      return scheduleService.deleteScheduleOverride(employeeId, overrideId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SCHEDULE_QUERY_KEYS.all, "overrides", variables.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
}

// 4. Holidays Hooks
export function useHolidaysQuery(year: number, workplaceId?: number, includeGlobal: boolean = true) {
  return useQuery<HolidayView[]>({
    queryKey: SCHEDULE_QUERY_KEYS.holidays(year, workplaceId, includeGlobal),
    queryFn: () => scheduleService.getHolidays(year, workplaceId, includeGlobal),
  });
}

export function useCreateHolidayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HolidaySaveRequest) => {
      const parsed = holidaySchema.parse(payload);
      return scheduleService.createHoliday(parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SCHEDULE_QUERY_KEYS.all, "holidays"] });
    },
  });
}

export function useUpdateHolidayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: HolidaySaveRequest }) => {
      const parsed = holidaySchema.parse(payload);
      return scheduleService.updateHoliday(id, parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SCHEDULE_QUERY_KEYS.all, "holidays"] });
    },
  });
}

export function useDeleteHolidayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return scheduleService.deleteHoliday(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SCHEDULE_QUERY_KEYS.all, "holidays"] });
    },
  });
}
