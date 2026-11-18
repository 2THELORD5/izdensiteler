import { NextResponse } from "next/server";

/** robots.txt-disallowed bait — looks tempting, returns nothing useful. */
export async function GET() {
  await new Promise((r) => setTimeout(r, 2200));
  const res = new NextResponse(null, { status: 404 });
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
