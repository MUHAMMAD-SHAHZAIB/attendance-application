"use client";

import React, { useState, useEffect } from "react";
import { WorkPatternDayRequest, WorkPatternRequest, WorkPatternView } from "../types";
import { useCreateWorkPatternMutation, useUpdateWorkPatternMutation } from "../hooks/useSchedules";

interface WorkPatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternToEdit?: WorkPatternView | null;
}

const DEFAULT_DAYS: WorkPatternDayRequest[] = [
  { weekday: 1, workingDay: true },  // Monday
  { weekday: 2, workingDay: true },  // Tuesday
  { weekday: 3, workingDay: true },  // Wednesday
  { weekday: 4, workingDay: true },  // Thursday
  { weekday: 5, workingDay: true },  // Friday
  { weekday: 6, workingDay: false }, // Saturday
  { weekday: 7, workingDay: false }, // Sunday
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function WorkPatternModal({ isOpen, onClose, patternToEdit }: WorkPatternModalProps) {
  const createMutation = useCreateWorkPatternMutation();
  const updateMutation = useUpdateWorkPatternMutation();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [days, setDays] = useState<WorkPatternDayRequest[]>(DEFAULT_DAYS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (patternToEdit) {
      setCode(patternToEdit.code || "");
      setName(patternToEdit.name || "");
      setDescription(patternToEdit.description || "");
      setActive(patternToEdit.active ?? true);
      if (patternToEdit.days && patternToEdit.days.length === 7) {
        setDays(
          patternToEdit.days.map((d) => ({
            weekday: d.weekday,
            workingDay: d.workingDay,
          }))
        );
      } else {
        setDays(DEFAULT_DAYS);
      }
    } else {
      setCode("");
      setName("");
      setDescription("");
      setActive(true);
      setDays(DEFAULT_DAYS);
    }
    setErrorMsg(null);
  }, [patternToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (weekday: number) => {
    setDays((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, workingDay: !d.workingDay } : d))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const workingDaysCount = days.filter((d) => d.workingDay).length;
    if (workingDaysCount === 0) {
      setErrorMsg("A work pattern must have at least one working day.");
      return;
    }

    const payload: WorkPatternRequest = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || null,
      active,
      days,
    };

    try {
      if (patternToEdit) {
        await updateMutation.mutateAsync({ id: patternToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save work pattern");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {patternToEdit ? "Edit Work Pattern" : "Create Work Pattern"}
            </h3>
            <p className="text-xs text-slate-400">
              Define standard weekly work days and rest days
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

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1">
          {/* Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pattern Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MON_FRI_5D"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Only letters, numbers, -, _</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pattern Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard 5-Day (Mon-Fri)"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Corporate headquarters standard schedule"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Weekly Days Matrix */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Weekly Days Configuration (7 Days)
            </label>
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
              {days.map((d) => {
                const dayLabel = DAY_NAMES[d.weekday - 1];
                return (
                  <div
                    key={d.weekday}
                    onClick={() => toggleDay(d.weekday)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      d.workingDay
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={d.workingDay}
                        onChange={() => {}} // Handled by parent div
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
                      />
                      <span className="text-xs font-medium">{dayLabel}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        d.workingDay
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {d.workingDay ? "Working Day" : "Rest / Off"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="patternActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
            />
            <label htmlFor="patternActive" className="text-xs text-slate-300 cursor-pointer">
              Active pattern (available for employee assignments)
            </label>
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
              {isPending ? "Saving..." : patternToEdit ? "Update Pattern" : "Create Pattern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
