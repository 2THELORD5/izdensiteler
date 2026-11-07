import { NextResponse } from "next/server";

const GROQ_MODELS = new Set([
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-safeguard-20b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
]);

/** Allow only known Groq chat models from env. */
export function safeGroqModel(raw: string | undefined): string {
  const model = (raw || "openai/gpt-oss-120b").trim();
  return GROQ_MODELS.has(model) ? model : "openai/gpt-oss-120b";
}

/**
 * Same-origin (or configured) API gate.
 * In production, rejects cross-site browser calls without matching Origin/Referer.
 */
export function assertSameOrigin(req: Request): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const allowed = new Set<string>();
  const proto = req.headers.get("x-forwarded-proto") || "https";
  allowed.add(`${proto}://${host}`);
  allowed.add(`https://${host}`);
  allowed.add(`http://${host}`);

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) allowed.add(site);

  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    allowed.add(`https://${vercel}`);
    allowed.add(`http://${vercel}`);
  }

  if (origin) {
    if (![...allowed].some((a) => origin === a || origin.startsWith(a + "/"))) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return null;
  }

  // No Origin (same-origin navigations / some clients): check Referer when present.
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (![...allowed].some((a) => refOrigin === a)) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  return null;
}

export function stripControls(input: string, max = 1200): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, max);
}
