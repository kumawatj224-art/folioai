import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isNewAppEnabled } from "@/lib/env/feature-flags";

const bypassPrefixes = ["/_next", "/api", "/__demo", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

export function middleware(request: NextRequest) {
  if (isNewAppEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow static files to pass through
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Rewrite to /__demo route which serves Demo/index.html
  // Using rewrite keeps the URL as "/" but serves demo content
  const demoUrl = request.nextUrl.clone();
  demoUrl.pathname = "/__demo";

  return NextResponse.rewrite(demoUrl);
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
