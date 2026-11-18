/**
 * Demo readiness probe — decides when an embedded demo is *really* ready.
 *
 * Why: visitors have very different connections. A demo that opens while its
 * scroll film / hero video / images are still arriving feels broken and loses
 * the client. The preview shell keeps a loading screen on top of the iframe
 * until everything that makes the scroll experience work is loaded.
 *
 * Same-origin demos (all local ones) are inspected directly. Cross-origin
 * demos (e.g. junesun.com.tr) cannot be inspected; they report through
 * postMessage ({ type: "izden:progress" | "izden:ready" }).
 */

export type ReadinessSnapshot = {
  /** 0–100, monotonic, never reaches 100 before `ready` */
  pct: number;
  /** Everything loaded and the DOM has stopped changing */
  ready: boolean;
  /** Short Turkish status line for the loading screen */
  label: string;
  /** Debug: what we are still waiting for */
  pending: string[];
};

type Unit = { key: string; weight: number; frac: number; label: string };

const LOADER_SELECTORS = [
  "#loader",
  "#iz-boot",
  ".iz-boot",
  "[data-iz-boot]",
  "#preloader",
  ".preloader",
  ".loading-screen",
  "#boot",
  ".boot-loader",
  "#intro-loader",
  ".loader",
];

const SCRUB_VIDEO_SELECTOR = [
  "[data-iz-film-scrub] video",
  "video.iz-film",
  "video[data-scrub]",
  "video[data-iz-scrub]",
  "#vVariety",
  ".vhero__video",
].join(",");

/** Stall window: browser stopped buffering a huge file but playback is possible */
const STALL_ACCEPT_MS = 5000;
/** DOM must stay unchanged this long before we call it ready */
const SETTLE_MS = 900;
/** Never settle earlier than this after the iframe `load` event */
const MIN_AFTER_LOAD_MS = 1200;

function bufferedFraction(v: HTMLVideoElement): number {
  const d = v.duration;
  if (!Number.isFinite(d) || d <= 0) return 0;
  let covered = 0;
  try {
    for (let i = 0; i < v.buffered.length; i += 1) {
      covered += v.buffered.end(i) - v.buffered.start(i);
    }
  } catch {
    return 0;
  }
  return Math.min(1, covered / d);
}

function videoSrc(v: HTMLVideoElement): string {
  return (
    v.currentSrc ||
    v.getAttribute("src") ||
    v.querySelector("source")?.getAttribute("src") ||
    ""
  );
}

function visibleOverlay(win: Window, el: Element): boolean {
  const cs = win.getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  if (parseFloat(cs.opacity || "1") < 0.4) return false;
  if (cs.position !== "fixed" && cs.position !== "absolute") return false;
  const r = el.getBoundingClientRect();
  return r.width >= win.innerWidth * 0.6 && r.height >= win.innerHeight * 0.6;
}

export type SameOriginProbe = {
  tick(): ReadinessSnapshot;
};

export function createSameOriginProbe(frame: HTMLIFrameElement): SameOriginProbe {
  let bestPct = 0;
  let sig = "";
  let sigSince = performance.now();
  /* The iframe is server-rendered, so its `load` event can fire before React
     hydrates — never rely on onLoad; watch readyState instead. */
  let completeAt: number | null = null;
  const stalls = new WeakMap<HTMLVideoElement, { frac: number; since: number }>();
  const primed = new WeakSet<Element>();
  const sizes = new Map<string, number>();
  const sizeAsked = new Set<string>();

  const askSize = (url: string) => {
    if (!url || sizeAsked.has(url)) return;
    sizeAsked.add(url);
    fetch(url, { method: "HEAD", cache: "force-cache" })
      .then((r) => {
        const n = Number(r.headers.get("content-length") || 0);
        if (n > 0) sizes.set(url, n);
      })
      .catch(() => {});
  };

  return {
    tick() {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      const units: Unit[] = [];
      const pending: string[] = [];
      const now = performance.now();

      if (!win || !doc) {
        return { pct: bestPct, ready: false, label: "Sayfa açılıyor", pending: ["frame"] };
      }

      // 1. Document
      const docDone = doc.readyState === "complete";
      if (docDone && completeAt === null) completeAt = now;
      if (!docDone) completeAt = null; // navigated again
      units.push({ key: "doc", weight: 0.6, frac: docDone ? 1 : 0.3, label: "Sayfa açılıyor" });
      if (!docDone) pending.push("document");

      // 2. Fonts
      const fontsDone = !doc.fonts || doc.fonts.status === "loaded";
      units.push({ key: "fonts", weight: 0.4, frac: fontsDone ? 1 : 0, label: "Yazı tipleri hazırlanıyor" });
      if (!fontsDone) pending.push("fonts");

      // 3. Images (force lazy ones — a half-loaded gallery is a broken gallery)
      const imgs = Array.from(doc.images).filter((img) => {
        const s = img.currentSrc || img.src || "";
        return s && !s.startsWith("data:");
      });
      let imgDone = 0;
      for (const img of imgs) {
        if (img.loading === "lazy" && !primed.has(img)) {
          primed.add(img);
          try { img.loading = "eager"; } catch { /* noop */ }
        }
        if (img.complete) imgDone += 1;
      }
      if (imgs.length) {
        units.push({
          key: "img",
          weight: Math.min(20, Math.max(0.5, imgs.length * 0.25)),
          frac: imgDone / imgs.length,
          label: `Görseller yükleniyor ${imgDone}/${imgs.length}`,
        });
        if (imgDone < imgs.length) pending.push(`img ${imgDone}/${imgs.length}`);
      }

      // 4. Videos
      const videos = Array.from(doc.querySelectorAll("video")).filter((v) => videoSrc(v));
      for (const v of videos) {
        const url = videoSrc(v);
        const scrub = v.matches(SCRUB_VIDEO_SELECTOR) || !v.loop;
        if (!primed.has(v)) {
          primed.add(v);
          try {
            if (v.preload !== "auto") {
              v.preload = "auto";
              if (v.readyState === 0) v.load();
            }
          } catch { /* noop */ }
        }
        if (v.error) continue; // never block on a broken file
        const frac = bufferedFraction(v);
        if (scrub) {
          askSize(url);
          const size = sizes.get(url) || 0;
          // Weight ≈ megabytes, so the bar tracks what the visitor actually waits for
          const weight = size ? Math.min(80, Math.max(2, size / 1e6)) : 15;
          let done = frac >= 0.98;
          if (!done && v.readyState >= 1) {
            const st = stalls.get(v);
            if (!st || frac > st.frac + 0.004) {
              stalls.set(v, { frac, since: now });
            } else if (now - st.since > STALL_ACCEPT_MS && frac >= 0.4) {
              done = true; // browser stopped buffering a very large file; seeks stream the rest
            }
          }
          const f = done ? 1 : Math.min(0.99, frac);
          units.push({
            key: `vid:${url}`,
            weight,
            frac: f,
            label: `Sahne filmi yükleniyor %${Math.round(f * 100)}`,
          });
          if (!done) pending.push(`scrub ${url.split("/").pop()} ${Math.round(frac * 100)}%`);
        } else {
          const done = v.readyState >= 2;
          units.push({ key: `vid:${url}`, weight: 1.5, frac: done ? 1 : 0, label: "Videolar hazırlanıyor" });
          if (!done) pending.push(`loop ${url.split("/").pop()}`);
        }
      }

      // 5. The demo's own loading screen / loading classes
      let loaderUp = false;
      for (const sel of LOADER_SELECTORS) {
        const el = doc.querySelector(sel);
        if (el && visibleOverlay(win, el)) {
          loaderUp = true;
          break;
        }
      }
      const rootLoading =
        doc.documentElement.classList.contains("is-loading") ||
        Boolean(doc.body?.classList.contains("is-loading"));
      if (loaderUp || rootLoading) {
        pending.push("page loader");
      }
      units.push({
        key: "loader",
        weight: 0.6,
        frac: loaderUp || rootLoading ? 0.4 : 1,
        label: "Son dokunuşlar",
      });

      // Weighted progress
      let wSum = 0;
      let fSum = 0;
      for (const u of units) {
        wSum += u.weight;
        fSum += u.weight * u.frac;
      }
      const raw = wSum ? fSum / wSum : 0;
      const allDone = pending.length === 0;

      // DOM stability — catches content injected after hydration (film mounts etc.)
      const nextSig = [
        imgs.length,
        videos.length,
        doc.querySelectorAll("canvas").length,
        doc.body ? doc.body.childElementCount : 0,
      ].join("|");
      if (nextSig !== sig) {
        sig = nextSig;
        sigSince = now;
      }
      const settled = now - sigSince >= SETTLE_MS;
      const afterLoad = completeAt !== null && now - completeAt >= MIN_AFTER_LOAD_MS;
      const ready = allDone && settled && afterLoad;

      bestPct = Math.max(bestPct, ready ? 100 : Math.min(97, Math.round(raw * 100)));

      // Label: the least-complete, heaviest unit
      const worst = units
        .filter((u) => u.frac < 1)
        .sort((a, b) => b.weight * (1 - b.frac) - a.weight * (1 - a.frac))[0];
      const label = ready ? "Hazır" : worst?.label ?? "Son dokunuşlar";

      return { pct: bestPct, ready, label, pending };
    },
  };
}
