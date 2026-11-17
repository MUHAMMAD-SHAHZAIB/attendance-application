"use client";

import React, { useState, useMemo } from "react";
import { PermissionView } from "../types";
import { useDeletePermissionMutation, usePermissionsQuery } from "../hooks/useAccessControl";
import { PermissionModal } from "./PermissionModal";

export function PermissionList() {
  const { data: permissions, isLoading, isError, error } = usePermissionsQuery();
  const deleteMutation = useDeletePermissionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");

  const handleCreate = () => {
    setSelectedPermission(null);
    setIsModalOpen(true);
  };

  const handleEdit = (perm: PermissionView) => {
    setSelectedPermission(perm);
    setIsModalOpen(true);
  };

  const handleDelete = async (perm: PermissionView) => {
    if (perm.assignedRoleCount > 0) {
      if (
        !confirm(
          `Warning: This permission is currently assigned to ${perm.assignedRoleCount} role(s). Deleting it will revoke this privilege from all assigned roles. Continue?`
        )
      ) {
        return;
      }
    } else if (!confirm(`Delete permission "${perm.code}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(perm.id);
    } catch (err: any) {
      alert(err?.message || "Failed to delete permission");
    }
  };

  // Distinct modules for filtering
  const modules = useMemo(() => {
    const set = new Set<string>();
    (permissions || []).forEach((p) => {
      if (p.module) set.add(p.module);
    });
    return Array.from(set).sort();
  }, [permissions]);

  const filteredPermissions = (permissions || []).filter((p) => {
    const matchesModule = selectedModule === "ALL" || p.module === selectedModule;
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <svg width="14" height="14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search permission code or name..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all shadow-md shadow-blue-950/15 cursor-pointer shrink-0"
        >
          <svg width="14" height="14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Define Permission</span>
        </button>
      </div>

      {/* Loading / Error States */}
      {isLoading && (
        <div className="p-10 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/80">
          Loading permissions catalog...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load permissions: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Table of Permissions */}
      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Permission Code</th>
                  <th className="px-5 py-3.5 font-semibold">Module</th>
                  <th className="px-5 py-3.5 font-semibold">Display Title & Description</th>
                  <th className="px-5 py-3.5 font-semibold">Assigned Roles</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No permissions match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {p.code}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[10px] font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                          {p.module}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white block">{p.name}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {p.description || "No description provided."}
                        </p>
                      </td>

                      {/* Role Count */}
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {p.assignedRoleCount} role(s)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit permission"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete permission"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        permissionToEdit={selectedPermission}
      />
    </div>
  );
}
