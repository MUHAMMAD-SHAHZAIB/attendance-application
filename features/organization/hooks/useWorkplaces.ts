"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workplaceService } from "../services/workplaceService";
import { Workplace, WorkplaceRequest } from "../types";
import { workplaceSchema } from "../schemas/organizationSchemas";

export const WORKPLACES_QUERY_KEY = ["workplaces"];

export function useWorkplacesQuery(countryCode?: string) {
  return useQuery<Workplace[]>({
    queryKey: [...WORKPLACES_QUERY_KEY, countryCode],
    queryFn: () => workplaceService.getAll(countryCode),
  });
}

export function useWorkplaceDetailsQuery(id: number) {
  return useQuery<Workplace>({
    queryKey: [...WORKPLACES_QUERY_KEY, id],
    queryFn: () => workplaceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkplaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkplaceRequest) => {
      const validated = workplaceSchema.parse(data);
      return workplaceService.create(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKPLACES_QUERY_KEY });
    },
  });
}

export function useUpdateWorkplaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: WorkplaceRequest }) => {
      const validated = workplaceSchema.parse(data);
      return workplaceService.update(id, validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKPLACES_QUERY_KEY });
    },
  });
}
