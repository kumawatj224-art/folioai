/**
 * UI COMPONENT LIBRARY - Badge
 * Dark theme design system with semantic colors
 */

import { forwardRef } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

type BadgeProps = {
  variant?: BadgeVariant;
  dot?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>;

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#1a1a1a] text-[#a0a0a0] border border-white/[0.08]",
  success: "bg-[#22c55e]/15 text-[#22c55e]",
  warning: "bg-[#ff6b35]/15 text-[#ff6b35]",
  error: "bg-red-500/15 text-red-400",
  info: "bg-[#3b82f6]/15 text-[#3b82f6]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[#606060]",
  success: "bg-[#22c55e]",
  warning: "bg-[#ff6b35]",
  error: "bg-red-400",
  info: "bg-[#3b82f6]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", dot = false, className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
