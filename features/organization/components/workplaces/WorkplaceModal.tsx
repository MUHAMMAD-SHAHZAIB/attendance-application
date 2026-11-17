"use client";

import React, { useState, useEffect } from "react";
import { Workplace, WorkplaceRequest } from "../../types";
import { useCreateWorkplaceMutation, useUpdateWorkplaceMutation } from "../../hooks/useWorkplaces";
import { useShiftsQuery } from "../../hooks/useShifts";

interface WorkplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workplaceToEdit?: Workplace | null;
}

export function WorkplaceModal({ isOpen, onClose, workplaceToEdit }: WorkplaceModalProps) {
  const { data: availableShifts } = useShiftsQuery();

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState<number | string>("25.2048");
  const [longitude, setLongitude] = useState<number | string>("55.2708");
  const [radiusMeters, setRadiusMeters] = useState<number | string>("150");
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [countryCode, setCountryCode] = useState("AE");
  const [currencyCode, setCurrencyCode] = useState("AED");
  const [selectedShiftIds, setSelectedShiftIds] = useState<number[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreateWorkplaceMutation();
  const updateMutation = useUpdateWorkplaceMutation();

  useEffect(() => {
    if (workplaceToEdit) {
      setName(workplaceToEdit.name);
      setLatitude(workplaceToEdit.latitude);
      setLongitude(workplaceToEdit.longitude);
      setRadiusMeters(workplaceToEdit.radiusMeters || 150);
      setTimezone(workplaceToEdit.timezone || "Asia/Dubai");
      setCountryCode(workplaceToEdit.countryCode || "AE");
      setCurrencyCode(workplaceToEdit.currencyCode || "AED");
      setSelectedShiftIds((workplaceToEdit.shifts || []).map((s) => s.id));
      setStatus(workplaceToEdit.status || "active");
    } else {
      setName("");
      setLatitude("25.2048");
      setLongitude("55.2708");
      setRadiusMeters("150");
      setTimezone("Asia/Dubai");
      setCountryCode("AE");
      setCurrencyCode("AED");
      // Default select first shift if available
      setSelectedShiftIds(availableShifts && availableShifts.length > 0 ? [availableShifts[0].id] : []);
      setStatus("active");
    }
    setErrorMsg(null);
  }, [workplaceToEdit, isOpen, availableShifts]);

  if (!isOpen) return null;

  const toggleShift = (shiftId: number) => {
    setSelectedShiftIds((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Workplace name is required");
      return;
    }
    if (selectedShiftIds.length === 0) {
      setErrorMsg("Please assign at least one shift to this workplace");
      return;
    }

    const payload: WorkplaceRequest = {
      name: name.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radiusMeters),
      timezone: timezone.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      currencyCode: currencyCode.trim().toUpperCase(),
      shiftIds: selectedShiftIds,
      status,
    };

    try {
      if (workplaceToEdit) {
        await updateMutation.mutateAsync({ id: workplaceToEdit.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save workplace");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {workplaceToEdit ? "Edit Workplace" : "Create New Workplace"}
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Workplace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dubai Central Kitchen, Business Bay Branch"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="25.2048"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="55.2708"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Radius (Meters)
              </label>
              <input
                type="number"
                min={10}
                max={5000}
                required
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                placeholder="150"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                <option value="Asia/Karachi">Asia/Karachi (PKT +5)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (AST +3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Country Code
              </label>
              <input
                type="text"
                maxLength={2}
                required
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="AE"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Currency
              </label>
              <input
                type="text"
                maxLength={3}
                required
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                placeholder="AED"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Assigned Shifts Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Shifts ({selectedShiftIds.length} selected)
            </label>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 max-h-36 overflow-y-auto space-y-1.5">
              {(!availableShifts || availableShifts.length === 0) ? (
                <p className="text-xs text-slate-500">No shifts created yet. Please create a shift first.</p>
              ) : (
                availableShifts.map((shift) => (
                  <label
                    key={shift.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800/40 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedShiftIds.includes(shift.id)}
                        onChange={() => toggleShift(shift.id)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-white">{shift.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({shift.code})</span>
                    </div>
                    <span className="text-slate-400">
                      {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                    </span>
                  </label>
                ))
              )}
            </div>
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
              {isPending ? "Saving..." : workplaceToEdit ? "Update Workplace" : "Create Workplace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
