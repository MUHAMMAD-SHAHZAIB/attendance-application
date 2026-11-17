"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "../services/employeeService";
import {
  EmployeeCreatePayload,
  EmployeeDetail,
  EmployeeFilterParams,
  EmployeePage,
  EmployeeUpdatePayload,
  EmployeeView,
} from "../types";
import { employeeFormSchema } from "../schemas/employeeSchemas";

export const EMPLOYEES_QUERY_KEY = ["employees"];
export const WORK_PATTERNS_QUERY_KEY = ["work-patterns"];

export function useEmployeesQuery(params: EmployeeFilterParams = {}) {
  return useQuery<EmployeePage>({
    queryKey: [...EMPLOYEES_QUERY_KEY, params],
    queryFn: () => employeeService.list(params),
  });
}

export function useEmployeeDetailsQuery(id: number | null) {
  return useQuery<EmployeeView>({
    queryKey: [...EMPLOYEES_QUERY_KEY, "details", id],
    queryFn: () => employeeService.getById(id!),
    enabled: !!id,
  });
}

export function useEmployeeFullDetailQuery(id: number | null) {
  return useQuery<EmployeeDetail>({
    queryKey: [...EMPLOYEES_QUERY_KEY, "full-detail", id],
    queryFn: () => employeeService.getDetailById(id!),
    enabled: !!id,
  });
}

export function useWorkPatternsQuery() {
  return useQuery({
    queryKey: WORK_PATTERNS_QUERY_KEY,
    queryFn: () => employeeService.getWorkPatterns(),
  });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EmployeeCreatePayload) => {
      const validated = employeeFormSchema.parse(payload);
      return employeeService.create(validated as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmployeeUpdatePayload }) => {
      const validated = employeeFormSchema.parse(payload);
      return employeeService.update(id, validated as any);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EMPLOYEES_QUERY_KEY, "details", variables.id] });
    },
  });
}

export function useEmployeeStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "active" | "inactive" }) => {
      return employeeService.changeStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      return employeeService.uploadPhoto(id, file);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EMPLOYEES_QUERY_KEY, "details", variables.id] });
    },
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return employeeService.deletePhoto(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EMPLOYEES_QUERY_KEY, "details", id] });
    },
  });
}
