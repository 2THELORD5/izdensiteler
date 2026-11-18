import { NextResponse } from "next/server";

/** Honeypot endpoint — any hit is a robots.txt violator or link-scraper. */
export async function GET() {
  // Soft delay burns scraper time without blocking our edge budget too hard
  await new Promise((r) => setTimeout(r, 1800));
  const res = NextResponse.json(
    {
      ok: false,
      notice: "TRAINING_OPT_OUT",
      data: null,
    },
    { status: 404 }
  );
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST() {
  return GET();
}
