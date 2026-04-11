import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isNewAppEnabled } from "@/lib/env/feature-flags";

const bypassPrefixes = ["/_next", "/api", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/index.html"];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  // Extract subdomain: jai.getfolioai.in -> jai
  const subdomain = host.split(".")[0];

  // Check if this is a portfolio subdomain request
  const isPortfolioSubdomain = 
    host.includes("getfolioai.in") &&
    subdomain !== "www" &&
    subdomain !== "getfolioai" &&
    !host.startsWith("getfolioai.in");

  console.log(`[middleware] host=${host}, subdomain=${subdomain}, isPortfolio=${isPortfolioSubdomain}, pathname=${pathname}`);

  if (isPortfolioSubdomain) {
    // Skip API and static assets
    if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    // Rewrite to portfolio API
    const url = new URL(`/api/p/${subdomain}`, req.url);
    console.log(`[middleware] Rewriting to: ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // Regular app routing for main domain
  if (isNewAppEnabled()) {
    return NextResponse.next();
  }

  // Demo mode - redirect to static page
  if (!pathname.includes(".") && !bypassPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/index.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
