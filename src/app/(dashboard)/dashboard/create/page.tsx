import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { createRepositories } from "@/infrastructure/repositories/file-repository";
import { CreatePortfolioForm } from "@/features/portfolio/components/create-portfolio-form";

export default async function CreatePortfolioPage() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/mvp1-preview");
  }

  // Check if user already has a portfolio
  const { portfolios } = createRepositories();
  const existingPortfolio = await portfolios.findByUserId(session.user.id ?? "");
  
  if (existingPortfolio) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8 text-center">
        <p className="text-sm text-[var(--muted)]">Step 1 of 3</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight md:text-3xl">
          Let&apos;s create your portfolio
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Start with the basics. You can always edit these later.
        </p>
      </header>

      <CreatePortfolioForm userId={session.user.id ?? ""} userName={session.user.name ?? ""} />
    </div>
  );
}
