"use client";

import React, { useState, useEffect, useRef } from "react";
import { EmployeeCreatePayload, EmployeeView, WorkplaceShiftSelection } from "../types";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useUploadPhotoMutation,
  useDeletePhotoMutation,
  useWorkPatternsQuery,
} from "../hooks/useEmployees";
import {
  useDepartmentsQuery,
  useWorkplacesQuery,
  useShiftsQuery,
} from "@/features/organization";
import { EmployeeExceptionsList } from "@/features/schedules";

interface AdditionalAssignment {
  id: string;
  workplaceId: number | string;
  shiftId: number | string;
  workPatternId: number | string;
}

interface EmployeeFormPageProps {
  employeeToEdit?: EmployeeView | null;
  onBack: () => void;
}

export function EmployeeFormPage({ employeeToEdit, onBack }: EmployeeFormPageProps) {
  const isEditMode = !!employeeToEdit;

  const { data: departments } = useDepartmentsQuery();
  const { data: workplaces } = useWorkplacesQuery();
  const { data: shifts } = useShiftsQuery();
  const { data: workPatterns } = useWorkPatternsQuery();

  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const uploadPhotoMutation = useUploadPhotoMutation();
  const deletePhotoMutation = useDeletePhotoMutation();

  // Photo State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);

  // Basic Information State
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState<number | string>("");
  const [country, setCountry] = useState("PK");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);

  // Primary Workplace Assignment
  const [primaryWorkplaceId, setPrimaryWorkplaceId] = useState<number | string>("");
  const [primaryShiftId, setPrimaryShiftId] = useState<number | string>("");
  const [primaryWorkPatternId, setPrimaryWorkPatternId] = useState<number | string>("");

  // Additional Workplace Assignments (Multiple Workplaces)
  const [additionalAssignments, setAdditionalAssignments] = useState<AdditionalAssignment[]>([]);

  // Salary & Overtime Policy State
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState<number | string>("3500");
  const [salaryCurrencyCode, setSalaryCurrencyCode] = useState("PKR");
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState<number | string>("25");
  const [countOffDayAsOvertime, setCountOffDayAsOvertime] = useState(true);
  const [overtimeAllowed, setOvertimeAllowed] = useState(true);
  const [maxDailyOvertimeHours, setMaxDailyOvertimeHours] = useState<number | string>("3");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setEmployeeId(employeeToEdit.employeeId);
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email);
      setPhone(employeeToEdit.phone);
      setDepartmentId(employeeToEdit.departmentId);
      setCountry(employeeToEdit.country || "PK");
      setDesignation(employeeToEdit.designation);
      setJoiningDate(employeeToEdit.joiningDate || new Date().toISOString().split("T")[0]);

      // Resolve primary workplace assignment
      const primaryWpId = employeeToEdit.primaryWorkplaceId;
      setPrimaryWorkplaceId(primaryWpId);

      const todayStr = new Date().toISOString().split("T")[0];
      const activeWorkplaces = (employeeToEdit.workplaces || []).filter(
        (w) => !w.validTo || w.validTo >= todayStr
      );

      const primaryAssignment =
        activeWorkplaces.find((w) => String(w.workplaceId) === String(primaryWpId)) ||
        activeWorkplaces.find((w) => w.primary) ||
        activeWorkplaces[0];

      setPrimaryShiftId(primaryAssignment?.shiftId || employeeToEdit.workplaceShiftId || "");
      setPrimaryWorkPatternId(primaryAssignment?.workPatternId || (workPatterns?.[0]?.id ?? 1));

      // Resolve additional secondary workplace assignments (Deduplicated, No duplicates, No Primary)
      const seenWpIds = new Set<string>([String(primaryWpId)]);
      const additionals: AdditionalAssignment[] = [];
      for (let i = 0; i < activeWorkplaces.length; i++) {
        const w = activeWorkplaces[i];
        const wIdStr = String(w.workplaceId);
        if (!seenWpIds.has(wIdStr)) {
          seenWpIds.add(wIdStr);
          additionals.push({
            id: `edit-wp-${w.workplaceId}-${i}`,
            workplaceId: w.workplaceId,
            shiftId: w.shiftId,
            workPatternId: w.workPatternId || (workPatterns?.[0]?.id ?? 1),
          });
        }
      }

      setAdditionalAssignments(additionals);

      setMonthlyBaseSalary(employeeToEdit.monthlyBaseSalary);
      const matchedWp = workplaces?.find(
        (w) => String(w.id) === String(employeeToEdit.primaryWorkplaceId)
      );
      setSalaryCurrencyCode(
        employeeToEdit.salaryCurrencyCode || matchedWp?.currencyCode || "PKR"
      );
      setOvertimeHourlyRate(employeeToEdit.overtimeHourlyRate || 0);
      setCountOffDayAsOvertime(employeeToEdit.countOffDayAsOvertime ?? true);
      setOvertimeAllowed(employeeToEdit.overtimeAllowed ?? true);
      setMaxDailyOvertimeHours(employeeToEdit.maxDailyOvertimeHours ?? 3);

      // Photo initialization
      if (employeeToEdit.hasPhoto && employeeToEdit.photoUrl) {
        setPhotoPreviewUrl(employeeToEdit.photoUrl);
      } else {
        setPhotoPreviewUrl(null);
      }
      setPhotoFile(null);
      setRemoveExistingPhoto(false);
    } else {
      const defaultWp = workplaces?.[0];
      setEmployeeId("");
      setName("");
      setEmail("");
      setPhone("");
      setDepartmentId(departments?.[0]?.id || "");
      setCountry(defaultWp?.countryCode || "PK");
      setDesignation("");
      setPrimaryWorkplaceId(defaultWp?.id || "");
      setPrimaryShiftId(defaultWp?.shifts?.[0]?.id || shifts?.[0]?.id || "");
      setPrimaryWorkPatternId(workPatterns?.[0]?.id || 1);
      setAdditionalAssignments([]);
      setMonthlyBaseSalary("3500");
      setSalaryCurrencyCode(defaultWp?.currencyCode || "PKR");
      setOvertimeHourlyRate("25");
      setCountOffDayAsOvertime(true);
      setOvertimeAllowed(true);
      setMaxDailyOvertimeHours("3");
      setJoiningDate(new Date().toISOString().split("T")[0]);

      // Reset photo state
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setRemoveExistingPhoto(false);
    }
    setErrorMsg(null);
  }, [employeeToEdit, departments, workplaces, shifts, workPatterns]);

  // Handle Photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Photo file size must be under 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
      setRemoveExistingPhoto(false);
      setErrorMsg(null);
    }
  };

  // Handle Photo removal
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setRemoveExistingPhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Primary Workplace Change -> Auto-sync Currency, Country, and Shifts
  const handlePrimaryWorkplaceChange = (wpId: string) => {
    setPrimaryWorkplaceId(wpId);
    const selectedWp = workplaces?.find((w) => String(w.id) === String(wpId));
    if (selectedWp) {
      setSalaryCurrencyCode(selectedWp.currencyCode || "PKR");
      setCountry(selectedWp.countryCode || "PK");

      // Auto pick valid shift for new primary workplace
      if (selectedWp.shifts && selectedWp.shifts.length > 0) {
        setPrimaryShiftId(selectedWp.shifts[0].id);
      }

      // Remove any additional assignments that have a different currency code
      setAdditionalAssignments((prev) =>
        prev.filter((a) => {
          const wp = workplaces?.find((w) => String(w.id) === String(a.workplaceId));
          return wp && wp.currencyCode === selectedWp.currencyCode;
        })
      );
    }
  };

  // Add Another Workplace
  const handleAddAdditionalWorkplace = () => {
    const primaryWp = workplaces?.find((w) => String(w.id) === String(primaryWorkplaceId));
    const alreadySelectedIds = [
      String(primaryWorkplaceId),
      ...additionalAssignments.map((a) => String(a.workplaceId)),
    ];

    // Filter to workplaces with matching currency and not already selected
    const eligibleWorkplaces = workplaces?.filter(
      (w) =>
        !alreadySelectedIds.includes(String(w.id)) &&
        (!primaryWp || w.currencyCode === primaryWp.currencyCode)
    );

    if (!eligibleWorkplaces || eligibleWorkplaces.length === 0) {
      setErrorMsg("No other workplaces available with the same currency code.");
      return;
    }

    const nextWp = eligibleWorkplaces[0];
    const newAssignment: AdditionalAssignment = {
      id: `add-wp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workplaceId: nextWp.id,
      shiftId: nextWp.shifts?.[0]?.id || shifts?.[0]?.id || "",
      workPatternId: primaryWorkPatternId || workPatterns?.[0]?.id || 1,
    };

    setAdditionalAssignments((prev) => [...prev, newAssignment]);
    setErrorMsg(null);
  };

  // Update Additional Workplace Field
  const handleUpdateAdditional = (
    id: string,
    field: "workplaceId" | "shiftId" | "workPatternId",
    value: any
  ) => {
    setAdditionalAssignments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "workplaceId") {
          const wp = workplaces?.find((w) => String(w.id) === String(value));
          if (wp?.shifts && wp.shifts.length > 0) {
            updated.shiftId = wp.shifts[0].id;
          }
          updated.workPatternId = primaryWorkPatternId || workPatterns?.[0]?.id || 1;
        }
        return updated;
      })
    );
  };

  // Remove Additional Workplace
  const handleRemoveAdditional = (id: string) => {
    setAdditionalAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  // Promote an Additional Workplace to Primary
  const handlePromoteToPrimary = (id: string) => {
    const target = additionalAssignments.find((a) => a.id === id);
    if (!target) return;

    const oldPrimary: AdditionalAssignment = {
      id: `demoted-primary-${Date.now()}`,
      workplaceId: primaryWorkplaceId,
      shiftId: primaryShiftId,
      workPatternId: primaryWorkPatternId,
    };

    setPrimaryWorkplaceId(target.workplaceId);
    setPrimaryShiftId(target.shiftId);
    setPrimaryWorkPatternId(target.workPatternId);

    const newPrimaryWp = workplaces?.find((w) => String(w.id) === String(target.workplaceId));
    if (newPrimaryWp) {
      setSalaryCurrencyCode(newPrimaryWp.currencyCode || "PKR");
      setCountry(newPrimaryWp.countryCode || "PK");
    }

    setAdditionalAssignments((prev) => [
      ...prev.filter((a) => a.id !== id),
      oldPrimary,
    ]);
  };

  // Helper to get shifts for a specific workplace
  const getShiftsForWorkplace = (wpId: number | string) => {
    const wp = workplaces?.find((w) => String(w.id) === String(wpId));
    if (wp && wp.shifts && wp.shifts.length > 0) {
      return wp.shifts;
    }
    return shifts || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!employeeId.trim() || !name.trim() || !email.trim()) {
      setErrorMsg("Please fill in all required basic fields (ID, Name, Email)");
      return;
    }
    if (!primaryWorkplaceId || !primaryShiftId) {
      setErrorMsg("Please select a primary workplace and assigned shift");
      return;
    }

    // Validate additional assignments
    for (const add of additionalAssignments) {
      if (!add.workplaceId) {
        setErrorMsg("Please select a workplace for all additional secondary assignments, or remove unneeded rows.");
        return;
      }
    }

    // Check for duplicate workplace selections
    const allWpIds = [
      String(primaryWorkplaceId),
      ...additionalAssignments.map((a) => String(a.workplaceId)),
    ];
    if (new Set(allWpIds).size !== allWpIds.length) {
      setErrorMsg("Each workplace can only be assigned once per employee.");
      return;
    }

    // Compile workplaceAssignments
    const workplaceAssignments: WorkplaceShiftSelection[] = [
      {
        workplaceId: Number(primaryWorkplaceId),
        shiftId: Number(primaryShiftId),
        workPatternId: Number(primaryWorkPatternId) || 1,
      },
      ...additionalAssignments.map((a) => {
        const wp = workplaces?.find((w) => String(w.id) === String(a.workplaceId));
        const effectiveShiftId = a.shiftId || wp?.shifts?.[0]?.id || shifts?.[0]?.id || 1;
        const effectivePatternId = a.workPatternId || primaryWorkPatternId || workPatterns?.[0]?.id || 1;
        return {
          workplaceId: Number(a.workplaceId),
          shiftId: Number(effectiveShiftId),
          workPatternId: Number(effectivePatternId),
        };
      }),
    ];

    const payload: EmployeeCreatePayload = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      departmentId: Number(departmentId),
      country,
      designation: designation.trim(),
      primaryWorkplaceId: Number(primaryWorkplaceId),
      workplaceAssignments,
      monthlyBaseSalary: Number(monthlyBaseSalary),
      salaryCurrencyCode,
      overtimeHourlyRate: Number(overtimeHourlyRate),
      countOffDayAsOvertime,
      overtimeAllowed,
      maxDailyOvertimeHours: maxDailyOvertimeHours ? Number(maxDailyOvertimeHours) : null,
      joiningDate,
    };

    try {
      let savedEmployee: EmployeeView;
      if (isEditMode && employeeToEdit) {
        savedEmployee = await updateMutation.mutateAsync({ id: employeeToEdit.id, payload });
      } else {
        savedEmployee = await createMutation.mutateAsync(payload);
      }

      // Handle photo upload if user selected a new photo
      if (photoFile && savedEmployee?.id) {
        try {
          await uploadPhotoMutation.mutateAsync({ id: savedEmployee.id, file: photoFile });
        } catch (photoErr: any) {
          console.error("Photo upload error:", photoErr);
          alert(
            `Employee profile saved, but photo upload encountered an issue: ${
              photoErr?.response?.data?.message || photoErr?.message || "Please check photo format and face clarity."
            }`
          );
        }
      } else if (isEditMode && removeExistingPhoto && employeeToEdit?.hasPhoto && employeeToEdit?.id) {
        try {
          await deletePhotoMutation.mutateAsync(employeeToEdit.id);
        } catch (delErr: any) {
          console.error("Photo delete error:", delErr);
        }
      }

      onBack();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save employee profile");
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadPhotoMutation.isPending ||
    deletePhotoMutation.isPending;
  const primaryWpObj = workplaces?.find((w) => String(w.id) === String(primaryWorkplaceId));

  const alreadyAssignedWpIds = [
    String(primaryWorkplaceId),
    ...additionalAssignments.map((a) => String(a.workplaceId)),
  ];
  const eligibleWorkplacesCount =
    workplaces?.filter(
      (w) =>
        !alreadyAssignedWpIds.includes(String(w.id)) &&
        (!primaryWpObj || w.currencyCode === primaryWpObj.currencyCode)
    ).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Employee List</span>
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEditMode ? `Edit Employee: ${employeeToEdit?.name}` : "Register New Employee"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEditMode
              ? `Updating profile and policies for Employee ID #${employeeToEdit?.employeeId}`
              : "Create a complete employee profile with multi-workplace assignments and payroll policies"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {isPending ? "Saving Profile..." : isEditMode ? "Save Changes" : "Register Employee"}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic & Contact Information */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">1. Basic & Contact Information</h2>
              <p className="text-xs text-slate-400">Core identity, profile picture, and communication details</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Personal
            </span>
          </div>

          {/* Employee Photo Upload Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center shadow-inner relative">
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt="Employee Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 text-center p-2">
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-slate-600 mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] text-slate-400 font-medium">No Photo</span>
                  </div>
                )}
              </div>
              {photoPreviewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs shadow-md transition-all cursor-pointer"
                  title="Remove photo"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Photo Actions & Notes */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{photoPreviewUrl ? "Change Photo" : "Upload Photo"}</span>
                </button>
                {photoPreviewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
                {photoFile && (
                  <span className="text-[11px] text-emerald-400/90 font-mono">
                    ✓ Selected: {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supported formats: <strong className="text-slate-300">JPG, PNG, WebP</strong> (Max 5MB). Photo is used for identity verification and biometric face recognition.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employee Code / ID *
              </label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="e.g. EMP-101"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Muhammad Ali"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ali@khanhome.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department *
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Department</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Designation / Job Role
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Chef / Operations Lead"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Country *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="PK">🇵🇰 Pakistan (PK)</option>
                <option value="AE">🇦🇪 United Arab Emirates (AE)</option>
                <option value="SA">🇸🇦 Saudi Arabia (SA)</option>
              </select>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Workplace & Schedule Roster (with Multiple Workplaces support) */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">2. Workplace & Schedule Roster</h2>
              <p className="text-xs text-slate-400">
                Configure primary workplace and optional secondary branches where employee can clock in
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                {1 + additionalAssignments.length} Workplace(s) Assigned
              </span>
            </div>
          </div>

          {/* A. Primary Workplace Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  ⭐ Primary Workplace (Default)
                </span>
                <span className="text-xs text-slate-400">
                  Main working branch · Dictates currency and base schedule
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Primary Workplace Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Workplace *
                </label>
                <select
                  required
                  value={primaryWorkplaceId}
                  onChange={(e) => handlePrimaryWorkplaceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Primary Workplace</option>
                  {workplaces?.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.countryCode} · {w.currencyCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operating Shift */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Shift *
                </label>
                <select
                  required
                  value={primaryShiftId}
                  onChange={(e) => setPrimaryShiftId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Shift</option>
                  {getShiftsForWorkplace(primaryWorkplaceId).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Pattern */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Weekly Work Pattern *
                </label>
                <select
                  required
                  value={primaryWorkPatternId}
                  onChange={(e) => setPrimaryWorkPatternId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {workPatterns && workPatterns.length > 0 ? (
                    workPatterns.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))
                  ) : (
                    <option value={1}>Standard 5-Day (Mon-Fri)</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* B. Additional Workplace Assignments */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>Additional Operating Branches</span>
                  {additionalAssignments.length > 0 && (
                    <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                      +{additionalAssignments.length} Assigned
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allow employee to also clock in at other branches sharing the same currency ({primaryWpObj?.currencyCode || "PKR"})
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAdditionalWorkplace}
                disabled={eligibleWorkplacesCount === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  eligibleWorkplacesCount === 0
                    ? "opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500"
                    : "text-teal-300 bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20 cursor-pointer shadow-sm"
                }`}
              >
                <span>+</span>
                <span>{eligibleWorkplacesCount === 0 ? "All Branches Assigned" : "Add Another Workplace"}</span>
              </button>
            </div>

            {additionalAssignments.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="text-slate-500">🏢</span>
                <span>Currently assigned only to the primary workplace. Click <strong>&quot;+ Add Another Workplace&quot;</strong> to add secondary branches.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {additionalAssignments.map((assignment, index) => {
                  const currentSelectedIds = [
                    String(primaryWorkplaceId),
                    ...additionalAssignments
                      .filter((a) => a.id !== assignment.id)
                      .map((a) => String(a.workplaceId)),
                  ];

                  const availableWorkplaces = workplaces?.filter(
                    (w) =>
                      String(w.id) === String(assignment.workplaceId) ||
                      (!currentSelectedIds.includes(String(w.id)) &&
                        (!primaryWpObj || w.currencyCode === primaryWpObj.currencyCode))
                  );

                  return (
                    <div
                      key={assignment.id}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-[10px] font-bold">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            Secondary Branch:
                          </span>
                        </div>

                        <div className="flex-1 max-w-md">
                          <select
                            required
                            value={assignment.workplaceId}
                            onChange={(e) =>
                              handleUpdateAdditional(assignment.id, "workplaceId", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                          >
                            <option value="">Select Secondary Workplace</option>
                            {availableWorkplaces?.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.countryCode} · {w.currencyCode})
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-[11px] text-slate-500 font-mono hidden xl:inline">
                          Currency: {primaryWpObj?.currencyCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePromoteToPrimary(assignment.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                          title="Promote this branch to Primary"
                        >
                          <span>⭐</span>
                          <span>Make Primary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditional(assignment.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                          title="Remove this branch"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Salary & Compensation */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">3. Salary & Compensation</h2>
              <p className="text-xs text-slate-400">Monthly base salary and overtime rate configuration</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Payroll
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly Base Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Base Salary *
              </label>
              <input
                type="number"
                required
                min={0}
                value={monthlyBaseSalary}
                onChange={(e) => setMonthlyBaseSalary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Currency Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Currency Code *
              </label>
              <select
                value={salaryCurrencyCode}
                onChange={(e) => setSalaryCurrencyCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="SAR">SAR - Saudi Riyal</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must match the primary workplace currency ({primaryWpObj?.currencyCode || "PKR"}).
              </span>
            </div>

            {/* Overtime Hourly Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Overtime Hourly Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={overtimeHourlyRate}
                  onChange={(e) => setOvertimeHourlyRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-semibold">
                  {salaryCurrencyCode}/hr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Overtime Policy & Rules */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">4. Overtime & Duty Policy</h2>
              <p className="text-xs text-slate-400">Rules governing overtime eligibility and limits</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Policy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Overtime Allowed Toggle */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white block">Overtime Allowed</span>
                <span className="text-[10px] text-slate-500">Employee can accrue OT</span>
              </div>
              <input
                type="checkbox"
                checked={overtimeAllowed}
                onChange={(e) => setOvertimeAllowed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
              />
            </div>

            {/* Count Off-Day as Overtime */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white block">Count Off-Day as OT</span>
                <span className="text-[10px] text-slate-500">Work on rest days paid as OT</span>
              </div>
              <input
                type="checkbox"
                checked={countOffDayAsOvertime}
                onChange={(e) => setCountOffDayAsOvertime(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
              />
            </div>

            {/* Max Daily Overtime */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Daily Overtime (Hours)
              </label>
              <input
                type="number"
                min={0}
                max={12}
                value={maxDailyOvertimeHours}
                onChange={(e) => setMaxDailyOvertimeHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Schedule Overrides & Day Exceptions (Only when editing an existing employee - NOT for adding employee) */}
        {isEditMode && employeeToEdit && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-bold text-white">5. Schedule Adjustments & Custom Duty Hours</h2>
              <p className="text-xs text-slate-400">
                Manage single-day day-offs, working rest days, shift swaps, and custom daily duty hours for this employee
              </p>
            </div>
            <EmployeeExceptionsList
              fixedEmployeeId={employeeToEdit.id}
              hideEmployeeSelect
              hideHeader
            />
          </div>
        )}

        {/* Sticky Action Footer */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isEditMode ? "All edits will take effect immediately upon saving." : "All fields marked with * are required."}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Register Employee"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
