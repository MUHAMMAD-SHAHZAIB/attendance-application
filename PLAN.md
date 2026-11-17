# Khan Home HRMS — Project Status & Implementation Plan

> **Date:** 16 November 2026  
> **Frontend Application:** `attendance-application` (Next.js 16, React 19, TypeScript, Tailwind CSS)  
> **Backend Service:** `khanhome-attendance-service` (Spring Boot API)  
> **API Base URL:** `https://hrms.khanhomekitchens.ae`  
> **State & Data Fetching:** TanStack Query (`@tanstack/react-query`), Zustand, Zod  

---

## 1. Summary of Completed Modules

### ✅ Phase 1: Authentication & MFA (`features/auth`)
* **Decoupled Architecture**: Separated business logic (`useAuthLogic.ts`, `authService.ts`, `authSchemas.ts`) from UI (`LoginForm.tsx`, `MfaScanQrView.tsx`, `MfaVerifyView.tsx`, `MfaPinInput.tsx`).
* **Zustand Auth Store**: `useAuthStore.ts` with local storage persistence and rehydration guard.
* **TanStack Query Mutations**: Handling `/api/auth/login` and `/api/auth/mfa/verify`.
* **MFA Modes Supported**: 
  - `SCAN_QR`: Base64 QR code rendering, plaintext secret copy button, 6-digit OTP input.
  - `MFA_REQUIRED`: 6-digit OTP input with remaining attempts tracking.
* **Shared Face Attendance (Section 14)**: Cleanly excluded as per instructions.

---

### ✅ Phase 2: Organization Setup — Departments, Workplaces & Shifts (`features/organization`)
* **Complete CRUD & API Integration**:
  1. **Departments**:
     - `GET /api/v1/departments` (List departments with search)
     - `POST /api/v1/departments` (Create department with Zod validation)
     - `PATCH /api/v1/departments/{id}` (Update department name/status)
  2. **Workplaces**:
     - `GET /api/v1/workplaces` (List workplaces with country filter: AE, PK, SA)
     - `GET /api/v1/workplaces/{id}` (Workplace details)
     - `POST /api/v1/workplaces` (Create workplace with geofence, coordinates, timezone, assigned shifts)
     - `PATCH /api/v1/workplaces/{id}` (Update workplace configuration)
  3. **Work Shifts**:
     - `GET /api/v1/shifts` (List shifts with filter)
     - `GET /api/v1/shifts/{id}` (Shift details)
     - `POST /api/v1/shifts` (Create shift with start/end time, grace minutes, crosses midnight)
     - `PATCH /api/v1/shifts/{id}` (Update shift details)
* **UI Components**:
  - `OrganizationTabs.tsx`: Central switcher between Workplaces, Departments, and Shifts with live counter badges.
  - `DepartmentList.tsx` & `DepartmentModal.tsx`: Searchable table with create/edit modal.
  - `WorkplaceList.tsx` & `WorkplaceModal.tsx`: Geofenced workplace cards with assigned shifts selector.
  - `ShiftList.tsx` & `ShiftModal.tsx`: Shift timings cards with grace period & night shift indicators.

---

### ✅ Phase 3: Employee Administration (`features/employees`)
* **Complete CRUD & Details**:
  - `GET /api/v1/admin/employees` (Search, status, workplace filter, pagination)
  - `POST /api/v1/admin/employees` (Create employee with primary & secondary workplaces, salary, overtime policies)
  - `GET /api/v1/admin/employees/{id}` (Live single employee query with shift timing and sync indicator)
  - `PATCH /api/v1/admin/employees/{id}` (Update employee profile)
  - `PATCH /api/v1/admin/employees/{id}/status` (Activate/Deactivate toggle)
  - `POST /api/v1/admin/employees/{id}/photo` & `DELETE /photo` (Upload & delete reference face image)
* **UI Components**:
  - `EmployeeList.tsx`: Searchable table with status filters, 3-dots actions menu (View Details, Edit Profile, Change Photo, Deactivate).
  - `EmployeeFormPage.tsx`: Full employee creation and edit form with streamlined secondary branches.
  - `EmployeeDetailsPage.tsx`: Rich profile page with live single ID API integration, shift timing display, and assignment breakdown.
  - `EmployeePhotoModal.tsx`: Profile photo manager with webcam capture and file upload.

---

### ✅ Phase 4: Attendance Records & Punches (`features/attendance`)
* **Live Integration**:
  - `GET /api/v1/attendance/records` (Filter by date, workplace, department, status, late)
  - `GET /api/v1/attendance/records/{id}/punches` (Chronological punches history)
  - `PATCH /api/v1/attendance/records/{id}/correction` (Time corrections & status review)
  - `POST /api/v1/attendance/manual-day` (Manual day entry with split punches or absence)
  - `POST /api/v1/attendance/records/absence-pay` (Bulk absence pay configuration)
* **UI Components**:
  - `AttendanceTable.tsx`: Full attendance ledger with filters, search, and action triggers.
  - `PunchHistoryModal.tsx`, `AttendanceCorrectionModal.tsx`, `ManualDayModal.tsx`, `BulkAbsencePayModal.tsx`.

---

### ✅ Phase 5: Weekly Schedules, Day Exceptions & Overrides (`features/schedules`)
* **Live Integration**:
  - `GET /api/v1/work-patterns`, `POST`, `PATCH /work-patterns/{id}` (7-day work patterns CRUD)
  - `GET /api/v1/admin/employees/{id}/day-exceptions?from=...&to=...` (Single-day status exceptions)
  - `POST / PUT / DELETE /day-exceptions/{exceptionId}`
  - `GET /api/v1/admin/employees/{id}/schedule-overrides?from=...&to=...` (Custom duty timings & breaks)
  - `POST / PUT / DELETE /schedule-overrides/{overrideId}`
  - `GET /api/v1/holidays`, `POST`, `PATCH`, `DELETE` (Global and workplace holidays)
* **UI Components**:
  - `SchedulesTabs.tsx`: Tabbed management for Work Patterns, Employee Exceptions & Overrides, and Holidays.
  - `WorkPatternList.tsx`, `EmployeeExceptionsList.tsx`, `HolidayList.tsx`.

---

### ✅ Phase 6: Leaves & Overtime Management (`features/leaves`)
* **Live Integration**:
  - `GET /api/v1/leave-requests?status=pending|approved|rejected|all` (Admin leave requests ledger)
  - `PATCH /api/v1/leave-requests/{leaveId}/review` (Approve/Reject with paid/unpaid selection and admin note)
  - `GET /api/v1/overtime-requests?status=pending|approved|rejected|all` (Admin overtime ledger)
  - `PATCH /api/v1/overtime-requests/{id}/review` (Approve/Reject with duration adjustment and admin note)
* **UI Components**:
  - `LeavesTabs.tsx`: Central hub with live pending count badges, subtabs, and status filters.
  - `LeaveReviewModal.tsx`: Leave approval modal with duration calculation and pay type selection.
  - `OvertimeReviewModal.tsx`: Overtime approval modal with hour/minute conversion.

---

## 2. Latest Pull Updates (Git Commit: `f6a1e89` & `11bd34b`)

On **16 November 2026**, the backend (`khanhome-attendance-service`) received significant enhancements:

### 1. Expanded Single Employee Detail API (`GET /api/v1/admin/employees/{id}`)
* **Method:** `AdminEmployeeController.get(id)`
* **Return Type:** Changed from `AttendanceApi.EmployeeData` to `AttendanceApi.EmployeeDetail`
* **Response Body:** Now returns complete workforce configuration in one call:
  - `employee`: Complete `EmployeeView`
  - `exceptions`: `List<DayExceptionView>` (Day status exceptions)
  - `scheduleOverrides`: `List<ScheduleOverrideView>` (Duty time overrides)
  - `leaves`: `List<AnnualLeaveView>` (Approved/Pending/Historical annual leaves)
  - `overtimePolicies`: `List<OvertimePolicyView>` (Overtime rules & daily max hours)

### 2. Workplace Branding Images APIs (`AdminWorkforceController`)
* Added branding support for header and footer letterheads per workplace:
  - `GET /api/v1/workplaces/{id}/branding` — List configured branding images
  - `PUT /api/v1/workplaces/{id}/branding/{imageType}` — Upload/replace header or footer image (multipart `imageFile`)
  - `GET /api/v1/workplaces/{id}/branding/{imageType}` — Stream branding JPEG image
  - `DELETE /api/v1/workplaces/{id}/branding/{imageType}` — Delete branding image

### 3. Employee Portal Role Security (`SecurityConfig` & `AuthService`)
* Added `RoleNames.EMPLOYEE = "employee"`
* Secured `/api/v1/employee/**` strictly with `hasRole('employee')`
* `AuthService.java` automatically assigns the `employee` role upon login for accounts linked to an employee.

### 4. Workplace Shifts Update Optimization (`WorkforceService`)
* Workplace shift assignment replacement now only deletes removed links, avoiding unnecessary bulk deletes.

---

## 3. Remaining Roadmap Modules

- [ ] **Workplace Branding UI**: Add header/footer logo upload in `WorkplaceModal.tsx`
- [ ] **Employee Profile Tabs**: Display employee's exceptions, overrides, and leaves in `EmployeeDetailsPage.tsx` using the newly expanded `EmployeeDetail` response
- [ ] **Payroll Reports (`features/payroll`)**: (On hold per user preference)
- [ ] **Admin Dashboard Trends**: Trend charts for `GET /api/v1/admin/dashboard/trend`
- [ ] **Admin MFA Reset**: UI for `POST /api/auth/mfa/reset/{userId}`
