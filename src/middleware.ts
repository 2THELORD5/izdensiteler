import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Block obvious probe paths; keep portal routes only. */
const BLOCKED = [
  /^\/\.env/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/\.git/i,
  /^\/server-status/i,
  /^\/phpmyadmin/i,
  /^\/actuator/i,
  /^\/\.aws/i,
  /^\/\.docker/i,
  /^\/xmlrpc\.php/i,
  /^\/vendor\/phpunit/i,
  /^\/config\.json$/i,
  /^\/secrets?\//i,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BLOCKED.some((re) => re.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  // Never cache API responses at the edge.
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|previews/|demos/).*)",
  ],
};
