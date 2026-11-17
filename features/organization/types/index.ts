export type EntityStatus = "active" | "inactive";

// 1. Department Types
export interface Department {
  id: number;
  name: string;
  status: EntityStatus;
}

export interface DepartmentRequest {
  name: string;
  status: EntityStatus;
}

// 2. Shift Types
export interface Shift {
  id: number;
  code: string;
  name: string;
  startTime: string; // "HH:mm:ss" or "HH:mm"
  endTime: string;   // "HH:mm:ss" or "HH:mm"
  crossesMidnight: boolean;
  graceMinutes: number;
  status: EntityStatus;
}

export interface ShiftRequest {
  code: string;
  name: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  crossesMidnight: boolean;
  graceMinutes: number;
  status: EntityStatus;
}

// 3. Workplace Types
export interface Workplace {
  id: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  timezone: string;
  countryCode: string; // e.g. "AE", "PK"
  currencyCode: string; // e.g. "AED", "PKR"
  shifts: Shift[];
  status: EntityStatus;
}

export interface WorkplaceRequest {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  timezone: string;
  countryCode: string;
  currencyCode: string;
  shiftIds: number[];
  status: EntityStatus;
}

export interface WorkplaceBrandingView {
  workplaceId: number;
  imageType: "header" | "footer" | string;
  imageUrl: string;
}

// Backend Response Envelope
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}
