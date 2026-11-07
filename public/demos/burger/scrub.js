/**
 * Continuous Kling film scrubbed by scroll (smooth forward + rewind).
 */
/* Grill ticket voice — deliberately NOT cafe poetry */
const ACTS = [
  { at: 0.0, act: "STEP 01 / GRILL", title: "SOĞUK PATTİ", body: "Tezgâh temiz. Ateş açık. Smash sırada." },
  { at: 0.14, act: "STEP 02 / PRESS", title: "DANTELLİ KENAR", body: "Spatula bastırır. Yağ cızırdar. Maillard." },
  { at: 0.30, act: "STEP 03 / BUILD", title: "KATMAN SIRASI", body: "Ekmek · turşu · cheddar · et. Hızlı montaj." },
  { at: 0.52, act: "STEP 04 / MELT", title: "CHEDDAR KAPLAR", body: "Kapak kapanır. 12 saniye buhar. Eriyen sarı." },
  { at: 0.74, act: "STEP 05 / PLATE", title: "TEZGÂHA DÜŞER", body: "Sıcak. Ağır. İsmini söyleyen alır." },
  { at: 0.90, act: "STEP 06 / ORDER", title: "SENİN SIRAN", body: "Boy seç. Sos ekle. Sepete at." },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const video = document.getElementById("v");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false });
const track = document.getElementById("track");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
const progressEl = document.getElementById("progress");
const nav = document.getElementById("nav");
const hint = document.getElementById("hint");
const actEl = document.getElementById("act");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const stageUi = document.querySelector(".stage-ui");

let duration = 0;
let ready = false;
let seeking = false;
let pending = null;
let lastApplied = -1;
let targetP = 0;
let currentP = 0;
let velocity = 0;
let activeAct = -1;
const SEEK_EPS = 0.008;
const IS_MOBILE =
  typeof matchMedia === "function" &&
  matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches;
const MAX_DPR = IS_MOBILE ? 1.25 : 2;
const SEEK_EPS_LIVE = IS_MOBILE ? 0.02 : SEEK_EPS;

/* Prefer 720 all-intra for reliable scroll-scrub (Safari + mobile). */
video.preload = "auto";
video.muted = true;
video.playsInline = true;
video.setAttribute("playsinline", "");
video.setAttribute("webkit-playsinline", "");
video.src = IS_MOBILE
  ? "./public/film-full-mobile.mp4?v=hq720"
  : "./public/film-full-720.mp4?v=intra1";

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function paint() {
  if (!ready || video.readyState < 1 || !video.videoWidth) return;
  resize();
  const cw = canvas.width;
  const ch = canvas.height;
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const s = Math.max(cw / vw, ch / vh);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(video, (cw - vw * s) / 2, (ch - vh * s) / 2, vw * s, vh * s);
}

function setAct(i) {
  if (i === activeAct) return;
  activeAct = i;
  const a = ACTS[i];
  stageUi?.classList.remove("is-swap");
  void stageUi?.offsetWidth;
  stageUi?.classList.add("is-swap");
  actEl.textContent = a.act;
  titleEl.textContent = a.title;
  bodyEl.textContent = a.body;
}

function actFromP(p) {
  let idx = 0;
  for (let i = 0; i < ACTS.length; i++) if (p >= ACTS[i].at) idx = i;
  return idx;
}

function readProgress() {
  const vh = innerHeight || 1;
  const total = Math.max(1, track.offsetHeight - vh);
  return clamp(-track.getBoundingClientRect().top / total);
}

function seek(t) {
  if (!ready || !Number.isFinite(t) || duration <= 0) return;
  const next = clamp(t, 0, Math.max(0, duration - 0.04));
  if (Math.abs(next - lastApplied) < SEEK_EPS_LIVE && Math.abs(next - video.currentTime) < SEEK_EPS_LIVE * 1.5) {
    paint();
    return;
  }
  if (seeking) {
    pending = next;
    return;
  }
  seeking = true;
  lastApplied = next;
  try {
    video.currentTime = next;
  } catch {
    seeking = false;
    return;
  }
  // Fallback if seeked never fires (some Safari builds)
  clearTimeout(seek.timer);
  seek.timer = setTimeout(() => {
    if (!seeking) return;
    seeking = false;
    paint();
    flushPending();
  }, 120);
}

function flushPending() {
  if (pending == null) return;
  const p = pending;
  pending = null;
  seek(p);
}

video.addEventListener("seeked", () => {
  seeking = false;
  clearTimeout(seek.timer);
  paint();
  flushPending();
});

function syncUI(p) {
  progressEl.style.width = `${p * 100}%`;
  setAct(actFromP(p));
  hint.style.opacity = p > 0.02 && p < 0.92 ? "0.45" : "0";
  const onMenu = document.getElementById("menu").getBoundingClientRect().top < innerHeight * 0.55;
  nav.classList.toggle("is-light", p > 0.92 || onMenu);
}

/** Critically damped-ish follow — smoother than fixed lerp, less lag on reverse. */
function smoothFollow(cur, target, vel, dt) {
  const stiffness = 18;
  const damping = 2 * Math.sqrt(stiffness);
  const accel = (target - cur) * stiffness - vel * damping;
  vel += accel * dt;
  cur += vel * dt;
  if (Math.abs(target - cur) < 0.00015 && Math.abs(vel) < 0.00015) {
    return [target, 0];
  }
  return [cur, vel];
}

async function loadFilmBlob() {
  const res = await fetch(video.currentSrc || video.src, { cache: "force-cache" });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (total && loaderBar) {
      loaderBar.style.width = `${Math.min(99, (got / total) * 100).toFixed(1)}%`;
    }
  }
  return URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
}

async function boot() {
  try {
    try {
      const blobUrl = await loadFilmBlob();
      video.src = blobUrl;
    } catch (err) {
      console.warn("ANVIL blob failed, streaming", err);
    }

    await new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        duration = Number.isFinite(video?.duration) && video.duration > 0 ? video.duration : 0;
        resolve();
      };
      if (!video) return done();
      if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) done();
      else {
        video.addEventListener("loadedmetadata", done, { once: true });
        video.addEventListener("error", () => {
          console.warn("ANVIL video error", video.error);
          done();
        }, { once: true });
        setTimeout(done, 12000);
      }
      try { video.load(); } catch { done(); }
    });

    // Safari needs a play/pause unlock before canvas scrub frames decode
    try {
      video.pause();
      const p = video.play();
      if (p && typeof p.then === "function") {
        await p.catch(() => {});
      }
      video.pause();
    } catch {}

    try {
      await new Promise((resolve) => {
        const finish = () => resolve();
        video.addEventListener("seeked", finish, { once: true });
        try { video.currentTime = 0.001; } catch { finish(); }
        setTimeout(finish, 800);
      });
    } catch {}

    if (loaderBar) loaderBar.style.width = "100%";
    ready = duration > 0;
    paint();
    if (!ready) {
      const lateFilmRecover = () => {
        if (!(video.duration > 0)) return;
        duration = video.duration;
        ready = true;
        paint();
      };
      video.addEventListener("loadedmetadata", lateFilmRecover);
      video.addEventListener("canplay", lateFilmRecover);
    }
  } catch (err) {
    console.warn("ANVIL boot:", err);
  }
  loader.classList.add("is-done");

  /* Native scroll — Lenis transform breaks sticky and can draw a mid-screen hairline. */
  addEventListener("scroll", () => { targetP = readProgress(); }, { passive: true });
  window.__anvilLenis = null;

  let last = performance.now();
  function raf(time) {
    const dt = Math.min(0.05, (time - last) / 1000);
    last = time;
    [currentP, velocity] = smoothFollow(currentP, targetP, velocity, dt);
    seek(currentP * duration);
    syncUI(currentP);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  addEventListener("resize", () => {
    paint();
    targetP = readProgress();
  });

  targetP = readProgress();
  currentP = targetP;
}

boot();
