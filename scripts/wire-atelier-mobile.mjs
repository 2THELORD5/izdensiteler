#!/usr/bin/env node
/**
 * Wire hero-mob.jpg into atelier demos + inject mobile polish CSS.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEMOS = path.join(ROOT, "public/demos");

const picture = (pc = "media/hero.jpg", mob = "media/hero-mob.jpg") =>
  `<picture>
          <source media="(max-width:900px)" srcset="${mob}" />
          <img src="${pc}" alt="" width="1920" height="1280" fetchpriority="high" />
        </picture>`;

const MOBILE_CSS_HREF = "/demos/_shared/izden-atelier-mobile.css";

for (const name of fs.readdirSync(DEMOS)) {
  if (!name.startsWith("atelier-")) continue;
  const dir = path.join(DEMOS, name);
  const index = path.join(dir, "index.html");
  const mob = path.join(dir, "media/hero-mob.jpg");
  if (!fs.existsSync(index) || !fs.existsSync(mob)) {
    console.log("skip", name);
    continue;
  }
  let html = fs.readFileSync(index, "utf8");

  // Replace plain hero img (not already in picture)
  html = html.replace(
    /<(div|figure)([^>]*class="[^"]*hero__(?:media|split-media|stack-media|rail-media|mast-media)[^"]*"[^>]*)>\s*<img src="media\/hero\.jpg"[^>]*>\s*<\/\1>/g,
    (_, tag, attrs) =>
      `<${tag}${attrs}>\n        ${picture()}\n      </${tag}>`
  );

  // Simpler fallback: any remaining bare hero.jpg in hero sections
  if (!html.includes("hero-mob.jpg")) {
    html = html.replace(
      /(<div class="hero__media[^"]*"[^>]*>)\s*<img src="media\/hero\.jpg"[^>]*>/,
      `$1\n        ${picture()}`
    );
  }

  if (!html.includes("izden-atelier-mobile.css")) {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="stylesheet" href="${MOBILE_CSS_HREF}" />\n</head>`
    );
  }

  fs.writeFileSync(index, html);
  console.log("wired", name, html.includes("hero-mob.jpg") ? "OK" : "CHECK");
}
