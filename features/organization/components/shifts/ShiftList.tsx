"use client";

import React, { useState } from "react";
import { Shift } from "../../types";
import { useShiftsQuery } from "../../hooks/useShifts";
import { ShiftModal } from "./ShiftModal";

export function ShiftList() {
  const { data: shifts, isLoading, isError, error } = useShiftsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [search, setSearch] = useState("");

  const filtered = (shifts || []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shifts by name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all shadow-md shadow-blue-950/15 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Shift</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/60">
          Loading shifts...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load shifts: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Shifts Grid / Cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              No shifts found.
            </div>
          ) : (
            filtered.map((shift) => (
              <div
                key={shift.id}
                className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {shift.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{shift.name}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        shift.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-700/20 text-slate-400 border-slate-700/30"
                      }`}
                    >
                      {shift.status}
                    </span>
                  </div>

                  {/* Timing Badges */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Timings:</span>
                      <span className="font-semibold text-white">
                        {shift.startTime?.slice(0, 5)} — {shift.endTime?.slice(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Grace period:</span>
                      <span className="text-slate-300 font-medium">{shift.graceMinutes} mins</span>
                    </div>
                    {shift.crossesMidnight && (
                      <div className="text-[11px] text-amber-400 flex items-center gap-1 pt-1">
                        <span>🌙 Crosses midnight</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Edit Shift →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shiftToEdit={selectedShift}
      />
    </div>
  );
}
