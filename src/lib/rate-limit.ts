type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5_000;

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
  // Hard cap: drop oldest-ish entries if still huge.
  if (buckets.size >= MAX_KEYS) {
    const excess = buckets.size - Math.floor(MAX_KEYS * 0.7);
    let i = 0;
    for (const k of buckets.keys()) {
      buckets.delete(k);
      if (++i >= excess) break;
    }
  }
}

/** Simple in-memory rate limit (per server instance). */
export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { ok: true };
}

export function clientKey(req: Request, prefix: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = req.headers.get("x-real-ip")?.trim();
  // Cap key length to avoid Map abuse via huge forged headers.
  const ip = (fwd || real || "local").slice(0, 64);
  return `${prefix}:${ip}`;
}
