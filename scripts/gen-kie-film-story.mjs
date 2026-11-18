#!/usr/bin/env node
/**
 * Narrative Kling film chains (head-frame continuity, one verified stage at a time).
 *
 *   node scripts/gen-kie-film-story.mjs --only sapa,leaft --side pc|mob|both --upto 1 [--encode]
 *
 * - shot 1 head = site still; shot N head = LAST frame of shot N-1 (no visible cut).
 * - --upto N generates shots 1..N (existing files are skipped, so credits are never re-spent).
 * - --encode concatenates s01..s03 into assets/kie-scrub/film-{pc,mob}.mp4 (all-intra, scrub friendly).
 * kling/v2-1-pro: ~88 credits per 5s shot; failed jobs are not charged.
 */
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KIE = path.join(ROOT, "scripts/kie.mjs");
const FF = execFileSync("python3", ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"], { encoding: "utf8" }).trim();
const NEG = "no text, no watermark, no people close to camera, no cut, no scene change";

const STORY = {
  sapa: {
    pc: { head: "pc/03.jpg", p: [
      "SKIP-existing-pilot",
      "The camera continues forward and glides through the glass entrance doors into the grand marble lobby with a crystal chandelier and warm light, one steady uninterrupted forward dolly, photoreal luxury residence film",
      "The camera keeps moving forward past the reception desk and through a warm corridor into a bright luxury apartment living room with floor-to-ceiling windows overlooking the city skyline, smooth gimbal walkthrough, photoreal",
    ] },
    mob: { head: "mob/01.jpg", p: [
      "Smooth cinematic drone flight: the camera flies forward and descends toward the base and entrance of the tall residential tower, golden hour light, steady uninterrupted move, photoreal architecture film",
      "The camera continues forward and glides through the glass entrance doors into the grand marble lobby with warm light, one steady uninterrupted forward dolly, photoreal luxury residence film",
      "The camera keeps moving forward through a warm corridor into a bright luxury apartment living room with floor-to-ceiling windows overlooking the city skyline, smooth gimbal walkthrough, photoreal",
    ] },
  },
  leaft: {
    both: { head: "01.jpg", p: [
      "Slow cinematic dolly forward along the stone path beside the still reflective pond, birch trees swaying gently in daylight, steady uninterrupted move, photoreal landscape architecture film",
      "The camera keeps gliding forward toward the dark timber house; daylight softly fades into golden hour, then blue dusk, the house windows begin to glow warm, steady uninterrupted move, photoreal",
      "The camera continues toward the house as dusk deepens into night, the fire bowl flame and warm windows glow, ripples on the pond, steady uninterrupted move, photoreal",
    ] },
  },
  bold: {
    both: { head: "01.jpg", p: [
      "Slow cinematic glide across still water toward the sculptural curved landmark building at deep blue night, warm light glowing through its façade, mirror reflections, steady uninterrupted move, photoreal architecture film",
      "The camera continues gliding around the building while dawn breaks: the sky shifts from deep blue to soft pink and gold, reflections brighten, steady uninterrupted move, photoreal",
      "The camera continues past the building as the sun climbs, golden light fading into clear daylight, steady uninterrupted move, photoreal",
      "The camera keeps gliding as full bright midday daylight arrives: clear blue sky with soft white clouds, crisp white curved architecture, sparkling reflection in the water, steady uninterrupted move, photoreal",
    ] },
  },
  retro: {
    both: { head: "01.jpg", p: [
      "Slow cinematic dolly forward over the sunken conversation pit of a warm mid-century lounge, golden sunlight through large windows, velvet cushions and brass details, steady uninterrupted move, photoreal interior film",
      "The camera glides sideways revealing the heavy wooden table, shelving and indoor plants, warm tungsten and sun light, steady uninterrupted move, photoreal interior film",
      "The camera drifts toward the big windows with the hills outside and the orange pendant lamp, sunset light deepening, steady uninterrupted move, photoreal interior film",
    ] },
  },
  peak: {
    both: { head: "01.jpg", p: [
      "Slow cinematic dolly along a floor-to-ceiling window of a high-rise apartment, city lights twinkling at dusk, warm lamp glow, steady uninterrupted move, photoreal interior film",
      "The camera turns smoothly into the calm bedroom with natural linen bedding and a timber armchair, soft daylight through sheer curtains, steady uninterrupted move, photoreal interior film",
      "The camera glides on into the neutral living room with a low sofa, plant and pendant lamp, soft light, steady uninterrupted move, photoreal interior film",
    ] },
  },
};

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes(n);
const only = (arg("--only", Object.keys(STORY).join(","))).split(",");
const sideArg = arg("--side", "both");
const upto = Number(arg("--upto", "1"));

const run = (cmd, args) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  let err = "";
  p.stdout.on("data", (d) => process.stdout.write(d));
  p.stderr.on("data", (d) => { err += d; });
  p.on("exit", (c) => (c === 0 ? res() : rej(new Error(err.slice(-300) || "exit " + c))));
});
const ok = (f) => fs.existsSync(f) && fs.statSync(f).size > 100000;

async function lastFrame(mp4, out) {
  await run(FF, ["-y", "-sseof", "-0.08", "-i", mp4, "-frames:v", "1", "-q:v", "2", out]);
}

async function chain(slug, side) {
  const cfg = STORY[slug][side] || STORY[slug].both;
  const scrub = path.join(ROOT, `public/demos/moos-${slug}/assets/kie-scrub`);
  const dir = path.join(scrub, "_story", side);
  fs.mkdirSync(dir, { recursive: true });
  const headStill = path.join(scrub, side === "pc" ? "pc" : "mob", path.basename(cfg.head));
  const headSrc = cfg.head.includes("/") ? path.join(scrub, cfg.head) : headStill;
  for (let i = 1; i <= Math.min(upto, cfg.p.length); i++) {
    const out = path.join(dir, `s0${i}.mp4`);
    const last = path.join(dir, `l0${i}.jpg`);
    if (ok(out)) { if (!fs.existsSync(last)) await lastFrame(out, last); continue; }
    const head = i === 1 ? headSrc : path.join(dir, `l0${i - 1}.jpg`);
    if (!fs.existsSync(head)) throw new Error("missing head " + head);
    // downscale head to 1920 on the long side (Kie rejects/chokes on huge heads)
    const small = path.join(dir, `h0${i}.jpg`);
    await run(FF, ["-y", "-i", head, "-vf", "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease", "-q:v", "2", small]);
    console.log(`>>> ${slug} ${side} shot ${i}`);
    let done = false;
    for (let a = 0; a < 2 && !done; a++) {
      try {
        await run("node", [KIE, "shot", `${cfg.p[i - 1]}. ${NEG}`, small, out, "--dur", "5"]);
        done = ok(out);
      } catch (e) { console.log("fail", e.message.slice(0, 160)); try { fs.unlinkSync(out); } catch {} }
    }
    if (!done) throw new Error(`${slug} ${side} shot ${i} failed`);
    // guard: portrait for mob, landscape for pc (catches crossed uploads before more credits are spent)
    const info = await new Promise((r) => { const p = spawn(FF, ["-i", out]); let e = ""; p.stderr.on("data", (d) => (e += d)); p.on("exit", () => r(e)); });
    const m = info.match(/Video:.*?, (\d+)x(\d+)/);
    if (m && (side === "pc") !== (Number(m[1]) > Number(m[2]))) { fs.unlinkSync(out); throw new Error(`${slug} ${side} shot ${i}: wrong orientation ${m[1]}x${m[2]}`); }
    await lastFrame(out, last);
  }
}

async function encode(slug, side) {
  const cfg = STORY[slug][side] || STORY[slug].both;
  const scrub = path.join(ROOT, `public/demos/moos-${slug}/assets/kie-scrub`);
  const dir = path.join(scrub, "_story", side);
  const [w, h] = side === "pc" ? [1920, 1080] : [720, 1280];
  const crf = side === "pc" ? "24" : "21";
  const tmp = `/tmp/izden_story_${slug}_${side}`;
  fs.mkdirSync(tmp, { recursive: true });
  const lines = [];
  for (let i = 1; i <= cfg.p.length; i++) {
    const src = path.join(dir, `s0${i}.mp4`);
    if (!ok(src)) throw new Error("missing " + src);
    const norm = path.join(tmp, `0${i}.mp4`);
    await run(FF, ["-y", "-i", src, "-vf", `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},fps=24`,
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-g", "1", "-keyint_min", "1", "-sc_threshold", "0", "-bf", "0",
      "-preset", "medium", "-crf", crf, "-an", "-movflags", "+faststart", norm]);
    lines.push(`file '${norm}'`);
  }
  fs.writeFileSync(path.join(tmp, "list.txt"), lines.join("\n") + "\n");
  const out = path.join(scrub, `film-${side}.mp4`);
  if (fs.existsSync(out) && !fs.existsSync(out + ".bak-pre-story")) fs.copyFileSync(out, out + ".bak-pre-story");
  await run(FF, ["-y", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"), "-c", "copy", "-movflags", "+faststart", out]);
  console.log("wrote", out, (fs.statSync(out).size / 1e6).toFixed(1) + "MB");
}

const jobs = [];
for (const s of only) for (const side of sideArg === "both" ? ["pc", "mob"] : [sideArg]) jobs.push([s, side]);
await Promise.all(jobs.map(async ([s, side]) => {
  try { has("--encode") ? await encode(s, side) : await chain(s, side); }
  catch (e) { console.log("JOB FAIL", s, side, e.message); }
}));
console.log("DONE");
