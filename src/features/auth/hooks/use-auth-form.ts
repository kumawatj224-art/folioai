"use client";

import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";

export type AuthMode = "signin" | "signup";

type AuthFormState = {
  name: string;
  email: string;
  password: string;
};

type UseAuthFormOptions = {
  callbackUrl: string;
};

type UseAuthFormReturn = {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  formState: AuthFormState;
  updateField: <K extends keyof AuthFormState>(field: K, value: AuthFormState[K]) => void;
  error: string | null;
  isPending: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function useAuthForm({ callbackUrl }: UseAuthFormOptions): UseAuthFormReturn {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [formState, setFormState] = useState<AuthFormState>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const updateField = useCallback(<K extends keyof AuthFormState>(field: K, value: AuthFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null); // Clear error on input change
  }, []);

  const handleModeChange = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setIsPending(true);

      try {
        // Step 1: Register user if signing up
        if (mode === "signup") {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formState),
          });

          if (!response.ok) {
            const result = (await response.json()) as { message?: string };
            throw new Error(result.message ?? "Unable to create account.");
          }
        }

        // Step 2: Authenticate with credentials
        const result = await signIn("credentials", {
          email: formState.email,
          password: formState.password,
          redirect: false,
        });

        if (!result) {
          throw new Error("Authentication failed. Please try again.");
        }

        if (result.error) {
          throw new Error(mode === "signup" 
            ? "Account created but sign-in failed. Please try signing in." 
            : "Invalid email or password.");
        }

        // Step 3: Hard redirect to ensure session cookie is picked up
        // Using window.location for full page reload instead of client navigation
        window.location.href = callbackUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    },
    [mode, formState, callbackUrl]
  );

  return {
    mode,
    setMode: handleModeChange,
    formState,
    updateField,
    error,
    isPending,
    handleSubmit,
  };
}
