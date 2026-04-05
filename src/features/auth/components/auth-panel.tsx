"use client";

import { useState } from "react";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { useAuthForm, type AuthMode } from "@/features/auth/hooks/use-auth-form";
import { FormInput } from "@/components/ui/form-input";

type AuthPanelProps = {
  callbackUrl?: string;
  googleEnabled: boolean;
};

type OTPStep = "form" | "otp";

export function AuthPanel({ callbackUrl = "/dashboard", googleEnabled }: AuthPanelProps) {
  const { mode, setMode, formState, updateField, error, isPending, handleSubmit } = useAuthForm({
    callbackUrl,
  });

  // OTP state - only used during signup
  const [otpStep, setOtpStep] = useState<OTPStep>("form");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);

  // Handle Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-otp",
          email: formState.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOtpToken(data.otpToken);
        setOtpStep("otp");
      } else {
        const data = await response.json();
        setOtpError(data.error || "Failed to send OTP");
      }
    } catch (error) {
      setOtpError("Error sending OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Verify OTP & Register
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-and-register",
          email: formState.email,
          otp,
          otpToken,
          name: formState.name,
          password: formState.password,
        }),
      });

      if (response.ok) {
        // Redirect to callback URL or dashboard
        window.location.href = callbackUrl;
      } else {
        const data = await response.json();
        setOtpError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Error verifying OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset OTP state when switching modes
  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setOtpStep("form");
    setOtp("");
    setOtpError(null);
    setOtpToken(null);
  };

  return (
    <aside className="rounded-2xl border border-white/[0.08] bg-[#111111] p-8">
      <AuthHeader mode={mode} otpStep={otpStep} />
      <ModeToggle mode={mode} onModeChange={handleModeChange} />

      {googleEnabled && mode === "signin" && (
        <div className="mt-6">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.15] bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-[#f0ece4] transition-all hover:bg-[#222222] hover:border-white/[0.25]"
          />
        </div>
      )}

      {googleEnabled && mode === "signin" && <Divider />}

      {/* Sign In Form */}
      {mode === "signin" && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            autoComplete="current-password"
            value={formState.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Your password"
            minLength={8}
            required
          />

          {error && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}

          <SubmitButton mode="signin" isPending={isPending} />
        </form>
      )}

      {/* Sign Up Form - Step 1: Email/Name/Password */}
      {mode === "signup" && otpStep === "form" && (
        <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
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
            autoComplete="new-password"
            value={formState.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Min 8 characters"
            minLength={8}
            required
          />

          {(error || otpError) && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {otpError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full rounded-xl bg-[#ff6b35] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {otpLoading ? "Sending code..." : "Continue"}
          </button>
        </form>
      )}

      {/* Sign Up Form - Step 2: OTP Verification */}
      {mode === "signup" && otpStep === "otp" && (
        <form onSubmit={handleVerifyAndRegister} className="mt-6 space-y-4">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-400">
            <p>Verification code sent to <strong>{formState.email}</strong></p>
          </div>

          <FormInput
            id="otp"
            name="otp"
            type="text"
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />

          {otpError && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{otpError}</p>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full rounded-xl bg-[#ff6b35] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpLoading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setOtpStep("form")}
              className="w-full rounded-xl border border-white/[0.15] py-3 text-sm font-medium text-[#f0ece4] transition hover:bg-[#1a1a1a]"
            >
              Back
            </button>
          </div>

          <p className="text-center text-xs text-[#606060]">
            Didn't receive the code? Check your spam folder or try again.
          </p>
        </form>
      )}

      {!googleEnabled && mode === "signin" && (
        <p className="mt-4 text-center text-xs text-[#606060]">
          Google sign-in not configured
        </p>
      )}
    </aside>
  );
}

// Sub-components for better readability

function AuthHeader({ mode, otpStep }: { mode: AuthMode; otpStep: OTPStep }) {
  return (
    <div className="text-center">
      {mode === "signin" ? (
        <>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#f0ece4]">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-[#606060]">Welcome back to FolioAI</p>
        </>
      ) : otpStep === "form" ? (
        <>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#f0ece4]">
            Create account
          </h2>
          <p className="mt-2 text-sm text-[#606060]">Start building your portfolio</p>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#f0ece4]">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-[#606060]">Enter the code we sent to your inbox</p>
        </>
      )}
    </div>
  );
}

function ModeToggle({ mode, onModeChange }: { mode: AuthMode; onModeChange: (mode: AuthMode) => void }) {
  const baseClasses = "rounded-lg py-2 text-sm font-medium transition";
  const activeClasses = "bg-[#222222] text-[#f0ece4] shadow-sm";
  const inactiveClasses = "text-[#606060] hover:text-[#f0ece4]";

  return (
    <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-[#1a1a1a] p-1">
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
      <span className="h-px flex-1 bg-white/[0.08]" />
      <span className="text-xs text-[#606060]">or continue with email</span>
      <span className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}

function SubmitButton({ mode, isPending }: { mode: AuthMode; isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-xl bg-[#ff6b35] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
    </button>
  );
}