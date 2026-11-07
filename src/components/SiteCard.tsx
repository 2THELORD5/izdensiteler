"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import type { Site } from "@/lib/sites";

export function SiteCard({ site, index }: { site: Site; index: number }) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", `${x * 14}px`);
    el.style.setProperty("--my", `${y * 10}px`);
    el.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <article
      ref={ref}
      className={`site-card ${index === 0 || index === 5 ? "is-wide" : ""}`}
      style={{ ["--accent" as string]: site.accent, animationDelay: `${index * 90}ms` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="site-card-media">
        <Image
          src={site.preview}
          alt={site.name}
          fill
          unoptimized
          sizes="(max-width: 900px) 100vw, 50vw"
          className="site-card-img"
          priority={index < 2}
        />
        <div className="site-card-veil" />
        <div className="site-card-shine" aria-hidden />
        <span className="site-card-metric">{site.metric}</span>
        <span className="site-card-index">0{site.order}</span>
      </div>

      <div className="site-card-body">
        <p className="site-card-cat">{site.category}</p>
        <h3>{site.name}</h3>
        <p>{site.tagline}</p>
        <div className="site-actions">
          <Link href={`/incele/${site.slug}`} className="btn-primary compact">
            Siteye gir
          </Link>
          <a
            href={site.localPath || site.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost compact"
          >
            Tam ekran
          </a>
        </div>
      </div>
    </article>
  );
}
