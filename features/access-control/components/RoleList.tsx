"use client";

import React, { useState } from "react";
import { RoleView } from "../types";
import { useDeleteRoleMutation, useRolesQuery } from "../hooks/useAccessControl";
import { RoleModal } from "./RoleModal";

export function RoleList() {
  const { data: roles, isLoading, isError, error } = useRolesQuery();
  const deleteMutation = useDeleteRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: RoleView) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role: RoleView) => {
    if (role.systemRole) {
      alert("System roles cannot be deleted as they are required by core platform functions.");
      return;
    }
    if (confirm(`Are you sure you want to delete custom role "${role.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(role.id);
      } catch (err: any) {
        alert(err?.message || "Failed to delete role");
      }
    }
  };

  const filteredRoles = (roles || []).filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <svg width="14" height="14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles by title or identifier..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all shadow-md shadow-blue-950/15 cursor-pointer shrink-0"
        >
          <svg width="14" height="14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Role</span>
        </button>
      </div>

      {/* Loading / Error States */}
      {isLoading && (
        <div className="p-10 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/80">
          Loading system roles & privileges...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load roles: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Roles Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              No roles match your search term.
            </div>
          ) : (
            filteredRoles.map((role) => {
              const perms = role.permissions || [];
              return (
                <div
                  key={role.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            role.systemRole
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                          }`}
                        >
                          {role.systemRole ? "System Role" : "Custom Role"}
                        </span>
                        {!role.active && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Inactive
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {role.roleName}
                      </span>
                    </div>

                    {/* Role Title & Description */}
                    <h4 className="text-base font-bold text-white mb-1">{role.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {role.description || "No specific description provided."}
                    </p>

                    {/* Permissions Granted Preview */}
                    <div className="pt-3 border-t border-slate-800/60 mb-4">
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-semibold text-slate-300">Granted Privileges</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {perms.length} privileges
                        </span>
                      </div>

                      {perms.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                          {perms.slice(0, 6).map((p) => (
                            <span
                              key={p.id}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 truncate"
                              title={`${p.module}: ${p.name}`}
                            >
                              {p.code}
                            </span>
                          ))}
                          {perms.length > 6 && (
                            <span className="text-[9px] font-semibold text-slate-400 self-center">
                              +{perms.length - 6} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic block">
                          No specific permissions assigned.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Configure Privileges
                    </button>
                    {!role.systemRole && (
                      <button
                        onClick={() => handleDelete(role)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete custom role"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roleToEdit={selectedRole}
      />
    </div>
  );
}
