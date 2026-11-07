#!/usr/bin/env node
/**
 * Profesyonel demo paketi — Desktop’taki orijinal sitelerin tam kopyası.
 * node_modules / .git / generator scriptleri hariç her şey gelir.
 */
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const DESKTOP = resolve(ROOT, "..");
const OUT = join(ROOT, "public", "demos");

const SKIP = new Set([
  "node_modules",
  ".git",
  ".next",
  ".vercel",
  "out",
  "scripts",
  "_ILHAM",
  "_ilham-videolari",
  "_ILHAM-INDEX.md",
  "README.md",
  "KIE-PLAN.txt",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
  "next-env.d.ts",
  "next.config.ts",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "eslint.config.mjs",
  "components.json",
  ".DS_Store",
]);

function du(dir) {
  let n = 0;
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else n += st.size;
    }
  };
  walk(dir);
  return `${Math.round(n / 1024 / 1024)}M`;
}

function copyFull(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (SKIP.has(entry) || entry.startsWith(".")) continue;
    const from = join(src, entry);
    const to = join(dest, entry);
    const st = statSync(from);
    if (st.isDirectory()) {
      if (SKIP.has(entry)) continue;
      // scrub-frames / huge unused seq: keep if present (insaat may use rooms not frames)
      if (entry === "scrub-frames") continue;
      copyFull(from, to);
    } else {
      // Skip obsolete huge masters that sites don't reference
      const name = entry.toLowerCase();
      if (name.endsWith(".old.mp4")) continue;
      if (name === "film-full.mp4" || name === "film.mp4" || name === "film-kling.mp4") continue;
      if (name === "film-house-pro.mp4" || name === "film-house-v8.mp4" || name === "film-house-v9.mp4") continue;
      if (name === "film-house-v10.mp4" || name === "film-house-v10-720.mp4") continue; // scrub only
      if (name === "film-house-scrub-vercel.mp4") continue; // packed as film-house-scrub.mp4 below
      // Vercel upload hard limit: 100MB per file — scrub must stay all-intra (<95MB)
      if (st.size > 95 * 1024 * 1024) {
        console.warn("  skip >95MB", entry);
        continue;
      }
      cpSync(from, to);
    }
  }
}

function packStatic(slug, srcDir) {
  const dest = join(OUT, slug);
  console.log(`\n→ ${slug}  ← ${srcDir}`);
  if (!existsSync(srcDir)) {
    console.error("  MISSING SOURCE");
    return;
  }
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  copyFull(srcDir, dest);
  console.log(`  OK ${slug} (${du(dest)})`);
}

mkdirSync(OUT, { recursive: true });

// —— Static originals (tam profesyonel)
packStatic("burger", join(DESKTOP, "hamburger"));
packStatic("insaat", join(DESKTOP, "inşaat"));
// İnşaat: prefer scrub-safe encode (all-intra). Never ship long-GOP / v10-720.
{
  const dest = join(OUT, "insaat", "public");
  const vercelSafe = join(DESKTOP, "inşaat", "public", "film-house-scrub-vercel.mp4");
  const hq = join(DESKTOP, "inşaat", "public", "film-house-scrub.mp4");
  const target = join(dest, "film-house-scrub.mp4");
  mkdirSync(dest, { recursive: true });
  const pick = existsSync(vercelSafe) ? vercelSafe : hq;
  if (existsSync(pick)) {
    cpSync(pick, target);
    console.log(`  insaat film ← ${pick.split("/").pop()} (${du(target)})`);
  }
}
packStatic("galeri", join(DESKTOP, "galeri"));

// SIGNAL
{
  const src = existsSync(join(DESKTOP, "adsız klasör", "signal", "index.html"))
    ? join(DESKTOP, "adsız klasör", "signal")
    : join(OUT, "signal");
  if (src !== join(OUT, "signal")) {
    packStatic("signal", src);
  } else {
    console.log("\n→ signal (keep existing)");
  }
}

// —— Kumrucu: profesyonel static (_legacy shell) + tam public medya
{
  const appDir = join(DESKTOP, "kumrucu");
  const dest = join(OUT, "kumrucu");
  const legacy = join(appDir, "_legacy");
  console.log(`\n→ kumrucu  ← _legacy + full public`);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(join(dest, "public"), { recursive: true });
  for (const f of ["index.html", "styles.css", "scrub.js", "site.js"]) {
    const p = join(legacy, f);
    if (existsSync(p)) cpSync(p, join(dest, f));
  }
  const pub = join(appDir, "public");
  if (existsSync(pub)) copyFull(pub, join(dest, "public"));
  console.log(`  OK kumrucu (${du(dest)})`);
}

// —— Junesun: canlı profesyonel site (Next e-ticaret) — portal iframe ile
// Yerelde hafif showcase değil; sites.ts → https://www.junesun.com.tr
{
  const dest = join(OUT, "junesun");
  console.log(`\n→ junesun  ← redirect shell → junesun.com.tr`);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  writeFileSync(
    join(dest, "index.html"),
    `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=https://www.junesun.com.tr" />
  <title>Junesun</title>
  <script>location.replace("https://www.junesun.com.tr");</script>
</head>
<body style="margin:0;background:#0c0b0a;color:#f4efe8;font-family:system-ui;display:grid;place-items:center;min-height:100svh">
  <p><a href="https://www.junesun.com.tr" style="color:inherit">Junesun demosuna git →</a></p>
</body>
</html>`
  );
  console.log("  OK junesun → live URL (sites.ts iframe)");
}

console.log("\n=== sizes ===");
for (const slug of ["burger", "insaat", "galeri", "kumrucu", "junesun", "signal"]) {
  const d = join(OUT, slug);
  if (existsSync(d)) console.log(`  ${slug}: ${du(d)}`);
}
console.log("\nDone.\n");
