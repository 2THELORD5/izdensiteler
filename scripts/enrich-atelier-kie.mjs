#!/usr/bin/env node
/**
 * Batch Kie stills for atelier catalogs (PC 4:5 editorial).
 * Usage: node scripts/enrich-atelier-kie.mjs
 */
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve("public/demos");
const KIE = path.resolve("scripts/kie.mjs");

const JOBS = [
  // NOIR — product catalog
  { dir: "atelier-noir", out: "catalog-01.jpg", ar: "3:4", ref: "bottle.jpg",
    prompt: "Luxury niche perfume NOIR 01 matte black geometric flacon upright on black stone, soft oxblood rim light, photoreal editorial, no text no logo" },
  { dir: "atelier-noir", out: "catalog-02.jpg", ar: "3:4", ref: "bottle.jpg",
    prompt: "Luxury perfume NOIR 02 amber glass flacon on dark velvet, warm ember glow, dried rose petal, photoreal, no text no logo" },
  { dir: "atelier-noir", out: "catalog-03.jpg", ar: "3:4", ref: "pack.jpg",
    prompt: "Luxury perfume coffret open leather sleeve travel atomiser matte black, dark atelier table, photoreal, no text no logo" },
  { dir: "atelier-noir", out: "notes.jpg", ar: "1:1", ref: "notes.jpg",
    prompt: "Olfactive materials flatlay: rose absolute, iris root, incense tears, pink pepper on black slate, luxury perfume atelier, photoreal, no text" },
  { dir: "atelier-noir", out: "ritual.jpg", ar: "3:4", ref: "ritual.jpg",
    prompt: "Close-up wrist pulse point perfume mist in low warm light, dark elegant bathroom marble, photoreal cinematic, no face, no text" },

  // LUMEN
  { dir: "atelier-lumen", out: "catalog-01.jpg", ar: "3:4", ref: "look-01.jpg",
    prompt: "Editorial womenswear bone coat in vertical glass lobby, steel and marble, fashion lookbook, photoreal, no text no logo" },
  { dir: "atelier-lumen", out: "catalog-02.jpg", ar: "3:4", ref: "look-02.jpg",
    prompt: "Editorial womenswear steel-grey layered look on city terrace dusk, fashion photography, photoreal, no text" },
  { dir: "atelier-lumen", out: "catalog-03.jpg", ar: "3:4", ref: "fabric.jpg",
    prompt: "Macro double-face wool fabric bone and steel weave, luxury textile detail, photoreal, no text" },

  // KOR
  { dir: "atelier-kor", out: "catalog-01.jpg", ar: "3:4", ref: "plate.jpg",
    prompt: "Open fire kitchen plated dish on charred wood board, ember glow, Karakoy night restaurant, photoreal food, no text" },
  { dir: "atelier-kor", out: "catalog-02.jpg", ar: "3:4", ref: "grill.jpg",
    prompt: "Close-up charcoal grill flames and skewers, dramatic restaurant kitchen, photoreal, no text" },
  { dir: "atelier-kor", out: "catalog-03.jpg", ar: "3:4", ref: "night.jpg",
    prompt: "Moody open-fire restaurant dining room night Karakoy, low warm light iron tables, photoreal interior, no text" },

  // Seven
  { dir: "atelier-meridian", out: "catalog-01.jpg", ar: "3:4", ref: "facade.jpg",
    prompt: "Coastal modern architecture facade at blue hour, salt air concrete and glass, photoreal, no text" },
  { dir: "atelier-meridian", out: "catalog-02.jpg", ar: "3:4", ref: "cliff.jpg",
    prompt: "Cliffside terrace architecture overlooking sea horizon, dusk, photoreal, no text" },
  { dir: "atelier-velvet", out: "catalog-01.jpg", ar: "3:4", ref: "cellar.jpg",
    prompt: "Wine cellar limestone vault barrels candlelight, luxury tasting room, photoreal, no text" },
  { dir: "atelier-velvet", out: "catalog-02.jpg", ar: "3:4", ref: "pour.jpg",
    prompt: "Red wine pour into crystal glass dark cellar, photoreal macro, no text" },
  { dir: "atelier-atlas", out: "catalog-01.jpg", ar: "3:4", ref: "peak.jpg",
    prompt: "Alpine ridge trail gear laid on rock map and pack, golden hour outdoors, photoreal, no text" },
  { dir: "atelier-atlas", out: "catalog-02.jpg", ar: "3:4", ref: "camp.jpg",
    prompt: "Mountain camp at dawn mist tents and ridgeline, adventure photography, photoreal, no text" },
  { dir: "atelier-solace", out: "catalog-01.jpg", ar: "3:4", ref: "pool.jpg",
    prompt: "Serene spa stone pool steam soft daylight, wellness architecture, photoreal, no text" },
  { dir: "atelier-solace", out: "catalog-02.jpg", ar: "3:4", ref: "stone.jpg",
    prompt: "Spa ritual stones oils linen on warm stone bench, calm wellness still life, photoreal, no text" },
  { dir: "atelier-forge", out: "catalog-01.jpg", ar: "3:4", ref: "roast.jpg",
    prompt: "Specialty coffee roasting drum beans pouring steam, industrial cafe, photoreal, no text" },
  { dir: "atelier-forge", out: "catalog-02.jpg", ar: "3:4", ref: "pour.jpg",
    prompt: "Espresso pour over cup crema close-up dark cafe counter, photoreal, no text" },
  { dir: "atelier-rivet", out: "catalog-01.jpg", ar: "3:4", ref: "gloss.jpg",
    prompt: "Car detailing ceramic gloss reflection on black paint, studio light, photoreal, no text" },
  { dir: "atelier-rivet", out: "catalog-02.jpg", ar: "3:4", ref: "detail.jpg",
    prompt: "Auto detailing wheel and brake caliper clean macro, photoreal, no text" },
  { dir: "atelier-amber", out: "catalog-01.jpg", ar: "3:4", ref: "gold.jpg",
    prompt: "Amber jewelry necklace on dark silk, warm gold light, luxury still life, photoreal, no text" },
  { dir: "atelier-amber", out: "catalog-02.jpg", ar: "3:4", ref: "macro.jpg",
    prompt: "Amber gemstone macro inclusions glowing, jewelry atelier, photoreal, no text" },
];

function run(job) {
  return new Promise((resolve, reject) => {
    const media = path.join(ROOT, job.dir, "media");
    const out = path.join(media, job.out);
    if (fs.existsSync(out) && fs.statSync(out).size > 40_000) {
      console.log("skip existing", `${job.dir}/${job.out}`);
      resolve(out);
      return;
    }
    const ref = path.join(media, job.ref);
    const args = [KIE, "still", job.prompt, out, "--ar", job.ar];
    if (fs.existsSync(ref)) args.push("--ref", ref);
    const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    child.stderr.on("data", (d) => { err += d; process.stderr.write(d); });
    child.stdout.on("data", (d) => process.stdout.write(d));
    child.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`${job.dir}/${job.out} failed: ${err.slice(-400)}`));
    });
  });
}

async function compressJpeg(file) {
  try {
    const { default: sharp } = await import("sharp").catch(() => ({ default: null }));
    if (!sharp) {
      // pillow via python
      await new Promise((res, rej) => {
        const py = spawn("python3", ["-c", `
from PIL import Image
from pathlib import Path
p=Path(${JSON.stringify(file)})
im=Image.open(p).convert('RGB')
w,h=im.size
mx=1400
if max(w,h)>mx:
  s=mx/max(w,h); im=im.resize((int(w*s),int(h*s)), Image.Resampling.LANCZOS)
tmp=p.with_suffix('.tmp.jpg')
im.save(tmp,'JPEG',quality=84,optimize=True,progressive=True)
tmp.replace(p)
print(p, p.stat().st_size)
`]);
        py.on("close", (c) => (c === 0 ? res() : rej(new Error("pillow fail"))));
      });
      return;
    }
  } catch {}
}

async function main() {
  const concurrency = 2;
  const queue = [...JOBS];
  let ok = 0;
  let fail = 0;
  async function worker() {
    while (queue.length) {
      const job = queue.shift();
      const label = `${job.dir}/${job.out}`;
      try {
        console.log("\n===", label, "===");
        const out = await run(job);
        await compressJpeg(out).catch(() => {});
        ok++;
        console.log("OK", label);
      } catch (e) {
        fail++;
        console.error("FAIL", label, e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`\nDone ok=${ok} fail=${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
