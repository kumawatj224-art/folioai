import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { templateRepository } from "@/infrastructure/repositories/template-repository";

export const metadata = {
  title: "Create Portfolio | FolioAI",
  description: "Chat with AI to create your professional portfolio",
};

type PageProps = {
  searchParams: Promise<{ template?: string }>;
};

export default async function NewChatPage({ searchParams }: PageProps) {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  const params = await searchParams;
  
  // If template slug provided, fetch template data
  let templateContext: { name: string; slug: string; htmlTemplate: string } | null = null;
  if (params.template) {
    const template = await templateRepository.findBySlug(params.template);
    if (template) {
      templateContext = {
        name: template.name,
        slug: template.slug,
        htmlTemplate: template.htmlTemplate,
      };
    }
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
              {templateContext ? `New Portfolio — ${templateContext.name}` : "New Portfolio"}
            </h1>
          </div>
          <span className="text-sm text-[#606060]">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ChatInterface templateContext={templateContext} />
      </main>
    </div>
  );
}
