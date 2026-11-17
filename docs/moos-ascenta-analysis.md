# Moos + Ascenta — Profesyonel Analiz (İZDEN portal)

Kaynaklar:
- https://moos-up.com/web-design/
- Hostinger demo seti (13 site) — `docs/moos-demo-audit.md`
- https://ascentastudio.com/#work (kalite / scroll referansı)

## Portal mantığı

Portal içinden açılan siteler = müşteriye gösterilen demo. Beklenti:
1. Kaynak siteyle **aynı scroll / bölüm / görsel / geçiş**
2. Sadece metin + İZDEN logosu değişir
3. Ascenta seviyesinde akıcı pin/scrub (takılma, foto-döngü hissi yok)

## Ascenta (#work) — kalite çubuğu

- Seçili işler: tam ekran / cinematic reveal, kısa copy, net CTA
- Scroll: Lenis benzeri yumuşak akış + frame/section pin
- İlk viewport sade: marka + bir vaat + bir CTA + dominant görsel
- Bizim hedef: Moos demolarının pin/scrub’ı bu kadar pürüzsüz hissetsin

## Moos demoları — tek tek

| # | Moos | Kaynak | Stack | Scroll / motion | İZDEN paket | Durum |
|---|------|--------|-------|-----------------|-------------|--------|
| 1 | Ores Interiors | deepskyblue-kudu… | Static + GSAP ST | Hero video + **pin portfolio** | `moos-ores` TR+logo | Canlı |
| 2 | Leaft | royalblue-elk… | Static | Day/dusk + rail + step chips | `moos-leaft` | Ayna hazır, TR devam |
| 3 | Trio | seagreen-falcon… | Static | Loop hero video + filtre grid | `moos-trio` | Ayna hazır |
| 4 | Sapa | darkslategrey-herring… | Static | Gallery scrub + SVG map | `moos-sapa` | Ayna hazır |
| 5 | Bold | slategray-marten… | Static | Reveal + side menu | `moos-bold` | Ayna hazır |
| 6 | K Studio | floralwhite-crab… | Static | Editorial chapters + running head | `moos-kstudio` | Ayna hazır |
| 7 | Green It | olive-mouse… | Static | **13-step funnel** (sayfa scroll yok) | `moos-greenit` | Ayna hazır |
| 8 | Grids | greenyellow-wren… | Static | Flip-card grid | `moos-grids` | Ayna hazır |
| 9 | Retro | powderblue-alligator… | **Next.js** | Canvas hero sequence | `moos-retro` | Canlı (ayna) |
| 10 | Peak | darkgoldenrod-goose… | **Next.js** | Hero image sequence | `moos-peak` | Canlı (ayna) |
| 11 | Black Block | lavender-sparrow… | **Next.js** | Video hero + pinned steps | `moos-blok` | Canlı (ayna) |
| 12 | Niche | lightblue-wildcat… | **Next.js** | 20 panel scroll-story | `moos-niche` | Canlı (ayna) |
| 13 | QAD | silver-sandpiper… | **Vite SPA** | Hash slides V1/V2 | — | Sırada |

## Ne yaptık / ne yapıyoruz

1. Zayıf “yeniden yazılmış” demolar portal listesinden **kaldırıldı**
2. Hostinger static siteler **birebir mirror** (`scripts/mirror-moos.mjs` → `public/demos/moos-*`) — 2026-11-17 yeniden çekildi
3. Ores + diğer static: İZDEN mark (`_shared/izden-mark.*`)
4. Preview bar yığılması: singleton portal chrome + hard exit + homepage wipe
5. Next.js Moos (retro/peak/blok/niche): eksik görseller/videolar Hostinger’dan dolduruldu; path’ler `/demos/moos-*` altına rewrite (portal iframe)
6. Blok: `video/hero-scrub.mp4` + opt görseller tamam
7. Ascenta Nacre/Pivoine: mirror OK; Nacre `product-native-v6.webp` tamamlandı
8. Asset audit: tüm `moos-*` + `ascenta-*` HTML medya ref → **missing 0** (2026-11-17)

## Orijinal İZDEN demoları (korundu)

Kumrucu, Junesun, Burger, İnşaat, Galeri, SIGNAL — bunlar Moos değil; kendi film-scrub kalitemiz.
