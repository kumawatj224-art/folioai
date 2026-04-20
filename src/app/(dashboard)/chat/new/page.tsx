import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/auth/session";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { getSubscription } from "@/infrastructure/repositories/subscription-repository";
import { PLAN_LIMITS } from "@/domain/entities/subscription";

export const metadata = {
  title: "Create Portfolio | FolioAI",
  description: "Chat with AI to create your professional portfolio",
};

export default async function NewChatPage() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  /**
   * SERVER-SIDE PREFLIGHT GUARD (Task 2)
   *
   * Before rendering the chat interface, check if the user has consumed
   * their new-portfolio generation quota. If they have, redirect them
   * to the dashboard with a flag so the upgrade modal can be triggered.
   *
   * This prevents users from bypassing the UI restriction by navigating
   * directly to /chat/new.
   */
  const subscription = await getSubscription(session.user.id);
  const limits = PLAN_LIMITS[subscription.plan];

  if (subscription.plan === "free") {
    // Free tier: max 1 new portfolio generation (lifetime)
    if (subscription.usage.newGenerationsCount >= limits.maxNewGenerations) {
      // Redirect to dashboard with upgrade prompt flag
      redirect("/dashboard?upgrade=new_generation_limit");
    }
  }
  // Paid plans are checked server-side at the API layer; the UI is always accessible.

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/[0.08] bg-[#111111] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#a0a0a0] hover:text-[#f0ece4] transition-colors">
              ← Back to Dashboard
            </Link>
            <span className="text-[#606060]">|</span>
            <h1 className="font-display font-semibold text-[#f0ece4]">
              New Portfolio
            </h1>
          </div>
          <span className="text-sm text-[#606060]">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ChatInterface />
      </main>
    </div>
  );
}
