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

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  const hostname = host.split(":")[0]; // remove port
  const parts = hostname.split(".");

  const subdomain = parts[0];

  const isPortfolioSubdomain =
    parts.length > 2 && // ensures subdomain exists
    hostname.endsWith("getfolioai.in") &&
    subdomain !== "www";

  console.log(
    `[middleware] host=${host}, subdomain=${subdomain}, isPortfolio=${isPortfolioSubdomain}, pathname=${pathname}`
  );

  // Skip static assets
  if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Handle portfolio subdomain
  if (isPortfolioSubdomain) {
    const url = new URL(`/p/${subdomain}`, req.url);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};