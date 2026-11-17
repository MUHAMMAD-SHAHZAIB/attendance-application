import { z } from "zod";

export const workplaceShiftSelectionSchema = z.object({
  workplaceId: z.coerce.number().positive("Workplace is required"),
  shiftId: z.coerce.number().positive("Shift is required"),
  workPatternId: z.coerce.number().positive("Work pattern is required"),
});

export const employeeFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID code is required")
    .max(40, "Max 40 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores")
    .trim(),
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Max 80 characters").trim(),
  email: z.string().email("Invalid email address").max(120, "Max 120 characters").trim(),
  phone: z.string().min(5, "Phone number is required").max(25, "Max 25 characters").trim(),
  departmentId: z.coerce.number().positive("Department is required"),
  country: z
    .string()
    .length(2, "Country must be 2 characters (e.g. AE, PK, SA)")
    .toUpperCase(),
  designation: z.string().min(1, "Designation is required").max(80, "Max 80 characters").trim(),
  primaryWorkplaceId: z.coerce.number().positive("Primary workplace is required"),
  workplaceAssignments: z.array(workplaceShiftSelectionSchema).min(1, "At least one workplace assignment is required"),
  monthlyBaseSalary: z.coerce.number().min(0, "Salary cannot be negative"),
  salaryCurrencyCode: z.string().length(3, "Currency code must be 3 letters (e.g. AED, PKR, USD)").toUpperCase(),
  overtimeHourlyRate: z.coerce.number().min(0, "Overtime rate cannot be negative"),
  countOffDayAsOvertime: z.boolean().default(false),
  overtimeAllowed: z.boolean().default(true),
  overtimeAllowedFrom: z.string().nullable().optional(),
  overtimeAllowedUntil: z.string().nullable().optional(),
  maxDailyOvertimeHours: z.coerce.number().min(0, "Max daily overtime cannot be negative").nullable().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
