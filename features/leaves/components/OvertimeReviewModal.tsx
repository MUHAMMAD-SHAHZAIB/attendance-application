"use client";

import React, { useState } from "react";
import { OvertimeRequestView } from "../types";
import { useReviewOvertimeMutation } from "../hooks/useLeaves";

interface OvertimeReviewModalProps {
  overtime: OvertimeRequestView;
  onClose: () => void;
}

export function OvertimeReviewModal({ overtime, onClose }: OvertimeReviewModalProps) {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [approvedMinutes, setApprovedMinutes] = useState<number>(
    overtime.approvedMinutes ?? overtime.requestedMinutes ?? 60
  );
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reviewMutation = useReviewOvertimeMutation();

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await reviewMutation.mutateAsync({
        id: overtime.id,
        payload: {
          status,
          approvedMinutes: status === "approved" ? Number(approvedMinutes) : 0,
          note: note.trim() || undefined,
        },
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        error?.response?.data?.message || "Failed to submit overtime review. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Review Overtime Request</h3>
              <p className="text-xs text-slate-400">
                Verify extra hours for <span className="text-teal-300 font-medium">{overtime.employeeName}</span> ({overtime.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Summary Details Box */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Work Date:</span>
            <span className="text-white font-medium">{overtime.workDate}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Workplace Location:</span>
            <span className="text-white font-medium">{overtime.workplaceName || "Primary Workplace"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Requested Overtime:</span>
            <span className="text-amber-400 font-bold font-mono">
              {formatMinutes(overtime.requestedMinutes)} ({overtime.requestedMinutes} mins)
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Current Status:</span>
            <span className="capitalize font-semibold text-slate-300">{overtime.status}</span>
          </div>
        </div>

        {/* Form Actions */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Decision *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("approved")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  status === "approved"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve Overtime</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("rejected")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  status === "rejected"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Reject Overtime</span>
              </button>
            </div>
          </div>

          {/* Approved Minutes (if approving) */}
          {status === "approved" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Approved Duration (Minutes) *
                </label>
                <span className="text-xs font-mono font-bold text-teal-400">
                  = {formatMinutes(approvedMinutes)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1440"
                  step="15"
                  value={approvedMinutes}
                  onChange={(e) => setApprovedMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
                  required
                />
                <div className="flex items-center gap-1.5 absolute right-2.5 top-2">
                  <button
                    type="button"
                    onClick={() => setApprovedMinutes(overtime.requestedMinutes)}
                    className="text-[10px] text-teal-300 hover:text-white bg-teal-500/20 hover:bg-teal-500/30 px-2 py-0.5 rounded border border-teal-500/30 transition-colors"
                    title="Reset to requested duration"
                  >
                    Match Full
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                You can adjust approved minutes if required (e.g. 60m = 1 hour, 120m = 2 hours).
              </p>
            </div>
          )}

          {/* Reviewer Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reviewer Note / Approval Remarks (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Verified check-out punch logs and approved 2 hours..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={reviewMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 ${
                status === "approved"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
              }`}
            >
              {reviewMutation.isPending && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>
                {reviewMutation.isPending
                  ? "Saving..."
                  : status === "approved"
                  ? "Confirm Overtime"
                  : "Reject Overtime"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
