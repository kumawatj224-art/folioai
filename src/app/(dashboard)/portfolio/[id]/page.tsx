import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { PortfolioDetailClient } from "@/features/portfolio/components/portfolio-detail-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Portfolio | FolioAI",
  description: "View and deploy your portfolio",
};

export default async function PortfolioPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/mvp1-preview");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-neutral-500 hover:text-neutral-900">
              ← Back to Dashboard
            </a>
          </div>
          <span className="text-sm text-neutral-500">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <PortfolioDetailClient portfolioId={id} />
      </main>
    </div>
  );
}
