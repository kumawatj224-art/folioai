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
    redirect("/mvp1-preview");
  }

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Dashboard</p>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
              FolioAI workspace
            </h1>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="rounded-full border border-[var(--border)] px-4 py-2">
              Back to home
            </Link>
            <span className="rounded-full bg-white px-4 py-2 text-[var(--muted)]">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
