"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SITES, siteEmbedSrc, type Site } from "@/lib/sites";
import { Logo } from "./Logo";

type Props = { site: Site };

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

export function PreviewShell({ site }: Props) {
  const baseSrc = useMemo(() => siteEmbedSrc(site), [site]);
  const isMobile = useIsMobilePreview();
  /** Remount iframe on each visit so intros (e.g. junesun jaguar) replay. */
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    setVisit((v) => v + 1);
  }, [site.slug]);

  const src = useMemo(() => {
    if (!baseSrc.startsWith("http")) return baseSrc;
    const u = new URL(
      baseSrc,
      typeof window !== "undefined" ? window.location.origin : "https://www.izdemo.com"
    );
    if (site.slug === "junesun") u.searchParams.set("intro", "1");
    // Owned embeds can show a return chip back to the portal.
    if (site.slug === "kumrucu") u.searchParams.set("izden", "1");
    u.searchParams.set("_v", String(visit));
    return u.toString();
  }, [baseSrc, site.slug, visit]);

  const isHttps = src.startsWith("https://");
  const hasLocal = Boolean(site.localPath);
  const [online, setOnline] = useState<boolean | null>(
    isHttps || hasLocal ? true : null
  );
  const [frameOk, setFrameOk] = useState(true);
  const others = SITES.filter((s) => s.slug !== site.slug);

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

  /** Lock body scroll while immersing on phone */
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

  // Cross-origin iframe: if it never paints, offer a direct open after a short wait.
  useEffect(() => {
    if (!isHttps || !isMobile) return;
    setFrameOk(true);
    const t = window.setTimeout(() => {
      // Keep true — we still show iframe; this only reveals the rescue CTA.
      setFrameOk(false);
    }, 7000);
    return () => window.clearTimeout(t);
  }, [isHttps, isMobile, src]);

  const goSiteler = () => {
    sessionStorage.setItem("izden-scroll-to", "siteler");
  };

  return (
    <div className={`preview ${isMobile ? "preview--immersive" : ""}`}>
      {!isMobile && (
        <header className="preview-bar">
          <Link
            href="/#siteler"
            scroll={false}
            className="preview-brand"
            aria-label="Siteler bölümüne dön"
            onClick={goSiteler}
          >
            <Logo variant="white" className="preview-logo" priority />
          </Link>
          <div className="preview-meta">
            <span className="preview-dot" style={{ background: site.accent }} />
            <strong>{site.name}</strong>
            <span className="preview-cat">{site.category}</span>
          </div>
          <div className="preview-switch">
            {others.map((s) => (
              <Link key={s.slug} href={`/incele/${s.slug}`} title={s.name}>
                {s.name.split("·")[0].trim()}
              </Link>
            ))}
          </div>
          <div className="preview-actions">
            <a href={src} target="_blank" rel="noreferrer" className="btn-ghost compact">
              Tam ekran
            </a>
            <Link href="/#teklif" className="btn-primary compact">
              Teklif al
            </Link>
            <Link
              href="/#siteler"
              scroll={false}
              className="btn-ghost compact"
              onClick={goSiteler}
            >
              Çık
            </Link>
          </div>
        </header>
      )}

      {isMobile && (
        <Link
          href="/#siteler"
          scroll={false}
          className="preview-exit"
          aria-label="Siteler listesine dön"
          onClick={goSiteler}
        >
          <span aria-hidden>←</span> Çık
        </Link>
      )}

      <div className="preview-frame-wrap">
        {online !== false ? (
          <>
            <iframe
              key={src}
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
              loading={isMobile ? "eager" : "lazy"}
            />
            {isMobile && isHttps && !frameOk && (
              <div className="preview-rescue" role="status">
                <p>Önizleme yavaş açıldı. Doğrudan siteye geçebilirsiniz.</p>
                <a href={src} className="btn-primary compact">
                  Siteyi aç
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="preview-fallback">
            <h2>{site.name}</h2>
            <p>
              Önizleme yüklenemedi. Tam ekranda açmayı deneyin veya sayfayı
              yenileyin.
            </p>
            <div className="site-actions">
              <a href={src} target="_blank" rel="noreferrer" className="btn-primary">
                Tam ekranda aç
              </a>
              <Link href="/#siteler" className="btn-ghost" onClick={goSiteler}>
                Portala dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
