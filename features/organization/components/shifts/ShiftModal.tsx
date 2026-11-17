"use client";

import React, { useState, useEffect } from "react";
import { Shift, ShiftRequest } from "../../types";
import { useCreateShiftMutation, useUpdateShiftMutation } from "../../hooks/useShifts";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit?: Shift | null;
}

export function ShiftModal({ isOpen, onClose, shiftToEdit }: ShiftModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [crossesMidnight, setCrossesMidnight] = useState(false);
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreateShiftMutation();
  const updateMutation = useUpdateShiftMutation();

  useEffect(() => {
    if (shiftToEdit) {
      setCode(shiftToEdit.code);
      setName(shiftToEdit.name);
      // Format time to HH:mm if it includes seconds
      setStartTime(shiftToEdit.startTime?.slice(0, 5) || "08:00");
      setEndTime(shiftToEdit.endTime?.slice(0, 5) || "17:00");
      setCrossesMidnight(shiftToEdit.crossesMidnight || false);
      setGraceMinutes(shiftToEdit.graceMinutes || 15);
      setStatus(shiftToEdit.status || "active");
    } else {
      setCode("");
      setName("");
      setStartTime("08:00");
      setEndTime("17:00");
      setCrossesMidnight(false);
      setGraceMinutes(15);
      setStatus("active");
    }
    setErrorMsg(null);
  }, [shiftToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMsg("Shift code and name are required");
      return;
    }

    // Backend expects LocalTime formatted as HH:mm:ss
    const formattedStart = startTime.length === 5 ? `${startTime}:00` : startTime;
    const formattedEnd = endTime.length === 5 ? `${endTime}:00` : endTime;

    const payload: ShiftRequest = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      startTime: formattedStart,
      endTime: formattedEnd,
      crossesMidnight,
      graceMinutes: Number(graceMinutes),
      status,
    };

    try {
      if (shiftToEdit) {
        await updateMutation.mutateAsync({ id: shiftToEdit.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save shift");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {shiftToEdit ? "Edit Shift" : "Create New Work Shift"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Shift Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MORNING_A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Shift Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Morning"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="crossesMidnight"
              checked={crossesMidnight}
              onChange={(e) => setCrossesMidnight(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="crossesMidnight" className="text-xs text-slate-300 select-none cursor-pointer">
              Crosses midnight (Night shift ending on the next calendar day)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? "Saving..." : shiftToEdit ? "Update Shift" : "Create Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
