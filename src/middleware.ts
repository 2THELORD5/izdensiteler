import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AI_BOT_UA, HONEYPOT_PATHS } from "@/lib/ai-bots";

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
  /^\/\.vscode/i,
  /^\/\.idea/i,
  /^\/debug\//i,
  /^\/telescope/i,
  /^\/_profiler/i,
];

const HONEYPOT_SET = new Set<string>(HONEYPOT_PATHS);

function isAiBot(ua: string) {
  return AI_BOT_UA.test(ua);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  if (BLOCKED.some((re) => re.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  // Allow policy files for compliant crawlers
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Honeypot hits → tarpit (bots that ignore robots.txt)
  if (HONEYPOT_SET.has(pathname) || pathname.startsWith("/_trap/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/tarpit";
    url.searchParams.set("from", pathname);
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // Declared AI training crawlers → never serve real portal/demos
  if (isAiBot(ua) && pathname !== "/tarpit") {
    const url = req.nextUrl.clone();
    url.pathname = "/tarpit";
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noai, noimageai");
  return res;
}

export const config = {
  // Include demos/previews so AI UAs cannot siphon film assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
