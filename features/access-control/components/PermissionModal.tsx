"use client";

import React, { useState, useEffect } from "react";
import { PermissionRequest, PermissionView } from "../types";
import { useCreatePermissionMutation, useUpdatePermissionMutation } from "../hooks/useAccessControl";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionToEdit?: PermissionView | null;
}

export function PermissionModal({ isOpen, onClose, permissionToEdit }: PermissionModalProps) {
  const createMutation = useCreatePermissionMutation();
  const updateMutation = useUpdatePermissionMutation();

  const [code, setCode] = useState("");
  const [module, setModule] = useState("ATTENDANCE");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (permissionToEdit) {
      setCode(permissionToEdit.code);
      setModule(permissionToEdit.module);
      setName(permissionToEdit.name);
      setDescription(permissionToEdit.description || "");
    } else {
      setCode("");
      setModule("ATTENDANCE");
      setName("");
      setDescription("");
    }
    setErrorMsg(null);
  }, [permissionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !module.trim() || !name.trim()) {
      setErrorMsg("Please fill in all required fields");
      return;
    }

    const payload: PermissionRequest = {
      code: code.trim().toUpperCase(),
      module: module.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
    };

    try {
      if (permissionToEdit) {
        await updateMutation.mutateAsync({ id: permissionToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save permission");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {permissionToEdit ? "Edit Permission" : "Define New Permission"}
            </h3>
            <p className="text-xs text-slate-400">Configure granular system privilege</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Permission Code *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. VIEW_ATTENDANCE"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Only letters, numbers, and underscores (e.g. EDIT_EMPLOYEE)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              System Module *
            </label>
            <input
              type="text"
              required
              value={module}
              onChange={(e) => setModule(e.target.value.toUpperCase())}
              placeholder="ATTENDANCE, WORKFORCE, PAYROLL, ROLES"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="View Attendance Logs"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Allows viewing employee attendance summaries and biometric logs."
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
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
              {isPending ? "Saving..." : "Save Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
