"use client";

import { useState } from "react";
import Link from "next/link";
import type { UsageDisplay } from "@/domain/entities/subscription";

type UsageBannerProps = {
  usage: UsageDisplay;
  compact?: boolean;
};

export function UsageBanner({ usage, compact = false }: UsageBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine urgency level
  const generationUrgency = getUrgency(usage.generationsRemaining, usage.generationsLimit);
  const regenerationUrgency = usage.regenerationsLimit < 999 
    ? getUrgency(usage.regenerationsRemaining, usage.regenerationsLimit)
    : 'normal';
  
  const showWarning = generationUrgency === 'critical' || regenerationUrgency === 'critical';
  const showCaution = generationUrgency === 'low' || regenerationUrgency === 'low';
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className={`flex items-center gap-1.5 ${getTextColor(generationUrgency)}`}>
          <BoltIcon className="h-4 w-4" />
          {usage.generationsLabel}
        </span>
        {usage.canUpgrade && (
          <Link 
            href="/pricing" 
            className="text-[#ff6b35] hover:underline"
          >
            Upgrade
          </Link>
        )}
      </div>
    );
  }
  
  return (
    <div className={`rounded-xl border px-4 py-3 ${getBannerStyle(showWarning, showCaution)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Plan Badge */}
          <div className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${getPlanBadgeStyle(usage.plan)}`}>
            {usage.planLabel}
          </div>
          
          {/* Generations */}
          <div className="flex items-center gap-2">
            <BoltIcon className={`h-4 w-4 ${getIconColor(generationUrgency)}`} />
            <span className={`text-sm font-medium ${getTextColor(generationUrgency)}`}>
              {usage.generationsLabel}
            </span>
            {usage.generationsResetIn && (
              <span className="text-xs text-[#606060]">
                · Resets {usage.generationsResetIn}
              </span>
            )}
          </div>
          
          {/* Separator */}
          <div className="h-4 w-px bg-white/10" />
          
          {/* Regenerations */}
          <div className="flex items-center gap-2">
            <RefreshIcon className={`h-4 w-4 ${getIconColor(regenerationUrgency)}`} />
            <span className={`text-sm ${getTextColor(regenerationUrgency)}`}>
              {usage.regenerationsLabel === 'unlimited' ? (
                <span className="text-[#22c55e]">∞ regenerations</span>
              ) : (
                <span>{usage.regenerationsLabel}</span>
              )}
            </span>
            {usage.regenerationsResetIn && usage.regenerationsLabel !== 'unlimited' && (
              <span className="text-xs text-[#606060]">
                · Resets in {usage.regenerationsResetIn}
              </span>
            )}
          </div>
        </div>
        
        {/* Upgrade CTA */}
        {usage.canUpgrade && (
          <Link 
            href="/pricing"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ff8f5a] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            <SparklesIcon className="h-4 w-4" />
            Upgrade
          </Link>
        )}
      </div>
      
      {/* Expandable details for mobile */}
      {isExpanded && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 md:hidden">
          <div>
            <p className="text-xs text-[#606060]">Generations</p>
            <p className="text-sm font-medium text-[#f0ece4]">{usage.generationsLabel}</p>
          </div>
          <div>
            <p className="text-xs text-[#606060]">Regenerations</p>
            <p className="text-sm font-medium text-[#f0ece4]">{usage.regenerationsLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIMIT REACHED MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type LimitReachedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: 'generation' | 'regeneration';
  resetIn?: string;
};

export function LimitReachedModal({ isOpen, onClose, type, resetIn }: LimitReachedModalProps) {
  if (!isOpen) return null;
  
  const isGeneration = type === 'generation';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl">
        {/* Icon */}
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
          isGeneration ? 'bg-red-500/20' : 'bg-amber-500/20'
        }`}>
          {isGeneration ? (
            <BoltIcon className="h-7 w-7 text-red-400" />
          ) : (
            <ClockIcon className="h-7 w-7 text-amber-400" />
          )}
        </div>
        
        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-[#f0ece4]">
          {isGeneration ? 'Generation Limit Reached' : 'Daily Limit Reached'}
        </h2>
        
        {/* Message */}
        <p className="mb-6 text-center text-[#a0a0a0]">
          {isGeneration 
            ? "You've used all your portfolio generations. Upgrade to get more!"
            : `You've used all your regenerations for today.`
          }
        </p>
        
        {/* Reset time */}
        {resetIn && !isGeneration && (
          <div className="mb-6 rounded-lg bg-white/5 px-4 py-3 text-center">
            <p className="text-sm text-[#a0a0a0]">Resets in</p>
            <p className="text-lg font-semibold text-[#f0ece4]">{resetIn}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-transparent py-3 text-sm font-medium text-[#a0a0a0] transition-colors hover:bg-white/5"
          >
            {isGeneration ? 'Maybe later' : 'Wait'}
          </button>
          <Link
            href="/pricing"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8f5a] py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            onClick={onClose}
          >
            <SparklesIcon className="h-4 w-4" />
            {isGeneration ? 'Upgrade Now' : 'Get Unlimited'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Urgency = 'normal' | 'low' | 'critical';

function getUrgency(remaining: number, limit: number): Urgency {
  if (limit >= 999) return 'normal'; // unlimited
  const percentage = remaining / limit;
  if (percentage <= 0) return 'critical';
  if (percentage <= 0.25) return 'low';
  return 'normal';
}

function getTextColor(urgency: Urgency): string {
  switch (urgency) {
    case 'critical': return 'text-red-400';
    case 'low': return 'text-amber-400';
    default: return 'text-[#f0ece4]';
  }
}

function getIconColor(urgency: Urgency): string {
  switch (urgency) {
    case 'critical': return 'text-red-400';
    case 'low': return 'text-amber-400';
    default: return 'text-[#a0a0a0]';
  }
}

function getBannerStyle(warning: boolean, caution: boolean): string {
  if (warning) return 'border-red-500/30 bg-red-500/10';
  if (caution) return 'border-amber-500/30 bg-amber-500/10';
  return 'border-white/10 bg-[#111111]';
}

function getPlanBadgeStyle(plan: string): string {
  switch (plan) {
    case 'free': return 'bg-white/10 text-[#a0a0a0]';
    case 'starter': return 'bg-blue-500/20 text-blue-400';
    case 'pro': return 'bg-gradient-to-r from-[#ff6b35]/20 to-[#ff8f5a]/20 text-[#ff6b35]';
    case 'lifetime': return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400';
    default: return 'bg-white/10 text-[#a0a0a0]';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
