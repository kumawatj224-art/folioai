import Link from "next/link";

import { HeroCard } from "@/components/layout/hero-card";
import { siteConfig } from "@/config/site";

export default function MvpPreviewPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10">
      <header className="mb-16 flex items-center justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-heading)] text-2xl font-extrabold tracking-tight">
            {siteConfig.name}
          </p>
          <p className="text-sm text-[var(--muted)]">MVP1 scaffold</p>
        </div>

        <nav className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/dashboard" className="rounded-full border border-[var(--border)] px-4 py-2">
            Dashboard
          </Link>
        </nav>
      </header>

      <section className="grid flex-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow)] backdrop-blur">
            Phase 0 foundation
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-extrabold tracking-tight text-balance md:text-7xl">
            Next.js scaffold for FolioAI MVP1.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            The app shell is ready for auth, protected dashboard flows, and portfolio listing routes.
            Business logic is intentionally left blank.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
            >
              View dashboard shell
            </Link>
            <a
              href="https://folioai-fawn.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold"
            >
              Current landing page
            </a>
          </div>
        </div>

        <HeroCard />
      </section>
    </main>
  );
}
