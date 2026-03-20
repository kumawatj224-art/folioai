/**
 * UI COMPONENT LIBRARY - Badge
 */

import { forwardRef } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

type BadgeProps = {
  variant?: BadgeVariant;
} & React.HTMLAttributes<HTMLSpanElement>;

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface)] text-[var(--muted)]",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
