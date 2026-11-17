#!/usr/bin/env node
/**
 * Rewire moos-* iz-scrub stages to use assets/kie-scrub/{pc,mob} when present.
 * Mobile uses matchMedia via data-src-mob on each frame.
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
};

function scrubBlock(slug, acts) {
  const frames = acts
    .map(([act, title, body], i) => {
      const n = String(i + 1).padStart(2, "0");
      const pc = `assets/kie-scrub/pc/${n}.jpg`;
      const mob = `assets/kie-scrub/mob/${n}.jpg`;
      return `<div class="iz-scrub__frame" data-act="${act}" data-title="${title}" data-body="${body}" data-src-pc="${pc}" data-src-mob="${mob}">
<img src="${pc}" alt="" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" /></div>`;
    })
    .join("");
  return `
<section class="iz-scrub iz-scrub--kie" data-iz-scrub data-iz-scrub-responsive="1" aria-label="Film chapter scrub">
  <div class="iz-scrub__pin">
    <div class="iz-scrub__stage">${frames}</div>
    <div class="iz-scrub__veil" aria-hidden="true"></div>
    <div class="iz-scrub__ui">
      <p class="iz-scrub__act" data-iz-act></p>
      <h2 class="iz-scrub__title" data-iz-title></h2>
      <p class="iz-scrub__body" data-iz-body></p>
    </div>
    <p class="iz-scrub__hint">Scroll</p>
  </div>
</section>`;
}

for (const [slug, acts] of Object.entries(CHAPTERS)) {
  const folder = path.join(DEMOS, `moos-${slug}`);
  const pcDir = path.join(folder, "assets/kie-scrub/pc");
  if (!fs.existsSync(pcDir)) {
    console.log("skip", slug, "(no kie yet)");
    continue;
  }
  const have = acts.every((_, i) =>
    fs.existsSync(path.join(pcDir, `${String(i + 1).padStart(2, "0")}.jpg`))
  );
  if (!have) {
    console.log("skip", slug, "(incomplete)");
    continue;
  }
  const index = path.join(folder, "index.html");
  let html = fs.readFileSync(index, "utf8");
  const block = scrubBlock(slug, acts);
  if (/data-iz-scrub/.test(html)) {
    html = html.replace(/<section class="iz-scrub[\s\S]*?<\/section>/, block.trim());
  } else {
    html = html.replace(/<main[^>]*>/i, (m) => `${m}\n${block}`);
  }
  if (!html.includes("izden-image-scrub.js")) {
    html = html.replace(
      /<\/body>/i,
      `<script src="/demos/_shared/izden-image-scrub.js" defer></script>\n</body>`
    );
  }
  fs.writeFileSync(index, html);
  console.log("rewired", slug);
}
