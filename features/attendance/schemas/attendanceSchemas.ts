import { z } from "zod";

export const attendanceCorrectionSchema = z.object({
  checkInAt: z.string().min(1, "Check-in time is required"),
  checkOutAt: z.string().nullable().optional(),
  reviewStatus: z.enum(["pending", "approved", "flagged"]),
});

export const adminPunchSchema = z.object({
  punchType: z.enum(["check_in", "check_out"]),
  at: z.string().min(1, "Punch timestamp is required"),
});

export const adminDayUpsertSchema = z.object({
  employeeId: z.coerce.number().positive("Employee is required"),
  workDate: z.string().min(1, "Work date is required"),
  workplaceId: z.coerce.number().positive().nullable().optional(),
  absent: z.boolean().default(false),
  absencePayType: z.enum(["unpaid", "paid"]).optional(),
  includeBreakTimeInOvertime: z.boolean().optional(),
  breakStart: z.string().nullable().optional(),
  breakEnd: z.string().nullable().optional(),
  punches: z.array(adminPunchSchema).optional(),
});

export const bulkAbsencePaySchema = z.object({
  employeeId: z.coerce.number().positive("Employee is required"),
  dates: z.array(z.string().min(1)).min(1, "At least one date is required"),
  absencePayType: z.enum(["unpaid", "paid"]),
});
