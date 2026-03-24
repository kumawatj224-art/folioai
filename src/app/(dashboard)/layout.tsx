import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getCurrentSession } from "@/lib/auth/session";
import { isNewAppEnabled } from "@/lib/env/feature-flags";

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
    <div className="min-h-screen bg-neutral-50">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="font-semibold tracking-tight text-neutral-900">FolioAI</span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link 
                href="/dashboard" 
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                Portfolios
              </Link>
              <Link 
                href="/templates" 
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                Templates
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-neutral-500">
              {session.user.email}
            </span>
            <SignOutButton className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
