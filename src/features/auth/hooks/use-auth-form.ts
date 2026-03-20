"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  const registerUser = async (data: AuthFormState): Promise<void> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message ?? "Unable to create account.");
    }
  };

  const authenticateUser = async (email: string, password: string): Promise<string> => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      throw new Error("Invalid email or password.");
    }

    return result.url ?? callbackUrl;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setIsPending(true);

      try {
        if (mode === "signup") {
          await registerUser(formState);
        }

        const redirectUrl = await authenticateUser(formState.email, formState.password);
        router.push(redirectUrl);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    },
    [mode, formState, callbackUrl, router]
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
