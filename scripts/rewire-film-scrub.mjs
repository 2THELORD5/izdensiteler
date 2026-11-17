#!/usr/bin/env node
/**
 * Convert moos-* still crossfade scrubs → continuous film currentTime scrub.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEMOS = path.join(ROOT, "public/demos");

const CHAPTERS = {
  ores: [
    ["01 Arrival", "Light first.", "Oda ve sessizlik — giriş."],
    ["02 Plan", "Space composed.", "Her boşluk bir nefes."],
    ["03 Material", "Hand & grain.", "Dokunulan yüzeyler."],
    ["04 Atmosphere", "Evening hold.", "Akşam ışığında tamamlanır."],
  ],
  peak: [
    ["01 Horizon", "Sequence on.", "Ufuk açılır."],
    ["02 Material", "Touch board.", "Malzeme tahtası."],
    ["03 Suite", "Held light.", "Işık tutulur."],
    ["04 Interior", "Calm room.", "Sakin oda."],
  ],
  retro: [
    ["01 Era", "Canvas on.", "Dönem dokusu."],
    ["02 Craft", "Hand finish.", "El işçiliği."],
    ["03 Lounge", "Warm hold.", "Sıcak salon."],
    ["04 Detail", "Close grain.", "Detay."],
  ],
  bold: [
    ["01 Landmark", "Nothing less.", "İkonik siluet."],
    ["02 Mass", "Gravity drawn.", "Kütle ve yansıma."],
    ["03 Night", "Skyline edge.", "Gece hattı."],
    ["04 Plaza", "Public heart.", "Kamusal alan."],
  ],
  sapa: [
    ["01 Arrive", "Residence.", "Residans eşiği."],
    ["02 Lobby", "Warm stone.", "Lobide karşılama."],
    ["03 Live", "Terrace light.", "Teras ışığı."],
    ["04 Green", "Community.", "Avlu."],
  ],
  leaft: [
    ["01 Day", "Path open.", "Bahçe yolu."],
    ["02 Dusk", "Blue hour.", "Alacakaranlık."],
    ["03 Build", "Soil & line.", "Şantiye yeşili."],
    ["04 Settle", "Water hold.", "Su öğesi."],
  ],
  trio: [
    ["01 Terrain", "Ground opens.", "Arazi okunur."],
    ["02 Canopy", "Green mass.", "Yeşil kütle."],
    ["03 Edge", "Hard / soft.", "Sınır çizgisi."],
    ["04 Night", "Lit garden.", "Gece bahçesi."],
  ],
  niche: [
    ["01 Brief", "Ask first.", "Brief başlar."],
    ["02 Form", "Massing.", "Kütle arayışı."],
    ["03 Craft", "Detail hold.", "Detay."],
    ["04 Handover", "Lived in.", "Teslim."],
  ],
  grids: [
    ["01 Grid", "Structure.", "Izgara kurulur."],
    ["02 Volume", "Filled air.", "Hacim."],
    ["03 Facade", "Skin on.", "Cephe."],
    ["04 Life", "Occupied.", "Yaşam."],
  ],
  blok: [
    ["01 Model", "City in hand.", "Maket sahnesi."],
    ["02 Creek", "Water route.", "Su hattı."],
    ["03 Arts", "Public form.", "Kamusal form."],
    ["04 Coast", "Shore light.", "Kıyı."],
  ],
  greenit: [
    ["01 Path", "Walk in.", "Yürüyüş."],
    ["02 Plant", "Species set.", "Tür seçimi."],
    ["03 Build", "Soil work.", "Toprak."],
    ["04 Settle", "Grown in.", "Olgun bahçe."],
  ],
  kstudio: [
    ["01 Mark", "K opens.", "İşaret."],
    ["02 Space", "Room holds.", "Mekân."],
    ["03 Material", "Touch.", "Malzeme."],
    ["04 Close", "Still frame.", "Kapanış."],
  ],
};

function scrubBlock(slug, acts) {
  const chapters = JSON.stringify(
    acts.map(([act, title, body]) => ({ act, title, body }))
  );
  const poster = `assets/kie-scrub/pc/01.jpg`;
  return `
<section class="iz-scrub iz-scrub--film iz-scrub--kie" data-iz-film-scrub
  data-film-pc="assets/kie-scrub/film-pc.mp4"
  data-film-mob="assets/kie-scrub/film-mob.mp4"
  data-poster="${poster}"
  aria-label="Film chapter scrub">
  <div class="iz-scrub__pin">
    <div class="iz-scrub__stage">
      <video class="iz-film" muted playsinline preload="auto" poster="${poster}" disablePictureInPicture></video>
    </div>
    <div class="iz-scrub__veil" aria-hidden="true"></div>
    <div class="iz-scrub__ui">
      <p class="iz-scrub__act" data-iz-act></p>
      <h2 class="iz-scrub__title" data-iz-title></h2>
      <p class="iz-scrub__body" data-iz-body></p>
    </div>
    <p class="iz-scrub__hint">Scroll</p>
  </div>
  <script type="application/json" data-iz-chapters>${chapters}</script>
</section>`;
}

for (const [slug, acts] of Object.entries(CHAPTERS)) {
  const folder = path.join(DEMOS, `moos-${slug}`);
  const filmPc = path.join(folder, "assets/kie-scrub/film-pc.mp4");
  if (!fs.existsSync(filmPc)) {
    console.log("skip", slug, "(no film-pc yet)");
    continue;
  }
  const index = path.join(folder, "index.html");
  if (!fs.existsSync(index)) {
    console.log("skip", slug, "(no index)");
    continue;
  }
  let html = fs.readFileSync(index, "utf8");
  const block = scrubBlock(slug, acts);
  if (/data-iz-film-scrub|data-iz-scrub/.test(html)) {
    html = html.replace(
      /<section class="iz-scrub[\s\S]*?<\/section>/,
      block.trim()
    );
  } else {
    html = html.replace(/<main[^>]*>/i, (m) => `${m}\n${block}`);
  }
  if (!html.includes("izden-image-scrub.css")) {
    html = html.replace(
      /<\/head>/i,
      `<link rel="stylesheet" href="/demos/_shared/izden-image-scrub.css" />\n</head>`
    );
  }
  html = html.replace(
    /<script src="\/demos\/_shared\/izden-image-scrub\.js"[^>]*><\/script>\s*/g,
    ""
  );
  if (!html.includes("izden-film-scrub.js")) {
    html = html.replace(
      /<\/body>/i,
      `<script src="/demos/_shared/izden-film-scrub.js" defer></script>\n</body>`
    );
  }
  fs.writeFileSync(index, html);
  console.log("film-rewired", slug);
}
