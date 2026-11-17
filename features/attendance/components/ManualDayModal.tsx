"use client";

import React, { useState, useEffect } from "react";
import { useWorkplacesQuery } from "@/features/organization";
import { useManualDayMutation } from "../hooks/useAttendance";
import { AdminDayUpsertRequest } from "../types";

interface ManualDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillEmployeeId?: number;
  prefillEmployeeName?: string;
}

export function ManualDayModal({
  isOpen,
  onClose,
  prefillEmployeeId,
  prefillEmployeeName,
}: ManualDayModalProps) {
  const { data: workplaces } = useWorkplacesQuery();
  const mutation = useManualDayMutation();

  const [employeeId, setEmployeeId] = useState<number | string>(prefillEmployeeId || "");
  const [workDate, setWorkDate] = useState(new Date().toISOString().split("T")[0]);
  const [workplaceId, setWorkplaceId] = useState<number | string>("");
  const [isAbsent, setIsAbsent] = useState(false);
  const [absencePayType, setAbsencePayType] = useState<"unpaid" | "paid">("unpaid");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [withinAllowedHours, setWithinAllowedHours] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (prefillEmployeeId) {
        setEmployeeId(prefillEmployeeId);
      }
      setErrorMsg(null);
    }
  }, [isOpen, prefillEmployeeId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setErrorMsg("Please specify the Employee ID");
      return;
    }
    if (!workDate) {
      setErrorMsg("Work date is required");
      return;
    }

    try {
      const payload: AdminDayUpsertRequest = {
        employeeId: Number(employeeId),
        workDate,
        workplaceId: workplaceId ? Number(workplaceId) : null,
        absent: isAbsent,
        absencePayType: isAbsent ? absencePayType : undefined,
        withinAllowedHours: !isAbsent ? withinAllowedHours : undefined,
        punches: !isAbsent
          ? [
              {
                punchType: "check_in",
                at: new Date(`${workDate}T${checkInTime}:00`).toISOString(),
              },
              {
                punchType: "check_out",
                at: new Date(`${workDate}T${checkOutTime}:00`).toISOString(),
              },
            ]
          : undefined,
      };

      await mutation.mutateAsync(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to log manual attendance day");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Log Manual Attendance Day</h3>
            <p className="text-xs text-slate-400">
              {prefillEmployeeName ? `Employee: ${prefillEmployeeName}` : "Create or overwrite daily record"}
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

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Workplace
              </label>
              <select
                value={workplaceId}
                onChange={(e) => setWorkplaceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">Default Workplace</option>
                {workplaces?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Absent Toggle */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-white">Mark as Absent for this day</span>
              <input
                type="checkbox"
                checked={isAbsent}
                onChange={(e) => setIsAbsent(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>

            {isAbsent && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Absence Pay Policy
                </label>
                <select
                  value={absencePayType}
                  onChange={(e) => setAbsencePayType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="unpaid">Unpaid Absent</option>
                  <option value="paid">Paid Absent</option>
                </select>
              </div>
            )}
          </div>

          {/* Time Punches (if present) */}
          {!isAbsent && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Check-In Time *
                </label>
                <input
                  type="time"
                  required={!isAbsent}
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Check-Out Time *
                </label>
                <input
                  type="time"
                  required={!isAbsent}
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {!isAbsent && (
            <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={withinAllowedHours}
                onChange={(e) => setWithinAllowedHours(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Within Allowed Duty Hours Only</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Discard punch minutes before shift start or after shift finish (clip to scheduled duty window).
                </span>
              </div>
            </label>
          )}

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
              {mutation.isPending ? "Logging..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
