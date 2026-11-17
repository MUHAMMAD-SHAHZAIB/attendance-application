"use client";

import React from "react";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { LoginForm } from "./LoginForm";
import { MfaScanQrView } from "./MfaScanQrView";
import { MfaVerifyView } from "./MfaVerifyView";
import { API_BASE_URL } from "@/lib/api/endpoints";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthContainer() {
  const { step } = useAuthLogic();

  return (
    <div className="relative w-full max-w-md mx-auto pt-12 sm:pt-10">
      <div className="absolute right-0 top-0">
        <ThemeToggle compact />
      </div>
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex rounded-xl bg-white p-2 shadow-lg shadow-slate-900/10 mb-4">
          <Image src="/KH-DS%20Admin%20Logo.png" alt="Khan Home Digital Solutions" width={320} height={96} priority className="h-auto w-64 sm:w-72" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Attendance <span className="text-emerald-400">HRMS</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Attendance & Workforce Management Portal
        </p>
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{API_BASE_URL ? API_BASE_URL.replace("https://", "").replace("http://", "") : "hrms.khanhomekitchens.ae"}</span>
        </div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl p-7 sm:p-8">
        {step === "LOGIN" && <LoginForm />}
        {step === "SCAN_QR" && <MfaScanQrView />}
        {step === "MFA_REQUIRED" && <MfaVerifyView />}

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Protected by TOTP MFA · Khan Home Kitchens
          </p>
        </div>
      </div>
    </div>
  );
}
