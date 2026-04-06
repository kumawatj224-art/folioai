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
  generationsPerMonth: number;  // -1 = based on lifetime total for free
  regenerationsPerDay: number;  // 999 = unlimited
  
  // Features
  allowedTemplates: string[] | 'all';
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
  // Generation tracking
  generationsUsedThisMonth: number;
  generationsUsedTotal: number;      // For free tier lifetime limit
  monthResetDate: Date;
  
  // Regeneration tracking
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
  free: {
    plan: 'free',
    generationsPerMonth: 3,  // Actually lifetime total
    regenerationsPerDay: 2,
    allowedTemplates: ['minimal-dark', 'minimal-warm', 'terminal-dark'],
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
    regenerationsPerDay: 10,
    allowedTemplates: 'all',
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
    regenerationsPerDay: 999,  // Unlimited
    allowedTemplates: 'all',
    hasSubdomain: true,
    maxCustomDomains: 1,  // BYOD - user brings their own domain
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
    generationsPerMonth: 10,  // Capped for sustainability (120/year max)
    regenerationsPerDay: 999,
    allowedTemplates: 'all',
    hasSubdomain: true,
    maxCustomDomains: 1,  // BYOD - user brings their own domain
    maxPortfolios: 3,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    showBranding: false,
    brandingSize: 'none',
    hasPrioritySupport: true,
    hasGithubSync: true,
    priceMonthly: 0,
    priceYearly: 0,
    priceLifetime: 4999,  // Sustainable: break-even ~2 years of Pro
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

export function isTemplateAllowed(plan: PlanType, templateSlug: string): boolean {
  const limits = PLAN_LIMITS[plan];
  if (limits.allowedTemplates === 'all') return true;
  return limits.allowedTemplates.includes(templateSlug);
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

export function canGenerate(subscription: UserSubscription): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[subscription.plan];
  const usage = subscription.usage;
  
  // Free plan uses lifetime total
  if (subscription.plan === 'free') {
    if (usage.generationsUsedTotal >= limits.generationsPerMonth) {
      return { 
        allowed: false, 
        reason: `You've used all ${limits.generationsPerMonth} free generations. Upgrade to continue!` 
      };
    }
  } else {
    // Paid plans use monthly
    if (usage.generationsUsedThisMonth >= limits.generationsPerMonth) {
      return { 
        allowed: false, 
        reason: `You've used all ${limits.generationsPerMonth} generations this month. Resets ${formatResetDate(usage.monthResetDate)}.` 
      };
    }
  }
  
  return { allowed: true };
}

export function canRegenerate(subscription: UserSubscription): { allowed: boolean; reason?: string; resetIn?: string } {
  const limits = PLAN_LIMITS[subscription.plan];
  const usage = subscription.usage;
  
  // Unlimited for pro/lifetime
  if (limits.regenerationsPerDay >= 999) {
    return { allowed: true };
  }
  
  // Check daily limit
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
  
  // Calculate generations
  let generationsRemaining: number;
  let generationsLimit: number;
  let generationsLabel: string;
  
  if (subscription.plan === 'free') {
    generationsRemaining = Math.max(0, limits.generationsPerMonth - usage.generationsUsedTotal);
    generationsLimit = limits.generationsPerMonth;
    generationsLabel = `${generationsRemaining}/${generationsLimit} generations left`;
  } else {
    generationsRemaining = Math.max(0, limits.generationsPerMonth - usage.generationsUsedThisMonth);
    generationsLimit = limits.generationsPerMonth;
    generationsLabel = `${generationsRemaining}/${generationsLimit} this month`;
  }
  
  // Calculate regenerations
  const isUnlimited = limits.regenerationsPerDay >= 999;
  const regenerationsRemaining = isUnlimited ? 999 : Math.max(0, limits.regenerationsPerDay - usage.regenerationsUsedToday);
  const regenerationsLimit = limits.regenerationsPerDay;
  const regenerationsLabel = isUnlimited ? 'unlimited' : `${regenerationsRemaining}/${regenerationsLimit} today`;
  
  return {
    plan: subscription.plan,
    planLabel: getPlanLabel(subscription.plan),
    generationsRemaining,
    generationsLimit,
    generationsLabel,
    regenerationsRemaining,
    regenerationsLimit,
    regenerationsLabel,
    generationsResetIn: subscription.plan !== 'free' ? formatResetDate(usage.monthResetDate) : undefined,
    regenerationsResetIn: !isUnlimited ? formatTimeUntil(usage.dayResetDate) : undefined,
    canUpgrade: subscription.plan !== 'lifetime',
    upgradeReason: subscription.plan === 'free' ? 'Get more generations & features' : undefined,
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
      generationsUsedThisMonth: 0,
      generationsUsedTotal: 0,
      monthResetDate: nextMonth,
      regenerationsUsedToday: 0,
      dayResetDate: tomorrow,
      portfolioCount: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}
