import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Extract styles and body content from complete HTML document
 */
function parsePortfolioHtml(html: string) {
  // Extract content inside <style> tags
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const styles = styleMatches.map(s => s.replace(/<\/?style[^>]*>/gi, "")).join("\n");
  
  // Extract content inside <body> tags, or use full HTML if no body tag
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  
  return { styles, bodyContent };
}

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
