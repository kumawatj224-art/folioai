import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/auth/session";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
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
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-900">
              ← Back to Dashboard
            </Link>
            <span className="text-neutral-300">|</span>
            <h1 className="font-semibold text-neutral-900">Edit: {portfolio.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href={`/portfolio/${id}`} 
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              View Portfolio →
            </Link>
            <span className="text-sm text-neutral-500">{session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ChatInterface 
          portfolioId={id}
          initialMessages={initialMessages}
          initialHtml={portfolio.htmlContent}
        />
      </main>
    </div>
  );
}
