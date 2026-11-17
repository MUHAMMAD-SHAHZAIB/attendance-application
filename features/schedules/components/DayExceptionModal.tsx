"use client";

import React, { useState, useEffect } from "react";
import { DayExceptionRequest, DayExceptionView } from "../types";
import { useCreateDayExceptionMutation, useUpdateDayExceptionMutation } from "../hooks/useSchedules";
import { useWorkplacesQuery, useShiftsQuery } from "@/features/organization";

interface DayExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  exceptionToEdit?: DayExceptionView | null;
}

export function DayExceptionModal({
  isOpen,
  onClose,
  employeeId,
  exceptionToEdit,
}: DayExceptionModalProps) {
  const { data: workplaces } = useWorkplacesQuery();
  const { data: shifts } = useShiftsQuery();

  const createMutation = useCreateDayExceptionMutation();
  const updateMutation = useUpdateDayExceptionMutation();

  const [workplaceId, setWorkplaceId] = useState<number | string>("");
  const [workDate, setWorkDate] = useState(new Date().toISOString().split("T")[0]);
  const [exceptionType, setExceptionType] = useState<"OFF" | "WORK" | "SHIFT_OVERRIDE">("OFF");
  const [shiftId, setShiftId] = useState<number | string>("");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (exceptionToEdit) {
      setWorkplaceId(exceptionToEdit.workplaceId || "");
      setWorkDate(exceptionToEdit.workDate || new Date().toISOString().split("T")[0]);
      const editType = (exceptionToEdit.exceptionType as "OFF" | "WORK" | "SHIFT_OVERRIDE") || "OFF";
      setExceptionType(editType);
      setShiftId(editType === "SHIFT_OVERRIDE" ? exceptionToEdit.shiftId || "" : "");
      setReason(exceptionToEdit.reason || "");
    } else {
      setWorkplaceId(workplaces?.[0]?.id || "");
      setWorkDate(new Date().toISOString().split("T")[0]);
      setExceptionType("OFF");
      setShiftId("");
      setReason("");
    }
    setErrorMsg(null);
  }, [exceptionToEdit, isOpen, workplaces]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!workplaceId) {
      setErrorMsg("Please select a workplace");
      return;
    }
    if (!workDate) {
      setErrorMsg("Work date is required");
      return;
    }

    if (exceptionType === "SHIFT_OVERRIDE" && !shiftId) {
      setErrorMsg("Please select an alternate shift for Shift Switch (SHIFT_OVERRIDE)");
      return;
    }

    const payload: DayExceptionRequest = {
      workplaceId: Number(workplaceId),
      workDate,
      exceptionType,
      shiftId: exceptionType === "SHIFT_OVERRIDE" && shiftId ? Number(shiftId) : null,
      reason: reason.trim() || null,
    };

    try {
      if (exceptionToEdit) {
        await updateMutation.mutateAsync({
          employeeId,
          exceptionId: exceptionToEdit.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync({ employeeId, payload });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save day exception");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {exceptionToEdit ? "Edit Day Status Adjustment" : "Adjust Day Status (Day Off / Shift Swap)"}
            </h3>
            <p className="text-xs text-slate-400">Employee ID #{employeeId}</p>
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
          {/* Workplace */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Workplace *
            </label>
            <select
              required
              value={workplaceId}
              onChange={(e) => setWorkplaceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Workplace</option>
              {workplaces?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.countryCode})
                </option>
              ))}
            </select>
          </div>

          {/* Work Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Adjustment Date *
            </label>
            <input
              type="date"
              required
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Exception Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Day Status Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["OFF", "WORK", "SHIFT_OVERRIDE"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setExceptionType(t);
                    if (t !== "SHIFT_OVERRIDE") {
                      setShiftId("");
                    }
                  }}
                  className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                    exceptionType === t
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {t === "OFF" ? "Day Off" : t === "WORK" ? "Work on Rest Day" : "Shift Swap"}
                </button>
              ))}
            </div>

            {/* Explanation card */}
            <div className="text-[11px] text-slate-400 mt-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              {exceptionType === "OFF" && (
                <span>🛋️ <strong>Day Off:</strong> Forces this date as an approved day off (no shift required).</span>
              )}
              {exceptionType === "WORK" && (
                <span>💼 <strong>Work Day:</strong> Forces working day using employee&apos;s normal assigned shift (no shift required).</span>
              )}
              {exceptionType === "SHIFT_OVERRIDE" && (
                <span>🔄 <strong>Shift Switch:</strong> Temporarily assign an alternate shift specifically for this date.</span>
              )}
            </div>
          </div>

          {/* Shift (ONLY if SHIFT_OVERRIDE) */}
          {exceptionType === "SHIFT_OVERRIDE" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alternate Shift *
              </label>
              <select
                required
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Alternate Shift</option>
                {shifts?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason / Notes
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensatory off, extra Sunday shift, etc."
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tip */}
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px]">
            💡 <em>Tip: To adjust custom duty start/end or break times for one date, use the <strong>Custom Daily Duty Override</strong> tab instead.</em>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? "Saving..." : exceptionToEdit ? "Update Exception" : "Add Exception"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
