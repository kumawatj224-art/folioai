import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/mvp1-preview");
  }

  const portfolios = await chatPortfolioRepository.listSummaries(session.user.id ?? "");

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">Dashboard</p>
          <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight md:text-3xl">
            Welcome, {session.user.name ?? "there"} 👋
          </h1>
        </div>
        
        <Link href="/chat/new">
          <Button>+ Create Portfolio</Button>
        </Link>
      </header>

      {/* Main Content */}
      {portfolios.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden transition hover:shadow-md">
              <Link href={`/portfolio/${portfolio.id}`}>
                <div className="bg-gradient-to-br from-violet-600 to-violet-800 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">
                      {portfolio.title.charAt(0).toUpperCase()}
                    </div>
                    <Badge variant={portfolio.status === "deployed" ? "success" : "default"}>
                      {portfolio.status === "deployed" ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{portfolio.title}</h3>
                  <p className="mt-1 text-sm text-white/70">
                    Updated {new Date(portfolio.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              
              <div className="p-4">
                {portfolio.liveUrl ? (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                    <span className="font-medium">Live:</span>
                    <a 
                      href={portfolio.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate underline underline-offset-2"
                    >
                      {portfolio.liveUrl.replace("https://", "")}
                    </a>
                  </div>
                ) : (
                  <div className="mb-3 rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-600">
                    Not deployed yet
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Link href={`/chat/${portfolio.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Edit with AI
                    </Button>
                  </Link>
                  <Link href={`/portfolio/${portfolio.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      {portfolio.status === "deployed" ? "View" : "Preview"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Create New Card */}
          <Link href="/chat/new">
            <Card className="flex h-full min-h-[280px] items-center justify-center border-2 border-dashed border-neutral-200 bg-neutral-50 transition hover:border-violet-300 hover:bg-violet-50">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <span className="text-2xl">+</span>
                </div>
                <p className="font-medium text-neutral-600">Create New Portfolio</p>
                <p className="mt-1 text-xs text-neutral-500">Start chatting with AI</p>
              </div>
            </Card>
          </Link>
        </div>
      ) : (
        <Card padding="lg">
          <EmptyState
            icon={<span className="text-3xl">💬</span>}
            title="Create your first portfolio"
            description="Chat with our AI to build a stunning portfolio in minutes. Tell us about your skills, projects, and experience — we'll create a professional portfolio for you."
            action={
              <Link href="/chat/new">
                <Button size="lg">Start Chatting →</Button>
              </Link>
            }
          />
        </Card>
      )}
    </div>
  );
}
