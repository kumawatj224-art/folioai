import type { JSX, ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-[#f0ece4]">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#a0a0a0]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
