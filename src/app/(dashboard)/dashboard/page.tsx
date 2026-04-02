import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  const portfolios = await chatPortfolioRepository.listSummaries(session.user.id ?? "");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#f0ece4]">
            Welcome back, {session.user.name?.split(' ')[0] ?? "there"}
          </h1>
          <p className="mt-1 text-[#a0a0a0]">
            Manage and deploy your portfolios
          </p>
        </div>
        
        <Link href="/chat/new">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Portfolio
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      {portfolios.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <div 
              key={portfolio.id} 
              className="group rounded-2xl border border-white/[0.08] bg-[#111111] p-6 transition-all hover:border-white/[0.15] hover:-translate-y-1"
            >
              <Link href={`/portfolio/${portfolio.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1a1a1a] text-sm font-bold text-[#f0ece4]">
                    {portfolio.title.charAt(0).toUpperCase()}
                  </div>
                  <Badge variant={portfolio.status === "deployed" ? "success" : "default"} dot>
                    {portfolio.status === "deployed" ? "Live" : "Draft"}
                  </Badge>
                </div>
                
                <h3 className="font-display mt-4 font-semibold text-[#f0ece4] group-hover:text-[#ff6b35] transition-colors">
                  {portfolio.title}
                </h3>
                
                <p className="mt-1 text-sm text-[#606060]">
                  Updated {new Date(portfolio.updatedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>

                {portfolio.liveUrl && (
                  <p className="mt-4 text-xs text-[#ff6b35]">
                    {portfolio.liveUrl.replace("https://", "").slice(0, 30)}
                  </p>
                )}
              </Link>

              <div className="mt-4 flex gap-2">
                <Link 
                  href={`/chat/${portfolio.id}`} 
                  className="flex-1 rounded-lg border border-white/[0.08] bg-transparent py-2 text-center text-xs font-medium text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ece4]"
                >
                  Edit
                </Link>
                <Link 
                  href={`/portfolio/${portfolio.id}`}
                  className="flex-1 rounded-lg bg-[#1a1a1a] border border-white/[0.15] py-2 text-center text-xs font-medium text-[#f0ece4] transition-colors hover:bg-[#ff6b35] hover:border-[#ff6b35]"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
          
          {/* Create New Card */}
          <Link href="/chat/new">
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/[0.15] bg-transparent transition-all hover:border-[#ff6b35] hover:bg-[#ff6b35]/[0.05]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.15] bg-[#1a1a1a] transition-all group-hover:bg-[#ff6b35] group-hover:border-[#ff6b35]">
                  <svg className="h-5 w-5 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#a0a0a0]">Create with AI</p>
                <p className="text-xs text-[#606060] mt-1">Start a new portfolio</p>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-12">
          <EmptyState
            icon={
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/[0.08]">
                <svg className="h-6 w-6 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            }
            title="No portfolios yet"
            description="Create your first portfolio with AI. Just chat about your skills and projects."
            action={
              <Link href="/chat/new">
                <Button size="lg">Get Started</Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
