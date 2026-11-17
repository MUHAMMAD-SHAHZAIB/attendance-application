"use client";

import React, { useState } from "react";
import { AttendanceEntry, AttendanceFilterParams } from "../types";
import {
  useAttendanceDashboardQuery,
  useAttendanceRecordsQuery,
} from "../hooks/useAttendance";
import { useDepartmentsQuery, useWorkplacesQuery } from "@/features/organization";
import { PunchHistoryModal } from "./PunchHistoryModal";
import { AttendanceCorrectionModal } from "./AttendanceCorrectionModal";
import { ManualDayModal } from "./ManualDayModal";
import { BulkAbsencePayModal } from "./BulkAbsencePayModal";

export function AttendanceTable() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState<AttendanceFilterParams>({
    search: "",
    workplaceId: undefined,
    departmentId: undefined,
    countryCode: "",
    dateFilter: "today",
    from: todayStr,
    to: todayStr,
    status: "all",
    late: undefined,
    page: 1,
    pageSize: 20,
  });

  const { data: dashboard, isLoading: isDashboardLoading } = useAttendanceDashboardQuery();
  const { data: recordsPage, isLoading, isError, error } = useAttendanceRecordsQuery(filters);
  const { data: workplaces } = useWorkplacesQuery();
  const { data: departments } = useDepartmentsQuery();

  // Modals
  const [selectedRecordForPunches, setSelectedRecordForPunches] = useState<AttendanceEntry | null>(null);
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState<AttendanceEntry | null>(null);
  const [manualPrefill, setManualPrefill] = useState<{ employeeId?: number; name?: string } | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkAbsenceModalOpen, setIsBulkAbsenceModalOpen] = useState(false);

  // Quick Date Preset Handler
  const handleQuickDate = (preset: "today" | "yesterday" | "week" | "month" | "all") => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === "today") {
      const today = fmt(now);
      setFilters((prev) => ({ ...prev, dateFilter: "today", from: today, to: today, page: 1 }));
    } else if (preset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = fmt(y);
      setFilters((prev) => ({ ...prev, dateFilter: "yesterday", from: yStr, to: yStr, page: 1 }));
    } else if (preset === "week") {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      setFilters((prev) => ({ ...prev, dateFilter: "custom", from: fmt(w), to: fmt(now), page: 1 }));
    } else if (preset === "month") {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters((prev) => ({ ...prev, dateFilter: "custom", from: fmt(m), to: fmt(now), page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, dateFilter: "all", from: undefined, to: undefined, page: 1 }));
    }
  };

  const records = Array.isArray(recordsPage?.records) ? recordsPage.records : [];
  const total = recordsPage?.total ?? 0;
  const currentPage = recordsPage?.page ?? 1;
  const totalPages = recordsPage?.totalPages ?? 1;

  // Format minutes into "Xh Ym"
  const formatMins = (minutes: number) => {
    if (!minutes || minutes <= 0) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Format ISO time to HH:mm
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* 1. Live Attendance Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Present Today</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {isDashboardLoading ? "—" : dashboard?.presentToday ?? 0}
          </div>
          <span className="text-[10px] text-slate-500">Active workforce check-ins</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Late Arrivals</span>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {isDashboardLoading ? "—" : dashboard?.lateToday ?? 0}
          </div>
          <span className="text-[10px] text-slate-500">Beyond shift grace period</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open Shifts</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {isDashboardLoading ? "—" : dashboard?.openShifts ?? 0}
          </div>
          <span className="text-[10px] text-slate-500">Awaiting checkout punch</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Review</span>
            <span className="w-2 h-2 rounded-full bg-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 mt-1">
            {isDashboardLoading ? "—" : dashboard?.pendingReview ?? 0}
          </div>
          <span className="text-[10px] text-slate-500">Corrections & discrepancies</span>
        </div>
      </div>

      {/* 2. Top Filter and Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        {/* Row A: Quick Dates & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Date Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => handleQuickDate("today")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                filters.dateFilter === "today"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDate("yesterday")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                filters.dateFilter === "yesterday"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handleQuickDate("week")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                filters.dateFilter === "custom" && filters.from !== todayStr
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickDate("month")}
              className="px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickDate("all")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                filters.dateFilter === "all"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              All Time
            </button>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkAbsenceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700/60"
            >
              Bulk Absence Pay
            </button>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all shadow-md shadow-blue-950/15 cursor-pointer"
            >
              <svg width="14" height="14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Log Manual Day</span>
            </button>
          </div>
        </div>

        {/* Row B: Granular Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-800/60 text-xs">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <svg width="14" height="14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Search employee name or code..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Workplace */}
          <select
            value={filters.workplaceId || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                workplaceId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Workplaces</option>
            {workplaces?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Department */}
          <select
            value={filters.departmentId || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                departmentId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Record Status */}
          <select
            value={filters.recordStatus || "all"}
            onChange={(e) => setFilters((prev) => ({ ...prev, recordStatus: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Attendance</option>
            <option value="open">Open (Checked In)</option>
            <option value="complete">Complete</option>
            <option value="missing_checkout">Missing Checkout</option>
            <option value="absent">Absent</option>
            <option value="not_checked_in">Not Checked In</option>
            <option value="leave">On Leave</option>
            <option value="off">Off Day</option>
          </select>

          {/* Late Toggle */}
          <div className="flex items-center px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={filters.late === true}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    late: e.target.checked ? true : undefined,
                    page: 1,
                  }))
                }
                className="w-3.5 h-3.5 rounded text-rose-500 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="truncate">Late Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Loading & Error States */}
      {isLoading && (
        <div className="p-10 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/80">
          Loading attendance records...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load attendance logs: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* 4. Attendance Table */}
      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Employee</th>
                  <th className="px-5 py-3.5 font-semibold">Workplace & Date</th>
                  <th className="px-5 py-3.5 font-semibold">Check-In</th>
                  <th className="px-5 py-3.5 font-semibold">Check-Out</th>
                  <th className="px-5 py-3.5 font-semibold">Duration</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Review</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                      No attendance records found for this period.
                    </td>
                  </tr>
                ) : (
                  records.map((entry, idx) => {
                    const rowKey =
                      entry.id != null
                        ? `att-${entry.id}`
                        : `no-att-${entry.employeeId || "emp"}-${entry.workDate || "date"}-${idx}`;

                    return (
                      <tr key={rowKey} className="hover:bg-slate-800/30 transition-colors">
                        {/* Employee */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{entry.name || "Unknown"}</div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {entry.employeeId} · {entry.department || "No Dept"}
                          </div>
                        </td>

                        {/* Workplace & Date */}
                        <td className="px-5 py-3.5">
                          <span className="text-slate-200 block font-medium">
                            {entry.workplace || "Standard Workplace"}
                          </span>
                          <span className="text-[11px] text-slate-400">{entry.workDate}</span>
                        </td>

                        {/* Check-In */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white">{formatTime(entry.checkInAt)}</span>
                            {entry.late && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                LATE
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Check-Out */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white">{formatTime(entry.checkOutAt)}</span>
                            {entry.open && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                OPEN
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Duration & Overtime */}
                        <td className="px-5 py-3.5">
                          <div className="text-white font-medium flex items-center gap-1.5">
                            <span>{formatMins(entry.workedMinutes)}</span>
                            <span className="text-slate-500 font-normal text-[10px]">
                              / {formatMins(entry.scheduledMinutes)}
                            </span>
                            {entry.withinAllowedHours && (
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1 py-0.2 rounded border border-cyan-500/20" title="Clipped to scheduled shift duty window">
                                Clipped
                              </span>
                            )}
                          </div>
                          {entry.overtimeMinutes > 0 && (
                            <div className="text-[10px] text-emerald-400 font-medium">
                              +{formatMins(entry.overtimeMinutes)} OT
                            </div>
                          )}
                          {entry.shortfallMinutes > 0 && (
                            <div className="text-[10px] text-rose-400">
                              -{formatMins(entry.shortfallMinutes)} short
                            </div>
                          )}
                        </td>

                        {/* Record Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              entry.recordStatus === "present" || entry.recordStatus === "complete"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : entry.recordStatus === "open"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                : entry.recordStatus === "missing_checkout"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : entry.recordStatus === "absent"
                                ? entry.absencePayType === "paid"
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : entry.recordStatus === "leave"
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                : entry.recordStatus === "off"
                                ? "bg-slate-800 text-slate-300 border-slate-700"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {entry.recordStatus === "absent" && entry.absencePayType
                              ? `Absent (${entry.absencePayType})`
                              : entry.recordStatus === "off"
                              ? "Off Day"
                              : entry.recordStatus === "not_checked_in"
                              ? "Not Checked In"
                              : entry.recordStatus === "missing_checkout"
                              ? "Missing Out"
                              : entry.recordStatus}
                          </span>
                        </td>

                        {/* Review Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-medium ${
                              entry.reviewStatus === "approved"
                                ? "text-emerald-400"
                                : entry.reviewStatus === "flagged"
                                ? "text-rose-400 font-bold"
                                : "text-amber-400"
                            }`}
                          >
                            {entry.reviewStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Punches Modal */}
                            <button
                              onClick={() => setSelectedRecordForPunches(entry)}
                              disabled={!entry.id}
                              title={entry.id ? "View punch logs" : "No punch logs (not checked in)"}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>

                            {/* Correction or Manual Entry */}
                            <button
                              onClick={() => {
                                if (entry.id) {
                                  setSelectedRecordForCorrection(entry);
                                } else {
                                  setManualPrefill({ employeeId: entry.employeeRecordId, name: entry.name });
                                  setIsManualModalOpen(true);
                                }
                              }}
                              title={entry.id ? "Correct attendance" : "Add manual attendance entry"}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span> ({total} records)
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }))}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PunchHistoryModal
        isOpen={!!selectedRecordForPunches}
        onClose={() => setSelectedRecordForPunches(null)}
        record={selectedRecordForPunches}
      />

      <AttendanceCorrectionModal
        isOpen={!!selectedRecordForCorrection}
        onClose={() => setSelectedRecordForCorrection(null)}
        record={selectedRecordForCorrection}
      />

      <ManualDayModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setManualPrefill(null);
        }}
        prefillEmployeeId={manualPrefill?.employeeId}
        prefillEmployeeName={manualPrefill?.name}
      />

      <BulkAbsencePayModal
        isOpen={isBulkAbsenceModalOpen}
        onClose={() => setIsBulkAbsenceModalOpen(false)}
      />
    </div>
  );
}
