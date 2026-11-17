import { z } from "zod";

export const workPatternDaySchema = z.object({
  weekday: z.number().int().min(1).max(7),
  workingDay: z.boolean(),
});

export const workPatternSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(40, "Code max length is 40 characters")
    .regex(/^[A-Za-z0-9_-]{1,40}$/, "Code must only contain letters, numbers, hyphens, and underscores"),
  name: z.string().min(1, "Name is required").max(100, "Name max length is 100 characters"),
  description: z.string().max(500, "Description max length is 500 characters").optional().nullable(),
  active: z.boolean().default(true),
  days: z.array(workPatternDaySchema).length(7, "Must define all 7 days of the week (Monday through Sunday)"),
});

export const dayExceptionSchema = z
  .object({
    workplaceId: z.number().positive("Please select a workplace"),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Work date must be in YYYY-MM-DD format"),
    exceptionType: z.enum(["OFF", "WORK", "SHIFT_OVERRIDE"]),
    shiftId: z.number().positive().optional().nullable(),
    reason: z.string().max(255, "Reason max length is 255 characters").optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.exceptionType === "SHIFT_OVERRIDE") {
        return !!data.shiftId;
      }
      return true;
    },
    {
      message: "Shift is required when exception type is SHIFT_OVERRIDE",
      path: ["shiftId"],
    }
  )
  .transform((data) => ({
    ...data,
    shiftId: data.exceptionType === "SHIFT_OVERRIDE" && data.shiftId ? data.shiftId : null,
  }));

export const dailyScheduleOverrideSchema = z.object({
  workplaceId: z.number().positive("Please select a workplace"),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Work date must be in YYYY-MM-DD format"),
  dutyStart: z.string().min(1, "Duty start time is required"),
  dutyFinish: z.string().min(1, "Duty finish time is required"),
  breakStart: z.string().optional().nullable(),
  breakEnd: z.string().optional().nullable(),
  allowedBreakMinutes: z.number().int().min(0).default(0),
  crossesMidnight: z.boolean().default(false),
  reason: z.string().max(255, "Reason max length is 255 characters").optional().nullable(),
});

export const holidaySchema = z.object({
  workplaceId: z.number().positive().optional().nullable(),
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Holiday date must be in YYYY-MM-DD format"),
  name: z.string().min(1, "Holiday name is required").max(150, "Holiday name max length is 150 characters"),
});
