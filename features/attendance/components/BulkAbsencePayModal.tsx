"use client";

import React, { useState } from "react";
import { useBulkAbsencePayMutation } from "../hooks/useAttendance";

interface BulkAbsencePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillEmployeeId?: number;
}

export function BulkAbsencePayModal({
  isOpen,
  onClose,
  prefillEmployeeId,
}: BulkAbsencePayModalProps) {
  const mutation = useBulkAbsencePayMutation();

  const [employeeId, setEmployeeId] = useState<number | string>(prefillEmployeeId || "");
  const [datesText, setDatesText] = useState(new Date().toISOString().split("T")[0]);
  const [absencePayType, setAbsencePayType] = useState<"unpaid" | "paid">("paid");
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setErrorMsg("Please enter Employee ID");
      return;
    }

    const rawDates = datesText
      .split(/[\n,]/)
      .map((d) => d.trim())
      .filter((d) => Boolean(d));

    if (rawDates.length === 0) {
      setErrorMsg("Please enter at least one date");
      return;
    }

    try {
      const res = await mutation.mutateAsync({
        employeeId: Number(employeeId),
        dates: rawDates,
        absencePayType,
      });
      setResultMsg(`Successfully updated ${res.updatedOrCreated} day(s) to ${res.absencePayType} absence.`);
      setErrorMsg(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update bulk absence pay");
      setResultMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Bulk Absence Pay Update</h3>
            <p className="text-xs text-slate-400">Mark absent dates as Paid or Unpaid</p>
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

        {resultMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            {resultMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Employee Database ID *
            </label>
            <input
              type="number"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Dates (comma or newline separated YYYY-MM-DD) *
            </label>
            <textarea
              required
              rows={3}
              value={datesText}
              onChange={(e) => setDatesText(e.target.value)}
              placeholder="2026-11-10, 2026-11-11"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Absence Compensation Policy *
            </label>
            <select
              value={absencePayType}
              onChange={(e) => setAbsencePayType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="paid">Paid Absent (Company covered)</option>
              <option value="unpaid">Unpaid Absent (Deducted from salary)</option>
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
              {mutation.isPending ? "Applying..." : "Apply Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
