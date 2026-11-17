"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shiftService } from "../services/shiftService";
import { Shift, ShiftRequest } from "../types";
import { shiftSchema } from "../schemas/organizationSchemas";

export const SHIFTS_QUERY_KEY = ["shifts"];

export function useShiftsQuery(workplaceId?: number) {
  return useQuery<Shift[]>({
    queryKey: [...SHIFTS_QUERY_KEY, workplaceId],
    queryFn: () => shiftService.getAll(workplaceId),
  });
}

export function useCreateShiftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShiftRequest) => {
      const validated = shiftSchema.parse(data);
      return shiftService.create(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFTS_QUERY_KEY });
    },
  });
}

export function useUpdateShiftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ShiftRequest }) => {
      const validated = shiftSchema.parse(data);
      return shiftService.update(id, validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFTS_QUERY_KEY });
    },
  });
}
