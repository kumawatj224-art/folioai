import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import { parsePortfolioHtml } from "@/lib/utils/portfolio-html";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await chatPortfolioRepository.findBySlug(slug);

  if (!portfolio) {
    return { title: "Portfolio Not Found | FolioAI" };
  }

  return {
    title: `${portfolio.title} | FolioAI`,
    description: `Professional portfolio created with FolioAI`,
    openGraph: {
      title: portfolio.title,
      type: "profile",
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  
  console.log("[p/page] Rendering portfolio for:", slug);

  const portfolio = await chatPortfolioRepository.findBySlug(slug);

  if (!portfolio || portfolio.status !== "deployed" || !portfolio.htmlContent) {
    console.log("[p/page] Portfolio not found or not deployed:", slug);
    notFound();
  }

  const { styles, bodyContent } = parsePortfolioHtml(portfolio.htmlContent);

  return (
    <>
      {/* Inject extracted styles */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {/* Render body content */}
      <div 
        dangerouslySetInnerHTML={{ __html: bodyContent }}
        suppressHydrationWarning
        className="portfolio-container"
      />
    </>
  );
}
