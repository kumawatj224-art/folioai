import type { JSX } from "react";

const highlights = [
  "App Router scaffolded",
  "Dashboard route group ready",
  "API placeholders created",
  "Secret-safe env template included",
];

export function HeroCard(): JSX.Element {
  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur md:p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Structure</p>
      <div className="mt-5 rounded-[28px] bg-[var(--foreground)] p-6 text-white">
        <p className="text-sm text-white/70">Ready now</p>
        <p className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-extrabold tracking-tight">
          MVP1 shell
        </p>
        <p className="mt-3 text-sm leading-7 text-white/75">
          This is a compile-friendly scaffold for the first implementation pass, not product logic.
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {highlights.map((highlight) => (
          <li
            key={highlight}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)]"
          >
            {highlight}
          </li>
        ))}
      </ul>
    </section>
  );
}
