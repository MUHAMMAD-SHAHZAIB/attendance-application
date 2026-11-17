"use client";

import React, { useState } from "react";
import { EmployeeView } from "../types";
import {
  useEmployeeStatusMutation,
  useEmployeeFullDetailQuery,
} from "../hooks/useEmployees";
import { useShiftsQuery } from "@/features/organization";
import { EmployeeExceptionsList } from "@/features/schedules";

interface EmployeeDetailsPageProps {
  employee: EmployeeView;
  onBack: () => void;
  onEdit: (employee: EmployeeView) => void;
  onManagePhoto: (employee: EmployeeView) => void;
}

export function EmployeeDetailsPage({
  employee: initialEmployee,
  onBack,
  onEdit,
  onManagePhoto,
}: EmployeeDetailsPageProps) {
  const [activeProfileTab, setActiveProfileTab] = useState<"overview" | "day-status" | "work-hours" | "leaves">("overview");

  const { data: fullDetail, isFetching } = useEmployeeFullDetailQuery(
    initialEmployee?.id,
  );
  const { data: allShifts } = useShiftsQuery();
  const employee = fullDetail?.employee || initialEmployee;
  const exceptions = fullDetail?.exceptions || [];
  const scheduleOverrides = fullDetail?.scheduleOverrides || [];
  const leaves = fullDetail?.leaves || [];
  const statusMutation = useEmployeeStatusMutation();

  const getShiftTiming = (
    shiftId?: number | null,
    shiftName?: string | null,
  ) => {
    if (!allShifts || allShifts.length === 0) return null;
    const match = allShifts.find(
      (s) =>
        (shiftId && s.id === Number(shiftId)) ||
        (shiftName &&
          s.name?.trim().toLowerCase() === shiftName.trim().toLowerCase()),
    );
    if (!match || !match.startTime || !match.endTime) return null;
    const start =
      match.startTime.length >= 5
        ? match.startTime.slice(0, 5)
        : match.startTime;
    const end =
      match.endTime.length >= 5 ? match.endTime.slice(0, 5) : match.endTime;
    return `${start} - ${end}`;
  };

  const toggleStatus = async () => {
    const newStatus = employee.status === "active" ? "inactive" : "active";
    if (confirm(`Change status of ${employee.name} to ${newStatus}?`)) {
      await statusMutation.mutateAsync({ id: employee.id, status: newStatus });
    }
  };

  // Resolve unique active workplaces and guarantee STRICTLY ONLY ONE PRIMARY WORKPLACE
  const todayStr = new Date().toISOString().split("T")[0];
  const activeWorkplaces = (employee.workplaces || []).filter((w) => {
    return !w.validTo || w.validTo >= todayStr;
  });

  // Deduplicate by workplaceId
  const seenWorkplaceIds = new Set<string>();
  const uniqueActiveWorkplaces = activeWorkplaces.filter((w) => {
    const idStr = String(w.workplaceId);
    if (seenWorkplaceIds.has(idStr)) return false;
    seenWorkplaceIds.add(idStr);
    return true;
  });

  // Exactly ONE primary workplace: matching employee.primaryWorkplaceId
  const primaryIdStr = String(employee.primaryWorkplaceId);
  let primaryFound = false;
  const initialMapped = uniqueActiveWorkplaces.map((w) => {
    const isThisPrimary = primaryIdStr
      ? String(w.workplaceId) === primaryIdStr
      : false;
    if (isThisPrimary && !primaryFound) {
      primaryFound = true;
      return { ...w, isPrimary: true };
    }
    return { ...w, isPrimary: false };
  });

  // If none matched primaryWorkplaceId, designate only the first one as primary
  const displayWorkplaces = initialMapped
    .map((w, idx) => {
      if (!primaryFound && idx === 0) {
        primaryFound = true;
        return { ...w, isPrimary: true };
      }
      return w;
    })
    .sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-slate-700 transition-colors">
            ←
          </span>
          <span>Back to All Employees</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onManagePhoto(employee)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Upload or update employee profile photo"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Photo</span>
          </button>

          <button
            onClick={toggleStatus}
            disabled={statusMutation.isPending}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              employee.status === "active"
                ? "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            {statusMutation.isPending
              ? "Updating..."
              : employee.status === "active"
                ? "Deactivate Account"
                : "Activate Account"}
          </button>

          <button
            onClick={() => onEdit(employee)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Hero Profile Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              onClick={() => onManagePhoto(employee)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer relative group shadow-md"
              title="Click to update employee photo"
            >
              {employee.hasPhoto && employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-medium">
                Change Photo
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {employee.name}
                </h1>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {employee.employeeId}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    employee.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {employee.status}
                </span>
                {isFetching && (
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 animate-pulse">
                    Syncing live data...
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300">
                <span className="font-semibold text-white">{employee.designation || "Staff Member"}</span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-emerald-400 font-medium">{employee.department || "No Department"}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                <span>📧 {employee.email}</span>
                <span>📞 {employee.phone || "No phone registered"}</span>
                <span>🌍 {employee.country || "AE"}</span>
                <span>📅 Joined: {employee.joiningDate || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          {/* Primary Workplace */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Primary Workplace
            </span>
            <span className="text-xs font-semibold text-white mt-1 block truncate">
              {employee.primaryWorkplace || "Default Workplace"}
            </span>
          </div>

          {/* Assigned Shift */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Duty Shift
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-300 truncate">
                {employee.workplaceShift || "Standard"}
              </span>
              {getShiftTiming(employee.workplaceShiftId, employee.workplaceShift) && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {getShiftTiming(employee.workplaceShiftId, employee.workplaceShift)}
                </span>
              )}
            </div>
          </div>

          {/* Monthly Base Salary */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Monthly Salary
            </span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block">
              {employee.monthlyBaseSalary} {employee.salaryCurrencyCode}
            </span>
          </div>

          {/* Overtime Policy */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Overtime Policy
            </span>
            <span className={`text-xs font-bold mt-1 block ${employee.overtimeAllowed ? "text-emerald-400" : "text-rose-400"}`}>
              {employee.overtimeAllowed ? "✓ Overtime Enabled" : "✕ Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveProfileTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === "overview"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/5"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <span>👤 Profile & Employment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab("day-status")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === "day-status"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/5"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <span>🗓️ Day Off & Shift Swaps</span>
          {exceptions.length > 0 && (
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {exceptions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab("work-hours")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === "work-hours"
              ? "bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-md shadow-teal-500/5"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <span>⏱️ Custom Work Hours</span>
          {scheduleOverrides.length > 0 && (
            <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
              {scheduleOverrides.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab("leaves")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === "leaves"
              ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-500/5"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <span>🌴 Leaves History</span>
          {leaves.length > 0 && (
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              {leaves.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Profile & Employment Details */}
      {activeProfileTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Card 1: Employment & Workplace Assignment */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🏢 Workplace & Roster Assignment</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-teal-400">
                {displayWorkplaces.length || 1} Location(s)
              </span>
            </div>

            <div className="space-y-3">
              {displayWorkplaces.length > 0 ? (
                displayWorkplaces.map((w, idx) => (
                  <div
                    key={`emp-wp-${w.workplaceId || "none"}-${w.shiftId || "shift"}-${idx}`}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                      w.isPrimary
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{w.workplaceName}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            w.isPrimary
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {w.isPrimary ? "⭐ Primary" : "Secondary"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                        <span>
                          Shift:{" "}
                          <span className="text-teal-300 font-medium">
                            {w.shiftName || "Standard Shift"}
                          </span>
                        </span>
                        {getShiftTiming(w.shiftId, w.shiftName) && (
                          <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {getShiftTiming(w.shiftId, w.shiftName)}
                          </span>
                        )}
                        {w.workPatternName && (
                          <span>· Pattern: <strong className="text-slate-300">{w.workPatternName}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{employee.primaryWorkplace || "Standard Workplace"}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⭐ Primary
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-300">
                    Shift: {employee.workplaceShift || "Standard Shift"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Compensation & Overtime Rules */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>💰 Compensation & Duty Rules</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-amber-400">
                Payroll
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Monthly Base Salary:</span>
                <span className="text-white font-bold text-sm">
                  {employee.monthlyBaseSalary} {employee.salaryCurrencyCode}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Overtime Hourly Rate:</span>
                <span className="text-emerald-400 font-semibold">
                  {employee.overtimeHourlyRate} {employee.salaryCurrencyCode} / hour
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Overtime Eligibility:</span>
                <span className={`font-bold ${employee.overtimeAllowed ? "text-emerald-400" : "text-rose-400"}`}>
                  {employee.overtimeAllowed ? "✓ Enabled (Eligible for OT)" : "✕ Disabled"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Rest-Day Work Paid as OT:</span>
                <span className={`font-semibold ${employee.countOffDayAsOvertime ? "text-emerald-400" : "text-slate-400"}`}>
                  {employee.countOffDayAsOvertime ? "Yes (Paid as Overtime)" : "No (Standard Pay)"}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Max Daily Overtime Allowed:</span>
                <span className="text-white font-medium">
                  {employee.maxDailyOvertimeHours ? `${employee.maxDailyOvertimeHours} hours / day` : "No Limit"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Day Off & Shift Swaps */}
      {activeProfileTab === "day-status" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            💡 <strong>Day Status Adjustments:</strong> Mark specific single dates as Day Off (excused from duty), assign duty on scheduled rest days/weekends, or swap to an alternate shift.
          </div>

          <EmployeeExceptionsList
            fixedEmployeeId={employee.id}
            hideEmployeeSelect
            hideHeader
            mode="day-status"
          />
        </div>
      )}

      {/* Tab 3: Custom Daily Work Hours */}
      {activeProfileTab === "work-hours" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            💡 <strong>Custom Work Hours:</strong> Set custom duty start, finish, and break timings for this employee on specific dates.
          </div>

          <EmployeeExceptionsList
            fixedEmployeeId={employee.id}
            hideEmployeeSelect
            hideHeader
            mode="work-hours"
          />
        </div>
      )}

      {/* Tab 3: Leaves History */}
      {activeProfileTab === "leaves" && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Annual Leaves History</h3>
              <p className="text-[11px] text-slate-400">All registered annual leave requests and their review status</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {leaves.length} leave record(s)
            </span>
          </div>

          {leaves.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No leave records registered for this employee.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date Range</th>
                    <th className="py-2.5 px-3">Pay Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-medium text-white">
                        {l.startDate} to {l.endDate}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          l.payType === "paid"
                            ? "bg-teal-500/10 text-teal-300 border-teal-500/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        }`}>
                          {l.payType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          l.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : l.status === "rejected"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 italic">
                        {l.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
