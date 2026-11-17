import { z } from "zod";

// Department Schema
export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100, "Maximum 100 characters").trim(),
  status: z.enum(["active", "inactive"]),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

// Shift Schema
export const shiftSchema = z.object({
  code: z
    .string()
    .min(1, "Shift code is required")
    .max(40, "Maximum 40 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens or underscores")
    .trim(),
  name: z.string().min(1, "Shift name is required").max(100, "Maximum 100 characters").trim(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  crossesMidnight: z.boolean().default(false),
  graceMinutes: z.coerce.number().min(0, "Min 0").max(120, "Max 120 minutes").default(15),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ShiftFormData = z.infer<typeof shiftSchema>;

// Workplace Schema
export const workplaceSchema = z.object({
  name: z.string().min(1, "Workplace name is required").max(100, "Maximum 100 characters").trim(),
  latitude: z.coerce.number().min(-90, "Latitude between -90 and 90").max(90, "Latitude between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude between -180 and 180").max(180, "Longitude between -180 and 180"),
  radiusMeters: z.coerce.number().min(10, "Minimum 10m").max(5000, "Maximum 5000m").default(150),
  timezone: z.string().min(1, "Timezone is required").max(64),
  countryCode: z
    .string()
    .length(2, "Country code must be exactly 2 letters (e.g. AE, PK, SA)")
    .toUpperCase(),
  currencyCode: z
    .string()
    .length(3, "Currency code must be exactly 3 letters (e.g. AED, PKR, USD)")
    .toUpperCase(),
  shiftIds: z.array(z.number()).min(1, "Please assign at least one shift to this workplace"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type WorkplaceFormData = z.infer<typeof workplaceSchema>;
