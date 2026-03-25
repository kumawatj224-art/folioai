import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isNewAppEnabled } from "@/lib/env/feature-flags";

const bypassPrefixes = ["/_next", "/api", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/index.html"];

export function middleware(request: NextRequest) {
  if (isNewAppEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

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
  // Explicitly match root and all paths
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
