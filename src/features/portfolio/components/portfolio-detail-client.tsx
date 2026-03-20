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

export function PortfolioDetailClient({ portfolioId }: PortfolioDetailClientProps) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

      // Refresh portfolio to get new live URL
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
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600" />
          <p className="text-neutral-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="mb-4 text-red-600">{error || "Portfolio not found"}</p>
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{portfolio.title}</h1>
            <Badge variant={portfolio.status === "deployed" ? "success" : "default"}>
              {portfolio.status === "deployed" ? "Live" : "Draft"}
            </Badge>
          </div>
          {portfolio.liveUrl && (
            <p className="mt-1 text-sm text-neutral-500">
              Live at:{" "}
              <a 
                href={portfolio.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline"
              >
                {portfolio.liveUrl}
              </a>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/chat/${portfolio.id}`}>
            <Button variant="secondary">Edit with AI</Button>
          </Link>
          
          {portfolio.liveUrl ? (
            <>
              <Button variant="secondary" onClick={copyUrl}>
                {copied ? "Copied!" : "Copy URL"}
              </Button>
              <a href={portfolio.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">View Live</Button>
              </a>
              <Button onClick={handleDeploy} disabled={deploying}>
                {deploying ? "Redeploying..." : "Redeploy"}
              </Button>
            </>
          ) : (
            <Button onClick={handleDeploy} disabled={deploying}>
              {deploying ? "Deploying..." : "Deploy Live"}
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Preview */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-4 text-sm text-neutral-500">Preview</span>
          </div>
        </div>
        <div className="h-[70vh]">
          {portfolio.htmlContent ? (
            <iframe
              srcDoc={portfolio.htmlContent}
              className="h-full w-full"
              title="Portfolio Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-500">
              No content to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
