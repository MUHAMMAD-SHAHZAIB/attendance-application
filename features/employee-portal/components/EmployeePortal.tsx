"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthLogic } from "@/features/auth";
import {
  useApplyEmployeeLeave,
  useCancelEmployeeLeave,
  useEmployeeAttendance,
  useEmployeeLeaves,
  useEmployeeOvertime,
  useEmployeePortalDashboard,
} from "../hooks/useEmployeePortal";
import {
  EmployeeAttendanceDay,
  EmployeeLeaveRequest,
  EmployeeOvertimeRequest,
} from "../types";

type PortalTab = "overview" | "attendance" | "leave" | "overtime";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateOnly
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatTimestamp(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatTime(value?: string | null) {
  return value ? value.slice(0, 5) : "—";
}

function formatMinutes(value?: number | null) {
  if (value == null) return "—";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function readable(value?: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("approv") || normalized === "completed" || normalized === "present"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300"
    : normalized.includes("reject") || normalized.includes("absent") || normalized.includes("late")
      ? "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300"
      : normalized.includes("pending") || normalized.includes("check")
        ? "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300"
        : "bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{readable(status)}</span>;
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string | number; detail?: string; tone: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${tone}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {detail && <p className="mt-1 text-[11px] text-slate-500">{detail}</p>}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function LeaveRow({ request, onCancel, busy }: { request: EmployeeLeaveRequest; onCancel?: () => void; busy?: boolean }) {
  const canCancel = request.status.toLowerCase() === "pending";
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(request.startDate)} – {formatDate(request.endDate)}</p>
          <StatusBadge status={request.status} />
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">{readable(request.payType)} leave</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{request.reason || "No reason provided"}</p>
        {request.reviewNote && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Review note: {request.reviewNote}</p>}
      </div>
      {canCancel && onCancel && (
        <button type="button" disabled={busy} onClick={onCancel} className="self-start rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 sm:self-center dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40">
          {busy ? "Cancelling…" : "Cancel request"}
        </button>
      )}
    </div>
  );
}

function AttendanceDayRow({ day }: { day: EmployeeAttendanceDay }) {
  const status = day.onLeave ? "leave" : day.holiday ? "holiday" : day.dayStatus;
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">{formatDate(day.date)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatTime(day.dutyStart)} – {formatTime(day.dutyFinish)}</td>
      <td className="px-4 py-3"><StatusBadge status={status} /></td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{formatTimestamp(day.checkInAt)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{formatTimestamp(day.checkOutAt)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{formatMinutes(day.workedMinutes)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-blue-800 dark:text-blue-300">{formatMinutes(day.overtimeMinutes)}</td>
    </tr>
  );
}

function OvertimeRow({ request }: { request: EmployeeOvertimeRequest }) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(request.workDate)}</p>
        <p className="mt-1 text-xs text-slate-500">{request.workplaceName}</p>
        {request.reviewNote && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{request.reviewNote}</p>}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-300">Requested <strong className="text-slate-900 dark:text-white">{formatMinutes(request.requestedMinutes)}</strong></div>
      <div className="flex items-center gap-2"><span className="text-xs text-slate-500">Approved: {formatMinutes(request.approvedMinutes)}</span><StatusBadge status={request.status} /></div>
    </div>
  );
}

export function EmployeePortal() {
  const { user, logout } = useAuthLogic();
  const [activeTab, setActiveTab] = useState<PortalTab>("overview");
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [leaveStatus, setLeaveStatus] = useState("all");
  const [overtimeStatus, setOvertimeStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payType, setPayType] = useState<"paid" | "unpaid">("paid");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const dashboard = useEmployeePortalDashboard();
  const leaves = useEmployeeLeaves(leaveStatus, activeTab === "overview" || activeTab === "leave");
  const attendance = useEmployeeAttendance(attendanceMonth, activeTab === "attendance");
  const overtime = useEmployeeOvertime(overtimeStatus, activeTab === "overtime");
  const applyLeave = useApplyEmployeeLeave();
  const cancelLeave = useCancelEmployeeLeave();
  const employee = dashboard.data;
  const summary = employee?.attendanceSummary;

  const tabs: { id: PortalTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "attendance", label: "My Attendance" },
    { id: "leave", label: "Leave Requests" },
    { id: "overtime", label: "Overtime" },
  ];

  const leaveTotals = useMemo(() => {
    const list = leaves.data ?? [];
    return {
      pending: list.filter((item) => item.status.toLowerCase() === "pending").length,
      approved: list.filter((item) => item.status.toLowerCase() === "approved").length,
    };
  }, [leaves.data]);

  const submitLeave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNotice("");
    if (!startDate || !endDate) {
      setFormError("Select both a start date and an end date.");
      return;
    }
    if (endDate < startDate) {
      setFormError("The end date must be on or after the start date.");
      return;
    }
    if (reason.length > 500) {
      setFormError("Reason must be 500 characters or fewer.");
      return;
    }
    try {
      await applyLeave.mutateAsync({ startDate, endDate, payType, reason: reason.trim() || undefined });
      setStartDate("");
      setEndDate("");
      setReason("");
      setNotice("Your leave request was submitted.");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  const handleCancelLeave = async (request: EmployeeLeaveRequest) => {
    if (!window.confirm(`Cancel your leave request for ${formatDate(request.startDate)}?`)) return;
    setNotice("");
    setFormError("");
    try {
      await cancelLeave.mutateAsync(request.id);
      setNotice("Your leave request was cancelled.");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700">
              <Image src="/KH-DS%20Admin%20Logo.png" alt="Khan Home Digital Solutions" width={210} height={63} priority className="h-auto w-40 sm:w-48" />
            </div>
            <div className="hidden border-l border-slate-200 pl-3 sm:block dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900 dark:text-blue-200">Employee Portal</p>
              <p className="mt-0.5 max-w-48 truncate text-xs text-slate-500">Welcome, {employee?.employeeName || user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button type="button" onClick={logout} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Khan Home · Self Service</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Your work, at a glance</h1>
            <p className="mt-1 text-sm text-slate-500">View attendance, submit leave, and track overtime requests.</p>
          </div>
          {employee && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-right dark:border-blue-900 dark:bg-blue-950/40"><p className="text-xs font-semibold text-blue-900 dark:text-blue-100">{employee.employeeName}</p><p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">{employee.employeeCode} · {employee.currentAssignment.workplaceName}</p></div>}
        </div>

        <nav aria-label="Employee portal sections" className="mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setNotice(""); setFormError(""); }} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${activeTab === tab.id ? "bg-[#132F70] text-white dark:bg-[#244B91]" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              {tab.label}
            </button>
          ))}
        </nav>

        {(notice || formError) && <div role="status" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${formError ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"}`}>{formError || notice}</div>}

        {dashboard.isLoading && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading your employee portal…</div>}
        {dashboard.isError && <div className="rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900 dark:bg-slate-900"><p className="font-semibold text-rose-800 dark:text-rose-200">Could not load your employee profile</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{errorMessage(dashboard.error)} If this is unexpected, ask HR to check that your account is linked to an active employee record and workplace assignment.</p><button type="button" onClick={() => dashboard.refetch()} className="mt-4 rounded-lg bg-[#132F70] px-3 py-2 text-xs font-semibold text-white">Try again</button></div>}

        {employee && activeTab === "overview" && (
          <div className="space-y-5">
            <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today · {formatDate(employee.date)}</p><h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Your schedule</h2></div>
                  <StatusBadge status={employee.today.status} />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><p className="text-[11px] text-slate-500">Shift</p><p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{employee.currentAssignment.shiftName}</p><p className="mt-0.5 text-xs text-slate-500">{formatTime(employee.today.dutyStart || employee.currentAssignment.shiftStart)} – {formatTime(employee.today.dutyFinish || employee.currentAssignment.shiftEnd)}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><p className="text-[11px] text-slate-500">Check in</p><p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{formatTimestamp(employee.today.checkInAt)}</p><p className="mt-0.5 text-xs text-slate-500">{employee.today.late ? "Marked late" : employee.today.workingDay ? "On schedule" : "No scheduled duty"}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><p className="text-[11px] text-slate-500">Check out</p><p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{formatTimestamp(employee.today.checkOutAt)}</p><p className="mt-0.5 text-xs text-slate-500">{employee.currentAssignment.workplaceName}</p></div>
                </div>
                {employee.upcomingHoliday && <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30"><div><p className="text-xs font-semibold text-amber-900 dark:text-amber-100">Upcoming holiday · {employee.upcomingHoliday.name}</p><p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-200">{employee.upcomingHoliday.workplaceName || "Company holiday"}</p></div><span className="text-xs font-semibold text-amber-900 dark:text-amber-100">{formatDate(employee.upcomingHoliday.holidayDate)}</span></div>}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">This month</p><h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Attendance summary</h2></div><button type="button" onClick={() => setActiveTab("attendance")} className="text-xs font-semibold text-blue-800 hover:text-blue-600 dark:text-blue-300">View month →</button></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <SummaryCard label="Present" value={summary?.presentDays ?? 0} tone="border-l-4 border-l-emerald-500" />
                  <SummaryCard label="Absent" value={summary?.absentDays ?? 0} tone="border-l-4 border-l-rose-400" />
                  <SummaryCard label="Worked" value={formatMinutes(summary?.workedMinutes)} tone="border-l-4 border-l-blue-500" />
                  <SummaryCard label="Approved OT" value={formatMinutes(summary?.approvedOvertimeMinutes)} tone="border-l-4 border-l-amber-400" />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/70"><span className="text-slate-500">Leave requests</span><span className="font-semibold text-slate-800 dark:text-slate-200">{leaveTotals.pending} pending · {leaveTotals.approved} approved</span></div>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent activity</p><h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Leave requests</h2></div><button type="button" onClick={() => setActiveTab("leave")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Manage leave</button></div>
              {employee.recentLeaveRequests.length ? <div className="space-y-2">{employee.recentLeaveRequests.slice(0, 3).map((request) => <LeaveRow key={request.id} request={request} />)}</div> : <EmptyState title="No leave requests yet" description="Your submitted leave requests will appear here." />}
            </section>
          </div>
        )}

        {employee && activeTab === "attendance" && (
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance history</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Monthly attendance</h2></div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Month <input type="month" value={attendanceMonth} onChange={(event) => setAttendanceMonth(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label></div>
            {attendance.isLoading ? <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 dark:bg-slate-900">Loading attendance…</div> : attendance.isError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage(attendance.error)}</div> : attendance.data && <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Present" value={attendance.data.summary.presentDays} tone="border-t-2 border-t-emerald-500" /><SummaryCard label="Absent" value={attendance.data.summary.absentDays} tone="border-t-2 border-t-rose-400" /><SummaryCard label="Worked" value={formatMinutes(attendance.data.summary.workedMinutes)} tone="border-t-2 border-t-blue-500" /><SummaryCard label="Overtime" value={formatMinutes(attendance.data.summary.overtimeMinutes)} detail={`${formatMinutes(attendance.data.summary.approvedOvertimeMinutes)} approved`} tone="border-t-2 border-t-amber-400" /></div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left"><thead className="bg-slate-50 dark:bg-slate-800/70"><tr>{["Date", "Schedule", "Status", "Check in", "Check out", "Worked", "Overtime"].map((title) => <th key={title} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</th>)}</tr></thead><tbody>{attendance.data.days.map((day) => <AttendanceDayRow key={day.date} day={day} />)}</tbody></table></div>{attendance.data.days.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No attendance days for this month.</div>}</div>
            </>}
          </section>
        )}

        {employee && activeTab === "leave" && (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your requests</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Leave history</h2></div><label className="text-xs text-slate-500">Status <select value={leaveStatus} onChange={(event) => setLeaveStatus(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{["all", "pending", "approved", "rejected"].map((item) => <option key={item} value={item}>{readable(item)}</option>)}</select></label></div>
              {leaves.isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading leave requests…</p> : leaves.isError ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage(leaves.error)}</p> : leaves.data?.length ? <div className="space-y-2">{leaves.data.map((request) => <LeaveRow key={request.id} request={request} onCancel={() => handleCancelLeave(request)} busy={cancelLeave.isPending} />)}</div> : <EmptyState title="No requests found" description="Submit a leave request using the form." />}
            </div>
            <form onSubmit={submitLeave} className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Plan time away</p><h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Apply for leave</h2></div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Start date<input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">End date<input required type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Pay type<select value={payType} onChange={(event) => setPayType(event.target.value as "paid" | "unpaid")} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><option value="paid">Paid leave</option><option value="unpaid">Unpaid leave</option></select></label>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Reason <span className="font-normal text-slate-400">(optional)</span><textarea maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Add a note for your manager" className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>
              <div className="flex items-center justify-between"><span className="text-[11px] text-slate-400">{reason.length}/500</span><button type="submit" disabled={applyLeave.isPending} className="rounded-lg bg-[#132F70] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0A2155] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#244B91] dark:hover:bg-[#315B9D]">{applyLeave.isPending ? "Submitting…" : "Submit request"}</button></div>
            </form>
          </section>
        )}

        {employee && activeTab === "overtime" && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hours beyond your shift</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Overtime requests</h2></div><label className="text-xs text-slate-500">Status <select value={overtimeStatus} onChange={(event) => setOvertimeStatus(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{["all", "pending", "approved", "rejected"].map((item) => <option key={item} value={item}>{readable(item)}</option>)}</select></label></div>
            {overtime.isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading overtime…</p> : overtime.isError ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage(overtime.error)}</p> : overtime.data?.length ? <div className="space-y-2">{overtime.data.map((request) => <OvertimeRow key={request.id} request={request} />)}</div> : <EmptyState title="No overtime requests" description="Overtime requests and their approval status will appear here." />}
          </section>
        )}
      </div>
    </main>
  );
}
