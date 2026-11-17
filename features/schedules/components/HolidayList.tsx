"use client";

import React, { useState } from "react";
import { useDeleteHolidayMutation, useHolidaysQuery } from "../hooks/useSchedules";
import { useWorkplacesQuery } from "@/features/organization";
import { HolidayView } from "../types";
import { HolidayModal } from "./HolidayModal";

export function HolidayList() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [workplaceFilter, setWorkplaceFilter] = useState<number | undefined>(undefined);
  const [includeGlobal, setIncludeGlobal] = useState(true);

  const { data: workplaces } = useWorkplacesQuery();
  const { data: holidays, isLoading, isError, error } = useHolidaysQuery(
    selectedYear,
    workplaceFilter,
    includeGlobal
  );

  const deleteMutation = useDeleteHolidayMutation();

  const [selectedHoliday, setSelectedHoliday] = useState<HolidayView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.message || "Failed to delete holiday");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Public & Company Holidays</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global and location-specific public holidays for attendance calculation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-500 text-[11px]">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Workplace Filter */}
          <select
            value={workplaceFilter || ""}
            onChange={(e) => setWorkplaceFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">All Locations</option>
            {workplaces?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.countryCode})
              </option>
            ))}
          </select>

          {/* New Holiday Button */}
          <button
            onClick={() => {
              setSelectedHoliday(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <span>+</span>
            <span>Declare Holiday</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800">
          Loading declared holidays...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load holidays: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Holidays Table */}
      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Holiday Name</th>
                  <th className="px-5 py-3.5 font-semibold">Scope</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {(!holidays || holidays.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                      No holidays declared for year {selectedYear}. Click &quot;Declare Holiday&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  holidays.map((h) => {
                    const d = new Date(h.holidayDate);
                    const dayOfWeek = d.toLocaleDateString(undefined, { weekday: "short" });

                    return (
                      <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">
                          <span className="font-semibold">{h.holidayDate}</span>
                          <span className="text-[11px] text-slate-400 ml-2 font-normal">({dayOfWeek})</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-white">{h.name}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {h.global ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              🌐 Global (All Workplaces)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                              📍 {h.workplaceName || "Specific Workplace"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedHoliday(h);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Holiday"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDelete(h.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete Holiday"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        holidayToEdit={selectedHoliday}
      />
    </div>
  );
}
