"use client";

import React, { useState } from "react";
import { LeaveRequestView, LeavePayType } from "../types";
import { useReviewLeaveMutation } from "../hooks/useLeaves";

interface LeaveReviewModalProps {
  leave: LeaveRequestView;
  onClose: () => void;
}

export function LeaveReviewModal({ leave, onClose }: LeaveReviewModalProps) {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [payType, setPayType] = useState<LeavePayType>(leave.payType || "paid");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reviewMutation = useReviewLeaveMutation();

  // Calculate day count
  const calculateDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return 1;
    }
  };

  const daysCount = calculateDays(leave.startDate, leave.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await reviewMutation.mutateAsync({
        leaveId: leave.id,
        payload: {
          status,
          payType: status === "approved" ? payType : undefined,
          note: note.trim() || undefined,
        },
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        error?.response?.data?.message || "Failed to submit review. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Review Leave Request</h3>
              <p className="text-xs text-slate-400">
                Approve or reject leave for <span className="text-teal-300 font-medium">{leave.employeeName}</span> ({leave.employeeCode})
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
            <span className="text-slate-400">Leave Duration:</span>
            <span className="text-white font-medium">
              {leave.startDate} to {leave.endDate} <span className="text-emerald-400 font-bold">({daysCount} {daysCount === 1 ? "day" : "days"})</span>
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Requested Pay Type:</span>
            <span className="font-semibold uppercase text-teal-300">{leave.payType}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Reason / Notes:</span>
            <span className="text-slate-200 max-w-[260px] text-right italic">{leave.reason || "No reason specified"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Submitted On:</span>
            <span className="text-slate-400">
              {leave.requestedAt ? new Date(leave.requestedAt).toLocaleString() : "—"}
            </span>
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
                <span>Approve Leave</span>
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
                <span>Reject Leave</span>
              </button>
            </div>
          </div>

          {/* Pay Type (if approving) */}
          {status === "approved" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Approved Pay Classification *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-colors ${
                  payType === "paid"
                    ? "bg-teal-500/10 border-teal-500/30 text-white"
                    : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}>
                  <input
                    type="radio"
                    name="payType"
                    checked={payType === "paid"}
                    onChange={() => setPayType("paid")}
                    className="text-teal-500 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block">Paid Leave</span>
                    <span className="text-[10px] text-slate-500">Regular salary applies</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-colors ${
                  payType === "unpaid"
                    ? "bg-amber-500/10 border-amber-500/30 text-white"
                    : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}>
                  <input
                    type="radio"
                    name="payType"
                    checked={payType === "unpaid"}
                    onChange={() => setPayType("unpaid")}
                    className="text-amber-500 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block">Unpaid Leave</span>
                    <span className="text-[10px] text-slate-500">Salary deduction applied</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Reviewer Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reviewer Note / Reason (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Approved as per annual quota / Rejected due to branch coverage shortage..."
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
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
