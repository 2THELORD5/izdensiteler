"use client";

import { SITES } from "@/lib/sites";
import { SiteCard } from "./SiteCard";

export function SiteGallery() {
  return (
    <section id="siteler" className="sites">
      <div className="section-head">
        <p className="eyebrow">Örnek siteler</p>
        <h2>
          Canlı demolar.
          <br />
          <em>Gir · incele · çık · karşılaştır.</em>
        </h2>
        <p className="section-sub">
          Her kart gerçek siteden kare. Üst bardan istediğin an portala dönüp başka bir dünyaya geç.
        </p>
      </div>

      <div className="site-bento">
        {SITES.map((site, i) => (
          <SiteCard key={site.slug} site={site} index={i} />
        ))}
      </div>
    </section>
  );
}
