"use client";

import React, { useState, useEffect } from "react";
import { AttendanceEntry } from "../types";
import { useAttendanceCorrectionMutation } from "../hooks/useAttendance";

interface AttendanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceEntry | null;
}

export function AttendanceCorrectionModal({
  isOpen,
  onClose,
  record,
}: AttendanceCorrectionModalProps) {
  const mutation = useAttendanceCorrectionMutation();

  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "flagged">("approved");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to format ISO string to "YYYY-MM-DDTHH:mm" for datetime-local
  const toLocalInput = (isoString?: string | null, defaultDate?: string) => {
    if (!isoString) {
      return defaultDate ? `${defaultDate}T09:00` : "";
    }
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (record) {
      setCheckInTime(toLocalInput(record.checkInAt, record.workDate));
      setCheckOutTime(record.checkOutAt ? toLocalInput(record.checkOutAt, record.workDate) : "");
      setReviewStatus(
        record.reviewStatus === "flagged" || record.reviewStatus === "pending"
          ? record.reviewStatus
          : "approved"
      );
      setErrorMsg(null);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInTime) {
      setErrorMsg("Check-in time is required for correction");
      return;
    }

    if (!record.id) {
      setErrorMsg("This entry does not have an attendance ID to correct. Please use Manual Day Entry.");
      return;
    }

    try {
      const checkInIso = new Date(checkInTime).toISOString();
      const checkOutIso = checkOutTime ? new Date(checkOutTime).toISOString() : null;

      await mutation.mutateAsync({
        id: record.id,
        payload: {
          checkInAt: checkInIso,
          checkOutAt: checkOutIso,
          reviewStatus,
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit attendance correction");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Correct Attendance Record</h3>
            <p className="text-xs text-slate-400">
              {record.name} ({record.employeeId}) · {record.workDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Corrected Check-In Time *
            </label>
            <input
              type="datetime-local"
              required
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Corrected Check-Out Time
            </label>
            <input
              type="datetime-local"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Leave blank if shift is still active or punch-out was missing.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audit Review Status *
            </label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="approved">Approved (Verified by Admin)</option>
              <option value="pending">Pending Further Audit</option>
              <option value="flagged">Flagged for Discrepancy</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-950/15 disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save Correction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
