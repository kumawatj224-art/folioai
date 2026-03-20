import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isNewAppEnabled } from "@/lib/env/feature-flags";

const bypassPrefixes = ["/_next", "/api", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

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

  const demoUrl = request.nextUrl.clone();
  demoUrl.pathname = "/index.html";

  return NextResponse.rewrite(demoUrl);
}

export const config = {
  matcher: "/:path*",
};
