"use client";

import React, { useState } from "react";
import { Department } from "../../types";
import { useDepartmentsQuery } from "../../hooks/useDepartments";
import { DepartmentModal } from "./DepartmentModal";

export function DepartmentList() {
  const { data: departments, isLoading, isError, error } = useDepartmentsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [search, setSearch] = useState("");

  const filtered = (departments || []).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedDept(null);
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
            placeholder="Search departments..."
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
          <span>Add Department</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/60">
          Loading departments...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load departments: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Table / List */}
      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Department Name</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filtered.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-400">#{dept.id}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{dept.name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          dept.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-700/20 text-slate-400 border-slate-700/30"
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departmentToEdit={selectedDept}
      />
    </div>
  );
}
