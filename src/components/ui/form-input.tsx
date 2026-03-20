import { forwardRef } from "react";

type FormInputProps = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, error, className, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--foreground)] focus:bg-white ${className ?? ""}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
