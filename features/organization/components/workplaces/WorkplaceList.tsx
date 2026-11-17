"use client";

import React, { useState } from "react";
import { Workplace } from "../../types";
import { useWorkplacesQuery } from "../../hooks/useWorkplaces";
import { WorkplaceModal } from "./WorkplaceModal";

export function WorkplaceList() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const { data: workplaces, isLoading, isError, error } = useWorkplacesQuery(selectedCountry || undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const [search, setSearch] = useState("");

  const filtered = (workplaces || []).filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (wp: Workplace) => {
    setSelectedWorkplace(wp);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedWorkplace(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Actions & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workplaces..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Countries</option>
            <option value="AE">UAE (AE)</option>
            <option value="PK">Pakistan (PK)</option>
            <option value="SA">Saudi Arabia (SA)</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all shadow-md shadow-blue-950/15 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Workplace</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/60">
          Loading workplaces...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load workplaces: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Workplace Cards Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              No workplaces found.
            </div>
          ) : (
            filtered.map((wp) => (
              <div
                key={wp.id}
                className="relative p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                          {wp.code || `#${wp.id}`}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/40">
                          {wp.countryCode} · {wp.currencyCode}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{wp.name}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        wp.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-700/20 text-slate-400 border-slate-700/30"
                      }`}
                    >
                      {wp.status}
                    </span>
                  </div>

                  {/* Geofence & Details */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Geofence radius:</span>
                      <span className="text-white font-medium">{wp.radiusMeters}m</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Coordinates:</span>
                      <span className="font-mono text-[11px] text-slate-300">
                        {Number(wp.latitude).toFixed(4)}, {Number(wp.longitude).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Timezone:</span>
                      <span className="text-slate-300">{wp.timezone}</span>
                    </div>
                  </div>

                  {/* Assigned Shifts Pills */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Operating Shifts ({wp.shifts?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {wp.shifts && wp.shifts.length > 0 ? (
                        wp.shifts.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20"
                          >
                            {s.name} ({s.startTime?.slice(0, 5)}-{s.endTime?.slice(0, 5)})
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500">No shifts assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                  <button
                    onClick={() => handleEdit(wp)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Configure Workplace →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <WorkplaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workplaceToEdit={selectedWorkplace}
      />
    </div>
  );
}
