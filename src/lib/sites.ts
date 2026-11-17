export type SiteSlug =
  | "kumrucu"
  | "junesun"
  | "burger"
  | "insaat"
  | "galeri"
  | "signal"
  | "ores"
  | "leaft"
  | "trio"
  | "sapa"
  | "bold"
  | "kstudio"
  | "greenit"
  | "grids"
  | "retro"
  | "peak"
  | "blok"
  | "niche"
  | "nacre"
  | "pivoine";

export type Site = {
  slug: SiteSlug;
  name: string;
  tagline: string;
  category: string;
  accent: string;
  preview: string;
  externalUrl: string;
  localPath?: string;
  order: number;
  metric: string;
};

/**
 * Orijinal İZDEN demoları + Moos Hostinger’dan birebir aynalanmış paketler
 * (public/demos/moos-*). Next.js tabanlı Moos demoları (retro/peak/blok/niche/qad)
 * ayrı export edilene kadar listede yok.
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
  {
    slug: "ores",
    name: "Maden İç Mimarlık",
    tagline: "Moos Ores birebir — GSAP pin portfolyo, hero video, hizmet panelleri.",
    category: "İç mimari",
    accent: "#a78bfa",
    preview: "/previews/ores.jpg",
    externalUrl: "http://127.0.0.1:5222",
    localPath: "/demos/moos-ores/index.html",
    order: 7,
    metric: "GSAP pin",
  },
  {
    slug: "leaft",
    name: "Yaprak Peyzaj",
    tagline: "Moos Leaft birebir — day/dusk, proje rayı, süreç chip’leri.",
    category: "Peyzaj",
    accent: "#d4a017",
    preview: "/previews/leaft.jpg",
    externalUrl: "http://127.0.0.1:5225",
    localPath: "/demos/moos-leaft/index.html",
    order: 8,
    metric: "Day/dusk",
  },
  {
    slug: "trio",
    name: "Üçlü Peyzaj",
    tagline: "Moos Trio birebir — ambient video hero, filtreli projeler.",
    category: "Peyzaj",
    accent: "#7dd3a0",
    preview: "/previews/trio.jpg",
    externalUrl: "http://127.0.0.1:5226",
    localPath: "/demos/moos-trio/index.html",
    order: 9,
    metric: "Video hero",
  },
  {
    slug: "sapa",
    name: "Sapa Residans",
    tagline: "Moos Sapa birebir — galeri rayları, harita, SSS.",
    category: "Gayrimenkul",
    accent: "#b87333",
    preview: "/previews/sapa.jpg",
    externalUrl: "http://127.0.0.1:5227",
    localPath: "/demos/moos-sapa/index.html",
    order: 10,
    metric: "Galleries",
  },
  {
    slug: "bold",
    name: "Cesur Stüdyo",
    tagline: "Moos Bold birebir — landmark portfolyo, ödüller, ekip.",
    category: "Mimari",
    accent: "#e11d48",
    preview: "/previews/bold.jpg",
    externalUrl: "http://127.0.0.1:5228",
    localPath: "/demos/moos-bold/index.html",
    order: 11,
    metric: "Case study",
  },
  {
    slug: "kstudio",
    name: "K Atelye",
    tagline: "Moos K Studio birebir — editorial chapter’lar, running head.",
    category: "Mimari · Editorial",
    accent: "#4f7cff",
    preview: "/previews/kstudio.jpg",
    externalUrl: "http://127.0.0.1:5229",
    localPath: "/demos/moos-kstudio/index.html",
    order: 12,
    metric: "Chapters",
  },
  {
    slug: "greenit",
    name: "Yeşil İt",
    tagline: "Moos Green It birebir — 13 adımlı bahçe brief funnel.",
    category: "Peyzaj · Funnel",
    accent: "#14b8a6",
    preview: "/previews/greenit.jpg",
    externalUrl: "http://127.0.0.1:5230",
    localPath: "/demos/moos-greenit/index.html",
    order: 13,
    metric: "13-step",
  },
  {
    slug: "grids",
    name: "Izgara Mimarlık",
    tagline: "Moos Grids birebir — flip-card iş ızgarası, overlay menü.",
    category: "Mimari",
    accent: "#a855f7",
    preview: "/previews/grids.jpg",
    externalUrl: "http://127.0.0.1:5231",
    localPath: "/demos/moos-grids/index.html",
    order: 14,
    metric: "Flip grid",
  },
  {
    slug: "retro",
    name: "Vintage Atelye",
    tagline: "Moos Retro birebir — canvas hero sequence, seçili işler.",
    category: "İç mimari · Retro",
    accent: "#c9a66b",
    preview: "/previews/retro.jpg",
    externalUrl: "http://127.0.0.1:5224",
    localPath: "/demos/moos-retro/index.html",
    order: 15,
    metric: "Canvas scrub",
  },
  {
    slug: "peak",
    name: "Ufuk İç Mimarlık",
    tagline: "Moos Peak birebir — hero sequence, malzemeler, yaklaşım.",
    category: "İç mimari",
    accent: "#0d3b3a",
    preview: "/previews/peak.jpg",
    externalUrl: "http://127.0.0.1:5223",
    localPath: "/demos/moos-peak/index.html",
    order: 16,
    metric: "Sequence",
  },
  {
    slug: "blok",
    name: "Kara Blok",
    tagline: "Moos Black Block birebir — video hero, pinned süreç.",
    category: "Atölye · Model",
    accent: "#3b82f6",
    preview: "/previews/blok.jpg",
    externalUrl: "http://127.0.0.1:5221",
    localPath: "/demos/moos-blok/index.html",
    order: 17,
    metric: "Pinned steps",
  },
  {
    slug: "niche",
    name: "Niş Atelyesi",
    tagline: "Moos Niche birebir — 20 panelli scroll anlatı.",
    category: "İç mimari",
    accent: "#d4a574",
    preview: "/previews/niche.jpg",
    externalUrl: "http://127.0.0.1:5220",
    localPath: "/demos/moos-niche/index.html",
    order: 18,
    metric: "Chapter panels",
  },
  {
    slug: "nacre",
    name: "Sedef",
    tagline: "İstiridye / parfüm — scroll film scrub.",
    category: "Parfüm",
    accent: "#17373e",
    preview: "/previews/nacre.jpg",
    externalUrl: "http://127.0.0.1:5240",
    localPath: "/demos/ascenta-nacre/index.html",
    order: 19,
    metric: "Film scrub",
  },
  {
    slug: "pivoine",
    name: "Şakayık",
    tagline: "Pembe gül / cilt bakımı — ürün reveal scroll.",
    category: "Cilt bakımı",
    accent: "#c45a7a",
    preview: "/previews/pivoine.jpg",
    externalUrl: "http://127.0.0.1:5241",
    localPath: "/demos/ascenta-pivoine/index.html",
    order: 20,
    metric: "Product reveal",
  },
];

export function siteEmbedSrc(site: Site): string {
  // Local packs first — live Ascenta blocks iframe embeds (frame-ancestors self).
  if (site.localPath) return site.localPath;
  if (site.externalUrl.startsWith("https://")) return site.externalUrl;
  return site.externalUrl;
}

export function getSite(slug: string): Site | undefined {
  return SITES.find((s) => s.slug === slug);
}
