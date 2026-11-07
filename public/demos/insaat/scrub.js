/**
 * FORMA — house film scrub. One HQ video.
 * film-house-v9 build (site→frame→shell) + KIE curtain pair + v9 dusk.
 * 1920×1080, short-GOP, high bitrate — no quality crush.
 * Odalar sticky below is separate (site.js).
 */
const IS_MOBILE =
  typeof matchMedia === "function" &&
  matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches;
/* Desktop HQ; mobile 720p all-intra — no 59MB RAM blob. */
const SRC = IS_MOBILE
  ? "./public/film-house-scrub-mobile.mp4?v=hq1280"
  : "./public/film-house-scrub.mp4?v=cut25";
const FPS = 30;
const MAX_DPR = IS_MOBILE ? 1.15 : 2;

/* Seconds: build → entry perde → living perde → kitchen → bedroom → dusk
 * Morph bleed (living→kitchen) removed; all-intra for scrub seeks. */
const ACTS = [
  { t: 0.0, act: "01 — Arrival", title: "The Site", body: "Boş arazi. İlk beton. Işık henüz yok.", idx: "01 / 05", rail: "Arrival" },
  { t: 2.1, act: "02 — Frame", title: "The Skeleton", body: "Çelik yükselir. Oranlar kilitlenir.", idx: "02 / 05", rail: "Frame" },
  { t: 6.8, act: "03 — Skin", title: "The Shell", body: "Taş, cam, yürüyüş. Cephe giyinir.", idx: "03 / 05", rail: "Skin" },
  { t: 9.43, act: "04 — Rooms", title: "Inside", body: "Perde, mutfak, yatak odası.", idx: "04 / 05", rail: "Rooms" },
  { t: 22.23, act: "05 — Dusk", title: "Blue Hour", body: "Bitmiş villa. Su aynası. Mavi saat.", idx: "05 / 05", rail: "Dusk" },
];
const NOMINAL_DURATION = 25.23;
ACTS.forEach((a) => (a.at = a.t / NOMINAL_DURATION));

/* Desktop 1:1; mobile slight ease so decoder keeps up. */
const FOLLOW = IS_MOBILE ? 0.55 : 1;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const video = document.getElementById("v");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false });
const track = document.getElementById("track");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
const loaderText = loader?.querySelector("p");
const progressEl = document.getElementById("progress");
const nav = document.getElementById("nav");
const hint = document.getElementById("hint");
const actEl = document.getElementById("act");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const chapterIdx = document.getElementById("chapterIdx");
const railLabel = document.getElementById("railLabel");
const stageUi = document.querySelector(".stage-ui");
const manifesto = document.getElementById("manifesto");

let duration = NOMINAL_DURATION;
let ready = false;
let shownP = -1;
let pendingTime = null;
let lastSeekTime = -1;
let dirty = true;
let activeAct = -1;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = IS_MOBILE ? "medium" : "high";
    dirty = true;
  }
}

function paint() {
  if (!ready || video.readyState < 2) return;
  resize();
  const cw = canvas.width;
  const ch = canvas.height;
  const iw = video.videoWidth || 1280;
  const ih = video.videoHeight || 720;
  const s = Math.max(cw / iw, ch / ih);
  const w = iw * s;
  const h = ih * s;
  ctx.drawImage(video, (cw - w) / 2, (ch - h) / 2, w, h);
  dirty = false;
}

/* Aim inside the frame, never on its boundary, so the decoder can't round to the neighbour. */
function frameTime(p) {
  const frames = Math.max(1, Math.round(duration * FPS));
  const i = Math.min(frames - 1, Math.round(p * (frames - 1)));
  return (i + 0.25) / FPS;
}

/* Latest-wins: while a seek is in flight only the newest target is kept. */
function seekTo(t) {
  if (t === lastSeekTime && pendingTime === null) return;
  if (video.seeking) {
    pendingTime = t;
    return;
  }
  pendingTime = null;
  lastSeekTime = t;
  video.currentTime = t;
}

video.addEventListener("seeked", () => {
  dirty = true;
  if (pendingTime !== null) {
    const t = pendingTime;
    pendingTime = null;
    if (t !== lastSeekTime) {
      lastSeekTime = t;
      video.currentTime = t;
    }
  }
});

if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
  const onFrame = () => {
    paint();
    video.requestVideoFrameCallback(onFrame);
  };
  video.requestVideoFrameCallback(onFrame);
}

function actFromP(p) {
  let idx = 0;
  for (let i = 0; i < ACTS.length; i++) if (p >= ACTS[i].at - 1e-6) idx = i;
  return idx;
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
  if (chapterIdx) chapterIdx.textContent = a.idx;
  if (railLabel) railLabel.textContent = a.rail || a.title;
  document.querySelectorAll("#chapterNav [data-seek]").forEach((btn, n) => {
    btn.classList.toggle("is-on", n === i);
  });
}

function scrollRange() {
  const total = Math.max(1, track.offsetHeight - (innerHeight || 1));
  const top = track.getBoundingClientRect().top + scrollY;
  return { top, total };
}

function readProgress() {
  const { top, total } = scrollRange();
  return clamp((scrollY - top) / total);
}

function syncUI(p) {
  if (progressEl) progressEl.style.width = `${(p * 100).toFixed(2)}%`;
  setAct(actFromP(p));
  hint?.classList.toggle("is-hide", p > 0.02);
  const onBelow = manifesto && manifesto.getBoundingClientRect().top < innerHeight * 0.55;
  nav?.classList.toggle("is-solid", p > 0.92 || onBelow);
}

document.getElementById("chapterNav")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-seek]");
  if (!btn || !track) return;
  const { top, total } = scrollRange();
  scrollTo({ top: Math.ceil(top + Number(btn.dataset.seek) * total), behavior: "auto" });
});

function tick() {
  const target = readProgress();
  if (shownP < 0) shownP = target;
  else {
    shownP += (target - shownP) * FOLLOW;
    if (Math.abs(target - shownP) < 0.0004) shownP = target;
  }
  syncUI(target);
  if (ready) seekTo(frameTime(shownP));
  if (dirty) paint();
  requestAnimationFrame(tick);
}

/* Whole file into memory first: every seek is then a local decode, no range requests. */
async function loadBlob() {
  const res = await fetch(SRC, { cache: "force-cache" });
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
    if (total) {
      const t = got / total;
      if (loaderBar) loaderBar.style.width = `${(t * 100).toFixed(1)}%`;
      if (loaderText) loaderText.textContent = `House film yükleniyor — ${Math.round(t * 100)}%`;
    }
  }
  return URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
}

function attach(src) {
  return new Promise((resolve) => {
    const done = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
      ready = true;
      dirty = true;
      resolve();
    };
    video.addEventListener("loadeddata", done, { once: true });
    video.addEventListener("error", resolve, { once: true });
    video.src = src;
    video.load();
  });
}

async function boot() {
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  resize();
  ctx.fillStyle = "#0c0b0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  setAct(0);
  requestAnimationFrame(tick);

  const hardStop = setTimeout(() => loader?.classList.add("is-done"), 25000);
  let src = SRC;
  // Compact mobile encode (~11MB) + desktop HQ: blob so seeks never wait on network.
  try {
    if (loaderText) {
      loaderText.textContent = IS_MOBILE
        ? "House film yükleniyor…"
        : "House film yükleniyor…";
    }
    src = await loadBlob();
  } catch (err) {
    console.warn("FORMA scrub: blob load failed, streaming instead", err);
  }
  await attach(src);
  clearTimeout(hardStop);
  lastSeekTime = -1;
  loader?.classList.add("is-done");

  addEventListener("resize", () => (dirty = true));
}

boot();
