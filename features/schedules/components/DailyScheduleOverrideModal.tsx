"use client";

import React, { useState, useEffect } from "react";
import { DailyScheduleOverrideRequest, DailyScheduleOverrideView } from "../types";
import { useCreateScheduleOverrideMutation, useUpdateScheduleOverrideMutation } from "../hooks/useSchedules";
import { useWorkplacesQuery } from "@/features/organization";

interface DailyScheduleOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  overrideToEdit?: DailyScheduleOverrideView | null;
}

export function DailyScheduleOverrideModal({
  isOpen,
  onClose,
  employeeId,
  overrideToEdit,
}: DailyScheduleOverrideModalProps) {
  const { data: workplaces } = useWorkplacesQuery();

  const createMutation = useCreateScheduleOverrideMutation();
  const updateMutation = useUpdateScheduleOverrideMutation();

  const [workplaceId, setWorkplaceId] = useState<number | string>("");
  const [workDate, setWorkDate] = useState(new Date().toISOString().split("T")[0]);
  const [dutyStart, setDutyStart] = useState("09:00");
  const [dutyFinish, setDutyFinish] = useState("18:00");
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");
  const [allowedBreakMinutes, setAllowedBreakMinutes] = useState(60);
  const [crossesMidnight, setCrossesMidnight] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to normalize "HH:mm:ss" or "HH:mm" for input type="time"
  const toTimeInput = (t?: string | null) => {
    if (!t) return "";
    return t.substring(0, 5);
  };

  useEffect(() => {
    if (overrideToEdit) {
      setWorkplaceId(overrideToEdit.workplaceId || "");
      setWorkDate(overrideToEdit.workDate || new Date().toISOString().split("T")[0]);
      setDutyStart(toTimeInput(overrideToEdit.dutyStart) || "09:00");
      setDutyFinish(toTimeInput(overrideToEdit.dutyFinish) || "18:00");
      setBreakStart(toTimeInput(overrideToEdit.breakStart));
      setBreakEnd(toTimeInput(overrideToEdit.breakEnd));
      setAllowedBreakMinutes(overrideToEdit.allowedBreakMinutes ?? 60);
      setCrossesMidnight(overrideToEdit.crossesMidnight ?? false);
      setReason(overrideToEdit.reason || "");
    } else {
      setWorkplaceId(workplaces?.[0]?.id || "");
      setWorkDate(new Date().toISOString().split("T")[0]);
      setDutyStart("09:00");
      setDutyFinish("18:00");
      setBreakStart("");
      setBreakEnd("");
      setAllowedBreakMinutes(60);
      setCrossesMidnight(false);
      setReason("");
    }
    setErrorMsg(null);
  }, [overrideToEdit, isOpen, workplaces]);

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
    if (!dutyStart || !dutyFinish) {
      setErrorMsg("Both duty start and duty finish times are required");
      return;
    }

    const payload: DailyScheduleOverrideRequest = {
      workplaceId: Number(workplaceId),
      workDate,
      dutyStart: dutyStart.length === 5 ? `${dutyStart}:00` : dutyStart,
      dutyFinish: dutyFinish.length === 5 ? `${dutyFinish}:00` : dutyFinish,
      breakStart: breakStart ? (breakStart.length === 5 ? `${breakStart}:00` : breakStart) : null,
      breakEnd: breakEnd ? (breakEnd.length === 5 ? `${breakEnd}:00` : breakEnd) : null,
      allowedBreakMinutes: Number(allowedBreakMinutes) || 0,
      crossesMidnight,
      reason: reason.trim() || null,
    };

    try {
      if (overrideToEdit) {
        await updateMutation.mutateAsync({
          employeeId,
          overrideId: overrideToEdit.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync({ employeeId, payload });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save daily schedule override");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {overrideToEdit ? "Edit Custom Work Hours" : "Set Custom Daily Work Hours"}
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

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1">
          {/* Workplace & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Date *
              </label>
              <input
                type="date"
                required
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Duty Start & Finish */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duty Start *
              </label>
              <input
                type="time"
                required
                value={dutyStart}
                onChange={(e) => setDutyStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duty Finish *
              </label>
              <input
                type="time"
                required
                value={dutyFinish}
                onChange={(e) => setDutyFinish(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Break Timings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Break Start (Optional)
              </label>
              <input
                type="time"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Break Finish (Optional)
              </label>
              <input
                type="time"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Break Minutes & Midnight */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Allowed Break (mins)
              </label>
              <input
                type="number"
                min={0}
                value={allowedBreakMinutes}
                onChange={(e) => setAllowedBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={crossesMidnight}
                  onChange={(e) => setCrossesMidnight(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
                />
                <span className="text-xs text-slate-300">Crosses Midnight</span>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Override Reason / Notes
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. VIP event overtime, special duty hours"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
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
              {isPending ? "Saving..." : overrideToEdit ? "Update Override" : "Save Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
