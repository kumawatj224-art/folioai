import Link from "next/link";

type UpgradePromptBannerProps = {
  type: "generation" | "regeneration";
  message: string;
};

export function UpgradePromptBanner({ type, message }: UpgradePromptBannerProps) {
  const title = type === "generation"
    ? "Generation limit reached"
    : "Regeneration limit reached";

  return (
    <div className="rounded-2xl border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-4 text-[#f0ece4]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#ff9f1c]">{title}</p>
          <p className="mt-1 text-sm text-[#f0ece4]/85">{message}</p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#ff844f]"
        >
          Upgrade plan
        </Link>
      </div>
    </div>
  );
}