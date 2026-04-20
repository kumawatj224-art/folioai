import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/auth/session";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { LiveUrlLink } from "@/components/ui/live-url-link";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import { getSubscription } from "@/infrastructure/repositories/subscription-repository";
import { PLAN_LIMITS } from "@/domain/entities/subscription";
import type { ChatMessage } from "@/domain/entities/chat";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Edit Portfolio | FolioAI",
  description: "Continue editing your portfolio with AI",
};

export default async function EditChatPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  // Fetch portfolio from database
  const portfolio = await chatPortfolioRepository.findById(id);
  
  if (!portfolio) {
    notFound();
  }

  // Verify ownership
  if (portfolio.userId !== session.user.id) {
    redirect("/dashboard");
  }

  /**
   * SERVER-SIDE PREFLIGHT GUARD — Regeneration limit (Task 2)
   *
   * Free-tier users get 2 total regenerations (lifetime). If they have
   * exhausted that quota, block access to the chat edit interface and
   * send them to the dashboard with an upgrade prompt.
   *
   * This prevents bypass via direct URL navigation to /chat/[id].
   */
  const subscription = await getSubscription(session.user.id);
  const limits = PLAN_LIMITS[subscription.plan];

  if (subscription.plan === "free") {
    if (subscription.usage.regenerationsCount >= limits.maxRegenerations) {
      redirect("/dashboard?upgrade=regeneration_limit");
    }
  }

  // Get chat history or create initial message with context
  const initialMessages: ChatMessage[] = portfolio.chatHistory.length > 0 
    ? portfolio.chatHistory 
    : [{
        id: "initial",
        role: "assistant",
        content: `Welcome back! 👋 I see you already have a portfolio. I have access to your current portfolio content and can help you:\n\n• Update your skills, projects, or experience\n• Change the design or layout\n• Add new sections\n• Fix any issues\n\nWhat would you like to change?`,
        timestamp: new Date(),
      }];
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/[0.08] bg-[#111111] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#a0a0a0] hover:text-[#f0ece4] transition-colors">
              ← Back to Dashboard
            </Link>
            <span className="text-[#606060]">|</span>
            <h1 className="font-display font-semibold text-[#f0ece4]">Edit: {portfolio.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {portfolio.liveUrl && (
              <LiveUrlLink liveUrl={portfolio.liveUrl} />
            )}
            <Link 
              href={`/portfolio/${id}`} 
              className="text-sm text-[#ff6b35] hover:text-[#ff9f1c] transition-colors"
            >
              Preview →
            </Link>
            <span className="text-sm text-[#606060]">{session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ChatInterface 
          portfolioId={id}
          initialMessages={initialMessages}
          initialHtml={portfolio.htmlContent}
          initialLiveUrl={portfolio.liveUrl}
        />
      </main>
    </div>
  );
}
