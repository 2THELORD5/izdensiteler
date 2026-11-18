"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SITES, siteEmbedSrc, type Site } from "@/lib/sites";
import { Logo } from "./Logo";
import { createSameOriginProbe } from "@/lib/demoReadiness";

type Props = { site: Site };

const CHROME_ID = "izden-preview-chrome";

function useIsMobilePreview() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(max-width: 820px), (hover: none) and (pointer: coarse)"
    );
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return mobile;
}

/** Remove only the singleton chrome host — never the live React .preview tree. */
function wipeChromeHost() {
  document.getElementById(CHROME_ID)?.remove();
}

export function wipeAllPreviewArtifacts() {
  wipeChromeHost();
  document.querySelectorAll(".preview-bar").forEach((el) => {
    // orphan bars only (not inside live react tree — hard-nav should clear)
    if (!el.closest("[data-preview-live='1']")) el.remove();
  });
  document.documentElement.classList.remove("is-preview", "preview-immersive");
  document.body.style.overflow = "";
}


/** After this long the loading screen offers a manual "open anyway". */
const GATE_SLOW_MS = 25000;
/** Absolute ceiling — never trap a visitor behind a loader forever. */
const GATE_HARD_MS = 90000;
/** Cross-origin demos that never report: open after this long. */
const GATE_SILENT_MS = 15000;

type Gate = {
  pct: number;
  label: string;
  open: boolean;
  slow: boolean;
  /** true once the exit transition is over and the overlay can unmount */
  gone: boolean;
  forceOpen: () => void;
};

/**
 * Keeps the demo behind a loading screen until its scroll film, videos and
 * images are really loaded — every visitor has a different connection.
 */
function useDemoGate(
  frameRef: React.RefObject<HTMLIFrameElement | null>,
  src: string,
  enabled: boolean
): Gate {
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState("Önizleme hazırlanıyor");
  const [open, setOpen] = useState(false);
  const [slow, setSlow] = useState(false);
  const [gone, setGone] = useState(false);
  const openRef = useRef(false);

  const finish = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    setPct(100);
    setLabel("Hazır");
    window.setTimeout(() => setOpen(true), 380);
    window.setTimeout(() => setGone(true), 380 + 700);
  }, []);

  useEffect(() => {
    if (!enabled) {
      openRef.current = true;
      setOpen(true);
      setGone(true);
      return;
    }
    openRef.current = false;
    setPct(0);
    setOpen(false);
    setGone(false);
    setSlow(false);

    const started = performance.now();
    let crossOrigin = false;
    try {
      crossOrigin = new URL(src, window.location.href).origin !== window.location.origin;
    } catch {
      crossOrigin = true;
    }

    let reported = 0;
    const onMsg = (e: MessageEvent) => {
      const f = frameRef.current;
      if (!f || e.source !== f.contentWindow) return;
      const d = e.data as { type?: string; pct?: number; label?: string } | null;
      if (!d || typeof d !== "object") return;
      if (d.type === "izden:progress" && typeof d.pct === "number") {
        reported = Math.max(reported, Math.min(97, d.pct));
        setPct((p) => Math.max(p, Math.round(reported)));
        if (d.label) setLabel(String(d.label).slice(0, 60));
      } else if (d.type === "izden:ready") {
        finish();
      }
    };
    if (crossOrigin) window.addEventListener("message", onMsg);

    const probe =
      !crossOrigin && frameRef.current ? createSameOriginProbe(frameRef.current) : null;
    let activeProbe = probe;

    const timer = window.setInterval(() => {
      if (openRef.current) return;
      const elapsed = performance.now() - started;
      if (elapsed > GATE_SLOW_MS) setSlow(true);
      if (elapsed > GATE_HARD_MS) {
        finish();
        return;
      }
      if (crossOrigin) {
        if (elapsed > GATE_SILENT_MS && reported === 0) finish();
        return;
      }
      if (!activeProbe && frameRef.current) activeProbe = createSameOriginProbe(frameRef.current);
      if (!activeProbe) return;
      try {
        const snap = activeProbe.tick();
        (window as unknown as { __izGate?: unknown }).__izGate = snap;
        setPct((p) => Math.max(p, snap.pct));
        setLabel(snap.label);
        if (snap.ready) finish();
      } catch {
        // Frame navigated mid-probe — try again next tick
      }
    }, 300);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("message", onMsg);
    };
  }, [enabled, src, frameRef, finish]);

  return { pct, label, open, slow, gone, forceOpen: finish };
}

function PreviewGate({
  site,
  gate,
}: {
  site: Site;
  gate: Gate;
}) {
  if (gate.gone) return null;
  return (
    <div
      className={`preview-gate${gate.open ? " is-open" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={!gate.open}
      style={{ ["--gate-accent" as string]: site.accent }}
    >
      <div className="preview-gate__inner">
        <Logo variant="white" className="preview-gate__logo" priority />
        <p className="preview-gate__name">{site.name}</p>
        <p className="preview-gate__cat">{site.category}</p>
        <div
          className="preview-gate__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={gate.pct}
        >
          <span style={{ width: `${gate.pct}%` }} />
        </div>
        <p className="preview-gate__pct">
          <span>{gate.pct}</span>%
        </p>
        <p className="preview-gate__label">{gate.label}</p>
        <p className="preview-gate__note">
          Tüm sahneler yüklenmeden açılmaz — kaydırırken takılma olmasın diye.
        </p>
        {gate.slow && !gate.open && (
          <div className="preview-gate__slow">
            <p>Bağlantın yavaş görünüyor. Yükleme sürüyor; beklemek en iyi sonucu verir.</p>
            <button type="button" className="btn-ghost compact" onClick={gate.forceOpen}>
              Yine de aç
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PreviewShell({ site }: Props) {
  const baseSrc = useMemo(() => siteEmbedSrc(site), [site]);
  const isMobile = useIsMobilePreview();
  const [visit] = useState(() => Date.now());
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);

  const src = useMemo(() => {
    const qs = new URLSearchParams();
    if (site.slug === "junesun") qs.set("intro", "1");
    qs.set("izden", "1");
    qs.set("_v", String(visit));
    // Local demos stay origin-relative: always same-origin as the portal (dev,
    // previews, production), which lets the loading gate inspect them.
    if (baseSrc.startsWith("/")) {
      return `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}${qs.toString()}`;
    }
    const u = new URL(baseSrc);
    qs.forEach((v, k) => u.searchParams.set(k, v));
    return u.toString();
  }, [baseSrc, site.slug, visit]);

  const isHttps = src.startsWith("https://");
  /* Local demos are our own static files, served from the portal origin. */
  const isSameOrigin = src.startsWith("/");
  const hasLocal = Boolean(site.localPath);
  const [online, setOnline] = useState<boolean | null>(
    isHttps || hasLocal ? true : null
  );
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const gate = useDemoGate(frameRef, src, online !== false);

  useEffect(() => {
    wipeChromeHost();
    const el = document.createElement("div");
    el.id = CHROME_ID;
    document.body.appendChild(el);
    setPortalEl(el);
    document.documentElement.classList.add("is-preview");
    return () => {
      wipeChromeHost();
      document.documentElement.classList.remove("is-preview", "preview-immersive");
      document.body.style.overflow = "";
    };
  }, [site.slug]);

  useEffect(() => {
    if (!switchOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(".preview-switch")) return;
      setSwitchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSwitchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [switchOpen]);

  useEffect(() => {
    if (isHttps || hasLocal) {
      setOnline(true);
      return;
    }
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 2800);
    fetch(site.externalUrl, { mode: "no-cors", signal: ctrl.signal })
      .then(() => {
        if (!cancelled) setOnline(true);
      })
      .catch(() => {
        if (!cancelled) setOnline(false);
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [site, isHttps, hasLocal]);

  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("preview-immersive");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("preview-immersive");
    };
  }, [isMobile]);

  const goHome = () => {
    wipeAllPreviewArtifacts();
    sessionStorage.setItem("izden-scroll-to", "siteler");
    window.location.href = "/#siteler";
  };

  const goIncele = (slug: string) => {
    wipeChromeHost();
    window.location.href = `/incele/${slug}`;
  };

  const chrome = !isMobile ? (
    <header className="preview-bar" data-slug={site.slug}>
      <button type="button" className="preview-brand" onClick={goHome} aria-label="Siteler">
        <Logo variant="white" className="preview-logo" priority />
      </button>
      <div className="preview-meta">
        <span className="preview-dot" style={{ background: site.accent }} />
        <strong>{site.name}</strong>
        <span className="preview-cat">{site.category}</span>
      </div>
      <div className={`preview-switch${switchOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="preview-switch__btn"
          aria-expanded={switchOpen}
          onClick={() => setSwitchOpen((v) => !v)}
        >
          Diğer siteler ▾
        </button>
        <div className="preview-switch__menu" role="listbox">
          {SITES.map((s) => (
            <button
              key={s.slug}
              type="button"
              className={s.slug === site.slug ? "is-on" : undefined}
              onClick={() => {
                setSwitchOpen(false);
                if (s.slug !== site.slug) goIncele(s.slug);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-actions">
        <a href={src} target="_blank" rel="noreferrer" className="btn-ghost compact">
          Tam ekran
        </a>
        <a
          href="/#teklif"
          className="btn-primary compact"
          onClick={(e) => {
            e.preventDefault();
            wipeAllPreviewArtifacts();
            window.location.href = "/#teklif";
          }}
        >
          Teklif al
        </a>
        <button type="button" className="btn-ghost compact" onClick={goHome}>
          Çık
        </button>
      </div>
    </header>
  ) : (
    <button type="button" className="preview-exit" onClick={goHome} aria-label="Çık">
      <span aria-hidden>←</span> Çık
    </button>
  );

  return (
    <div
      className={`preview ${isMobile ? "preview--immersive" : ""}`}
      data-preview-slug={site.slug}
      data-preview-live="1"
    >
      {portalEl ? createPortal(chrome, portalEl) : null}

      <div className="preview-frame-wrap">
        {online !== false ? (
          <>
            <iframe
              ref={frameRef}
              key={`${site.slug}-${visit}`}
              title={site.name}
              src={src}
              className="preview-frame"
              allow="autoplay; fullscreen; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox={
                isHttps || isSameOrigin
                  ? "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  : "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              }
              loading="eager"
            />
            <PreviewGate site={site} gate={gate} />
          </>
        ) : (
          <div className="preview-fallback">
            <h2>{site.name}</h2>
            <p>Önizleme yüklenemedi. Tam ekranda açmayı deneyin.</p>
            <div className="site-actions">
              <a href={src} target="_blank" rel="noreferrer" className="btn-primary">
                Tam ekranda aç
              </a>
              <button type="button" className="btn-ghost" onClick={goHome}>
                Portala dön
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
