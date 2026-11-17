"use client";

import React, { useState } from "react";
import { EmployeeView } from "../types";
import { useUploadPhotoMutation, useDeletePhotoMutation } from "../hooks/useEmployees";

interface EmployeePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeView | null;
}

export function EmployeePhotoModal({ isOpen, onClose, employee }: EmployeePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadMutation = useUploadPhotoMutation();
  const deleteMutation = useDeletePhotoMutation();

  if (!isOpen || !employee) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File size must be under 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadMutation.mutateAsync({ id: employee.id, file: selectedFile });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to upload photo");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this employee's photo?")) return;
    try {
      await deleteMutation.mutateAsync(employee.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete photo");
    }
  };

  const isPending = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white">Employee Photo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-left">
            {errorMsg}
          </div>
        )}

        {/* Photo Display */}
        <div className="mx-auto w-32 h-32 rounded-full overflow-hidden bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-lg relative group mb-4">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : employee.hasPhoto && employee.photoUrl ? (
            <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-slate-500">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <p className="text-sm font-semibold text-white">{employee.name}</p>
        <p className="text-xs text-slate-400 mb-5">{employee.employeeId} · {employee.designation}</p>

        {/* Upload Input */}
        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </label>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
            {employee.hasPhoto && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Delete Photo
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50"
                >
                  {isPending ? "Uploading..." : "Save Photo"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
