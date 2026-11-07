import { NextResponse } from "next/server";
import { mkdir, appendFile } from "fs/promises";
import os from "os";
import path from "path";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, stripControls } from "@/lib/security";

export const runtime = "nodejs";

const MAX_BODY = 12_000;
const ALLOWED_KEYS = new Set([
  "businessName",
  "sector",
  "goal",
  "stylePrefs",
  "budget",
  "timeline",
  "likedSites",
  "notes",
  "name",
  "phone",
  "email",
]);

function cleanString(value: unknown, max = 500): string {
  return stripControls(String(value ?? ""), max).trim();
}

/** Vercel’de proje dizini yazılamaz — sadece best-effort log. */
async function tryLocalLog(line: string) {
  try {
    const dir = process.env.VERCEL
      ? path.join(os.tmpdir(), "izden-surveys")
      : path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, "surveys.jsonl");
    await appendFile(file, line, "utf8");
  } catch {
    /* ignore — mail asıl kanal */
  }
}

function flattenForMail(data: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) out[k] = v.join(", ");
    else out[k] = String(v ?? "");
  }
  return out;
}

export async function POST(req: Request) {
  const originBlock = assertSameOrigin(req);
  if (originBlock) return originBlock;

  const limited = rateLimit(clientKey(req, "survey"), 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      }
    );
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) continue;
      if (Array.isArray(value)) {
        sanitized[key] = value
          .slice(0, 12)
          .map((v) => cleanString(v, 80))
          .filter(Boolean);
      } else if (typeof value === "string" || typeof value === "number") {
        sanitized[key] = cleanString(value, key === "notes" ? 2000 : 240);
      }
    }

    const email = String(sanitized.email || "");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (!String(sanitized.name || "").trim()) {
      return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
    }

    const line =
      JSON.stringify({ ...sanitized, at: new Date().toISOString() }) + "\n";
    await tryLocalLog(line);

    const subject = `İzden teklif — ${sanitized.businessName || sanitized.name}`;
    const mailFields = flattenForMail(sanitized);
    const web3 = process.env.WEB3FORMS_ACCESS_KEY?.trim();
    const formspree = process.env.FORMSPREE_ENDPOINT?.trim();

    let mailed = false;

    if (web3) {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: web3,
          subject,
          from_name: "İzden Siteler",
          ...mailFields,
        }),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      mailed = res.ok && data?.success !== false;
    } else if (formspree) {
      const res = await fetch(formspree, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ _subject: subject, ...mailFields }),
      });
      mailed = res.ok;
    }

    // Production’da mail anahtarı yoksa veya gönderim patladıysa net hata ver.
    if (process.env.VERCEL && !web3 && !formspree) {
      return NextResponse.json(
        { ok: false, error: "mail_not_configured" },
        { status: 503 }
      );
    }
    if ((web3 || formspree) && !mailed) {
      return NextResponse.json({ ok: false, error: "mail_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[survey]", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
