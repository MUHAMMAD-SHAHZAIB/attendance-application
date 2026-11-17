"use client";

import React, { useState, useEffect } from "react";
import { HolidaySaveRequest, HolidayView } from "../types";
import { useCreateHolidayMutation, useUpdateHolidayMutation } from "../hooks/useSchedules";
import { useWorkplacesQuery } from "@/features/organization";

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidayToEdit?: HolidayView | null;
}

export function HolidayModal({ isOpen, onClose, holidayToEdit }: HolidayModalProps) {
  const { data: workplaces } = useWorkplacesQuery();

  const createMutation = useCreateHolidayMutation();
  const updateMutation = useUpdateHolidayMutation();

  const [name, setName] = useState("");
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split("T")[0]);
  const [workplaceId, setWorkplaceId] = useState<number | string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (holidayToEdit) {
      setName(holidayToEdit.name || "");
      setHolidayDate(holidayToEdit.holidayDate || new Date().toISOString().split("T")[0]);
      setWorkplaceId(holidayToEdit.workplaceId || "");
    } else {
      setName("");
      setHolidayDate(new Date().toISOString().split("T")[0]);
      setWorkplaceId("");
    }
    setErrorMsg(null);
  }, [holidayToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Holiday name is required");
      return;
    }
    if (!holidayDate) {
      setErrorMsg("Holiday date is required");
      return;
    }

    const payload: HolidaySaveRequest = {
      name: name.trim(),
      holidayDate,
      workplaceId: workplaceId ? Number(workplaceId) : null,
    };

    try {
      if (holidayToEdit) {
        await updateMutation.mutateAsync({ id: holidayToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save holiday");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {holidayToEdit ? "Edit Public / Company Holiday" : "Declare Holiday"}
            </h3>
            <p className="text-xs text-slate-400">Configure paid public or workplace holidays</p>
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
          {/* Holiday Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Holiday Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UAE National Day, Eid Al-Fitr, Pakistan Day"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Holiday Date *
            </label>
            <input
              type="date"
              required
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Workplace or Global */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Applicable Scope / Workplace
            </label>
            <select
              value={workplaceId}
              onChange={(e) => setWorkplaceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">🌐 Global (All Workplaces & Countries)</option>
              {workplaces?.map((w) => (
                <option key={w.id} value={w.id}>
                  📍 {w.name} ({w.countryCode})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Leave set to Global if this holiday applies to all workforce branches.
            </span>
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
              {isPending ? "Saving..." : holidayToEdit ? "Update Holiday" : "Declare Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
