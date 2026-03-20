"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  callbackUrl?: string;
  className?: string;
};

export function SignOutButton({
  callbackUrl = "/mvp1-preview",
  className,
}: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className={className ?? "rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium"}
    >
      Sign out
    </button>
  );
}
