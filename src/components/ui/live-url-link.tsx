"use client";

type LiveUrlLinkProps = {
  liveUrl: string;
};

export function LiveUrlLink({ liveUrl }: LiveUrlLinkProps) {
  // Extract subdomain from production URL
  const slugMatch = liveUrl.match(/https?:\/\/([^.]+)\.getfolioai\.in/);
  const slug = slugMatch ? slugMatch[1] : null;
  
  // For localhost, use local API route
  const isLocalhost = typeof window !== "undefined" && window.location.host.includes("localhost");
  const displayUrl = isLocalhost && slug 
    ? `${window.location.origin}/api/p/${slug}`
    : liveUrl;
  
  const displayText = isLocalhost && slug
    ? `localhost:3000/api/p/${slug}`
    : liveUrl.replace("https://", "");

  return (
    <a 
      href={displayUrl}
      target="_blank"
      rel="noopener noreferrer" 
      className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
      {displayText}
    </a>
  );
}
