"use client";

import React, { useState, useEffect } from "react";
import { EmployeeView, useEmployeesQuery, useEmployeeDetailsQuery } from "@/features/employees";
import {
  useDayExceptionsQuery,
  useDeleteDayExceptionMutation,
  useDeleteScheduleOverrideMutation,
  useScheduleOverridesQuery,
} from "../hooks/useSchedules";
import { DailyScheduleOverrideView, DayExceptionView } from "../types";
import { DayExceptionModal } from "./DayExceptionModal";
import { DailyScheduleOverrideModal } from "./DailyScheduleOverrideModal";

interface EmployeeExceptionsListProps {
  fixedEmployeeId?: number;
  hideEmployeeSelect?: boolean;
  hideHeader?: boolean;
  mode?: "all" | "day-status" | "work-hours";
}

export function EmployeeExceptionsList({
  fixedEmployeeId,
  hideEmployeeSelect = false,
  hideHeader = false,
  mode = "all",
}: EmployeeExceptionsListProps = {}) {
  const { data: employeesData } = useEmployeesQuery({ page: 1 });
  const employees: EmployeeView[] = employeesData?.employees || [];

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">(
    fixedEmployeeId || ""
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"day-status" | "work-hours">("day-status");
  const currentTab = mode === "all" ? activeSubTab : mode;

  useEffect(() => {
    if (fixedEmployeeId) {
      setSelectedEmployeeId(fixedEmployeeId);
    }
  }, [fixedEmployeeId]);

  // Date filters
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const monthEnd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  )}`;

  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(monthEnd);

  // Queries for the selected employee
  const numEmployeeId = Number(selectedEmployeeId) || 0;
  const {
    data: exceptions,
    isLoading: isExceptionsLoading,
  } = useDayExceptionsQuery(numEmployeeId, fromDate, toDate);

  const {
    data: overrides,
    isLoading: isOverridesLoading,
  } = useScheduleOverridesQuery(numEmployeeId, fromDate, toDate);

  // Fallback single employee query if employee is not on page 1
  const { data: directEmployee } = useEmployeeDetailsQuery(numEmployeeId || null);

  // Mutations
  const deleteExceptionMutation = useDeleteDayExceptionMutation();
  const deleteOverrideMutation = useDeleteScheduleOverrideMutation();

  // Modals state
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<DayExceptionView | null>(null);

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<DailyScheduleOverrideView | null>(null);

  // Filtered employees for dropdown
  const filteredEmployees = employees.filter((emp: EmployeeView) => {
    if (!employeeSearch) return true;
    const q = employeeSearch.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q)
    );
  });

  const activeEmployee = employees.find((e: EmployeeView) => e.id === Number(selectedEmployeeId)) || directEmployee;

  const handleDeleteException = async (exceptionId: number) => {
    if (!confirm("Are you sure you want to delete this day exception?")) return;
    try {
      await deleteExceptionMutation.mutateAsync({
        employeeId: numEmployeeId,
        exceptionId,
      });
    } catch (err: any) {
      alert(err?.message || "Failed to delete exception");
    }
  };

  const handleDeleteOverride = async (overrideId: number) => {
    if (!confirm("Are you sure you want to delete this schedule override?")) return;
    try {
      await deleteOverrideMutation.mutateAsync({
        employeeId: numEmployeeId,
        overrideId,
      });
    } catch (err: any) {
      alert(err?.message || "Failed to delete override");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Employee Selection Bar */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 space-y-4">
        {!hideHeader && (
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Employee Schedule Adjustments & Custom Hours
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage single-day day-offs, working rest days, shift swaps, and custom duty hours per employee
            </p>
          </div>
        )}

        {/* Filters Grid */}
        <div className={`grid grid-cols-1 ${hideEmployeeSelect ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3 ${!hideHeader ? "pt-2" : ""}`}>
          {/* Employee Selector (Only if not hidden) */}
          {!hideEmployeeSelect && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Select Employee
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">— Select an employee —</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId}) · {emp.primaryWorkplace || "No Workplace"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Selected Employee Info Banner (only when employee select is shown or when header is visible) */}
        {!hideEmployeeSelect && activeEmployee && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                {activeEmployee.name?.charAt(0) || "E"}
              </div>
              <div>
                <span className="font-semibold text-white">{activeEmployee.name}</span>
                <span className="text-slate-400 text-[11px] ml-2">
                  ID: #{activeEmployee.id} · Code: {activeEmployee.employeeId} · {activeEmployee.designation || "Staff"}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Workplace: <span className="text-slate-200 font-medium">{activeEmployee.primaryWorkplace || "Default"}</span>
            </div>
          </div>
        )}
      </div>

      {!selectedEmployeeId ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
          Please select an employee above to view or manage their schedule adjustments and custom work hours.
        </div>
      ) : (
        <div className="space-y-4">
          {mode === "all" && (
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveSubTab("day-status")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeSubTab === "day-status"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <span>🗓️ Day Off & Shift Swaps</span>
                {exceptions && exceptions.length > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {exceptions.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("work-hours")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeSubTab === "work-hours"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <span>⏱️ Custom Daily Work Hours</span>
                {overrides && overrides.length > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                    {overrides.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* 1. Day Off / Work / Shift Swap Section */}
          {currentTab === "day-status" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Day Off / Work / Shift Swap</h3>
                  <p className="text-[11px] text-slate-400">Single-day status: mark day off, duty on rest day, or swap shift</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedException(null);
                    setIsExceptionModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Add Day Adjustment</span>
                </button>
              </div>

              {isExceptionsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-xl border border-slate-800">
                  Loading day adjustments...
                </div>
              ) : (!exceptions || exceptions.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                  No day adjustments found for this date range.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3.5 py-2.5">Date</th>
                        <th className="px-3.5 py-2.5">Type</th>
                        <th className="px-3.5 py-2.5">Shift / Workplace</th>
                        <th className="px-3.5 py-2.5">Reason</th>
                        <th className="px-3.5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {exceptions.map((exc) => (
                        <tr key={exc.id} className="hover:bg-slate-800/30">
                          <td className="px-3.5 py-2.5 font-medium text-white">{exc.workDate}</td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                exc.exceptionType === "OFF"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : exc.exceptionType === "WORK"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              }`}
                            >
                              {exc.exceptionType === "OFF" ? "DAY OFF" : exc.exceptionType === "WORK" ? "WORK ON REST DAY" : "SHIFT SWAP"}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="block text-slate-200">{exc.shiftName || "Standard Shift"}</span>
                            <span className="text-[10px] text-slate-500">{exc.workplaceName || "Workplace"}</span>
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-400 text-[11px]">
                            {exc.reason || "—"}
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedException(exc);
                                  setIsExceptionModalOpen(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => handleDeleteException(exc.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Custom Daily Work Hours Section */}
          {currentTab === "work-hours" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Custom Daily Work Hours</h3>
                  <p className="text-[11px] text-slate-400">Custom start, end, and break hours for specific days</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOverride(null);
                    setIsOverrideModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Custom Work Hours</span>
                </button>
              </div>

              {isOverridesLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-xl border border-slate-800">
                  Loading custom work hours...
                </div>
              ) : (!overrides || overrides.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                  No custom work hours found for this date range.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3.5 py-2.5">Date</th>
                        <th className="px-3.5 py-2.5">Duty Hours</th>
                        <th className="px-3.5 py-2.5">Break</th>
                        <th className="px-3.5 py-2.5">Reason</th>
                        <th className="px-3.5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {overrides.map((ovr) => (
                        <tr key={ovr.id} className="hover:bg-slate-800/30">
                          <td className="px-3.5 py-2.5 font-medium text-white">{ovr.workDate}</td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-semibold text-emerald-400">
                              {ovr.dutyStart?.substring(0, 5)} - {ovr.dutyFinish?.substring(0, 5)}
                            </span>
                            {ovr.crossesMidnight && (
                              <span className="block text-[9px] text-amber-400 font-bold mt-0.5">
                                +1 Day (Midnight)
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-[11px] text-slate-400">
                            {ovr.breakStart && ovr.breakEnd
                              ? `${ovr.breakStart.substring(0, 5)} - ${ovr.breakEnd.substring(0, 5)} (${ovr.allowedBreakMinutes}m)`
                              : `${ovr.allowedBreakMinutes}m break`}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-400 text-[11px]">
                            {ovr.reason || "—"}
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedOverride(ovr);
                                  setIsOverrideModalOpen(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => handleDeleteOverride(ovr.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
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
      )}

      {/* Modals */}
      {numEmployeeId > 0 && (
        <>
          <DayExceptionModal
            isOpen={isExceptionModalOpen}
            onClose={() => setIsExceptionModalOpen(false)}
            employeeId={numEmployeeId}
            exceptionToEdit={selectedException}
          />

          <DailyScheduleOverrideModal
            isOpen={isOverrideModalOpen}
            onClose={() => setIsOverrideModalOpen(false)}
            employeeId={numEmployeeId}
            overrideToEdit={selectedOverride}
          />
        </>
      )}
    </div>
  );
}
