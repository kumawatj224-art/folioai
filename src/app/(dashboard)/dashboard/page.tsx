import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  return (
    <main className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">MVP1</p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">
              Your portfolios
            </h2>
          </div>
          <button
            type="button"
            disabled
            className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white opacity-50"
          >
            Create new
          </button>
        </div>

        <EmptyState
          title="No portfolios yet"
          description="Portfolio listing will plug into the portfolios API once auth and database wiring are added."
        />
      </section>

      <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-[var(--shadow)]">
        <p className="text-sm text-[var(--muted)]">Route status</p>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          <li className="rounded-2xl border border-[var(--border)] px-4 py-3">Google auth: placeholder only</li>
          <li className="rounded-2xl border border-[var(--border)] px-4 py-3">Portfolio API: placeholder only</li>
          <li className="rounded-2xl border border-[var(--border)] px-4 py-3">Supabase integration: not started</li>
        </ul>
      </aside>
    </main>
  );
}
