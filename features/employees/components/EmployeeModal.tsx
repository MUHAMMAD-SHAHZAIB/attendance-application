"use client";

import React, { useState, useEffect } from "react";
import { EmployeeCreatePayload, EmployeeView } from "../types";
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useWorkPatternsQuery } from "../hooks/useEmployees";
import { useDepartmentsQuery, useWorkplacesQuery, useShiftsQuery } from "@/features/organization";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: EmployeeView | null;
}

export function EmployeeModal({ isOpen, onClose, employeeToEdit }: EmployeeModalProps) {
  const { data: departments } = useDepartmentsQuery();
  const { data: workplaces } = useWorkplacesQuery();
  const { data: shifts } = useShiftsQuery();
  const { data: workPatterns } = useWorkPatternsQuery();

  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState<number | string>("");
  const [country, setCountry] = useState("AE");
  const [designation, setDesignation] = useState("");
  const [primaryWorkplaceId, setPrimaryWorkplaceId] = useState<number | string>("");
  const [shiftId, setShiftId] = useState<number | string>("");
  const [workPatternId, setWorkPatternId] = useState<number | string>("");
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState<number | string>("3500");
  const [salaryCurrencyCode, setSalaryCurrencyCode] = useState("AED");
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState<number | string>("25");
  const [countOffDayAsOvertime, setCountOffDayAsOvertime] = useState(true);
  const [overtimeAllowed, setOvertimeAllowed] = useState(true);
  const [maxDailyOvertimeHours, setMaxDailyOvertimeHours] = useState<number | string>("3");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setEmployeeId(employeeToEdit.employeeId);
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email);
      setPhone(employeeToEdit.phone);
      setDepartmentId(employeeToEdit.departmentId);
      setCountry(employeeToEdit.country || "AE");
      setDesignation(employeeToEdit.designation);
      setPrimaryWorkplaceId(employeeToEdit.primaryWorkplaceId);
      
      const firstAssignment = employeeToEdit.workplaces?.[0];
      setShiftId(firstAssignment?.shiftId || employeeToEdit.workplaceShiftId || "");
      setWorkPatternId(firstAssignment?.workPatternId || (workPatterns?.[0]?.id ?? 1));
      
      setMonthlyBaseSalary(employeeToEdit.monthlyBaseSalary);
      const matchedWp = workplaces?.find((w) => String(w.id) === String(employeeToEdit.primaryWorkplaceId));
      setSalaryCurrencyCode(employeeToEdit.salaryCurrencyCode || matchedWp?.currencyCode || "PKR");
      setOvertimeHourlyRate(employeeToEdit.overtimeHourlyRate || 0);
      setCountOffDayAsOvertime(employeeToEdit.countOffDayAsOvertime ?? true);
      setOvertimeAllowed(employeeToEdit.overtimeAllowed ?? true);
      setMaxDailyOvertimeHours(employeeToEdit.maxDailyOvertimeHours ?? 3);
      setJoiningDate(employeeToEdit.joiningDate || new Date().toISOString().split("T")[0]);
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
      setShiftId(shifts?.[0]?.id || "");
      setWorkPatternId(workPatterns?.[0]?.id || 1);
      setMonthlyBaseSalary("3500");
      setSalaryCurrencyCode(defaultWp?.currencyCode || "PKR");
      setOvertimeHourlyRate("25");
      setCountOffDayAsOvertime(true);
      setOvertimeAllowed(true);
      setMaxDailyOvertimeHours("3");
      setJoiningDate(new Date().toISOString().split("T")[0]);
    }
    setErrorMsg(null);
  }, [employeeToEdit, isOpen, departments, workplaces, shifts, workPatterns]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !name.trim() || !email.trim()) {
      setErrorMsg("Please fill in all required basic fields");
      return;
    }
    if (!primaryWorkplaceId || !shiftId) {
      setErrorMsg("Please select a primary workplace and shift");
      return;
    }

    const selectedWp = workplaces?.find((w) => String(w.id) === String(primaryWorkplaceId));
    const finalCurrency = (selectedWp?.currencyCode || salaryCurrencyCode || "PKR").trim().toUpperCase();

    const payload: EmployeeCreatePayload = {
      employeeId: employeeId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      departmentId: Number(departmentId),
      country: country.trim().toUpperCase(),
      designation: designation.trim(),
      primaryWorkplaceId: Number(primaryWorkplaceId),
      workplaceAssignments: [
        {
          workplaceId: Number(primaryWorkplaceId),
          shiftId: Number(shiftId),
          workPatternId: Number(workPatternId || 1),
        },
      ],
      monthlyBaseSalary: Number(monthlyBaseSalary),
      salaryCurrencyCode: finalCurrency,
      overtimeHourlyRate: Number(overtimeHourlyRate),
      countOffDayAsOvertime,
      overtimeAllowed,
      overtimeAllowedFrom: joiningDate,
      overtimeAllowedUntil: null,
      maxDailyOvertimeHours: maxDailyOvertimeHours ? Number(maxDailyOvertimeHours) : null,
      joiningDate,
    };

    try {
      if (employeeToEdit) {
        await updateMutation.mutateAsync({ id: employeeToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save employee");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {employeeToEdit ? "Edit Employee" : "Register New Employee"}
            </h3>
            <p className="text-xs text-slate-400">Complete workforce & compensation profile</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              1. Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP-101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Bilal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bilal@khanhome.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971501234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Chef, Supervisor, Driver"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Country Code *
                </label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  placeholder="AE"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Workplace & Shift */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              2. Workplace & Shift Assignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Workplace *
                </label>
                <select
                  required
                  value={primaryWorkplaceId}
                  onChange={(e) => {
                    const wpId = e.target.value;
                    setPrimaryWorkplaceId(wpId);
                    const found = workplaces?.find((w) => String(w.id) === String(wpId));
                    if (found?.currencyCode) {
                      setSalaryCurrencyCode(found.currencyCode);
                    }
                    if (found?.countryCode && !employeeToEdit) {
                      setCountry(found.countryCode);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select Workplace</option>
                  {workplaces?.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.countryCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Operating Shift *
                </label>
                <select
                  required
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Shift</option>
                  {shifts?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime?.slice(0, 5)}-{s.endTime?.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Weekly Work Pattern
                </label>
                <select
                  value={workPatternId}
                  onChange={(e) => setWorkPatternId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {workPatterns && workPatterns.length > 0 ? (
                    workPatterns.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  ) : (
                    <option value={1}>Standard 6 Days Week</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Salary & Overtime Policy */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. Compensation & Overtime Policy
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Base Salary *
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={monthlyBaseSalary}
                  onChange={(e) => setMonthlyBaseSalary(e.target.value)}
                  placeholder="3500"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Currency *
                </label>
                <select
                  required
                  value={salaryCurrencyCode}
                  onChange={(e) => setSalaryCurrencyCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="PKR">PKR (Pakistani Rupee)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                  <option value="SAR">SAR (Saudi Riyal)</option>
                </select>
                <span className="text-[10px] text-emerald-400 block mt-1">
                  Auto-synced with workplace currency
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OT Hourly Rate
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={overtimeHourlyRate}
                  onChange={(e) => setOvertimeHourlyRate(e.target.value)}
                  placeholder="25"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Daily OT Hours
                </label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={maxDailyOvertimeHours}
                  onChange={(e) => setMaxDailyOvertimeHours(e.target.value)}
                  placeholder="3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col justify-center space-y-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={overtimeAllowed}
                    onChange={(e) => setOvertimeAllowed(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Overtime Allowed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={countOffDayAsOvertime}
                    onChange={(e) => setCountOffDayAsOvertime(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Count Off-Day as Overtime</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? "Saving..." : employeeToEdit ? "Update Profile" : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
