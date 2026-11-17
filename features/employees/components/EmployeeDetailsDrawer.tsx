"use client";

import React from "react";
import { EmployeeView } from "../types";
import { useEmployeeStatusMutation } from "../hooks/useEmployees";

interface EmployeeDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeView | null;
  onEdit: (employee: EmployeeView) => void;
  onManagePhoto: (employee: EmployeeView) => void;
}

export function EmployeeDetailsDrawer({
  isOpen,
  onClose,
  employee,
  onEdit,
  onManagePhoto,
}: EmployeeDetailsDrawerProps) {
  const statusMutation = useEmployeeStatusMutation();

  if (!isOpen || !employee) return null;

  const toggleStatus = async () => {
    const newStatus = employee.status === "active" ? "inactive" : "active";
    if (confirm(`Change status of ${employee.name} to ${newStatus}?`)) {
      await statusMutation.mutateAsync({ id: employee.id, status: newStatus });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Employee Profile</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>

            {/* Profile Avatar & Primary Details */}
            <div className="flex items-center gap-4 py-5 border-b border-slate-800/80">
              <div
                onClick={() => onManagePhoto(employee)}
                className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer relative group"
                title="Click to manage photo"
              >
                {employee.hasPhoto && employee.photoUrl ? (
                  <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-emerald-400">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white">
                  Photo
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {employee.employeeId}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      employee.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1 truncate">{employee.name}</h2>
                <p className="text-xs text-slate-400 truncate">{employee.designation}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold mb-1">
                  Contact Information
                </span>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white font-medium">{employee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-white font-medium">{employee.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Country:</span>
                    <span className="text-white font-medium">{employee.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-emerald-400 font-medium">{employee.department}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold mb-1">
                  Workplace & Assignment
                </span>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Workplace:</span>
                    <span className="text-white font-medium">{employee.primaryWorkplace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operating Shift:</span>
                    <span className="text-teal-300 font-medium">{employee.workplaceShift || "Default"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Joining Date:</span>
                    <span className="text-white font-medium">{employee.joiningDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold mb-1">
                  Salary & Overtime Policy
                </span>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Base Salary:</span>
                    <span className="text-white font-bold">
                      {employee.monthlyBaseSalary} {employee.salaryCurrencyCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">OT Hourly Rate:</span>
                    <span className="text-white font-medium">
                      {employee.overtimeHourlyRate} {employee.salaryCurrencyCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Daily Overtime:</span>
                    <span className="text-slate-300">
                      {employee.maxDailyOvertimeHours ? `${employee.maxDailyOvertimeHours} hrs` : "No limit"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Overtime Status:</span>
                    <span className={employee.overtimeAllowed ? "text-emerald-400" : "text-rose-400"}>
                      {employee.overtimeAllowed ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={toggleStatus}
              disabled={statusMutation.isPending}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                employee.status === "active"
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              }`}
            >
              {employee.status === "active" ? "Deactivate" : "Activate"}
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
