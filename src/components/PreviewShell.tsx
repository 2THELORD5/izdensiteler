"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SITES, siteEmbedSrc, type Site } from "@/lib/sites";
import { Logo } from "./Logo";

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

export function PreviewShell({ site }: Props) {
  const baseSrc = useMemo(() => siteEmbedSrc(site), [site]);
  const isMobile = useIsMobilePreview();
  const [visit] = useState(() => Date.now());
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);

  const src = useMemo(() => {
    const u = new URL(
      baseSrc,
      typeof window !== "undefined" ? window.location.origin : "https://www.izdemo.com"
    );
    if (site.slug === "junesun") u.searchParams.set("intro", "1");
    u.searchParams.set("izden", "1");
    u.searchParams.set("_v", String(visit));
    return u.toString();
  }, [baseSrc, site.slug, visit]);

  const isHttps = src.startsWith("https://");
  const hasLocal = Boolean(site.localPath);
  const [online, setOnline] = useState<boolean | null>(
    isHttps || hasLocal ? true : null
  );
  const [rescueVisible, setRescueVisible] = useState(false);

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

  useEffect(() => {
    if (!isHttps || !isMobile) return;
    setRescueVisible(false);
    let hideTimer = 0;
    const showTimer = window.setTimeout(() => {
      setRescueVisible(true);
      hideTimer = window.setTimeout(() => setRescueVisible(false), 5200);
    }, 4500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isHttps, isMobile, src]);

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
              key={`${site.slug}-${visit}`}
              title={site.name}
              src={src}
              className="preview-frame"
              allow="autoplay; fullscreen; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox={
                isHttps
                  ? "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  : "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              }
              loading="eager"
              onLoad={() => setRescueVisible(false)}
            />
            {isMobile && isHttps && (
              <div
                className={`preview-rescue${rescueVisible ? " is-on" : ""}`}
                role="status"
                aria-hidden={!rescueVisible}
              >
                <p>Önizleme hazırlanıyor. İstersen doğrudan siteye geçebilirsin.</p>
                <a href={src} className="btn-primary compact">
                  Siteyi aç
                </a>
              </div>
            )}
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
