"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "../services/departmentService";
import { Department, DepartmentRequest } from "../types";
import { departmentSchema } from "../schemas/organizationSchemas";

export const DEPARTMENT_QUERY_KEY = ["departments"];

export function useDepartmentsQuery() {
  return useQuery<Department[]>({
    queryKey: DEPARTMENT_QUERY_KEY,
    queryFn: () => departmentService.getAll(),
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepartmentRequest) => {
      const validated = departmentSchema.parse(data);
      return departmentService.create(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEY });
    },
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DepartmentRequest }) => {
      const validated = departmentSchema.parse(data);
      return departmentService.update(id, validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEY });
    },
  });
}
