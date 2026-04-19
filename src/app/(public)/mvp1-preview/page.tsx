import Link from "next/link";

import { AuthPanel } from "@/features/auth/components/auth-panel";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { siteConfig } from "@/config/site";
import { isGoogleAuthConfigured } from "@/lib/auth/options";
import { getCurrentSession } from "@/lib/auth/session";

export default async function MvpPreviewPage() {
  const session = await getCurrentSession();
  const googleEnabled = isGoogleAuthConfigured();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 md:py-8">
      {/* Minimal header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)] text-xs font-bold text-white">
            F
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight">
            {siteConfig.name}
          </span>
        </div>
        {session?.user && (
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              Dashboard
            </Link>
            <SignOutButton className="text-sm text-[var(--muted)]" />
          </nav>
        )}
      </header>

      {/* Main content */}
      <section className="mt-12 grid flex-1 items-center gap-12 lg:mt-0 lg:grid-cols-2 lg:gap-16">
        {/* Left - Hero with visual mockup */}
        <div className="flex flex-col justify-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] md:text-5xl lg:text-[3.4rem]">
            Your work,<br />
            <span className="text-[var(--accent)]">presented better.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[var(--muted)] md:text-lg">
            Build a portfolio that opens doors. Clean design, smart structure, ready to share in minutes.
          </p>

          {/* Visual mockup - floating portfolio preview */}
          <div className="relative mt-10">
            <div className="relative rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_20px_50px_rgba(24,20,17,0.08)]">
              {/* Browser chrome mockup */}
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
                <span className="ml-3 flex-1 rounded-md bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
                  yourname.folioai.co
                </span>
              </div>
              
              {/* Portfolio content mockup */}
              <div className="grid gap-3">
                <div className="flex items-start gap-4 rounded-xl bg-[var(--surface)] p-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--foreground)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-[var(--foreground)]" />
                    <div className="h-3 w-48 rounded bg-[var(--border)]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[var(--surface)] to-[var(--border)]" />
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5" />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-2 -top-3 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              Live preview
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Private until you share
            </span>
          </div>
        </div>

        {/* Right - Auth panel */}
        {session?.user ? (
          <aside className="flex flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-white/80 p-8 text-center backdrop-blur">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)]">
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">Welcome back,</p>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold">
              {session.user.name ?? session.user.email ?? "Creator"}
            </h2>
            <div className="mt-6 flex gap-3">
              <Link href="/dashboard" className="rounded-xl bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg">
                Open Dashboard
              </Link>
              <SignOutButton className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm" />
            </div>
          </aside>
        ) : (
          <AuthPanel googleEnabled={googleEnabled} />
        )}
      </section>
    </main>
  );
}
