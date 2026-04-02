/**
 * API Route: User Subscription & Usage
 * 
 * GET /api/subscription - Get current user's subscription and usage
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { getSubscription } from "@/infrastructure/repositories/subscription-repository";
import { getUsageDisplay } from "@/domain/entities/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const subscription = await getSubscription(session.user.id);
    const usage = getUsageDisplay(subscription);
    
    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage,
    });
  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
