import { redirect, notFound } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { createRepositories } from "@/infrastructure/repositories/file-repository";

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
    redirect("/mvp1-preview");
  }

  // TODO: Fetch portfolio from database
  // For now, redirect to new chat if no portfolio found
  // const portfolio = await fetchPortfolio(id);
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-neutral-500 hover:text-neutral-900">
              ← Back to Dashboard
            </a>
            <span className="text-neutral-300">|</span>
            <h1 className="font-semibold text-neutral-900">Edit Portfolio</h1>
          </div>
          <span className="text-sm text-neutral-500">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ChatInterface 
          portfolioId={id}
          // initialMessages={portfolio.chatHistory}
          // initialStudentInfo={extractStudentInfoFromChat(portfolio.chatHistory)}
        />
      </main>
    </div>
  );
}
