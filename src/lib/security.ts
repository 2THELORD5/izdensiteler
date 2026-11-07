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

/** Production site hosts that may call /api/* from the browser. */
const TRUSTED_HOSTS = new Set([
  "www.izdemo.com",
  "izdemo.com",
  "izdensiteler.vercel.app",
]);

/** Allow only known Groq chat models from env. */
export function safeGroqModel(raw: string | undefined): string {
  const model = (raw || "openai/gpt-oss-120b").trim();
  return GROQ_MODELS.has(model) ? model : "openai/gpt-oss-120b";
}

function hostFromOrigin(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAllowedOrigin(origin: string, allowedOrigins: Set<string>): boolean {
  if (allowedOrigins.has(origin)) return true;
  const host = hostFromOrigin(origin);
  if (!host) return false;
  if (TRUSTED_HOSTS.has(host)) return true;
  // Preview deploys: *.vercel.app under the project account
  if (host.endsWith(".vercel.app") && host.includes("izdensiteler")) return true;
  return false;
}

/**
 * Same-origin (or configured) API gate.
 * In production, rejects cross-site browser calls without matching Origin/Referer.
 */
export function assertSameOrigin(req: Request): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
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

  for (const h of TRUSTED_HOSTS) {
    allowed.add(`https://${h}`);
    allowed.add(`http://${h}`);
  }

  if (origin) {
    if (!isAllowedOrigin(origin, allowed)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return null;
  }

  // No Origin (same-origin navigations / some clients): check Referer when present.
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!isAllowedOrigin(refOrigin, allowed)) {
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

/** Escape for HTML email bodies (defense in depth). */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate env email / "Name <email@domain>" for Resend from/to. */
export function safeEmailAddress(raw: string | undefined, fallback: string): string {
  const v = (raw || fallback).trim();
  const angle = v.match(/^(.+?)\s*<([^>]+)>$/);
  if (angle) {
    const addr = angle[2].trim();
    if (EMAIL_RE.test(addr)) return `${stripControls(angle[1], 80)} <${addr}>`;
    return fallback;
  }
  if (EMAIL_RE.test(v)) return v;
  return fallback;
}

/** Only allow Formspree endpoints — blocks SSRF via env misconfig. */
export function safeFormspreeEndpoint(raw: string | undefined): string | null {
  const v = (raw || "").trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") return null;
    if (u.hostname !== "formspree.io" && !u.hostname.endsWith(".formspree.io")) {
      return null;
    }
    if (!u.pathname.startsWith("/f/")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
