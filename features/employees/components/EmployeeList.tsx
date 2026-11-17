"use client";

import React, { useState, useEffect } from "react";
import { EmployeeFilterParams, EmployeeView } from "../types";
import { useEmployeesQuery, useEmployeeStatusMutation } from "../hooks/useEmployees";
import { useWorkplacesQuery } from "@/features/organization";
import { EmployeeFormPage } from "./EmployeeFormPage";
import { EmployeeDetailsPage } from "./EmployeeDetailsPage";
import { EmployeePhotoModal } from "./EmployeePhotoModal";

type EmployeeViewMode = "list" | "create" | "edit" | "details";

export function EmployeeList() {
  const [filters, setFilters] = useState<EmployeeFilterParams>({
    search: "",
    status: "all",
    workplaceId: undefined,
    countryCode: "",
    page: 1,
  });

  const { data: employeePage, isLoading, isError, error } = useEmployeesQuery(filters);
  const { data: workplaces } = useWorkplacesQuery();
  const statusMutation = useEmployeeStatusMutation();

  // Page view & selection state
  const [viewMode, setViewMode] = useState<EmployeeViewMode>("list");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeView | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleGlobalClick = () => setOpenDropdownId(null);
    if (openDropdownId !== null) {
      window.addEventListener("click", handleGlobalClick);
      return () => window.removeEventListener("click", handleGlobalClick);
    }
  }, [openDropdownId]);

  const handleCreate = () => {
    setSelectedEmployee(null);
    setViewMode("create");
  };

  const handleEdit = (employee: EmployeeView) => {
    setSelectedEmployee(employee);
    setViewMode("edit");
  };

  const handleManagePhoto = (employee: EmployeeView) => {
    setSelectedEmployee(employee);
    setIsPhotoModalOpen(true);
  };

  const handleViewDetails = (employee: EmployeeView) => {
    setSelectedEmployee(employee);
    setViewMode("details");
  };

  const handleToggleStatus = async (employee: EmployeeView) => {
    const nextStatus = employee.status === "active" ? "inactive" : "active";
    if (confirm(`Change status of ${employee.name} to ${nextStatus}?`)) {
      await statusMutation.mutateAsync({ id: employee.id, status: nextStatus });
    }
  };

  // Render Full Page: Register New Employee
  if (viewMode === "create") {
    return <EmployeeFormPage onBack={() => setViewMode("list")} />;
  }

  // Render Full Page: Edit Existing Employee
  if (viewMode === "edit" && selectedEmployee) {
    return (
      <EmployeeFormPage
        employeeToEdit={selectedEmployee}
        onBack={() => setViewMode("list")}
      />
    );
  }

  // Render Full Page: Employee Details & Profile
  if (viewMode === "details" && selectedEmployee) {
    return (
      <>
        <EmployeeDetailsPage
          employee={selectedEmployee}
          onBack={() => setViewMode("list")}
          onEdit={(emp) => {
            setSelectedEmployee(emp);
            setViewMode("edit");
          }}
          onManagePhoto={(emp) => {
            setSelectedEmployee(emp);
            setIsPhotoModalOpen(true);
          }}
        />
        <EmployeePhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          employee={selectedEmployee}
        />
      </>
    );
  }

  const employees = employeePage?.employees || [];
  const total = employeePage?.total || 0;
  const currentPage = employeePage?.page || 1;
  const totalPages = employeePage?.totalPages || 1;

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Search by name, ID code, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Workplace Filter */}
          <select
            value={filters.workplaceId || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                workplaceId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Workplaces</option>
            {workplaces?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={filters.countryCode}
            onChange={(e) => setFilters((prev) => ({ ...prev, countryCode: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Countries</option>
            <option value="AE">UAE (AE)</option>
            <option value="PK">Pakistan (PK)</option>
            <option value="SA">Saudi Arabia (SA)</option>
          </select>
        </div>

        {/* Register Button */}
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] active:scale-[0.98] transition-all shadow-md shadow-blue-950/15 cursor-pointer shrink-0"
        >
          <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Register Employee</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-10 text-center text-xs text-slate-400 animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800/80">
          Loading employees...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Failed to load employees: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Employees Table */}
      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Employee</th>
                  <th className="px-5 py-3.5 font-semibold">Department & Role</th>
                  <th className="px-5 py-3.5 font-semibold">Workplace & Shift</th>
                  <th className="px-5 py-3.5 font-semibold">Compensation</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No employees match your search criteria.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => handleManagePhoto(emp)}
                            className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer relative group"
                            title="Manage photo"
                          >
                            {emp.hasPhoto && emp.photoUrl ? (
                              <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-emerald-400">
                                {emp.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white block hover:text-emerald-300 cursor-pointer" onClick={() => handleViewDetails(emp)}>
                              {emp.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {emp.employeeId} · {emp.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-200 block">{emp.designation}</span>
                        <span className="text-[11px] text-emerald-400">{emp.department}</span>
                      </td>

                      {/* Workplace & Shift */}
                      <td className="px-5 py-3.5">
                        <span className="text-slate-200 block font-medium">{emp.primaryWorkplace}</span>
                        <span className="text-[11px] text-slate-400">
                          {emp.workplaceShift || "Standard"} · {emp.country}
                        </span>
                      </td>

                      {/* Compensation */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white block">
                          {emp.monthlyBaseSalary} {emp.salaryCurrencyCode}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          OT: {emp.overtimeHourlyRate}/hr · {emp.overtimeAllowed ? "Active" : "Off"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                            emp.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {emp.status}
                        </button>
                      </td>

                      {/* Actions (3-dots dropdown menu) */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === emp.id ? null : emp.id);
                            }}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                              openDropdownId === emp.id
                                ? "bg-slate-800 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                            }`}
                            title="Actions menu"
                          >
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>

                          {openDropdownId === emp.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 ${
                                index >= employees.length - 2 && employees.length > 2
                                  ? "bottom-full mb-1"
                                  : "top-full mt-1"
                              } w-44 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleViewDetails(emp);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-slate-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleEdit(emp);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-emerald-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit Profile</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleManagePhoto(emp);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-teal-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Change Photo</span>
                              </button>

                              <div className="my-1 border-t border-slate-800" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleToggleStatus(emp);
                                }}
                                className={`w-full px-3.5 py-2 text-xs flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-slate-800 ${
                                  emp.status === "active"
                                    ? "text-amber-400 hover:text-amber-300"
                                    : "text-emerald-400 hover:text-emerald-300"
                                }`}
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>{emp.status === "active" ? "Deactivate" : "Activate"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Showing page {currentPage} of {totalPages} ({total} employees)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                  className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 hover:text-white cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 hover:text-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Upload Modal (Specifically for file upload/crop) */}
      <EmployeePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
}
