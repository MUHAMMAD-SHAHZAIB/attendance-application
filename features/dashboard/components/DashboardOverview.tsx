"use client";

import React, { useState, useEffect } from "react";
import { useAuthLogic } from "@/features/auth";
import { OrganizationTabs, useWorkplacesQuery, useDepartmentsQuery, useShiftsQuery } from "@/features/organization";
import { EmployeeList, useEmployeesQuery } from "@/features/employees";
import { AttendanceTable, useAttendanceDashboardQuery } from "@/features/attendance";
import { AccessControlTabs, useRolesQuery } from "@/features/access-control";
import { SchedulesTabs, useHolidaysQuery } from "@/features/schedules";
import { LeavesTabs } from "@/features/leaves";
import { API_BASE_URL } from "@/lib/api/endpoints";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavSection = "overview" | "organization" | "employees" | "attendance" | "schedules" | "leaves" | "payroll" | "roles";

const VALID_SECTIONS: NavSection[] = [
  "overview",
  "organization",
  "employees",
  "attendance",
  "schedules",
  "leaves",
  "payroll",
  "roles",
];

function getInitialNavSection(): NavSection {
  if (typeof window === "undefined") return "overview";
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") || params.get("section");
    if (tabParam && VALID_SECTIONS.includes(tabParam as NavSection)) {
      return tabParam as NavSection;
    }
    const hash = window.location.hash.replace("#", "");
    if (hash && VALID_SECTIONS.includes(hash as NavSection)) {
      return hash as NavSection;
    }
    const saved = localStorage.getItem("khanhome_active_nav");
    if (saved && VALID_SECTIONS.includes(saved as NavSection)) {
      return saved as NavSection;
    }
  } catch (e) {}
  return "overview";
}

export function DashboardOverview() {
  const { user, logout } = useAuthLogic();
  const [activeNav, setActiveNav] = useState<NavSection>("overview");

  useEffect(() => {
    const initial = getInitialNavSection();
    setActiveNav(initial);
  }, []);

  const handleNavChange = (nav: NavSection) => {
    setActiveNav(nav);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("khanhome_active_nav", nav);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", nav);
        window.history.replaceState(null, "", url.toString());
      } catch (e) {}
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("khanhome_active_nav");
      localStorage.removeItem("khanhome_org_tab");
      localStorage.removeItem("khanhome_schedules_tab");
      localStorage.removeItem("khanhome_access_control_tab");
    }
    logout();
  };

  // Real-time queries for quick dashboard counts
  const { data: workplaces } = useWorkplacesQuery();
  const { data: departments } = useDepartmentsQuery();
  const { data: shifts } = useShiftsQuery();
  const { data: employeePage } = useEmployeesQuery({ page: 1 });
  const { data: attendanceStats } = useAttendanceDashboardQuery();
  const { data: rolesList } = useRolesQuery();
  const currentYear = new Date().getFullYear();
  const { data: holidaysList } = useHolidaysQuery(currentYear);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="dashboard-sidebar w-full md:fixed md:inset-y-0 md:left-0 md:z-30 md:h-screen md:overflow-y-auto md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="px-1 py-1 mb-8">
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image src="/KH-DS%20Admin%20Logo.png" alt="Khan Home Digital Solutions" width={320} height={96} priority className="h-auto w-full" />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">HRMS Portal</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm">
            <button
              onClick={() => handleNavChange("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "overview"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </button>

            {/* Workplaces, Departments & Shifts */}
            <button
              onClick={() => handleNavChange("organization")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "organization"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Org & Workplaces</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/50">
                {(workplaces?.length ?? 0) + (departments?.length ?? 0)}
              </span>
            </button>

            <button
              onClick={() => handleNavChange("employees")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "employees"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Employees</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/50">
                {employeePage?.total ?? 0}
              </span>
            </button>

            <button
              onClick={() => handleNavChange("attendance")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "attendance"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Attendance & Logs</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/50">
                {attendanceStats?.presentToday ?? 0}
              </span>
            </button>

            <button
              onClick={() => handleNavChange("schedules")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "schedules"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Holidays</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/50 shrink-0">
                {holidaysList?.length ?? 0}
              </span>
            </button>

            <button
              onClick={() => handleNavChange("leaves")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "leaves"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Leaves & Overtime</span>
            </button>

            <button
              onClick={() => handleNavChange("payroll")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "payroll"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Payroll Reports</span>
            </button>

            <button
              onClick={() => handleNavChange("roles")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeNav === "roles"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Roles & Privileges</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-teal-400 border border-slate-700/50">
                {rolesList?.length ?? 0}
              </span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.username}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || "Authenticated"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:ml-64 md:p-6 overflow-y-auto">
        {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {activeNav === "overview" && "Workforce Dashboard"}
              {activeNav === "organization" && "Organization & Workplace Management"}
              {activeNav === "employees" && "Employee Administration"}
              {activeNav === "attendance" && "Attendance & Punch Logs"}
              {activeNav === "schedules" && "Public & Company Holidays"}
              {activeNav === "leaves" && "Leave & Overtime Management"}
              {activeNav === "payroll" && "Payroll Reports"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome, <span className="text-emerald-400 font-medium">{user?.username}</span> · Connected to{" "}
              <code className="text-[11px] text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {API_BASE_URL || "hrms.khanhomekitchens.ae (proxy)"}
              </code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user?.roles?.map((r, i) => (
              <span
                key={r.id || r.name || i}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                {r.name}
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
              MFA Verified ✓
            </span>
            <ThemeToggle compact />
          </div>
        </div>

        {/* Content based on Active Navigation */}
        {activeNav === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid with live counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => handleNavChange("organization")}
                className="stat-card-blue p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Workplaces</span>
                  <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <div className="stat-value-blue text-2xl font-bold text-white mt-1">
                  {workplaces ? workplaces.length : "—"}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">Active locations configured</p>
              </div>

              <div
                onClick={() => handleNavChange("organization")}
                className="stat-card-violet p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Departments</span>
                  <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <div className="stat-value-violet text-2xl font-bold text-emerald-400 mt-1">
                  {departments ? departments.length : "—"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Operational divisions</p>
              </div>

              <div
                onClick={() => handleNavChange("organization")}
                className="stat-card-teal p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Work Shifts</span>
                  <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <div className="stat-value-teal text-2xl font-bold text-teal-400 mt-1">
                  {shifts ? shifts.length : "—"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Timing rules configured</p>
              </div>

              <div
                onClick={() => handleNavChange("attendance")}
                className="stat-card-amber p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Attendance System</span>
                  <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <div className="stat-value-amber text-2xl font-bold text-white mt-1">
                  {attendanceStats ? `${attendanceStats.presentToday} Present` : "Online"}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">
                  {attendanceStats?.openShifts ? `${attendanceStats.openShifts} open shift(s)` : "Geofence & policy active"}
                </p>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Manage Organizational Structure</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Configure workplaces, assign operating shifts, define geofence boundaries, and organize company departments.
                  </p>
                </div>
                <button
                  onClick={() => handleNavChange("organization")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#132F70] hover:bg-[#0A2155] dark:bg-[#244B91] dark:hover:bg-[#315B9D] transition-all shadow-md shadow-blue-950/15 shrink-0 cursor-pointer"
                >
                  Open Workplaces & Shifts →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Organization Section */}
        {activeNav === "organization" && <OrganizationTabs />}

        {/* Dedicated Employee Administration Section */}
        {activeNav === "employees" && <EmployeeList />}

        {/* Dedicated Attendance & Logs Section */}
        {activeNav === "attendance" && <AttendanceTable />}

        {/* Dedicated Roles & Privileges (Access Control) Section */}
        {activeNav === "roles" && <AccessControlTabs />}

        {/* Dedicated Schedules & Overrides Section */}
        {activeNav === "schedules" && <SchedulesTabs />}

        {/* Dedicated Leaves & Overtime Management Section */}
        {activeNav === "leaves" && <LeavesTabs />}

        {/* Coming soon placeholders for other sections */}
        {activeNav !== "overview" &&
          activeNav !== "organization" &&
          activeNav !== "employees" &&
          activeNav !== "attendance" &&
          activeNav !== "roles" &&
          activeNav !== "schedules" &&
          activeNav !== "leaves" && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <svg width="24" height="24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white capitalize">{activeNav} Module</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ready for the next integration step. Organization and Employees are both live!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => handleNavChange("employees")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                Go to Employees
              </button>
              <button
                onClick={() => handleNavChange("organization")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all cursor-pointer"
              >
                Go to Organization
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
