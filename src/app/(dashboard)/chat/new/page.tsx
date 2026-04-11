import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { ChatInterface } from "@/features/chat/components/chat-interface";

export const metadata = {
  title: "Create Portfolio | FolioAI",
  description: "Chat with AI to create your professional portfolio",
};

export default async function NewChatPage() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/[0.08] bg-[#111111] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-[#a0a0a0] hover:text-[#f0ece4] transition-colors">
              ← Back to Dashboard
            </a>
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
