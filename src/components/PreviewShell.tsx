"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SITES, type Site } from "@/lib/sites";
import { Logo } from "./Logo";

type Props = { site: Site };

export function PreviewShell({ site }: Props) {
  const [online, setOnline] = useState<boolean | null>(site.localPath ? true : null);
  const src = useMemo(
    () => (site.localPath ? site.localPath : site.externalUrl),
    [site]
  );
  const others = SITES.filter((s) => s.slug !== site.slug);

  useEffect(() => {
    if (site.localPath) {
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
  }, [site]);

  return (
    <div className="preview">
      <header className="preview-bar">
        <Link
          href="/#siteler"
          scroll={false}
          className="preview-brand"
          aria-label="Siteler bölümüne dön"
          onClick={() => {
            // Ensure hash scroll even if already on /
            if (typeof window !== "undefined") {
              sessionStorage.setItem("izden-scroll-to", "siteler");
            }
          }}
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
          <a
            href={site.localPath || site.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost compact"
          >
            Tam ekran
          </a>
          <Link href="/#teklif" className="btn-primary compact">
            Teklif al
          </Link>
          <Link
            href="/#siteler"
            scroll={false}
            className="btn-ghost compact"
            onClick={() => sessionStorage.setItem("izden-scroll-to", "siteler")}
          >
            Çık
          </Link>
        </div>
      </header>

      <div className="preview-frame-wrap">
        {online !== false ? (
          <iframe
            key={src}
            title={site.name}
            src={src}
            className="preview-frame"
            allow="autoplay; fullscreen; encrypted-media"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            loading="lazy"
          />
        ) : (
          <div className="preview-fallback">
            <h2>{site.name}</h2>
            <p>
              Önizleme yüklenemedi. Tam ekranda açmayı deneyin veya sayfayı
              yenileyin.
            </p>
            <div className="site-actions">
              <a
                href={site.localPath || site.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Tam ekranda aç
              </a>
              <Link href="/#siteler" className="btn-ghost">
                Portala dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
