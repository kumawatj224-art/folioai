import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getCurrentSession } from "@/lib/auth/session";
import { isNewAppEnabled } from "@/lib/env/feature-flags";
import { UsageBannerWrapper } from "@/components/usage/usage-banner-wrapper";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  if (!isNewAppEnabled()) {
    redirect("/index.html");
  }

  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#111111]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b35]">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="font-semibold tracking-tight text-[#f0ece4]">FolioAI</span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link 
                href="/dashboard" 
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ece4]"
              >
                Portfolios
              </Link>
              <Link 
                href="/templates" 
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ece4]"
              >
                Templates
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-[#606060]">
              {session.user.email}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b35] text-sm font-bold text-white">
              {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
            </div>
            <SignOutButton className="text-sm text-[#a0a0a0] hover:text-[#f0ece4] transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Usage Banner */}
        <Suspense fallback={<div className="mb-6 h-14 animate-pulse rounded-xl bg-[#111111]" />}>
          <div className="mb-6">
            <UsageBannerWrapper />
          </div>
        </Suspense>
        
        {children}
      </main>
    </div>
  );
}
