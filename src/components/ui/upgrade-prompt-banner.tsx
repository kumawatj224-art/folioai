"use client";

import Link from "next/link";
import { useState } from "react";

type UpgradePromptBannerProps = {
  type: "generation" | "regeneration";
  message: string;
};

/**
 * UpgradePromptBanner
 *
 * Shown on the dashboard when the user is redirected from a limit-reached
 * server-side guard (free tier: 1 new generation + 2 regenerations).
 *
 * Dismissible by the user. Links to /pricing for upgrade.
 */
export function UpgradePromptBanner({ type, message }: UpgradePromptBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isGeneration = type === "generation";

  return (
    <div
      role="alert"
      className="relative flex items-start gap-4 rounded-2xl border border-[#ff6b35]/30 bg-gradient-to-r from-[#ff6b35]/10 via-[#ff8f5a]/10 to-transparent p-5 shadow-lg"
    >
      {/* Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#ff6b35]/20">
        {isGeneration ? (
          // Bolt / Generation icon
          <svg className="h-5 w-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ) : (
          // Refresh / Regeneration icon
          <svg className="h-5 w-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#f0ece4]">
          {isGeneration ? "Portfolio Limit Reached" : "Regeneration Limit Reached"}
        </p>
        <p className="mt-0.5 text-sm text-[#a0a0a0]">{message}</p>

        {/* Free plan breakdown */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#606060]">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isGeneration ? "bg-red-400" : "bg-[#606060]"}`} />
            1 new portfolio (free, lifetime)
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${!isGeneration ? "bg-red-400" : "bg-[#606060]"}`} />
            2 regenerations (free, lifetime)
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ff8f5a] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Upgrade Now
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss upgrade prompt"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606060] transition-colors hover:bg-white/[0.05] hover:text-[#a0a0a0]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
