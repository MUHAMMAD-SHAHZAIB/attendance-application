export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "";

export const API_ENDPOINTS = {
  // 1. Auth & MFA
  AUTH: {
    LOGIN: "/api/auth/login",
    VERIFY_MFA: "/api/auth/mfa/verify",
    RESET_MFA: (userId: number | string) => `/api/auth/mfa/reset/${userId}`,
  },

  // 2. Dashboard
  DASHBOARD: {
    ADMIN_OVERVIEW: "/api/v1/admin/dashboard",
    ADMIN_OVERVIEW_ALT: "/api/v1/admin/dashboard/overview",
    ADMIN_TREND: "/api/v1/admin/dashboard/trend",
    TODAY_COUNTERS: "/api/v1/attendance/dashboard",
  },

  // 3. Employee Administration
  EMPLOYEES: {
    LIST: "/api/v1/admin/employees",
    CREATE: "/api/v1/admin/employees",
    DETAILS: (id: number | string) => `/api/v1/admin/employees/${id}`,
    UPDATE: (id: number | string) => `/api/v1/admin/employees/${id}`,
    STATUS: (id: number | string) => `/api/v1/admin/employees/${id}/status`,
    ASSIGNMENTS: (id: number | string) => `/api/v1/admin/employees/${id}/workplace-assignments`,
    REPLACE_ASSIGNMENTS: (id: number | string) => `/api/v1/admin/employees/${id}/workplace-assignments`,
  },

  // 4. Employee Photos
  EMPLOYEE_PHOTOS: {
    UPLOAD: (id: number | string) => `/api/v1/admin/employees/${id}/photo`,
    DOWNLOAD: (id: number | string) => `/api/v1/admin/employees/${id}/photo`,
    DELETE: (id: number | string) => `/api/v1/admin/employees/${id}/photo`,
  },

  // 5. Monthly Sheet & Annual Leaves
  MONTHLY_SHEET: {
    GET_SHEET: (id: number | string) => `/api/v1/admin/employees/${id}/monthly-sheet`,
    MATERIALIZE_ABSENCES: (id: number | string) => `/api/v1/admin/employees/${id}/monthly-sheet/materialize-absences`,
    ANNUAL_LEAVES: (id: number | string) => `/api/v1/admin/employees/${id}/annual-leaves`,
    CREATE_ANNUAL_LEAVE: (id: number | string) => `/api/v1/admin/employees/${id}/annual-leaves`,
    UPDATE_ANNUAL_LEAVE: (id: number | string, leaveId: number | string) => `/api/v1/admin/employees/${id}/annual-leaves/${leaveId}`,
    DELETE_ANNUAL_LEAVE: (id: number | string, leaveId: number | string) => `/api/v1/admin/employees/${id}/annual-leaves/${leaveId}`,
  },

  // 6. Attendance Records
  ATTENDANCE: {
    DASHBOARD_COUNTERS: "/api/v1/attendance/dashboard",
    RECORDS: "/api/v1/attendance/records",
    RECORD_DETAILS: (id: number | string) => `/api/v1/attendance/records/${id}`,
    PUNCHES: (id: number | string) => `/api/v1/attendance/records/${id}/punches`,
    CORRECTION: (id: number | string) => `/api/v1/attendance/records/${id}/correction`,
    MANUAL_DAY: "/api/v1/attendance/manual-day",
    DAYS_ALT: "/api/v1/attendance/days",
    RECORDS_ADMIN_ALT: "/api/v1/attendance/records/admin",
    BULK_ABSENCE_PAY: "/api/v1/attendance/records/absence-pay",
  },

  // 7. Departments, Workplaces, Shifts
  DEPARTMENTS: {
    LIST: "/api/v1/departments",
    CREATE: "/api/v1/departments",
    UPDATE: (id: number | string) => `/api/v1/departments/${id}`,
  },
  WORKPLACES: {
    LIST: "/api/v1/workplaces",
    DETAILS: (id: number | string) => `/api/v1/workplaces/${id}`,
    CREATE: "/api/v1/workplaces",
    UPDATE: (id: number | string) => `/api/v1/workplaces/${id}`,
    BRANDING_LIST: (id: number | string) => `/api/v1/workplaces/${id}/branding`,
    BRANDING_SAVE: (id: number | string, imageType: string) => `/api/v1/workplaces/${id}/branding/${imageType}`,
    BRANDING_STREAM: (id: number | string, imageType: string) => `/api/v1/workplaces/${id}/branding/${imageType}`,
    BRANDING_DELETE: (id: number | string, imageType: string) => `/api/v1/workplaces/${id}/branding/${imageType}`,
  },
  SHIFTS: {
    LIST: "/api/v1/shifts",
    DETAILS: (id: number | string) => `/api/v1/shifts/${id}`,
    CREATE: "/api/v1/shifts",
    UPDATE: (id: number | string) => `/api/v1/shifts/${id}`,
  },

  // 8. Weekly Schedules & Day Exceptions
  SCHEDULES: {
    WORK_PATTERNS: "/api/v1/work-patterns",
    PATTERN_DETAILS: (id: number | string) => `/api/v1/work-patterns/${id}`,
    CREATE_PATTERN: "/api/v1/work-patterns",
    UPDATE_PATTERN: (id: number | string) => `/api/v1/work-patterns/${id}`,
    DAY_EXCEPTIONS: (employeeId: number | string) => `/api/v1/admin/employees/${employeeId}/day-exceptions`,
    CREATE_DAY_EXCEPTION: (employeeId: number | string) => `/api/v1/admin/employees/${employeeId}/day-exceptions`,
    UPDATE_DAY_EXCEPTION: (employeeId: number | string, exceptionId: number | string) =>
      `/api/v1/admin/employees/${employeeId}/day-exceptions/${exceptionId}`,
    DELETE_DAY_EXCEPTION: (employeeId: number | string, exceptionId: number | string) =>
      `/api/v1/admin/employees/${employeeId}/day-exceptions/${exceptionId}`,
  },

  // 9. Schedule Overrides (NEW)
  SCHEDULE_OVERRIDES: {
    LIST: (employeeId: number | string) => `/api/v1/admin/employees/${employeeId}/schedule-overrides`,
    CREATE: (employeeId: number | string) => `/api/v1/admin/employees/${employeeId}/schedule-overrides`,
    UPDATE: (employeeId: number | string, overrideId: number | string) =>
      `/api/v1/admin/employees/${employeeId}/schedule-overrides/${overrideId}`,
    DELETE: (employeeId: number | string, overrideId: number | string) =>
      `/api/v1/admin/employees/${employeeId}/schedule-overrides/${overrideId}`,
  },

  // 10. Holidays
  HOLIDAYS: {
    GLOBAL_LIST: "/api/v1/holidays",
    CREATE: "/api/v1/holidays",
    UPDATE: (id: number | string) => `/api/v1/holidays/${id}`,
    DELETE: (id: number | string) => `/api/v1/holidays/${id}`,
    WORKPLACE_LIST: (workplaceId: number | string) => `/api/v1/workplaces/${workplaceId}/holidays`,
    WORKPLACE_CREATE: (workplaceId: number | string) => `/api/v1/workplaces/${workplaceId}/holidays`,
  },

  // 11. Leave Review, Overtime & Reports
  LEAVES_OVERTIME: {
    LEAVE_REQUESTS: "/api/v1/leave-requests",
    REVIEW_LEAVE: (leaveId: number | string) => `/api/v1/leave-requests/${leaveId}/review`,
    OVERTIME_REQUESTS: "/api/v1/overtime-requests",
    REVIEW_OVERTIME: (id: number | string) => `/api/v1/overtime-requests/${id}/review`,
    PAYROLL_PREVIEW: "/api/v1/reports/payroll",
    FINALIZE_PAYROLL: "/api/v1/reports/payroll/finalize",
    ABSENCE_REPORT: "/api/v1/reports/absents",
    ABSENT_TODAY: "/api/v1/reports/absent-today",
  },

  // 12. Employee Portal
  EMPLOYEE_PORTAL: {
    DASHBOARD: "/api/v1/employee/dashboard",
    APPLY_LEAVE: "/api/v1/employee/leaves",
    OWN_LEAVES: "/api/v1/employee/leaves",
    CANCEL_LEAVE: (leaveId: number | string) => `/api/v1/employee/leaves/${leaveId}`,
    OWN_ATTENDANCE: "/api/v1/employee/attendance",
    OWN_OVERTIME: "/api/v1/employee/overtime",
  },

  // 13. Permissions & Roles
  ACCESS_CONTROL: {
    PERMISSIONS: "/api/v1/permissions",
    PERMISSION_DETAILS: (id: number | string) => `/api/v1/permissions/${id}`,
    CREATE_PERMISSION: "/api/v1/permissions",
    UPDATE_PERMISSION: (id: number | string) => `/api/v1/permissions/${id}`,
    DELETE_PERMISSION: (id: number | string) => `/api/v1/permissions/${id}`,

    ROLES: "/api/v1/roles",
    ROLE_DETAILS: (id: number | string) => `/api/v1/roles/${id}`,
    CREATE_ROLE: "/api/v1/roles",
    UPDATE_ROLE: (id: number | string) => `/api/v1/roles/${id}`,
    DELETE_ROLE: (id: number | string) => `/api/v1/roles/${id}`,
    REPLACE_ROLE_PERMISSIONS: (id: number | string) => `/api/v1/roles/${id}/permissions`,
  },
} as const;
