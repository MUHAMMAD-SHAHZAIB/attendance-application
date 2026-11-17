"use client";

import React, { useState, useEffect } from "react";
import {
  useLeaveRequestsQuery,
  useOvertimeRequestsQuery,
} from "../hooks/useLeaves";
import { LeaveRequestView, OvertimeRequestView } from "../types";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { OvertimeReviewModal } from "./OvertimeReviewModal";

type SubTab = "leaves" | "overtime";

export function LeavesTabs() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("leaves");

  // Sync subtab with URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subtab");
    if (sub === "leaves" || sub === "overtime") {
      setActiveSubTab(sub);
    }
  }, []);

  const handleSubTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("subtab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // State for Leaves Tab
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>("pending");
  const [leaveSearch, setLeaveSearch] = useState<string>("");
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState<LeaveRequestView | null>(null);

  // State for Overtime Tab
  const [otStatusFilter, setOtStatusFilter] = useState<string>("pending");
  const [otSearch, setOtSearch] = useState<string>("");
  const [selectedOtForReview, setSelectedOtForReview] = useState<OvertimeRequestView | null>(null);

  // Queries
  const { data: leaves = [], isLoading: leavesLoading, refetch: refetchLeaves } =
    useLeaveRequestsQuery(leaveStatusFilter);

  const { data: overtimes = [], isLoading: otLoading, refetch: refetchOvertimes } =
    useOvertimeRequestsQuery(otStatusFilter);

  // Helpers
  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const calculateDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 1;
    }
  };

  // Filtered lists
  const filteredLeaves = leaves.filter((l) => {
    if (!leaveSearch.trim()) return true;
    const q = leaveSearch.toLowerCase();
    return (
      l.employeeName?.toLowerCase().includes(q) ||
      l.employeeCode?.toLowerCase().includes(q) ||
      l.reason?.toLowerCase().includes(q)
    );
  });

  const filteredOvertimes = overtimes.filter((ot) => {
    if (!otSearch.trim()) return true;
    const q = otSearch.toLowerCase();
    return (
      ot.employeeName?.toLowerCase().includes(q) ||
      ot.employeeCode?.toLowerCase().includes(q) ||
      ot.workplaceName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Subtab Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => handleSubTabChange("leaves")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "leaves"
                ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Leave Requests</span>
            {leaveStatusFilter === "pending" && leaves.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSubTab === "leaves" ? "bg-slate-950 text-teal-300" : "bg-teal-500/20 text-teal-300"
              }`}>
                {leaves.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSubTabChange("overtime")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "overtime"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Overtime Review</span>
            {otStatusFilter === "pending" && overtimes.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSubTab === "overtime" ? "bg-slate-950 text-amber-900" : "bg-amber-500/20 text-amber-300"
              }`}>
                {overtimes.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => {
            if (activeSubTab === "leaves") refetchLeaves();
            else refetchOvertimes();
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors w-fit self-end sm:self-auto cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. LEAVE REQUESTS SUBTAB */}
      {/* ============================================================== */}
      {activeSubTab === "leaves" && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["pending", "approved", "rejected", "all"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLeaveStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    leaveStatusFilter === st
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                      : "text-slate-400 hover:text-white border border-transparent hover:bg-slate-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={leaveSearch}
                onChange={(e) => setLeaveSearch(e.target.value)}
                placeholder="Search by name, code or reason..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
              />
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="absolute left-3 top-2.5 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Leaves Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Employee</th>
                    <th className="py-3 px-4 font-semibold">Duration & Dates</th>
                    <th className="py-3 px-4 font-semibold">Pay Type</th>
                    <th className="py-3 px-4 font-semibold">Reason</th>
                    <th className="py-3 px-4 font-semibold">Submitted</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leavesLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-teal-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Loading leave requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No {leaveStatusFilter !== "all" ? leaveStatusFilter : ""} leave requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((l) => {
                      const days = calculateDays(l.startDate, l.endDate);
                      return (
                        <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
                                {l.employeeName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">{l.employeeName}</span>
                                <span className="font-mono text-[10px] text-slate-400">{l.employeeCode}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-medium text-white">{l.startDate} to {l.endDate}</span>
                              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                                {days} {days === 1 ? "day" : "days"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              l.payType === "paid"
                                ? "bg-teal-500/10 text-teal-300 border-teal-500/20"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            }`}>
                              {l.payType}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-[220px]">
                            <p className="truncate text-slate-300 text-xs" title={l.reason || ""}>
                              {l.reason || "—"}
                            </p>
                            {l.reviewNote && (
                              <p className="text-[10px] text-slate-500 italic truncate mt-0.5" title={`Admin note: ${l.reviewNote}`}>
                                Note: {l.reviewNote}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {l.requestedAt ? new Date(l.requestedAt).toLocaleDateString() : "—"}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              l.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : l.status === "rejected"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse"
                            }`}>
                              {l.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedLeaveForReview(l)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. OVERTIME REQUESTS SUBTAB */}
      {/* ============================================================== */}
      {activeSubTab === "overtime" && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["pending", "approved", "rejected", "all"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOtStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    otStatusFilter === st
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:text-white border border-transparent hover:bg-slate-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={otSearch}
                onChange={(e) => setOtSearch(e.target.value)}
                placeholder="Search by name, code or branch..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
              />
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="absolute left-3 top-2.5 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Overtime Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Employee</th>
                    <th className="py-3 px-4 font-semibold">Workplace</th>
                    <th className="py-3 px-4 font-semibold">Work Date</th>
                    <th className="py-3 px-4 font-semibold">Requested OT</th>
                    <th className="py-3 px-4 font-semibold">Approved OT</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {otLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Loading overtime requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOvertimes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No {otStatusFilter !== "all" ? otStatusFilter : ""} overtime requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredOvertimes.map((ot) => (
                      <tr key={ot.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                              {ot.employeeName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">{ot.employeeName}</span>
                              <span className="font-mono text-[10px] text-slate-400">{ot.employeeCode}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          {ot.workplaceName || "Primary"}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-white">
                          {ot.workDate}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">
                          {formatMinutes(ot.requestedMinutes)}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-teal-300">
                          {ot.approvedMinutes !== null && ot.approvedMinutes !== undefined
                            ? formatMinutes(ot.approvedMinutes)
                            : "—"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            ot.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : ot.status === "rejected"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse"
                          }`}>
                            {ot.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOtForReview(ot)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modals */}
      {selectedLeaveForReview && (
        <LeaveReviewModal
          leave={selectedLeaveForReview}
          onClose={() => setSelectedLeaveForReview(null)}
        />
      )}

      {selectedOtForReview && (
        <OvertimeReviewModal
          overtime={selectedOtForReview}
          onClose={() => setSelectedOtForReview(null)}
        />
      )}
    </div>
  );
}
