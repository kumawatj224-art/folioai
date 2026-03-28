"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Portfolio } from "@/domain/entities/chat";

type PortfolioDetailClientProps = {
  portfolioId: string;
};

type ViewMode = "desktop" | "tablet" | "mobile";

export function PortfolioDetailClient({ portfolioId }: PortfolioDetailClientProps) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch(`/api/portfolios/${portfolioId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to load portfolio");
        }
        
        setPortfolio(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [portfolioId]);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      const refreshResponse = await fetch(`/api/portfolios/${portfolioId}`);
      const refreshData = await refreshResponse.json();
      setPortfolio(refreshData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setDeploying(false);
    }
  };

  const copyUrl = async () => {
    if (portfolio?.liveUrl) {
      await navigator.clipboard.writeText(portfolio.liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">{error || "Portfolio not found"}</p>
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-neutral-900">{portfolio.title}</h1>
              <Badge variant={portfolio.status === "deployed" ? "success" : "default"}>
                {portfolio.status === "deployed" ? "Live" : "Draft"}
              </Badge>
            </div>
            {portfolio.liveUrl && (
              <a 
                href={portfolio.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {portfolio.liveUrl.replace("https://", "")}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/chat/${portfolio.id}`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          
          {portfolio.liveUrl && (
            <Button variant="secondary" size="sm" onClick={copyUrl}>
              {copied ? "Copied!" : "Copy URL"}
            </Button>
          )}
          
          <Button size="sm" onClick={handleDeploy} disabled={deploying}>
            {deploying ? "Deploying..." : portfolio.liveUrl ? "Redeploy" : "Deploy"}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Preview */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-neutral-300" />
              <span className="h-3 w-3 rounded-full bg-neutral-300" />
              <span className="h-3 w-3 rounded-full bg-neutral-300" />
            </div>
            <span className="ml-2 text-xs text-neutral-400">Preview</span>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center justify-center rounded-md px-2.5 py-1.5 transition-colors ${
                viewMode === "desktop" 
                  ? "bg-white text-neutral-900 shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
              title="Desktop view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("tablet")}
              className={`flex items-center justify-center rounded-md px-2.5 py-1.5 transition-colors ${
                viewMode === "tablet" 
                  ? "bg-white text-neutral-900 shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
              title="Tablet view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center justify-center rounded-md px-2.5 py-1.5 transition-colors ${
                viewMode === "mobile" 
                  ? "bg-white text-neutral-900 shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
              title="Mobile view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex h-[calc(100vh-220px)] items-start justify-center overflow-auto bg-neutral-100 p-4">
          {portfolio.htmlContent ? (
            <div 
              className={`relative bg-white shadow-lg transition-all duration-300 overflow-hidden ${
                viewMode === "desktop" 
                  ? "w-full h-full" 
                  : viewMode === "tablet" 
                    ? "rounded-lg border-4 border-neutral-800" 
                    : "rounded-[2rem] border-[6px] border-neutral-800"
              }`}
              style={{ 
                width: viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "420px" : "280px",
                height: viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "560px" : "580px",
              }}
            >
              {/* Device frame notch for mobile */}
              {viewMode === "mobile" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-24 h-5 bg-neutral-800 rounded-b-xl" />
              )}
              <iframe
                srcDoc={portfolio.htmlContent}
                className="absolute top-0 left-0 origin-top-left"
                title="Portfolio Preview"
                sandbox="allow-scripts"
                style={{ 
                  width: viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "768px" : "375px",
                  height: viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "1024px" : "812px",
                  transform: viewMode === "desktop" ? "none" : viewMode === "tablet" ? "scale(0.545)" : "scale(0.71)",
                  borderRadius: viewMode === "mobile" ? "20px" : viewMode === "tablet" ? "4px" : "0"
                }}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              No content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
