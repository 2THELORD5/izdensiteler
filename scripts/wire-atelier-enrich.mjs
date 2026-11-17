#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("public/demos");

const SITES = {
  "atelier-noir": {
    enrich: "spotlight",
    title: "Catalogue",
    kicker: "Flacons · limited",
    items: [
      ["01", "NOIR 01 — After dark", "Smoked rose, incense, iron midnight.", "catalog-01.jpg", "bottle.jpg"],
      ["02", "NOIR 02 — Ember veil", "Ambered woods, burnt vanilla, night jasmine.", "catalog-02.jpg", "mood.jpg"],
      ["03", "NOIR 03 — Coffret", "Extrait, atomiser, stamped leather sleeve.", "catalog-03.jpg", "pack.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-lumen": {
    enrich: "spotlight",
    title: "Piece catalogue",
    kicker: "Drop 03 · Wind Corridor",
    items: [
      ["01", "Summit layer", "Bone face coat graded for atrium wind.", "catalog-01.jpg", "look-01.jpg"],
      ["02", "Lobby steel", "Steel-grey ensemble for vertical days.", "catalog-02.jpg", "look-02.jpg"],
      ["03", "Double face", "Wool weave — bone face, steel reverse.", "catalog-03.jpg", "fabric.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-kor": {
    enrich: "stack",
    title: "Tezgâh kataloğu",
    kicker: "Ateş · tabak · gece",
    items: [
      ["01", "Ember board", "Kül tuzlu kök ve odun protein.", "catalog-01.jpg", "plate.jpg"],
      ["02", "Izgara", "Ölçülü alev zonları.", "catalog-02.jpg", "grill.jpg"],
      ["03", "Gece salonu", "Karaköy seansı.", "catalog-03.jpg", "night.jpg"],
    ],
    insertBefore: 'id="sss"',
  },
  "atelier-meridian": {
    enrich: "rail",
    title: "Project catalogue",
    kicker: "Coast studies",
    items: [
      ["01", "Blue hour facade", "Salt air concrete.", "catalog-01.jpg", "facade.jpg"],
      ["02", "Cliff terrace", "Horizon openings.", "catalog-02.jpg", "cliff.jpg"],
      ["03", "Deck study", "Tide-set grid.", "deck.jpg", "deck.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-velvet": {
    enrich: "stack",
    title: "Cellar catalogue",
    kicker: "Reserves",
    items: [
      ["01", "Limestone vault", "Slow evenings below.", "catalog-01.jpg", "cellar.jpg"],
      ["02", "Pour", "Cork by cork.", "catalog-02.jpg", "pour.jpg"],
      ["03", "Vineyard dusk", "Before the cellar.", "vineyard.jpg", "vineyard.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-atlas": {
    enrich: "rail",
    title: "Route catalogue",
    kicker: "Field kit",
    items: [
      ["01", "Ridge kit", "Map, pack, altitude.", "catalog-01.jpg", "peak.jpg"],
      ["02", "Dawn camp", "Mist and ridgeline.", "catalog-02.jpg", "camp.jpg"],
      ["03", "Trail", "Routes that never repeat.", "trail.jpg", "trail.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-solace": {
    enrich: "stack",
    title: "Ritual catalogue",
    kicker: "Treatments",
    items: [
      ["01", "Stone pool", "Breath-timed water.", "catalog-01.jpg", "pool.jpg"],
      ["02", "Oil & linen", "Slow wipe sequence.", "catalog-02.jpg", "stone.jpg"],
      ["03", "Mist room", "Calm after heat.", "mist.jpg", "mist.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-forge": {
    enrich: "spotlight",
    title: "Roast catalogue",
    kicker: "Micron honesty",
    items: [
      ["01", "Drum roast", "Curves printed, not myth.", "catalog-01.jpg", "roast.jpg"],
      ["02", "Crema pour", "Predawn cup.", "catalog-02.jpg", "pour.jpg"],
      ["03", "Steam bar", "Crew shift fuel.", "steam.jpg", "steam.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-rivet": {
    enrich: "rail",
    title: "Finish catalogue",
    kicker: "Before / after truth",
    items: [
      ["01", "Ceramic gloss", "Film that holds.", "catalog-01.jpg", "gloss.jpg"],
      ["02", "Wheel detail", "Caliper clean.", "catalog-02.jpg", "detail.jpg"],
      ["03", "Studio bay", "One wipe reveal.", "studio.jpg", "studio.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
  "atelier-amber": {
    enrich: "spotlight",
    title: "Vitrine catalogue",
    kicker: "Pieces in orbit",
    items: [
      ["01", "Amber necklace", "Warm gold light.", "catalog-01.jpg", "gold.jpg"],
      ["02", "Inclusion macro", "Trapped light.", "catalog-02.jpg", "macro.jpg"],
      ["03", "Studio tray", "Hand-set pieces.", "studio.jpg", "studio.jpg"],
    ],
    insertBefore: 'id="faq"',
  },
};

function pickSrc(dir, preferred, fallback) {
  const media = path.join(ROOT, dir, "media");
  if (fs.existsSync(path.join(media, preferred))) return `media/${preferred}`;
  if (fallback && fs.existsSync(path.join(media, fallback))) return `media/${fallback}`;
  return `media/${fallback || preferred}`;
}

function spotlightHtml(cfg, dir) {
  const imgs = cfg.items
    .map((it, i) => {
      const src = pickSrc(dir, it[3], it[4]);
      return `<img src="${src}" alt="" ${i === 0 ? 'class="is-on"' : 'loading="lazy"'} data-enrich-img="${i}" />`;
    })
    .join("\n          ");
  const items = cfg.items
    .map((it, i) => {
      return `<article class="enrich-catalog__item${i === 0 ? " is-on" : ""}" data-enrich-item="${i}">
            <p class="enrich-catalog__index">${it[0]}</p>
            <h3>${it[1]}</h3>
            <p>${it[2]}</p>
          </article>`;
    })
    .join("\n          ");
  return `
    <section class="enrich-catalog" id="catalogue" aria-label="${cfg.title}">
      <div class="enrich-catalog__pin">
        <div class="enrich-catalog__stage" aria-hidden="true">
          ${imgs}
        </div>
        <div class="enrich-catalog__meta">
          <p class="section-kicker eyebrow" style="margin:0">${cfg.kicker}</p>
          <h2 class="section-title" style="margin:0 0 0.5rem">${cfg.title}</h2>
          ${items}
        </div>
      </div>
    </section>
`;
}

function railHtml(cfg, dir) {
  const cards = cfg.items
    .map((it) => {
      const src = pickSrc(dir, it[3], it[4]);
      return `<figure class="enrich-rail__card">
          <img src="${src}" alt="" width="800" height="1100" loading="lazy" />
          <figcaption>${it[0]} · ${it[1]}</figcaption>
        </figure>`;
    })
    .join("\n        ");
  return `
    <section class="enrich-rail" id="catalogue" aria-label="${cfg.title}">
      <div class="enrich-rail__head">
        <p class="section-kicker eyebrow" style="margin:0 0 0.4rem">${cfg.kicker}</p>
        <h2 class="section-title" style="margin:0">${cfg.title}</h2>
      </div>
      <div class="enrich-rail__track">
        ${cards}
      </div>
    </section>
`;
}

function stackHtml(cfg, dir) {
  const figs = cfg.items
    .map((it) => {
      const src = pickSrc(dir, it[3], it[4]);
      return `<figure>
          <img src="${src}" alt="${it[1]}" width="900" height="1200" loading="lazy" />
          <figcaption>${it[0]} · ${it[1]}</figcaption>
        </figure>`;
    })
    .join("\n        ");
  return `
    <section class="enrich-stack-wrap" id="catalogue" aria-label="${cfg.title}">
      <div style="max-width:72rem;margin:0 auto;padding:clamp(2rem,6vw,3rem) clamp(1.25rem,4vw,2.75rem) 0">
        <p class="section-kicker eyebrow" style="margin:0 0 0.4rem">${cfg.kicker}</p>
        <h2 class="section-title" style="margin:0 0 1rem">${cfg.title}</h2>
      </div>
      <div class="enrich-stack">
        ${figs}
      </div>
    </section>
`;
}

function ensureLinks(html) {
  let out = html;
  if (!out.includes("izden-atelier-enrich.css")) {
    out = out.replace(
      "</head>",
      '  <link rel="stylesheet" href="/demos/_shared/izden-atelier-enrich.css" />\n</head>'
    );
  }
  if (!out.includes("izden-atelier-enrich.js")) {
    out = out.replace(
      "</body>",
      '  <script src="/demos/_shared/izden-atelier-enrich.js" defer></script>\n</body>'
    );
  }
  return out;
}

for (const [dir, cfg] of Object.entries(SITES)) {
  const fp = path.join(ROOT, dir, "index.html");
  if (!fs.existsSync(fp)) {
    console.log("skip missing", dir);
    continue;
  }
  let html = fs.readFileSync(fp, "utf8");
  html = ensureLinks(html);

  // body enrich attr
  if (!html.includes('data-enrich=')) {
    html = html.replace(/<body([^>]*)>/, `<body$1 data-enrich="${cfg.enrich}">`);
  } else {
    html = html.replace(/data-enrich="[^"]*"/, `data-enrich="${cfg.enrich}"`);
  }

  // remove previous enrich block if re-run
  html = html.replace(/\n\s*<section class="enrich-(catalog|rail|stack-wrap)"[\s\S]*?<\/section>\n/g, "\n");

  let block = "";
  if (cfg.enrich === "spotlight") block = spotlightHtml(cfg, dir);
  else if (cfg.enrich === "rail") block = railHtml(cfg, dir);
  else block = stackHtml(cfg, dir);

  const marker = cfg.insertBefore;
  const idx = html.indexOf(marker);
  if (idx === -1) {
    // before contact
    const c = html.lastIndexOf('id="contact"');
    if (c === -1) {
      console.log(dir, "NO INSERT POINT");
      continue;
    }
    const start = html.lastIndexOf("<section", c);
    html = html.slice(0, start) + block + html.slice(start);
  } else {
    const start = html.lastIndexOf("<section", idx);
    html = html.slice(0, start) + block + html.slice(start);
  }

  // nav link
  if (!html.includes('href="#catalogue"')) {
    html = html.replace(
      /(<nav class="nav-drawer__links"[^>]*>)/,
      `$1\n      <a href="#catalogue">Catalogue</a>`
    );
  }

  fs.writeFileSync(fp, html);
  console.log("wired", dir, cfg.enrich);
}
