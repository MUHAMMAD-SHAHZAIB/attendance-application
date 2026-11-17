"use client";

import React, { useState } from "react";
import { useWorkPatternsQuery } from "../hooks/useSchedules";
import { WorkPatternView } from "../types";
import { WorkPatternModal } from "./WorkPatternModal";

const DAY_ABBRS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WorkPatternList() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: patterns, isLoading, isError, error } = useWorkPatternsQuery(statusFilter);

  const [selectedPattern, setSelectedPattern] = useState<WorkPatternView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCreate = () => {
    setSelectedPattern(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pattern: WorkPatternView) => {
    setSelectedPattern(pattern);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Weekly Work Patterns</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define standard working vs rest day templates for employee workforce assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Active
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <span>+</span>
            <span>New Pattern</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800">
          Loading work patterns...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load work patterns: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Grid of Work Patterns */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!patterns || patterns.length === 0) ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              No weekly work patterns found. Create one using the button above.
            </div>
          ) : (
            patterns.map((pattern) => {
              const workingDaysCount = pattern.days?.filter((d) => d.workingDay).length || 0;

              return (
                <div
                  key={pattern.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div>
                    {/* Header: Title, Code & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {pattern.name}
                        </h3>
                        <span className="font-mono text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 inline-block mt-1">
                          {pattern.code}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${
                          pattern.active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {pattern.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Description */}
                    {pattern.description && (
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                        {pattern.description}
                      </p>
                    )}

                    {/* Weekly Days Strip */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span>Weekly Schedule</span>
                        <span className="font-semibold text-slate-300">
                          {workingDaysCount} working / {7 - workingDaysCount} off
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {pattern.days?.map((d, i) => (
                          <div
                            key={d.weekday || i}
                            title={`${DAY_FULL[d.weekday - 1]}: ${d.workingDay ? "Working" : "Off"}`}
                            className={`flex flex-col items-center justify-center py-1.5 rounded-lg border text-center transition-all ${
                              d.workingDay
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-bold"
                                : "bg-slate-950/60 border-slate-800/80 text-slate-500"
                            }`}
                          >
                            <span className="text-[10px]">{DAY_ABBRS[d.weekday - 1]}</span>
                            <span className="text-[9px] mt-0.5 opacity-80">
                              {d.workingDay ? "✓" : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenEdit(pattern)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      Edit Pattern
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      <WorkPatternModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patternToEdit={selectedPattern}
      />
    </div>
  );
}
