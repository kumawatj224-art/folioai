/**
 * DOMAIN LAYER - Plan & Subscription Types
 * 
 * Defines pricing plans, limits, and subscription status.
 */

export type PlanType = 'free' | 'starter' | 'pro' | 'lifetime';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

/**
 * Plan feature limits
 */
export type PlanLimits = {
  plan: PlanType;
  
  // Generation limits
  generationsPerMonth: number;    // For paid plans (monthly, -1 = use free-tier split logic)
  maxNewGenerations: number;      // Free tier only: max brand-new portfolios (1)
  maxRegenerations: number;       // Free tier only: max lifetime regenerations (2)
  regenerationsPerDay: number;    // Paid plans: 999 = unlimited
  
  // Features
  hasSubdomain: boolean;
  maxCustomDomains: number;
  maxPortfolios: number;
  
  // Analytics
  hasBasicAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  
  // Branding
  showBranding: boolean;      // "Made with FolioAI" footer
  brandingSize: 'large' | 'small' | 'none';
  
  // Support
  hasPrioritySupport: boolean;
  hasGithubSync: boolean;
  
  // Pricing
  priceMonthly: number;       // in INR, 0 for free
  priceYearly: number;        // in INR, 0 for free
  priceLifetime?: number;     // only for lifetime plan
};

/**
 * User's current usage
 */
export type UserUsage = {
  // Paid plan generation tracking (monthly)
  generationsUsedThisMonth: number;
  monthResetDate: Date;

  /**
   * FREE TIER SPLIT TRACKING
   * The free plan has two separate lifetime counters:
   *   - new_generations_count:  how many brand-new portfolios created (max 1)
   *   - regenerations_count:    how many times the existing portfolio was regenerated (max 2)
   *
   * These replace the old single "generationsUsedTotal" (which was 3 combined).
   */
  newGenerationsCount: number;   // DB: new_generations_count
  regenerationsCount: number;    // DB: regenerations_count
  
  // Legacy field — kept for backward compatibility, mirrors newGenerationsCount + regenerationsCount
  generationsUsedTotal: number;

  // Paid plan regeneration tracking (daily)
  regenerationsUsedToday: number;
  dayResetDate: Date;
  
  // Portfolio count
  portfolioCount: number;
};

/**
 * Full subscription with usage
 */
export type UserSubscription = {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  
  // Usage
  usage: UserUsage;
  
  // Billing (for paid plans)
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
};

/**
 * What the UI needs to display
 */
export type UsageDisplay = {
  plan: PlanType;
  planLabel: string;
  
  // Generations
  generationsRemaining: number;
  generationsLimit: number;
  generationsLabel: string;  // "2/3 generations left" or "5/15 this month"
  
  // Regenerations
  regenerationsRemaining: number;
  regenerationsLimit: number;
  regenerationsLabel: string;  // "1/2 today" or "unlimited"
  
  // Time until reset
  generationsResetIn?: string;  // "Resets in 23 days"
  regenerationsResetIn?: string;  // "Resets in 14h 23m"
  
  // Upgrade CTA
  canUpgrade: boolean;
  upgradeReason?: string;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  /**
   * FREE TIER SPLIT LIMITS:
   * - 1 new portfolio generation  (new_generations_count, lifetime)
   * - 2 regenerations of that portfolio (regenerations_count, lifetime)
   * Both are lifetime counters — they do NOT reset.
   */
  free: {
    plan: 'free',
    generationsPerMonth: -1,   // Unused for free — use maxNewGenerations instead
    maxNewGenerations: 1,      // 1 brand-new portfolio creation (lifetime)
    maxRegenerations: 2,       // 2 regenerations of that portfolio (lifetime)
    regenerationsPerDay: 999,  // Free plan does NOT use daily regen; uses lifetime maxRegenerations
    hasSubdomain: false,
    maxCustomDomains: 0,
    maxPortfolios: 1,
    hasBasicAnalytics: false,
    hasAdvancedAnalytics: false,
    showBranding: true,
    brandingSize: 'large',
    hasPrioritySupport: false,
    hasGithubSync: false,
    priceMonthly: 0,
    priceYearly: 0,
  },
  
  starter: {
    plan: 'starter',
    generationsPerMonth: 5,
    maxNewGenerations: 999,    // Unlimited for paid plans
    maxRegenerations: 999,     // Unlimited for paid plans
    regenerationsPerDay: 10,
    hasSubdomain: true,
    maxCustomDomains: 0,
    maxPortfolios: 1,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: false,
    showBranding: true,
    brandingSize: 'small',
    hasPrioritySupport: false,
    hasGithubSync: false,
    priceMonthly: 99,
    priceYearly: 799,
  },
  
  pro: {
    plan: 'pro',
    generationsPerMonth: 15,
    maxNewGenerations: 999,    // Unlimited for paid plans
    maxRegenerations: 999,     // Unlimited for paid plans
    regenerationsPerDay: 999,  // Unlimited
    hasSubdomain: true,
    maxCustomDomains: 1,       // BYOD - user brings their own domain
    maxPortfolios: 3,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    showBranding: false,
    brandingSize: 'none',
    hasPrioritySupport: true,
    hasGithubSync: true,
    priceMonthly: 199,
    priceYearly: 1499,
  },
  
  lifetime: {
    plan: 'lifetime',
    generationsPerMonth: 10,   // Capped for sustainability (120/year max)
    maxNewGenerations: 999,    // Unlimited for paid plans
    maxRegenerations: 999,     // Unlimited for paid plans
    regenerationsPerDay: 999,
    hasSubdomain: true,
    maxCustomDomains: 1,       // BYOD - user brings their own domain
    maxPortfolios: 3,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    showBranding: false,
    brandingSize: 'none',
    hasPrioritySupport: true,
    hasGithubSync: true,
    priceMonthly: 0,
    priceYearly: 0,
    priceLifetime: 4999,       // Sustainable: break-even ~2 years of Pro
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getPlanLabel(plan: PlanType): string {
  const labels: Record<PlanType, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    lifetime: 'Lifetime',
  };
  return labels[plan];
}

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canCreatePortfolio(subscription: UserSubscription): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[subscription.plan];
  
  if (subscription.usage.portfolioCount >= limits.maxPortfolios) {
    return { 
      allowed: false, 
      reason: `You've reached the maximum of ${limits.maxPortfolios} portfolio${limits.maxPortfolios > 1 ? 's' : ''} on the ${getPlanLabel(subscription.plan)} plan.` 
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can create a brand-new portfolio.
 *
 * Free tier:  limited to 1 new generation (lifetime, no reset).
 * Paid plans: limited by generationsPerMonth (monthly reset).
 */
export function canGenerate(subscription: UserSubscription): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[subscription.plan];
  const usage = subscription.usage;
  
  if (subscription.plan === 'free') {
    // Free tier: check new_generations_count (max 1, lifetime)
    if (usage.newGenerationsCount >= limits.maxNewGenerations) {
      return { 
        allowed: false, 
        reason: `You've used your 1 free portfolio generation. Upgrade to create more!` 
      };
    }
  } else {
    // Paid plans: check monthly usage
    if (usage.generationsUsedThisMonth >= limits.generationsPerMonth) {
      return { 
        allowed: false, 
        reason: `You've used all ${limits.generationsPerMonth} generations this month. Resets ${formatResetDate(usage.monthResetDate)}.` 
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Check if user can regenerate (edit/refresh) their existing portfolio.
 *
 * Free tier:  limited to 2 regenerations TOTAL (lifetime, no reset).
 * Paid plans: limited by regenerationsPerDay (daily reset; 999 = unlimited).
 */
export function canRegenerate(subscription: UserSubscription): { allowed: boolean; reason?: string; resetIn?: string } {
  const limits = PLAN_LIMITS[subscription.plan];
  const usage = subscription.usage;
  
  if (subscription.plan === 'free') {
    // Free tier: check lifetime regenerations_count (max 2, never resets)
    if (usage.regenerationsCount >= limits.maxRegenerations) {
      return { 
        allowed: false, 
        reason: `You've used all 2 free regenerations. Upgrade to unlock unlimited regenerations!`,
      };
    }
    return { allowed: true };
  }
  
  // Paid plans: unlimited if regenerationsPerDay >= 999
  if (limits.regenerationsPerDay >= 999) {
    return { allowed: true };
  }
  
  // Paid plans: check daily limit
  if (usage.regenerationsUsedToday >= limits.regenerationsPerDay) {
    const resetIn = formatTimeUntil(usage.dayResetDate);
    return { 
      allowed: false, 
      reason: `Daily regeneration limit reached.`,
      resetIn,
    };
  }
  
  return { allowed: true };
}

export function getUsageDisplay(subscription: UserSubscription): UsageDisplay {
  const limits = PLAN_LIMITS[subscription.plan];
  const usage = subscription.usage;
  
  // ── Generations display ──
  let generationsRemaining: number;
  let generationsLimit: number;
  let generationsLabel: string;
  
  if (subscription.plan === 'free') {
    // Free tier: show new_generations_count against maxNewGenerations (1)
    generationsRemaining = Math.max(0, limits.maxNewGenerations - usage.newGenerationsCount);
    generationsLimit = limits.maxNewGenerations;
    generationsLabel = generationsRemaining > 0
      ? `${generationsRemaining} new portfolio left`
      : `0 new portfolios left`;
  } else {
    generationsRemaining = Math.max(0, limits.generationsPerMonth - usage.generationsUsedThisMonth);
    generationsLimit = limits.generationsPerMonth;
    generationsLabel = `${generationsRemaining}/${generationsLimit} this month`;
  }
  
  // ── Regenerations display ──
  let regenerationsRemaining: number;
  let regenerationsLimit: number;
  let regenerationsLabel: string;

  if (subscription.plan === 'free') {
    // Free tier: show regenerations_count against maxRegenerations (2, lifetime)
    regenerationsRemaining = Math.max(0, limits.maxRegenerations - usage.regenerationsCount);
    regenerationsLimit = limits.maxRegenerations;
    regenerationsLabel = `${regenerationsRemaining}/${regenerationsLimit} regenerations left`;
  } else {
    const isUnlimited = limits.regenerationsPerDay >= 999;
    regenerationsRemaining = isUnlimited ? 999 : Math.max(0, limits.regenerationsPerDay - usage.regenerationsUsedToday);
    regenerationsLimit = limits.regenerationsPerDay;
    regenerationsLabel = isUnlimited ? 'unlimited' : `${regenerationsRemaining}/${regenerationsLimit} today`;
  }
  
  const isFreePlan = subscription.plan === 'free';
  
  return {
    plan: subscription.plan,
    planLabel: getPlanLabel(subscription.plan),
    generationsRemaining,
    generationsLimit,
    generationsLabel,
    regenerationsRemaining,
    regenerationsLimit,
    regenerationsLabel,
    generationsResetIn: !isFreePlan ? formatResetDate(usage.monthResetDate) : undefined,
    regenerationsResetIn: !isFreePlan && limits.regenerationsPerDay < 999
      ? formatTimeUntil(usage.dayResetDate)
      : undefined,
    canUpgrade: subscription.plan !== 'lifetime',
    upgradeReason: isFreePlan ? 'Unlock more generations & features' : undefined,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatResetDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return `in ${diffDays} days`;
}

function formatTimeUntil(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'now';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT SUBSCRIPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createDefaultSubscription(userId: string): UserSubscription {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  
  return {
    id: crypto.randomUUID(),
    userId,
    plan: 'free',
    status: 'active',
    usage: {
      // Paid plan tracking
      generationsUsedThisMonth: 0,
      monthResetDate: nextMonth,
      regenerationsUsedToday: 0,
      dayResetDate: tomorrow,
      // Free tier split tracking
      newGenerationsCount: 0,   // New portfolios created (max 1)
      regenerationsCount: 0,    // Regenerations used (max 2)
      generationsUsedTotal: 0,  // Legacy field (kept for compatibility)
      portfolioCount: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}
