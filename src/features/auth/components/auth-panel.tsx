"use client";

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { useAuthForm, type AuthMode } from "@/features/auth/hooks/use-auth-form";
import { FormInput } from "@/components/ui/form-input";

type AuthPanelProps = {
  callbackUrl?: string;
  googleEnabled: boolean;
};

export function AuthPanel({ callbackUrl = "/dashboard", googleEnabled }: AuthPanelProps) {
  const { mode, setMode, formState, updateField, error, isPending, handleSubmit } = useAuthForm({
    callbackUrl,
  });

  return (
    <aside className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_40px_rgba(24,20,17,0.06)] md:p-8">
      <AuthHeader mode={mode} />
      <ModeToggle mode={mode} onModeChange={setMode} />

      {googleEnabled && (
        <div className="mt-6">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)]"
          />
        </div>
      )}

      <Divider />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <FormInput
            id="name"
            name="name"
            type="text"
            label="Full name"
            autoComplete="name"
            value={formState.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your name"
            required
          />
        )}

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={formState.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@example.com"
          required
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={formState.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
          minLength={8}
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <SubmitButton mode={mode} isPending={isPending} />
      </form>

      {!googleEnabled && (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Google sign-in not configured
        </p>
      )}
    </aside>
  );
}

// Sub-components for better readability

function AuthHeader({ mode }: { mode: AuthMode }) {
  return (
    <div className="text-center">
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {mode === "signin" ? "Welcome back to FolioAI" : "Start building your portfolio"}
      </p>
    </div>
  );
}

function ModeToggle({ mode, onModeChange }: { mode: AuthMode; onModeChange: (mode: AuthMode) => void }) {
  const baseClasses = "rounded-lg py-2 text-sm font-medium transition";
  const activeClasses = "bg-white text-[var(--foreground)] shadow-sm";
  const inactiveClasses = "text-[var(--muted)] hover:text-[var(--foreground)]";

  return (
    <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface)] p-1">
      <button
        type="button"
        onClick={() => onModeChange("signin")}
        className={`${baseClasses} ${mode === "signin" ? activeClasses : inactiveClasses}`}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onModeChange("signup")}
        className={`${baseClasses} ${mode === "signup" ? activeClasses : inactiveClasses}`}
      >
        Sign up
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-[var(--border)]" />
      <span className="text-xs text-[var(--muted)]">or continue with email</span>
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

function SubmitButton({ mode, isPending }: { mode: AuthMode; isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-xl bg-[var(--foreground)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
    </button>
  );
}