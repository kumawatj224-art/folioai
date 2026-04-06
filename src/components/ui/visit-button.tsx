"use client";

type VisitButtonProps = {
  liveUrl: string;
};

export function VisitButton({ liveUrl }: VisitButtonProps) {
  // Extract subdomain from production URL
  const slugMatch = liveUrl.match(/https?:\/\/([^.]+)\.getfolioai\.in/);
  const slug = slugMatch ? slugMatch[1] : null;
  
  // For localhost, use local API route
  const isLocalhost = typeof window !== "undefined" && window.location.host.includes("localhost");
  const href = isLocalhost && slug 
    ? `/api/p/${slug}`
    : liveUrl;

  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 rounded-lg bg-[#ff6b35] py-2 text-center text-xs font-medium text-white transition-colors hover:bg-[#ff8f5a]"
    >
      Visit ↗
    </a>
  );
}
