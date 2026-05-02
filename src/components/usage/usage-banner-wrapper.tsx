/**
 * Server component wrapper for UsageBanner
 * Fetches subscription data and renders the banner
 */

import { getCurrentSession } from "@/lib/auth/session";
import { getSubscription } from "@/infrastructure/repositories/subscription-repository";
import { getUsageDisplay } from "@/domain/entities/subscription";
import { UsageBanner } from "./usage-banner";

export async function UsageBannerWrapper() {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return null;
  }
  
  const subscription = await getSubscription(session.user.id, session.user.email);
  const usage = getUsageDisplay(subscription);
  
  return <UsageBanner usage={usage} />;
}

export async function CompactUsageBanner() {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return null;
  }
  
  const subscription = await getSubscription(session.user.id, session.user.email);
  const usage = getUsageDisplay(subscription);
  
  return <UsageBanner usage={usage} compact />;
}
