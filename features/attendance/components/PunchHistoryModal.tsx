"use client";

import React from "react";
import { AttendanceEntry } from "../types";
import { usePunchHistoryQuery } from "../hooks/useAttendance";

interface PunchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceEntry | null;
}

export function PunchHistoryModal({ isOpen, onClose, record }: PunchHistoryModalProps) {
  const { data: punchHistory, isLoading, isError } = usePunchHistoryQuery(record?.id || null);

  if (!isOpen || !record) return null;

  const punches = punchHistory?.punches || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">Punch Audit History</h3>
            <p className="text-xs text-slate-400">
              {record.name} ({record.employeeId}) · {record.workDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {isLoading && (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading punch audit trail...
            </div>
          )}

          {isError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              Unable to load punch logs for this attendance day.
            </div>
          )}

          {!isLoading && !isError && punches.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
              No biometric punches recorded for this entry (e.g. manual entry or absent).
            </div>
          )}

          {!isLoading &&
            !isError &&
            punches.map((punch, index) => {
              const isCheckIn = punch.punchType.toLowerCase().includes("in");
              const punchTime = punch.punchedAt
                ? new Date(punch.punchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "—";

              return (
                <div
                  key={punch.id || index}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCheckIn
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {punch.punchType.replace("_", " ")}
                      </span>
                      <span className="text-xs font-semibold text-white">{punchTime}</span>
                    </div>
                    {punch.faceScore > 0 && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/50">
                        Face: {Math.round(punch.faceScore * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block">Workplace:</span>
                      <span className="text-slate-200">{punch.workplaceName || record.workplace || "Standard"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GPS Distance:</span>
                      <span className={punch.distanceFromWorkplaceMeters > punch.allowedRadiusMeters ? "text-rose-400" : "text-slate-200"}>
                        {Math.round(punch.distanceFromWorkplaceMeters)}m / {punch.allowedRadiusMeters}m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Device:</span>
                      <span className="text-slate-200 truncate block">{punch.deviceId || "App Client"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location Validity:</span>
                      <span className={punch.mockedLocation ? "text-rose-400" : "text-emerald-400"}>
                        {punch.mockedLocation ? "Mocked (Suspicious)" : "Verified GPS"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
