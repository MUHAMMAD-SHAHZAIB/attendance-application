"use client";

import React, { useState, useEffect } from "react";
import { DepartmentList } from "./departments/DepartmentList";
import { WorkplaceList } from "./workplaces/WorkplaceList";
import { ShiftList } from "./shifts/ShiftList";
import { WorkPatternList, useWorkPatternsQuery } from "@/features/schedules";
import { useDepartmentsQuery } from "../hooks/useDepartments";
import { useWorkplacesQuery } from "../hooks/useWorkplaces";
import { useShiftsQuery } from "../hooks/useShifts";

export type OrgTab = "departments" | "workplaces" | "shifts" | "patterns";

export function OrganizationTabs() {
  const [activeTab, setActiveTab] = useState<OrgTab>("workplaces");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subtab");
      if (sub === "departments" || sub === "workplaces" || sub === "shifts" || sub === "patterns") {
        setActiveTab(sub as OrgTab);
        return;
      }
      const saved = localStorage.getItem("khanhome_org_tab");
      if (saved === "departments" || saved === "workplaces" || saved === "shifts" || saved === "patterns") {
        setActiveTab(saved as OrgTab);
      }
    } catch (e) {}
  }, []);

  const handleTabChange = (tab: OrgTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("khanhome_org_tab", tab);
        const url = new URL(window.location.href);
        url.searchParams.set("subtab", tab);
        window.history.replaceState(null, "", url.toString());
      } catch (e) {}
    }
  };

  const { data: departments } = useDepartmentsQuery();
  const { data: workplaces } = useWorkplacesQuery();
  const { data: shifts } = useShiftsQuery();
  const { data: patterns } = useWorkPatternsQuery("all");

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 w-fit flex-wrap">
        <button
          onClick={() => handleTabChange("workplaces")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "workplaces"
              ? "bg-[#132F70] text-white dark:bg-[#244B91] shadow-md shadow-blue-950/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>Workplaces</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "workplaces" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            {workplaces?.length ?? 0}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("departments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "departments"
              ? "bg-[#132F70] text-white dark:bg-[#244B91] shadow-md shadow-blue-950/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>Departments</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "departments" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            {departments?.length ?? 0}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("shifts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "shifts"
              ? "bg-[#132F70] text-white dark:bg-[#244B91] shadow-md shadow-blue-950/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>Work Shifts</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "shifts" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            {shifts?.length ?? 0}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("patterns")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "patterns"
              ? "bg-[#132F70] text-white dark:bg-[#244B91] shadow-md shadow-blue-950/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>Weekly Work Patterns</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "patterns" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            {patterns?.length ?? 0}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-300">
        {activeTab === "workplaces" && <WorkplaceList />}
        {activeTab === "departments" && <DepartmentList />}
        {activeTab === "shifts" && <ShiftList />}
        {activeTab === "patterns" && <WorkPatternList />}
      </div>
    </div>
  );
}
