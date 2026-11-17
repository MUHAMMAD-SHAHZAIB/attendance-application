"use client";

import React from "react";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { MfaPinInput } from "./MfaPinInput";

export function MfaVerifyView() {
  const { pendingAuthData, verifyMfa, isSubmitting, error, clearError, resetToLogin } =
    useAuthLogic();

  const handleComplete = (code: string) => {
    verifyMfa(code);
  };

  const remainingAttempts = pendingAuthData?.remainingAttempts;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Please enter the 6-digit code from your authenticator app for{" "}
          <span className="text-emerald-400 font-medium">{pendingAuthData?.username || "your account"}</span>
        </p>

        {remainingAttempts !== null && remainingAttempts !== undefined && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span>Remaining attempts: {remainingAttempts}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
          <div className="flex-1">
            <span>{error}</span>
          </div>
          <button onClick={clearError} type="button" className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="py-2">
        <label className="block text-center text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          6-Digit Security Code
        </label>
        <MfaPinInput onComplete={handleComplete} disabled={isSubmitting} />
      </div>

      {isSubmitting && (
        <div className="text-center text-xs text-emerald-400 animate-pulse my-2">
          Verifying security code...
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={resetToLogin}
          className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          ← Return to Login
        </button>
      </div>
    </div>
  );
}
