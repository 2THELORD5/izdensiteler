export type SiteSlug =
  | "kumrucu"
  | "junesun"
  | "burger"
  | "insaat"
  | "galeri"
  | "signal";

export type Site = {
  slug: SiteSlug;
  name: string;
  tagline: string;
  category: string;
  accent: string;
  preview: string;
  /** Dev localhost or live HTTPS embed */
  externalUrl: string;
  /** Same-origin static pack under /public/demos */
  localPath?: string;
  order: number;
  metric: string;
};

/**
 * Production embeds:
 * - Static packs → /demos/{slug}/index.html (orijinal sitelerin kopyası)
 * - Kumrucu / Junesun → canlı Next siteleri (son profesyonel build)
 */
export const SITES: Site[] = [
  {
    slug: "kumrucu",
    name: "Kumrucu Kale",
    tagline: "Scroll film, orbit menü, şube deneyimi.",
    category: "Yeme · İçme",
    accent: "#8B5E3C",
    preview: "/previews/kumrucu.jpg",
    externalUrl: "https://kumrucu-kale.vercel.app",
    order: 1,
    metric: "Film scrub",
  },
  {
    slug: "junesun",
    name: "Junesun",
    tagline: "Marka dünyası, motion ve ürün sahnesi.",
    category: "Lifestyle",
    accent: "#C4A574",
    preview: "/previews/junesun.jpg",
    // intro=1 → jaguar walk her girişte yeniden başlar
    externalUrl: "https://www.junesun.com.tr/?intro=1",
    order: 2,
    metric: "Runway",
  },
  {
    slug: "burger",
    name: "Burger · Anvil",
    tagline: "Smash burger film, menü ve sipariş tahtası.",
    category: "Yeme · İçme",
    accent: "#E23B2F",
    preview: "/previews/burger.jpg",
    externalUrl: "http://127.0.0.1:5210",
    localPath: "/demos/burger/index.html",
    order: 3,
    metric: "Grill scrub",
  },
  {
    slug: "insaat",
    name: "İnşaat · Forma",
    tagline: "Şantiye → perde → mutfak → yatak → mavi saat. Tek HQ film scrub.",
    category: "Mimari · Villa",
    accent: "#A67C52",
    preview: "/previews/insaat.jpg",
    externalUrl: "http://127.0.0.1:5211",
    localPath: "/demos/insaat/index.html",
    order: 4,
    metric: "House film scrub",
  },
  {
    slug: "galeri",
    name: "Galeri · Strada",
    tagline: "Gece showroom, private vault, performans.",
    category: "Kültür · Otomotiv",
    accent: "#6B7C8A",
    preview: "/previews/galeri.jpg",
    externalUrl: "http://127.0.0.1:5212",
    localPath: "/demos/galeri/index.html",
    order: 5,
    metric: "Vault scrub",
  },
  {
    slug: "signal",
    name: "SIGNAL",
    tagline: "VR frame-scrub — el, gözlük, sinematik scroll.",
    category: "Studio",
    accent: "#E10600",
    preview: "/previews/signal.jpg",
    externalUrl: "http://127.0.0.1:5213",
    localPath: "/demos/signal/index.html",
    order: 6,
    metric: "315 frames",
  },
];

/** Preview iframe src: HTTPS live → local pack → localhost */
export function siteEmbedSrc(site: Site): string {
  if (site.externalUrl.startsWith("https://")) return site.externalUrl;
  if (site.localPath) return site.localPath;
  return site.externalUrl;
}

export function getSite(slug: string): Site | undefined {
  return SITES.find((s) => s.slug === slug);
}
