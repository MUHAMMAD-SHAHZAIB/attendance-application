"use client";

import React, { useState, useEffect } from "react";
import { RoleList } from "./RoleList";
import { PermissionList } from "./PermissionList";
import { usePermissionsQuery, useRolesQuery } from "../hooks/useAccessControl";

export function AccessControlTabs() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subtab");
      if (sub === "roles" || sub === "permissions") {
        setActiveTab(sub);
        return;
      }
      const saved = localStorage.getItem("khanhome_access_control_tab");
      if (saved === "roles" || saved === "permissions") {
        setActiveTab(saved as "roles" | "permissions");
      }
    } catch (e) {}
  }, []);

  const handleTabChange = (tab: "roles" | "permissions") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("khanhome_access_control_tab", tab);
        const url = new URL(window.location.href);
        url.searchParams.set("subtab", tab);
        window.history.replaceState(null, "", url.toString());
      } catch (e) {}
    }
  };

  const { data: roles } = useRolesQuery();
  const { data: permissions } = usePermissionsQuery();

  const totalRoles = roles?.length ?? 0;
  const activeRoles = (roles || []).filter((r) => r.active).length;
  const totalPermissions = permissions?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Permissions & Roles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            RBAC (Role-Based Access Control) matrix, granular privileges, and module scopes
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 mr-1.5">Roles:</span>
            <span className="text-white font-bold">{totalRoles}</span>
            <span className="text-emerald-400 text-[10px] ml-1">({activeRoles} active)</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 mr-1.5">Privileges:</span>
            <span className="text-teal-400 font-bold">{totalPermissions}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => handleTabChange("roles")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "roles"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Roles & Assigned Privileges</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {totalRoles}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("permissions")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "permissions"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Permissions Catalogue</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {totalPermissions}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "roles" && <RoleList />}
      {activeTab === "permissions" && <PermissionList />}
    </div>
  );
}
