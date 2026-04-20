/**
 * INFRASTRUCTURE LAYER - Subscription Repository
 * 
 * Manages user subscriptions and usage tracking.
 * Uses Supabase for persistence.
 */

import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/client";
import type { 
  UserSubscription, 
  PlanType,
  UserUsage,
} from "@/domain/entities/subscription";
import { 
  createDefaultSubscription,
  PLAN_LIMITS,
} from "@/domain/entities/subscription";

// Get Supabase client
const getDb = () => getSupabaseServer();

// In-memory cache to reduce DB calls
const subscriptionCache = new Map<string, { data: UserSubscription; expiresAt: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN BYPASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if an email is an admin (bypasses all limits)
 * Set ADMIN_EMAILS in .env.local as comma-separated emails
 * Example: ADMIN_EMAILS=admin@example.com,me@mysite.com
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const isAdmin = adminEmails.includes(email.toLowerCase());
  
  if (isAdmin) {
    console.log('[Subscription] Admin bypass active for:', email);
  }
  
  return isAdmin;
}

/**
 * Get or create subscription for user
 */
export async function getSubscription(userId: string): Promise<UserSubscription> {
  // Skip database if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[Subscription] Supabase not configured, using default');
    return createDefaultSubscription(userId);
  }

  // Check cache first
  const cached = subscriptionCache.get(userId);
  if (cached && Date.now() < cached.expiresAt) {
    return resetCountersIfNeeded(cached.data);
  }
  
  // Fetch from Supabase (maybeSingle returns null for 0 rows without error)
  const { data, error } = await getDb()
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    // Table might not exist yet - silently fall back to default
    if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
      console.warn('[Subscription] Table not found, using in-memory default');
    } else {
      console.error('[Subscription] DB error:', error.message);
    }
    return createDefaultSubscription(userId);
  }
  
  if (!data) {
    // Create default subscription if not found
    const defaultSub = createDefaultSubscription(userId);
    await createSubscriptionInDb(defaultSub);
    subscriptionCache.set(userId, { data: defaultSub, expiresAt: Date.now() + CACHE_TTL });
    return defaultSub;
  }
  
  // Map database row to domain type
  const subscription = mapDbToSubscription(data);
  
  // Reset counters if needed
  const updated = resetCountersIfNeeded(subscription);
  if (updated !== subscription) {
    await updateSubscriptionInDb(updated);
  }
  
  subscriptionCache.set(userId, { data: updated, expiresAt: Date.now() + CACHE_TTL });
  return updated;
}

/**
 * Create subscription in database
 */
async function createSubscriptionInDb(subscription: UserSubscription): Promise<void> {
  const { error } = await getDb()
    .from('user_subscriptions')
    .insert({
      user_id: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      generations_used_this_month: subscription.usage.generationsUsedThisMonth,
      lifetime_generations_used: subscription.usage.generationsUsedTotal,
      regenerations_used_today: subscription.usage.regenerationsUsedToday,
      generations_reset_date: subscription.usage.monthResetDate.toISOString(),
      regenerations_reset_date: subscription.usage.dayResetDate.toISOString().split('T')[0],
    });
  
  if (error) {
    console.error('[Subscription] Failed to create:', error);
  }
}

/**
 * Update subscription in database
 */
async function updateSubscriptionInDb(subscription: UserSubscription): Promise<void> {
  const { error } = await getDb()
    .from('user_subscriptions')
    .update({
      plan: subscription.plan,
      status: subscription.status,
      generations_used_this_month: subscription.usage.generationsUsedThisMonth,
      lifetime_generations_used: subscription.usage.generationsUsedTotal,
      regenerations_used_today: subscription.usage.regenerationsUsedToday,
      generations_reset_date: subscription.usage.monthResetDate.toISOString(),
      regenerations_reset_date: subscription.usage.dayResetDate.toISOString().split('T')[0],
      razorpay_customer_id: subscription.razorpayCustomerId,
      razorpay_subscription_id: subscription.razorpaySubscriptionId,
      current_period_start: subscription.currentPeriodStart?.toISOString(),
      current_period_end: subscription.currentPeriodEnd?.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', subscription.userId);
  
  if (error) {
    console.error('[Subscription] Failed to update:', error);
  }
  // Note: Cache is managed by calling functions (recordGeneration, recordRegeneration, etc.)
}

/**
 * Map database row to domain type
 */
function mapDbToSubscription(row: Record<string, unknown>): UserSubscription {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    plan: row.plan as PlanType,
    status: row.status as 'active' | 'cancelled' | 'expired' | 'past_due',
    usage: {
      generationsUsedThisMonth: (row.generations_used_this_month as number) || 0,
      generationsUsedTotal: (row.lifetime_generations_used as number) || 0,
      monthResetDate: row.generations_reset_date ? new Date(row.generations_reset_date as string) : getNextMonthReset(),
      regenerationsUsedToday: (row.regenerations_used_today as number) || 0,
      dayResetDate: row.regenerations_reset_date ? new Date(row.regenerations_reset_date as string) : getTomorrowReset(),
      portfolioCount: 0, // Calculated separately
    },
    razorpaySubscriptionId: row.razorpay_subscription_id as string | undefined,
    razorpayCustomerId: row.razorpay_customer_id as string | undefined,
    currentPeriodStart: row.current_period_start ? new Date(row.current_period_start as string) : undefined,
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end as string) : undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/**
 * Update subscription plan (called after payment)
 */
export async function updatePlan(
  userId: string, 
  plan: PlanType,
  razorpayData?: {
    subscriptionId?: string;
    customerId?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }
): Promise<UserSubscription> {
  let subscription = await getSubscription(userId);
  
  subscription = {
    ...subscription,
    plan,
    status: 'active',
    razorpaySubscriptionId: razorpayData?.subscriptionId,
    razorpayCustomerId: razorpayData?.customerId,
    currentPeriodStart: razorpayData?.periodStart,
    currentPeriodEnd: razorpayData?.periodEnd,
    updatedAt: new Date(),
  };
  
  await updateSubscriptionInDb(subscription);
  return subscription;
}

/**
 * Record a generation (full portfolio creation)
 * @param userEmail - Optional email for admin bypass check
 */
export async function recordGeneration(userId: string, userEmail?: string | null): Promise<{ 
  allowed: boolean; 
  subscription: UserSubscription;
  reason?: string;
}> {
  let subscription = await getSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan];
  
  // Admin bypass - no limits
  if (isAdminEmail(userEmail)) {
    console.log('[Subscription] ADMIN: Bypassing generation limit for', userEmail);
    return { allowed: true, subscription };
  }
  
  // Check limits
  if (subscription.plan === 'free') {
    if (subscription.usage.generationsUsedTotal >= limits.generationsPerMonth) {
      return { 
        allowed: false, 
        subscription,
        reason: `You've used all ${limits.generationsPerMonth} free generations.`
      };
    }
  } else {
    if (subscription.usage.generationsUsedThisMonth >= limits.generationsPerMonth) {
      return { 
        allowed: false, 
        subscription,
        reason: `You've used all ${limits.generationsPerMonth} generations this month.`
      };
    }
  }
  
  // Record usage
  subscription = {
    ...subscription,
    usage: {
      ...subscription.usage,
      generationsUsedThisMonth: subscription.usage.generationsUsedThisMonth + 1,
      generationsUsedTotal: subscription.usage.generationsUsedTotal + 1,
    },
    updatedAt: new Date(),
  };
  
  console.log('[Subscription] Recording generation for user:', userId, {
    before: subscription.usage.generationsUsedTotal - 1,
    after: subscription.usage.generationsUsedTotal,
  });
  
  await updateSubscriptionInDb(subscription);
  
  // Update cache with new subscription data
  subscriptionCache.set(userId, { data: subscription, expiresAt: Date.now() + CACHE_TTL });
  
  return { allowed: true, subscription };
}

/**
 * Record a regeneration (editing existing portfolio)
 * @param userEmail - Optional email for admin bypass check
 */
export async function recordRegeneration(userId: string, userEmail?: string | null): Promise<{
  allowed: boolean;
  subscription: UserSubscription;
  reason?: string;
  resetIn?: string;
}> {
  let subscription = await getSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan];
  
  // Admin bypass - no limits
  if (isAdminEmail(userEmail)) {
    console.log('[Subscription] ADMIN: Bypassing regeneration limit for', userEmail);
    return { allowed: true, subscription };
  }
  
  // Unlimited for pro/lifetime
  if (limits.regenerationsPerDay >= 999) {
    return { allowed: true, subscription };
  }
  
  // Check daily limit
  if (subscription.usage.regenerationsUsedToday >= limits.regenerationsPerDay) {
    const resetIn = formatTimeUntil(subscription.usage.dayResetDate);
    return { 
      allowed: false, 
      subscription,
      reason: 'Daily regeneration limit reached.',
      resetIn,
    };
  }
  
  // Record usage
  subscription = {
    ...subscription,
    usage: {
      ...subscription.usage,
      regenerationsUsedToday: subscription.usage.regenerationsUsedToday + 1,
    },
    updatedAt: new Date(),
  };
  
  console.log('[Subscription] Recording regeneration for user:', userId, {
    regenerationsUsedToday: subscription.usage.regenerationsUsedToday,
  });
  
  await updateSubscriptionInDb(subscription);
  
  // Update cache with new subscription data
  subscriptionCache.set(userId, { data: subscription, expiresAt: Date.now() + CACHE_TTL });
  
  return { allowed: true, subscription };
}

/**
 * Increment portfolio count
 */
export async function incrementPortfolioCount(userId: string): Promise<UserSubscription> {
  let subscription = await getSubscription(userId);
  
  subscription = {
    ...subscription,
    usage: {
      ...subscription.usage,
      portfolioCount: subscription.usage.portfolioCount + 1,
    },
    updatedAt: new Date(),
  };
  
  // Portfolio count is derived from portfolios table, no need to persist here
  subscriptionCache.set(userId, { data: subscription, expiresAt: Date.now() + CACHE_TTL });
  return subscription;
}

/**
 * Decrement portfolio count
 */
export async function decrementPortfolioCount(userId: string): Promise<UserSubscription> {
  let subscription = await getSubscription(userId);
  
  subscription = {
    ...subscription,
    usage: {
      ...subscription.usage,
      portfolioCount: Math.max(0, subscription.usage.portfolioCount - 1),
    },
    updatedAt: new Date(),
  };
  
  subscriptionCache.set(userId, { data: subscription, expiresAt: Date.now() + CACHE_TTL });
  return subscription;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getNextMonthReset(): Date {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

function getTomorrowReset(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function resetCountersIfNeeded(subscription: UserSubscription): UserSubscription {
  const now = new Date();
  let updated = false;
  let usage = { ...subscription.usage };
  
  // Reset daily regenerations
  if (now >= usage.dayResetDate) {
    usage.regenerationsUsedToday = 0;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    usage.dayResetDate = tomorrow;
    updated = true;
  }
  
  // Reset monthly generations (for paid plans only)
  if (subscription.plan !== 'free' && now >= usage.monthResetDate) {
    usage.generationsUsedThisMonth = 0;
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    usage.monthResetDate = nextMonth;
    updated = true;
  }
  
  if (updated) {
    return {
      ...subscription,
      usage,
      updatedAt: now,
    };
  }
  
  return subscription;
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
// ADMIN FUNCTIONS (for testing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function _resetUserUsage(userId: string): Promise<void> {
  const subscription = await getSubscription(userId);
  subscription.usage.generationsUsedThisMonth = 0;
  subscription.usage.generationsUsedTotal = 0;
  subscription.usage.regenerationsUsedToday = 0;
  await updateSubscriptionInDb(subscription);
  subscriptionCache.delete(userId);
}

export async function _getAllSubscriptions(): Promise<UserSubscription[]> {
  const { data, error } = await getDb()
    .from('user_subscriptions')
    .select('*');
  
  if (error || !data) {
    console.error('[Subscription] Failed to fetch all:', error);
    return [];
  }
  
  return data.map(mapDbToSubscription);
}
