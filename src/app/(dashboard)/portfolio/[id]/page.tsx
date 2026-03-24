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
    redirect("/");
  }

  return <PortfolioDetailClient portfolioId={id} />;
}
