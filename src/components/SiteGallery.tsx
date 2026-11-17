"use client";

import { FILM_SITES, MOTION_SITES } from "@/lib/sites";
import { SiteCard } from "./SiteCard";

export function SiteGallery() {
  return (
    <>
      <section id="siteler" className="sites">
        <div className="section-head">
          <p className="eyebrow">Scroll · Film</p>
          <h2>
            Scrub demolar.
            <br />
            <em>Gir · incele · çık · karşılaştır.</em>
          </h2>
          <p className="section-sub">
            Film / frame scrub ağırlıklı örnekler. Üst bardan portala dönüp başka dünyaya geç.
          </p>
        </div>
        <div className="site-bento">
          {FILM_SITES.map((site, i) => (
            <SiteCard key={site.slug} site={site} index={i} />
          ))}
        </div>
      </section>
      <section id="animasyon" className="sites">
        <div className="section-head">
          <p className="eyebrow">Şık · Animasyonlu</p>
          <h2>
            Motion demolar.
            <br />
            <em>Kısa sayfa · bölüm geçişleri.</em>
          </h2>
          <p className="section-sub">
            Scrollsuz veya çok kısa; reveal, panel fade ve tipografi odaklı.
          </p>
        </div>
        <div className="site-bento">
          {MOTION_SITES.map((site, i) => (
            <SiteCard key={site.slug} site={site} index={i + FILM_SITES.length} />
          ))}
        </div>
      </section>
    </>
  );
}
