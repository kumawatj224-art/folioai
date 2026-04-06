import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isNewAppEnabled } from "@/lib/env/feature-flags";

// Main app domains (not subdomains)
const MAIN_DOMAINS = [
  "getfolioai.in",
  "www.getfolioai.in",
  "folioai.in",
  "www.folioai.in",
  "folioai.vercel.app",
  "localhost",
  "localhost:3000",
];

const bypassPrefixes = ["/_next", "/api", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/index.html"];

/**
 * Extract subdomain from hostname
 * e.g., "johndoe.folioai.in" -> "johndoe"
 * e.g., "folioai.in" -> null
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(":")[0];
  
  // Skip if it's a main domain
  if (MAIN_DOMAINS.some(d => d.startsWith(host) || host === d)) {
    return null;
  }
  
  // Check for subdomain pattern: subdomain.getfolioai.in or subdomain.folioai.in
  // or subdomain.folioai.vercel.app (for preview deployments)
  const subdomainMatch = host.match(/^([a-z0-9-]+)\.(getfolioai\.in|folioai\.in|folioai\.vercel\.app)$/i);
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1].toLowerCase();
    // Skip www and other reserved subdomains
    if (subdomain === "www" || subdomain === "api" || subdomain === "app") {
      return null;
    }
    return subdomain;
  }
  
  // For localhost development, check for subdomain.localhost:3000 pattern
  if (host.endsWith(".localhost") || host.match(/^[a-z0-9-]+\.localhost$/i)) {
    const subdomain = host.replace(/\.localhost$/, "").toLowerCase();
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
  }
  
  return null;
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  
  // Check for subdomain-based portfolio access
  const subdomain = extractSubdomain(hostname);
  console.log(`[middleware] host: ${hostname}, pathname: ${pathname}, subdomain: ${subdomain}`);
  
  if (subdomain) {
    // Bypass static files and assets
    if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }
    
    // Rewrite to API route that serves raw HTML
    // e.g., johndoe.folioai.in -> /api/p/johndoe
    const url = request.nextUrl.clone();
    url.pathname = `/api/p/${subdomain}`;
    console.log(`[middleware] Rewriting to: ${url.pathname}`);
    return NextResponse.rewrite(url);
  }
  
  // Regular app routing
  if (isNewAppEnabled()) {
    return NextResponse.next();
  }

  if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Redirect to index.html for demo mode instead of rewrite
  // This ensures the static file is served without Next.js page processing
  const demoUrl = request.nextUrl.clone();
  demoUrl.pathname = "/index.html";

  return NextResponse.redirect(demoUrl);
}

export const config = {
  // Match all requests
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
