import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const bypassPrefixes = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/index.html",
  "/api/",  // Bypass API routes
];

// Reserved subdomains that should NOT be treated as portfolio slugs (on root domain)
const reservedSubdomains = [
  "www",
  "ppe",      // Pre-production environment (root access)
  "staging",
  "dev",
  "api",
  "admin",
  "app",
];

// Environment subdomains that support nested portfolio subdomains
// e.g., portfolio.ppe.getfolioai.in, portfolio.staging.getfolioai.in
const environmentSubdomains = ["ppe", "staging", "dev"];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  const hostname = host.split(":")[0]; // remove port
  const parts = hostname.split(".");

  // Detect portfolio subdomain across different environments
  let portfolioSlug: string | null = null;

  const isProduction = hostname.endsWith("getfolioai.in");
  const isLocalTest = parts.length === 2 && parts[1] === "localhost";

  // Production: portfolio.getfolioai.in (3 parts)
  if (parts.length === 3 && isProduction && !reservedSubdomains.includes(parts[0])) {
    portfolioSlug = parts[0];
  }
  // Environment subdomain: portfolio.ppe.getfolioai.in (4 parts)
  else if (parts.length === 4 && isProduction && environmentSubdomains.includes(parts[1])) {
    portfolioSlug = parts[0];
  }
  // Local test: portfolio.localhost (2 parts)
  else if (isLocalTest && !reservedSubdomains.includes(parts[0])) {
    portfolioSlug = parts[0];
  }

  const isPortfolioSubdomain = portfolioSlug !== null;

  console.log(
    `[middleware] host=${host}, portfolioSlug=${portfolioSlug}, isPortfolio=${isPortfolioSubdomain}, pathname=${pathname}`
  );

  // Skip static assets
  if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Handle portfolio subdomain
  if (isPortfolioSubdomain && portfolioSlug) {
    // Prevent rewrite loop - if already on /p/{slug}, skip
    if (pathname.startsWith(`/p/${portfolioSlug}`)) {
      return NextResponse.next();
    }
    
    // Build the new pathname
    const newPathname = pathname === "/" 
      ? `/p/${portfolioSlug}` 
      : `/p/${portfolioSlug}${pathname}`;
    
    console.log(`[middleware] Rewriting: pathname=${newPathname}`);
    
    // Clone the request URL and modify pathname (preserves cookies, headers, etc.)
    const url = req.nextUrl.clone();
    url.pathname = newPathname;
    
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();
  response.headers.set("x-middleware-executed", "true");
  response.headers.set("x-portfolio-slug", portfolioSlug || "none");
  response.headers.set("x-is-portfolio", String(isPortfolioSubdomain));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};