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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Welcome back, {session.user.name?.split(' ')[0] ?? "there"}
          </h1>
          <p className="mt-1 text-neutral-500">
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
              className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-md"
            >
              <Link href={`/portfolio/${portfolio.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-sm font-semibold text-neutral-600">
                    {portfolio.title.charAt(0).toUpperCase()}
                  </div>
                  <Badge variant={portfolio.status === "deployed" ? "success" : "default"}>
                    {portfolio.status === "deployed" ? "Live" : "Draft"}
                  </Badge>
                </div>
                
                <h3 className="mt-4 font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                  {portfolio.title}
                </h3>
                
                <p className="mt-1 text-sm text-neutral-500">
                  Updated {new Date(portfolio.updatedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>

                {portfolio.liveUrl && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {portfolio.liveUrl.replace("https://", "").slice(0, 30)}
                  </div>
                )}
              </Link>

              <div className="mt-4 flex gap-2">
                <Link 
                  href={`/chat/${portfolio.id}`} 
                  className="flex-1 rounded-lg border border-neutral-200 bg-white py-2 text-center text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  Edit
                </Link>
                <Link 
                  href={`/portfolio/${portfolio.id}`}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white py-2 text-center text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
          
          {/* Create New Card */}
          <Link href="/chat/new">
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:bg-neutral-50">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-600">Create with AI</p>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-12">
          <EmptyState
            icon={
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
