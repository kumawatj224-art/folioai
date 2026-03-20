"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { startTransition, useState } from "react";

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";

type AuthMode = "signin" | "signup";

type AuthPanelProps = {
  callbackUrl?: string;
  googleEnabled: boolean;
};

export function AuthPanel({ callbackUrl = "/dashboard", googleEnabled }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    startTransition(async () => {
      try {
        if (mode === "signup") {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              password,
            }),
          });

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            throw new Error(data.message ?? "Unable to create account.");
          }
        }

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl,
        });

        if (!result || result.error) {
          throw new Error(mode === "signup" ? "Account created, but sign in failed." : "Invalid email or password.");
        }

        router.push(result.url ?? callbackUrl);
        router.refresh();
      } catch (submitError) {
        if (submitError instanceof Error) {
          setError(submitError.message);
        } else {
          setError("Unable to continue right now.");
        }
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <aside className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_40px_rgba(24,20,17,0.06)] md:p-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {mode === "signin" ? "Welcome back to FolioAI" : "Start building your portfolio"}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-lg py-2 text-sm font-medium transition ${
            mode === "signin" 
              ? "bg-white text-[var(--foreground)] shadow-sm" 
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg py-2 text-sm font-medium transition ${
            mode === "signup" 
              ? "bg-white text-[var(--foreground)] shadow-sm" 
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Sign up
        </button>
      </div>

      {/* Google button first */}
      {googleEnabled && (
        <div className="mt-6">
          <GoogleSignInButton 
            callbackUrl={callbackUrl} 
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)]" 
          />
        </div>
      )}

      {/* Divider */}
      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted)]">or continue with email</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* Form */}
      <form onSubmit={submitCredentials} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--foreground)] focus:bg-white"
              placeholder="Your name"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--foreground)] focus:bg-white"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--foreground)] focus:bg-white"
            placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
            minLength={8}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[var(--foreground)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {!googleEnabled && (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Google sign-in not configured
        </p>
      )}
    </aside>
  );
}