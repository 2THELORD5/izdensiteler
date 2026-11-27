export type SiteSlug =
  | "kumrucu"
  | "junesun"
  | "cafe"
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
  | "pivoine"
  | "lumen"
  | "kor"
  | "noir"
  | "meridian"
  | "velvet"
  | "atlas"
  | "solace"
  | "forge"
  | "rivet"
  | "amber";

/** film = scroll/scrub led; motion = section animation, short or no scrub */
export type SiteLane = "film" | "motion";

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
  lane: SiteLane;
};

/**
 * Portal demoları.
 * lane=film → scroll / film scrub ağırlıklı
 * lane=motion → kısa scroll veya scrollsüz, bölüm animasyonları
 * Kumrucu & Junesun: marka sahibi — İZDEN agency strip yok
 */
export const SITES: Site[] = [
  {
    slug: "kumrucu",
    name: "Kumrucu Kale",
    tagline: "Alaçatı tezgâhı — çeşit geçişli scroll film.",
    category: "Yeme · İçme",
    accent: "#8B5E3C",
    preview: "/previews/kumrucu.jpg?v=20261118",
    externalUrl: "https://kumrucu-kale.vercel.app",
    localPath: "/demos/kumrucu/index.html",
    order: 1,
    metric: "Film scrub",
    lane: "film",
  },
  {
    slug: "junesun",
    name: "Junesun",
    tagline: "Marka dünyası, motion ve ürün sahnesi.",
    category: "Lifestyle",
    accent: "#C4A574",
    preview: "/previews/junesun.jpg?v=20261118",
    externalUrl: "https://www.junesun.com.tr/?intro=1",
    order: 2,
    metric: "Runway",
    lane: "film",
  },
  {
    slug: "cafe",
    name: "IZDEN Night Roast",
    tagline: "Çuvaldan şeffaf bardağa specialty film scrub.",
    category: "Yeme · İçme",
    accent: "#C4A484",
    preview: "/previews/cafe.jpg?v=20261124",
    externalUrl: "http://127.0.0.1:5209",
    localPath: "/demos/cafe/index.html",
    order: 3,
    metric: "Film scrub",
    lane: "film",
  },
  {
    slug: "burger",
    name: "Anvil Burger",
    tagline: "Izgara film scrub + sipariş tahtası.",
    category: "Yeme · İçme",
    accent: "#E23B2F",
    preview: "/previews/burger.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5210",
    localPath: "/demos/burger/index.html",
    order: 3,
    metric: "Grill scrub",
    lane: "film",
  },
  {
    slug: "insaat",
    name: "Forma Villa",
    tagline: "Şantiyeden alacakaranlığa villa film scrub.",
    category: "Mimari · Villa",
    accent: "#A67C52",
    preview: "/previews/insaat.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5211",
    localPath: "/demos/insaat/index.html",
    order: 4,
    metric: "House film",
    lane: "film",
  },
  {
    slug: "galeri",
    name: "Strada Vault",
    tagline: "Gece showroom — private car vault scrub.",
    category: "Otomotiv",
    accent: "#6B7C8A",
    preview: "/previews/galeri.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5212",
    localPath: "/demos/galeri/index.html",
    order: 5,
    metric: "Vault scrub",
    lane: "film",
  },
  {
    slug: "signal",
    name: "Signal Studio",
    tagline: "VR frame-scrub ve cinematic brand world.",
    category: "Studio",
    accent: "#E10600",
    preview: "/previews/signal.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5213",
    localPath: "/demos/signal/index.html",
    order: 6,
    metric: "315 frames",
    lane: "film",
  },
  {
    slug: "ores",
    name: "Ores Interiors",
    tagline: "Sakin iç mekân — chapter film scrub + portfolyo.",
    category: "İç mimari",
    accent: "#5B4B3A",
    preview: "/previews/ores.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5222",
    localPath: "/demos/moos-ores/index.html",
    order: 7,
    metric: "Chapter scrub",
    lane: "film",
  },
  {
    slug: "leaft",
    name: "Leaft Studio",
    tagline: "Gündüzden akşama bahçe — chapter scroll + proje rayı.",
    category: "Peyzaj Mimarlığı",
    accent: "#d4a017",
    preview: "/previews/leaft.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5225",
    localPath: "/demos/moos-leaft/index.html",
    order: 8,
    metric: "Day/dusk",
    lane: "film",
  },
  {
    slug: "trio",
    name: "Trio Atelier",
    tagline: "Üç eksenli bahçe dili — video hero + chapter scrub.",
    category: "Peyzaj Mimarlığı",
    accent: "#3d7a55",
    preview: "/previews/trio.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5226",
    localPath: "/demos/moos-trio/index.html",
    order: 9,
    metric: "Video hero",
    lane: "film",
  },
  {
    slug: "sapa",
    name: "Sapa Residences",
    tagline: "Residans galerileri — dış mekân scrub + SSS.",
    category: "Gayrimenkul",
    accent: "#b87333",
    preview: "/previews/sapa.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5227",
    localPath: "/demos/moos-sapa/index.html",
    order: 10,
    metric: "Galleries",
    lane: "film",
  },
  {
    slug: "bold",
    name: "BOLD Architects",
    tagline: "Landmark mimari — massing scrub + case study.",
    category: "Mimari",
    accent: "#e11d48",
    preview: "/previews/bold.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5228",
    localPath: "/demos/moos-bold/index.html",
    order: 11,
    metric: "Landmark scrub",
    lane: "film",
  },
  {
    slug: "kstudio",
    name: "K Studio",
    tagline: "Editorial mimari chapter’lar + running head.",
    category: "Mimari · Editorial",
    accent: "#4f7cff",
    preview: "/previews/kstudio.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5229",
    localPath: "/demos/moos-kstudio/index.html",
    order: 12,
    metric: "Chapters",
    lane: "film",
  },
  {
    slug: "greenit",
    name: "Greenit Studio",
    tagline: "13 adımlı bahçe brief — funnel + scrub.",
    category: "Peyzaj Mimarlığı",
    accent: "#14b8a6",
    preview: "/previews/greenit.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5230",
    localPath: "/demos/moos-greenit/index.html",
    order: 13,
    metric: "13-step",
    lane: "film",
  },
  {
    slug: "grids",
    name: "Grids Architecture",
    tagline: "Flip-grid işler + yapısal chapter scrub.",
    category: "Mimari",
    accent: "#6b5b95",
    preview: "/previews/grids.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5231",
    localPath: "/demos/moos-grids/index.html",
    order: 14,
    metric: "Flip grid",
    lane: "film",
  },
  {
    slug: "retro",
    name: "Retro Atelier",
    tagline: "Dönem iç mimari — canvas sequence scrub.",
    category: "İç mimari",
    accent: "#c9a66b",
    preview: "/previews/retro.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5224",
    localPath: "/demos/moos-retro/index.html",
    order: 15,
    metric: "Canvas scrub",
    lane: "film",
  },
  {
    slug: "peak",
    name: "Peak Interiors",
    tagline: "Ufuk çizgisi — malzeme sequence scrub.",
    category: "İç mimari",
    accent: "#0d3b3a",
    preview: "/previews/peak.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5223",
    localPath: "/demos/moos-peak/index.html",
    order: 16,
    metric: "Sequence",
    lane: "film",
  },
  {
    slug: "blok",
    name: "Blackblock Studio",
    tagline: "Model atölyesi — video hero + pinned süreç.",
    category: "Atölye",
    accent: "#3b82f6",
    preview: "/previews/blok.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5221",
    localPath: "/demos/moos-blok/index.html",
    order: 17,
    metric: "Pinned steps",
    lane: "film",
  },
  {
    slug: "niche",
    name: "Niche Studio",
    tagline: "20 panelli scroll anlatı — iç mimari.",
    category: "İç mimari",
    accent: "#d4a574",
    preview: "/previews/niche.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5220",
    localPath: "/demos/moos-niche/index.html",
    order: 18,
    metric: "Chapter panels",
    lane: "film",
  },
  {
    slug: "nacre",
    name: "Sedef Parfüm",
    tagline: "İstiridye / okyanus — native film scrub.",
    category: "Parfüm",
    accent: "#17373e",
    preview: "/previews/nacre.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5240",
    localPath: "/demos/ascenta-nacre/index.html",
    order: 19,
    metric: "Film scrub",
    lane: "film",
  },
  {
    slug: "pivoine",
    name: "Pivoine Care",
    tagline: "Şakayık cilt bakımı — ürün reveal scroll.",
    category: "Cilt bakımı",
    accent: "#c45a7a",
    preview: "/previews/pivoine.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5241",
    localPath: "/demos/ascenta-pivoine/index.html",
    order: 20,
    metric: "Product reveal",
    lane: "film",
  },
  // —— Motion lane (şık / bölüm animasyonlu) ——
  {
    slug: "lumen",
    name: "LUMEN",
    tagline: "Vertical fashion — floor scrub + lookbook.",
    category: "Moda · Motion",
    accent: "#c5c8ce",
    preview: "/previews/lumen.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5250",
    localPath: "/demos/atelier-lumen/index.html",
    order: 21,
    metric: "Floor scrub",
    lane: "motion",
  },
  {
    slug: "kor",
    name: "KOR",
    tagline: "Open-fire mutfak — video hero + menü tahtası.",
    category: "Yeme · Motion",
    accent: "#E85D04",
    preview: "/previews/kor.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5251",
    localPath: "/demos/atelier-kor/index.html",
    order: 22,
    metric: "Fire motion",
    lane: "motion",
  },
  {
    slug: "noir",
    name: "NOIR",
    tagline: "After-dark fragrance — bottle scrub + notes.",
    category: "Parfüm · Motion",
    accent: "#9F1239",
    preview: "/previews/noir.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5252",
    localPath: "/demos/atelier-noir/index.html",
    order: 23,
    metric: "Bottle scrub",
    lane: "motion",
  },
  {
    slug: "meridian",
    name: "Meridian",
    tagline: "Kıyı mimarisi — yatay paneller, çizgi animasyonu.",
    category: "Mimari · Motion",
    accent: "#0e7490",
    preview: "/previews/meridian.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5253",
    localPath: "/demos/atelier-meridian/index.html",
    order: 24,
    metric: "Line reveal",
    lane: "motion",
  },
  {
    slug: "velvet",
    name: "Velvet Cellar",
    tagline: "Şarap mahzeni — soft fade chapter’lar.",
    category: "Hospitality · Motion",
    accent: "#7c2d12",
    preview: "/previews/velvet.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5254",
    localPath: "/demos/atelier-velvet/index.html",
    order: 25,
    metric: "Fade chapters",
    lane: "motion",
  },
  {
    slug: "atlas",
    name: "Atlas Field",
    tagline: "Outdoor gear — map scrub + gear grid.",
    category: "Outdoor · Motion",
    accent: "#365314",
    preview: "/previews/atlas.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5255",
    localPath: "/demos/atelier-atlas/index.html",
    order: 26,
    metric: "Map scrub",
    lane: "motion",
  },
  {
    slug: "solace",
    name: "Solace Spa",
    tagline: "Wellness — yavaş wipe geçişler, ritüel adımları.",
    category: "Wellness · Motion",
    accent: "#0f766e",
    preview: "/previews/solace.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5256",
    localPath: "/demos/atelier-solace/index.html",
    order: 27,
    metric: "Wipe ritual",
    lane: "motion",
  },
  {
    slug: "forge",
    name: "Forge Coffee",
    tagline: "Specialty kahve — grind counter + steam loop.",
    category: "Cafe · Motion",
    accent: "#78350f",
    preview: "/previews/forge.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5257",
    localPath: "/demos/atelier-forge/index.html",
    order: 28,
    metric: "Steam motion",
    lane: "motion",
  },
  {
    slug: "rivet",
    name: "Rivet Detail",
    tagline: "Auto detailing — gloss wipe + before/after.",
    category: "Otomotiv · Motion",
    accent: "#1e293b",
    preview: "/previews/rivet.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5258",
    localPath: "/demos/atelier-rivet/index.html",
    order: 29,
    metric: "Gloss wipe",
    lane: "motion",
  },
  {
    slug: "amber",
    name: "Amber Jewels",
    tagline: "Mücevher — makro orbit + vitrin fade.",
    category: "Jewelry · Motion",
    accent: "#b45309",
    preview: "/previews/amber.jpg?v=20261118",
    externalUrl: "http://127.0.0.1:5259",
    localPath: "/demos/atelier-amber/index.html",
    order: 30,
    metric: "Macro orbit",
    lane: "motion",
  },
];

export const FILM_SITES = SITES.filter((s) => s.lane === "film");
export const MOTION_SITES = SITES.filter((s) => s.lane === "motion");

export function siteEmbedSrc(site: Site): string {
  if (site.localPath) return site.localPath;
  if (site.externalUrl.startsWith("https://")) return site.externalUrl;
  return site.externalUrl;
}

export function getSite(slug: string): Site | undefined {
  return SITES.find((s) => s.slug === slug);
}
