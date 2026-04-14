import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const bypassPrefixes = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/index.html",
  "/p/",    // Prevent rewrite loop for portfolio routes
  "/api/",  // Bypass API routes
];

// Reserved subdomains that should NOT be treated as portfolio slugs
const reservedSubdomains = [
  "www",
  "ppe",      // Pre-production environment
  "staging",
  "dev",
  "api",
  "admin",
  "app",
];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  const hostname = host.split(":")[0]; // remove port
  const parts = hostname.split(".");

  const subdomain = parts[0];

  const isPortfolioSubdomain =
    parts.length > 2 && // ensures subdomain exists
    hostname.endsWith("getfolioai.in") &&
    !reservedSubdomains.includes(subdomain);

  console.log(
    `[middleware] host=${host}, subdomain=${subdomain}, isPortfolio=${isPortfolioSubdomain}, pathname=${pathname}`
  );

  // Skip static assets
  if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Handle portfolio subdomain
  if (isPortfolioSubdomain) {
    const url = req.nextUrl.clone();
    url.pathname = `/p/${subdomain}${pathname === "/" ? "" : pathname}`;
    console.log(`[middleware] Rewriting to: ${url.pathname}`);
    const response = NextResponse.rewrite(url);
    response.headers.set("x-middleware-rewrite", url.pathname);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("x-middleware-executed", "true");
  response.headers.set("x-subdomain", subdomain);
  response.headers.set("x-is-portfolio", String(isPortfolioSubdomain));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};