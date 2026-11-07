#!/usr/bin/env node
/**
 * Full professional pack → public/demos/*
 * Scroll film, menü, odalar, arabalar, kie stills, HDR — eksiksiz.
 * Sadece gereksiz devasa duplicate filmleri / generator scriptleri atlar.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, resolve, basename, extname } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DESKTOP = resolve(ROOT, "..");
const OUT = join(ROOT, "public", "demos");

const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  ".next",
  "scripts",
  "_ILHAM",
  "_ilham-videolari",
  "scrub-frames",
  "frames", // hamburger old frame seq — video scrub kullanıyor
  "seq",
]);

/** Skip bulky duplicate masters; keep 720 / scrub / stills. */
function keepMedia(filePath) {
  const name = basename(filePath).toLowerCase();
  const ext = extname(filePath).toLowerCase();

  if ([".ts", ".tsx", ".md", ".txt", ".map", ".DS_Store"].includes(ext)) return false;
  if (name.endsWith(".old.mp4") || name.includes(".old.")) return false;

  if (ext === ".mp4") {
    // Keep lean masters used by sites
    if (
      name.includes("720") ||
      name.includes("scrub") ||
      name === "film-house-v2.mp4" ||
      name === "runway-stage.mp4" ||
      name === "jaguar-walk-scrub.mp4" ||
      name === "jaguar-walk-wide-scrub.mp4"
    ) {
      return true;
    }
    // Drop kie shot videos + full unscaled masters
    if (name.startsWith("shot-")) return false;
    if (name === "film-full.mp4" || name === "film.mp4") return false;
    if (name.startsWith("film-house-v") && !name.includes("720") && !name.includes("scrub"))
      return false;
    if (name === "film-house-pro.mp4") return false;
    if (name === "jaguar-walk.mp4" || name === "jaguar-walk-wide.mp4" || name === "runway.mp4")
      return false;
    return false;
  }
  return true;
}

function copyFile(src, dest) {
  if (!existsSync(src)) {
    console.warn("  miss", src);
    return false;
  }
  mkdirSync(resolve(dest, ".."), { recursive: true });
  cpSync(src, dest);
  return true;
}

function copyTreeFiltered(src, dest) {
  if (!existsSync(src)) {
    console.warn("  miss tree", src);
    return;
  }
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (entry === ".DS_Store") continue;
    const from = join(src, entry);
    const to = join(dest, entry);
    let st;
    try {
      st = statSync(from);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIR.has(entry)) continue;
      copyTreeFiltered(from, to);
    } else if (keepMedia(from)) {
      copyFile(from, to);
    }
  }
}

/** Copy a complete static site root (html/css/js + public). */
function packFullStatic(slug, srcDir, { extraFiles = [], patch } = {}) {
  const dest = join(OUT, slug);
  console.log(`\n→ ${slug}  ← ${srcDir}`);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });

  const rootFiles = [
    "index.html",
    "styles.css",
    "scrub.js",
    "site.js",
    "menu.js",
    "scene.js",
    "icons.js",
    "sf-icons.js",
    "sf-icons-shared.js",
    "scrub.html",
    "main.js",
    ...extraFiles,
  ];
  for (const f of rootFiles) {
    const p = join(srcDir, f);
    if (existsSync(p)) copyFile(p, join(dest, f));
  }

  const pub = join(srcDir, "public");
  if (existsSync(pub)) copyTreeFiltered(pub, join(dest, "public"));

  if (patch) patch(dest);
  const size = du(dest);
  console.log(`  packed ${slug} (${size})`);
}

function du(dir) {
  try {
    let bytes = 0;
    const walk = (d) => {
      for (const e of readdirSync(d)) {
        const p = join(d, e);
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else bytes += st.size;
      }
    };
    walk(dir);
    if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}G`;
    return `${Math.round(bytes / 1024 / 1024)}M`;
  } catch {
    return "?";
  }
}

mkdirSync(OUT, { recursive: true });

// —— Burger (Anvil)
packFullStatic("burger", join(DESKTOP, "hamburger"));

// —— İnşaat (Forma) — scrub’u 720 master’a sabitle (101MB yerine ~17MB, aynı deneyim)
packFullStatic("insaat", join(DESKTOP, "inşaat"), {
  patch(dest) {
    const lean = join(DESKTOP, "inşaat", "public", "film-house-v10-720.mp4");
    const target = join(dest, "public", "film-house-scrub.mp4");
    if (existsSync(lean)) {
      copyFile(lean, target);
    }
    const scrubPath = join(dest, "scrub.js");
    if (existsSync(scrubPath)) {
      let js = readFileSync(scrubPath, "utf8");
      js = js.replace(
        /const SRC = ["'][^"']+["']/,
        `const SRC = "./public/film-house-scrub.mp4?v=embed-full"`
      );
      writeFileSync(scrubPath, js);
    }
  },
});

// —— Galeri (Strada)
packFullStatic("galeri", join(DESKTOP, "galeri"));

// —— SIGNAL (portal’daki veya adsız klasör)
{
  const signalSrc = existsSync(join(DESKTOP, "adsız klasör", "signal", "index.html"))
    ? join(DESKTOP, "adsız klasör", "signal")
    : join(OUT, "signal");
  if (signalSrc !== join(OUT, "signal")) {
    const dest = join(OUT, "signal");
    console.log(`\n→ signal  ← ${signalSrc}`);
    rmSync(dest, { recursive: true, force: true });
    cpSync(signalSrc, dest, { recursive: true });
    console.log(`  packed signal (${du(dest)})`);
  } else {
    console.log("\n→ signal  (already in place)");
  }
}

// —— Kumrucu: legacy shell + TAM public (brand/menu/kie/film)
{
  const dest = join(OUT, "kumrucu");
  const legacy = join(DESKTOP, "kumrucu", "_legacy");
  const pub = join(DESKTOP, "kumrucu", "public");
  console.log(`\n→ kumrucu  ← legacy + public`);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(join(dest, "public"), { recursive: true });

  for (const f of ["index.html", "styles.css", "scrub.js", "site.js"]) {
    if (existsSync(join(legacy, f))) copyFile(join(legacy, f), join(dest, f));
  }

  // Film: prefer house v2 name that legacy expects; else alias
  const filmCandidates = [
    "film-house-v2.mp4",
    "film-house-v1.mp4",
    "film-full-720.mp4",
  ];
  let filmSrc = null;
  for (const f of filmCandidates) {
    const p = join(pub, f);
    if (existsSync(p)) {
      filmSrc = p;
      break;
    }
  }
  // morph fallback
  if (!filmSrc) {
    const morph = join(pub, "film", "morph", "01-klasik-sucuklu.mp4");
    if (existsSync(morph)) filmSrc = morph;
  }
  if (filmSrc) {
    copyFile(filmSrc, join(dest, "public", "film-house-v2.mp4"));
    copyFile(filmSrc, join(dest, "public", "film-full-720.mp4"));
  }

  for (const sub of ["brand", "menu", "kie"]) {
    const s = join(pub, sub);
    if (existsSync(s)) copyTreeFiltered(s, join(dest, "public", sub));
  }

  // Patch scrub/index to film-house-v2
  for (const f of ["scrub.js", "index.html"]) {
    const p = join(dest, f);
    if (!existsSync(p)) continue;
    let t = readFileSync(p, "utf8");
    t = t.replace(/\.\/public\/film-house-v\d+\.mp4/g, "./public/film-house-v2.mp4");
    t = t.replace(/\.\/public\/film-full-720\.mp4/g, "./public/film-house-v2.mp4");
    writeFileSync(p, t);
  }
  console.log(`  packed kumrucu (${du(dest)})`);
}

// —— Junesun: gerçek asset’lerle profesyonel scrub + ürün sahnesi (Next export yerine)
{
  const dest = join(OUT, "junesun");
  const src = join(DESKTOP, "junesun", "public");
  console.log(`\n→ junesun  ← junesun/public + scrub shell`);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(join(dest, "public"), { recursive: true });

  copyTreeFiltered(join(src, "brand"), join(dest, "public", "brand"));
  copyTreeFiltered(join(src, "products"), join(dest, "public", "products"));
  copyTreeFiltered(join(src, "video"), join(dest, "public", "video"));

  writeFileSync(
    join(dest, "index.html"),
    `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Junesun — Lifestyle</title>
  <meta name="theme-color" content="#0c0b0a" />
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
  <link href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700,900&f[]=boska@500,700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <div class="progress" id="progress" aria-hidden="true"></div>
  <header class="nav">
    <img class="nav__logo" src="./public/brand/web-logo.png" alt="Junesun" height="28" />
    <nav class="nav__links">
      <a href="#runway">Runway</a>
      <a href="#walk">Walk</a>
      <a href="#katalog">Katalog</a>
    </nav>
  </header>

  <main>
    <section class="stage" id="runway">
      <div class="stage__pin">
        <video id="v1" class="stage__video" muted playsinline preload="auto"
          poster="./public/video/runway-still.png"
          src="./public/video/runway-stage.mp4"></video>
        <div class="stage__ui">
          <p class="eyebrow">Junesun · 01</p>
          <h1 id="t1">Runway</h1>
          <p id="b1">Sahne ışığı. Marka dünyası. Motion.</p>
        </div>
      </div>
    </section>

    <section class="stage stage--tall" id="walk">
      <div class="stage__pin">
        <video id="v2" class="stage__video" muted playsinline preload="auto"
          poster="./public/video/jaguar-still-wide.png"
          src="./public/video/jaguar-walk-wide-scrub.mp4"></video>
        <div class="stage__ui">
          <p class="eyebrow">Junesun · 02</p>
          <h1 id="t2">Walk</h1>
          <p id="b2">Scroll ile ilerleyen sinematik yürüyüş.</p>
        </div>
      </div>
    </section>

    <section class="katalog" id="katalog">
      <div class="katalog__head">
        <p class="eyebrow">Katalog</p>
        <h2>Ürün sahnesi</h2>
        <p>Konsept demo — üretimde markanıza özel film, tipografi ve sistem kurulur.</p>
      </div>
      <div class="katalog__grid" id="grid"></div>
    </section>
  </main>

  <footer class="foot">
    <p>İzden Creative · Junesun konsept demo</p>
  </footer>
  <script src="./site.js"></script>
</body>
</html>`
  );

  writeFileSync(
    join(dest, "styles.css"),
    `:root{--bg:#0c0b0a;--ink:#f4efe8;--muted:#a89f94;--line:rgba(244,239,232,.12);font-family:Satoshi,system-ui,sans-serif;color:var(--ink);background:var(--bg)}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:auto}body{min-height:100%}img,video{display:block;max-width:100%}
.progress{position:fixed;left:0;top:0;height:2px;width:0;background:var(--ink);z-index:40;transform-origin:left center}
.nav{position:fixed;inset:0 0 auto;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;background:linear-gradient(to bottom,rgba(12,11,10,.88),transparent)}
.nav__logo{height:28px;width:auto;filter:invert(1)}.nav__links{display:flex;gap:1rem}
.nav__links a{color:var(--muted);text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase}
.nav__links a:hover{color:var(--ink)}
.stage{position:relative;height:220vh}.stage--tall{height:260vh}
.stage__pin{position:sticky;top:0;height:100svh;overflow:hidden}
.stage__video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stage__ui{position:absolute;left:0;right:0;bottom:0;padding:2rem 1.25rem 3rem;background:linear-gradient(transparent,rgba(12,11,10,.92))}
.eyebrow{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:.55rem}
.stage__ui h1{font-family:Boska,Georgia,serif;font-size:clamp(2.4rem,8vw,4.2rem);line-height:1;letter-spacing:-.02em}
.stage__ui p:last-child{margin-top:.65rem;color:var(--muted);max-width:34ch;line-height:1.5}
.katalog{padding:4rem 1.25rem 3rem}.katalog__head{max-width:36rem;margin-bottom:1.5rem}
.katalog__head h2{font-family:Boska,Georgia,serif;font-size:clamp(1.8rem,5vw,2.8rem);margin:.4rem 0 .75rem}
.katalog__head p{color:var(--muted);line-height:1.55}
.katalog__grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem}
@media(min-width:900px){.katalog__grid{grid-template-columns:repeat(4,1fr);gap:.7rem}}
.katalog__grid figure{aspect-ratio:3/4;overflow:hidden;background:#1a1816}
.katalog__grid img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.katalog__grid figure:hover img{transform:scale(1.04)}
.foot{padding:1.5rem 1.25rem 2.5rem;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem}`
  );

  writeFileSync(
    join(dest, "site.js"),
    `(() => {
  const progress = document.getElementById("progress");
  const stages = [
    { video: document.getElementById("v1"), section: document.getElementById("runway") },
    { video: document.getElementById("v2"), section: document.getElementById("walk") },
  ];

  function bindScrub({ video, section }) {
    if (!video || !section) return;
    const ready = () => {
      video.pause();
      video.currentTime = 0;
    };
    if (video.readyState >= 1) ready();
    else video.addEventListener("loadedmetadata", ready, { once: true });

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0 || !video.duration) return;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = scrolled / total;
      video.currentTime = p * Math.max(video.duration - 0.05, 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  stages.forEach(bindScrub);

  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = \`\${Math.min(p, 1) * 100}%\`;
  }, { passive: true });

  const grid = document.getElementById("grid");
  const products = [
    "m8_1a-2.jpg","m8_1b-2.jpg","m8_2a-2.jpg","m8_2b-1.jpg",
    "m8_3a-2.jpg","m8_3b-2.jpg","acc-1.webp","acc-2.webp","acc-3.jpg","acc-4.webp"
  ];
  if (grid) {
    for (const file of products) {
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.src = "./public/products/" + file;
      img.alt = "";
      img.loading = "lazy";
      fig.appendChild(img);
      grid.appendChild(fig);
    }
  }
})();`
  );

  console.log(`  packed junesun (${du(dest)})`);
}

console.log("\nDone. Full demos → public/demos/*\n");
for (const slug of ["burger", "insaat", "galeri", "junesun", "kumrucu", "signal"]) {
  const d = join(OUT, slug);
  if (existsSync(d)) console.log(`  ${slug}: ${du(d)}`);
}
