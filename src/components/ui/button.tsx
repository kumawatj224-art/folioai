/**
 * UI COMPONENT LIBRARY - Button
 * 
 * Follows Open/Closed principle - extensible via variants without modification.
 * Uses composition for flexibility.
 */

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[var(--foreground)] text-white hover:opacity-90 shadow-sm",
  secondary: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-white",
  ghost: "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = "primary", 
    size = "md", 
    loading = false, 
    fullWidth = false, 
    className = "", 
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium transition
          disabled:opacity-60 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
