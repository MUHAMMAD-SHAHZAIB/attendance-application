"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PermissionView, RoleCreateRequest, RoleUpdateRequest, RoleView } from "../types";
import {
  useCreateRoleMutation,
  usePermissionsQuery,
  useUpdateRoleMutation,
} from "../hooks/useAccessControl";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: RoleView | null;
}

export function RoleModal({ isOpen, onClose, roleToEdit }: RoleModalProps) {
  const { data: allPermissions, isLoading: isPermissionsLoading } = usePermissionsQuery();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const map = new Map<string, PermissionView[]>();
    (allPermissions || []).forEach((p) => {
      const mod = p.module || "GENERAL";
      if (!map.has(mod)) {
        map.set(mod, []);
      }
      map.get(mod)!.push(p);
    });
    return map;
  }, [allPermissions]);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description || "");
      setActive(roleToEdit.active);
      setSelectedPermissionIds(roleToEdit.permissions?.map((p) => p.id) || []);
    } else {
      setName("");
      setDescription("");
      setActive(true);
      setSelectedPermissionIds([]);
    }
    setErrorMsg(null);
  }, [roleToEdit, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (id: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleModulePermissions = (modulePermissions: PermissionView[]) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const allSelected = moduleIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      // Unselect all in module
      setSelectedPermissionIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      // Select all in module
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Role name is required");
      return;
    }

    try {
      if (roleToEdit) {
        const payload: RoleUpdateRequest = {
          name: name.trim(),
          description: description.trim() || null,
          active,
          permissionIds: selectedPermissionIds,
        };
        await updateMutation.mutateAsync({ id: roleToEdit.id, payload });
      } else {
        const payload: RoleCreateRequest = {
          name: name.trim(),
          description: description.trim() || null,
          permissionIds: selectedPermissionIds,
        };
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save role");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {roleToEdit ? `Edit Role: ${roleToEdit.name}` : "Create New Custom Role"}
            </h3>
            <p className="text-xs text-slate-400">
              Define role title and assign granular module permissions
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
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Branch Supervisor"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {roleToEdit && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Status
                </label>
                <select
                  value={active ? "active" : "inactive"}
                  onChange={(e) => setActive(e.target.value === "active")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">Active (Can be assigned to users)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities and access scope of this role..."
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Granular Permission Matrix */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Assigned Privileges & Permissions
                </h4>
                <p className="text-[11px] text-slate-400">
                  {selectedPermissionIds.length} privilege(s) selected
                </p>
              </div>

              {allPermissions && allPermissions.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissionIds(allPermissions.map((p) => p.id))}
                    className="text-emerald-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissionIds([])}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {isPermissionsLoading && (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading permissions catalog...
              </div>
            )}

            {!isPermissionsLoading && allPermissions?.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No permissions registered in system yet.
              </div>
            )}

            {!isPermissionsLoading &&
              Array.from(permissionsByModule.entries()).map(([moduleName, perms]) => {
                const allSelected = perms.every((p) => selectedPermissionIds.includes(p.id));
                const someSelected = perms.some((p) => selectedPermissionIds.includes(p.id));

                return (
                  <div
                    key={moduleName}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5"
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide font-mono">
                          {moduleName}
                        </span>
                        <span className="text-[10px] text-slate-500">({perms.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModulePermissions(perms)}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          allSelected
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {allSelected ? "Unselect Module" : "Select Module"}
                      </button>
                    </div>

                    {/* Permissions in Module */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {perms.map((perm) => {
                        const isChecked = selectedPermissionIds.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
                              isChecked
                                ? "bg-emerald-500/5 border-emerald-500/30 text-white"
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 w-3.5 h-3.5 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold block text-white text-[11px] truncate">
                                {perm.name}
                              </span>
                              <span className="font-mono text-[9px] text-slate-500 block truncate">
                                {perm.code}
                              </span>
                              {perm.description && (
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer inside form */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-950/15 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Role & Permissions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
