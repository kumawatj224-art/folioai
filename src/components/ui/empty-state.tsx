import type { JSX, ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white/80 p-12 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--muted)]">
          {icon}
        </div>
      )}
      <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
