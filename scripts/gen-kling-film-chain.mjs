#!/usr/bin/env node
/**
 * Build continuous Kling film chains for moos scrub sites.
 *   node scripts/gen-kling-film-chain.mjs [--only grids,blok] [--side pc|mob|both] [--concurrency 1]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const KIE = path.join(ROOT, "scripts/kie.mjs");
const LOG = fs.createWriteStream("/tmp/izden-kling-chain.log", { flags: "a" });
const log = (...a) => {
  const line = a.map(String).join(" ");
  console.log(line);
  LOG.write(line + "\n");
};

const PROMPTS = {
  grids:
    "Slow cinematic camera push into organic tiled architecture at dusk, warm interior glow through curved slit windows, smooth continuous dolly, photoreal architectural film",
  kstudio:
    "Slow cinematic orbit around modern villa facade, soft golden hour light, glass reflections, continuous camera move, photoreal architecture film",
  greenit:
    "Slow cinematic glide through lush Dubai garden landscape, soft daylight through foliage, water and stone paths, continuous camera, photoreal landscape film",
  blok:
    "Slow cinematic studio camera push toward architectural scale model on dark table, dramatic rim light, continuous move, photoreal model-making film",
  niche:
    "Slow cinematic pan across luxury interior materials and room composition, soft natural window light, continuous camera, photoreal interior film",
  trio:
    "Slow cinematic glide through luxury landscaped garden with sculpted hedges and soft dusk light, continuous camera, photoreal landscape film",
  ores:
    "Slow cinematic push through calm luxury living room, soft dawn light across linen and oak, continuous camera, photoreal interior film",
  sapa:
    "Slow cinematic drone-like push toward luxury waterfront residence complex, soft daylight, landscaped courtyards, continuous camera, photoreal architecture film",
  leaft:
    "Slow cinematic glide along landscaped garden path, native plants and stone edges, soft daylight to dusk feel, continuous camera, photoreal landscape film",
  bold:
    "Slow cinematic approach toward mirrored landmark architecture over still water at dusk, continuous camera, photoreal architecture film",
  retro:
    "Slow cinematic pan through warm mid-century inspired lounge, velvet and brass details, tungsten light, continuous camera, photoreal interior film",
  peak:
    "Slow cinematic pan across modern apartment interior with city dusk through glass, continuous camera, photoreal interior film",
};

const SOFT = ["grids", "kstudio", "greenit", "blok", "niche", "trio"];

function flag(argv, name, dflt = null) {
  const i = argv.indexOf(name);
  return i > -1 && argv[i + 1] ? argv[i + 1] : dflt;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], cwd: ROOT });
    let err = "";
    p.stdout.on("data", (d) => process.stdout.write(d));
    p.stderr.on("data", (d) => {
      process.stderr.write(d);
      err += d.toString();
    });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(err.slice(-400) || `exit ${code}`))));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ffExe() {
  return execFileSync("python3", ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"], {
    encoding: "utf8",
  }).trim();
}

async function encodeFilm(slug, side, shots, w, h) {
  const FF = await ffExe();
  const scrub = path.join(ROOT, `public/demos/moos-${slug}/assets/kie-scrub`);
  const tmp = `/tmp/izden_kling_${slug}_${side}`;
  fs.mkdirSync(tmp, { recursive: true });
  const list = path.join(tmp, "list.txt");
  const lines = [];
  for (let i = 0; i < shots.length; i++) {
    if (!fs.existsSync(shots[i]) || fs.statSync(shots[i]).size < 100000) {
      throw new Error(`missing shot ${shots[i]}`);
    }
    const norm = path.join(tmp, `${String(i + 1).padStart(2, "0")}.mp4`);
    await run(FF, [
      "-y", "-i", shots[i],
      "-vf", `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},fps=30`,
      "-c:v", "libx264", "-pix_fmt", "yuv420p",
      "-g", "1", "-keyint_min", "1", "-sc_threshold", "0", "-bf", "0",
      "-preset", "medium", "-crf", "19", "-an", "-movflags", "+faststart",
      norm,
    ]);
    lines.push(`file '${norm}'`);
  }
  fs.writeFileSync(list, lines.join("\n") + "\n");
  const out = path.join(scrub, `film-${side}.mp4`);
  await run(FF, ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out]);
  log("Wrote", out, fs.statSync(out).size);
}

async function genShot(head, out, prompt) {
  if (fs.existsSync(out) && fs.statSync(out).size > 100000) {
    log("skip existing", out);
    return;
  }
  const attempts = [
    [KIE, "shot", `${prompt}. Slow continuous camera move, photoreal, no text.`, head, out, "--dur", "5"],
    [KIE, "shot", `${prompt}. Gentle push-in, photoreal architecture, no text.`, head, out, "--dur", "5"],
  ];
  let lastErr;
  for (let a = 0; a < attempts.length; a++) {
    try {
      log("shot attempt", a + 1, path.basename(out));
      await run("node", attempts[a]);
      if (fs.existsSync(out) && fs.statSync(out).size > 100000) return;
    } catch (e) {
      lastErr = e;
      log("shot fail", e.message.slice(0, 200));
      try { fs.unlinkSync(out); } catch {}
      await sleep(10000);
    }
  }
  throw lastErr || new Error("shot failed");
}

async function genSide(slug, side) {
  const scrub = path.join(ROOT, `public/demos/moos-${slug}/assets/kie-scrub`);
  const dir = path.join(scrub, side === "pc" ? "pc" : "mob");
  const shotDir = path.join(scrub, "_kling", side);
  fs.mkdirSync(shotDir, { recursive: true });
  const prompt = PROMPTS[slug] || PROMPTS.ores;
  const outs = [];
  for (let i = 1; i <= 3; i++) {
    const head = path.join(dir, `0${i}.jpg`);
    const out = path.join(shotDir, `shot-0${i}.mp4`);
    outs.push(out);
    log(`\n>>> ${slug} ${side} shot ${i}/3`);
    await genShot(head, out, prompt);
  }
  const wh = side === "pc" ? [1920, 1080] : [1080, 1920];
  await encodeFilm(slug, side, outs, wh[0], wh[1]);
}

async function pool(items, concurrency, fn) {
  const q = [...items];
  const workers = Array.from({ length: concurrency }, async () => {
    while (q.length) {
      const item = q.shift();
      try {
        await fn(item);
      } catch (e) {
        log("JOB FAIL", item.slug, item.side, e.message.slice(0, 300));
      }
    }
  });
  await Promise.all(workers);
}

const argv = process.argv.slice(2);
const only = flag(argv, "--only", SOFT.join(","))
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const sideArg = flag(argv, "--side", "both");
const sides = sideArg === "both" ? ["pc", "mob"] : [sideArg];
const concurrency = Math.max(1, Number(flag(argv, "--concurrency", "1")));

const jobs = [];
for (const slug of only) for (const side of sides) jobs.push({ slug, side });
log("Jobs", jobs.length, "concurrency", concurrency, new Date().toISOString());

await pool(jobs, concurrency, async ({ slug, side }) => genSide(slug, side));
log("CHAIN DONE", new Date().toISOString());
LOG.end();
