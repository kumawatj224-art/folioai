import type { JSX } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps): JSX.Element {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white/80 p-10 text-center">
      <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">{description}</p>
    </div>
  );
}
