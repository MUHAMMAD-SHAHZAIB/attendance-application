"use client";

import { useEffect, useState } from "react";
import { useAuthLogic, AuthContainer } from "@/features/auth";
import { DashboardOverview } from "@/features/dashboard";
import { EmployeePortal } from "@/features/employee-portal";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const { isAuthenticated, user, hasHydrated } = useAuthLogic();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if store already hydrated from localStorage or via persist callback
  const isReady = mounted && (hasHydrated || (useAuthStore.persist?.hasHydrated ? useAuthStore.persist.hasHydrated() : false));

  // Show clean dark loading state during hydration to prevent flashing the login screen
  if (!isReady) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">Loading workspace...</span>
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    const adminRoles = new Set(["admin", "super_admin", "hr_manager"]);
    const hasAdminAccess = user?.roles?.some((role) => {
      const normalized = role.name.trim().toLowerCase().replace(/[-\s]+/g, "_").replace(/^role_/, "");
      return adminRoles.has(normalized);
    });

    if (!hasAdminAccess) {
      return <EmployeePortal />;
    }

    return <DashboardOverview />;
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full">
        <AuthContainer />
      </div>
    </main>
  );
}
