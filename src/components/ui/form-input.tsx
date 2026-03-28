import { forwardRef } from "react";

type FormInputProps = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, error, className, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#a0a0a0]">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-2.5 text-sm text-[#f0ece4] outline-none transition placeholder:text-[#606060] focus:border-white/[0.15] focus:bg-[#222222] ${className ?? ""}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
