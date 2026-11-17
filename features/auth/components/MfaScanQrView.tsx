"use client";

import React, { useState } from "react";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { extractSecretFromOtpauth } from "../services/authService";
import { MfaPinInput } from "./MfaPinInput";

export function MfaScanQrView() {
  const { pendingAuthData, verifyMfa, isSubmitting, error, clearError, resetToLogin } =
    useAuthLogic();
  const [copied, setCopied] = useState(false);

  const secret = extractSecretFromOtpauth(pendingAuthData?.otpauthUri);

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleComplete = (code: string) => {
    verifyMfa(code);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Setup Authenticator (MFA)</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Scan this QR code using Google Authenticator or Microsoft Authenticator
        </p>
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

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-5">
        {pendingAuthData?.qrImageBase64 ? (
          <img
            src={`data:image/png;base64,${pendingAuthData.qrImageBase64}`}
            alt="MFA QR Code"
            className="w-44 h-44 rounded-xl bg-white p-2 shadow-lg"
          />
        ) : (
          <div className="w-44 h-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
            QR Code unavailable
          </div>
        )}

        {/* Secret fallback */}
        {secret && (
          <div className="mt-3 w-full text-center">
            <p className="text-[11px] text-slate-400 mb-1">Or enter manual key:</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              <span>{secret}</span>
              <button
                type="button"
                onClick={handleCopySecret}
                className="text-slate-400 hover:text-emerald-300 transition-colors text-xs"
                title="Copy secret"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code Input */}
      <div>
        <label className="block text-center text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Enter 6-Digit Verification Code
        </label>
        <MfaPinInput onComplete={handleComplete} disabled={isSubmitting} />
      </div>

      {isSubmitting && (
        <div className="text-center text-xs text-emerald-400 animate-pulse my-2">
          Verifying MFA code...
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-800 text-center">
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
