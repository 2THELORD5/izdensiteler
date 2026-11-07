/**
 * STRADA — private vault film scrubbed by scroll.
 * Editorial chapter titles: solid + outline (OBSIDIAN language).
 */
const ACTS = [
  {
    at: 0.0,
    act: "Bay 01",
    solid: "Bring it",
    outline: "dark.",
    body: "Obsidian bay. Spot altında S-Class Coupé.",
    idx: "01 / 06",
    dock: 0,
  },
  {
    at: 0.18,
    act: "Bay 01 · Cabin",
    solid: "Open the",
    outline: "door.",
    body: "Kırmızı ambiyans. Yıldız direksiyon. İçeri.",
    idx: "02 / 06",
    dock: 0,
  },
  {
    at: 0.38,
    act: "Cross",
    solid: "Next",
    outline: "bay.",
    body: "Mercedes’ten çık — hemen yandaki M8.",
    idx: "03 / 06",
    dock: 0,
  },
  {
    at: 0.55,
    act: "Bay 02",
    solid: "Alpine",
    outline: "white.",
    body: "M8 Competition. Kidney. Dıştan içeri.",
    idx: "04 / 06",
    dock: 1,
  },
  {
    at: 0.72,
    act: "Bay 02 · Cabin",
    solid: "Carbon",
    outline: "cockpit.",
    body: "Kırmızı LED. Sport koltuk. M dili.",
    idx: "05 / 06",
    dock: 1,
  },
  {
    at: 0.88,
    act: "Vault",
    solid: "Keys",
    outline: "tonight.",
    body: "İki bay. Envanter aşağıda. Randevu açık.",
    idx: "06 / 06",
    dock: 2,
  },
];

const STILLS = [
  "./public/kie/m01-merc-ext.jpg",
  "./public/kie/m02-merc-int.jpg",
  "./public/kie/m03-bmw-ext.jpg",
  "./public/kie/m04-bmw-int.jpg",
  "./public/kie/m05-pullback.jpg",
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

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
const titleSolid = document.getElementById("titleSolid");
const titleOutline = document.getElementById("titleOutline");
const bodyEl = document.getElementById("body");
const chapterIdx = document.getElementById("chapterIdx");
const stageUi = document.querySelector(".stage-ui");
const stageDock = document.getElementById("stageDock");

let duration = 0;
let ready = false;
let seeking = false;
let pending = null;
let lastApplied = -1;
let targetP = 0;
let currentP = 0;
let velocity = 0;
let activeAct = -1;
const IS_PHONE =
  typeof matchMedia === "function" &&
  matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches;
const SEEK_EPS = IS_PHONE ? 0.016 : 0.008;
const FOLLOW_STIFF = IS_PHONE ? 30 : 18;

video.preload = "auto";
video.muted = true;
video.playsInline = true;
video.setAttribute("playsinline", "");
video.setAttribute("webkit-playsinline", "");
const IS_MOBILE_G =
  typeof matchMedia === "function" &&
  matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches;
video.src = IS_MOBILE_G
  ? "./public/film-full-mobile.mp4?v=hq720"
  : "./public/film-full-720.mp4?v=intra1";

const stillImgs = STILLS.map((src) => {
  const im = new Image();
  im.decoding = "async";
  im.src = src;
  return im;
});

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, typeof matchMedia === "function" && matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches ? 1.25 : 2);
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function coverDraw(srcW, srcH, draw) {
  const cw = canvas.width;
  const ch = canvas.height;
  const contain = Math.min(cw / srcW, ch / srcH);
  const cover = Math.max(cw / srcW, ch / srcH);
  // Phone: soft cover — cars stay readable (hard cover halves the subject).
  const s = IS_PHONE ? contain + (cover - contain) * 0.38 : cover;
  ctx.fillStyle = "#070809";
  ctx.fillRect(0, 0, cw, ch);
  draw((cw - srcW * s) / 2, (ch - srcH * s) / 2, srcW * s, srcH * s);
}

function paintStill(p) {
  resize();
  const idx = Math.min(STILLS.length - 1, Math.floor(p * (STILLS.length - 0.001)));
  const im = stillImgs[idx];
  if (!im?.complete || !im.naturalWidth) {
    ctx.fillStyle = "#070809";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  coverDraw(im.naturalWidth, im.naturalHeight, (x, y, w, h) => ctx.drawImage(im, x, y, w, h));
}

function paint() {
  if (!ready || video.readyState < 1 || !video.videoWidth) {
    paintStill(currentP);
    return;
  }
  resize();
  coverDraw(video.videoWidth || 1280, video.videoHeight || 720, (x, y, w, h) =>
    ctx.drawImage(video, x, y, w, h)
  );
}

function setAct(i) {
  if (i === activeAct) return;
  activeAct = i;
  const a = ACTS[i];
  stageUi?.classList.remove("is-swap");
  void stageUi?.offsetWidth;
  stageUi?.classList.add("is-swap");
  if (actEl) actEl.textContent = a.act;
  if (titleSolid) titleSolid.textContent = a.solid;
  if (titleOutline) titleOutline.textContent = a.outline;
  if (bodyEl) bodyEl.textContent = a.body;
  if (chapterIdx) chapterIdx.textContent = a.idx;
  stageDock?.querySelectorAll("button").forEach((btn, n) => {
    btn.classList.toggle("is-on", n === a.dock);
  });
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

function flushPending() {
  if (pending == null) return;
  const p = pending;
  pending = null;
  seek(p);
}

function seek(t) {
  if (!ready || !Number.isFinite(t) || duration <= 0) {
    paintStill(currentP);
    return;
  }
  const next = clamp(t, 0, Math.max(0, duration - 0.04));
  if (Math.abs(next - lastApplied) < SEEK_EPS && Math.abs(next - video.currentTime) < SEEK_EPS * 1.5) {
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
  clearTimeout(seek.timer);
  seek.timer = setTimeout(() => {
    if (!seeking) return;
    seeking = false;
    paint();
    flushPending();
  }, 120);
}

video.addEventListener("seeked", () => {
  seeking = false;
  clearTimeout(seek.timer);
  paint();
  flushPending();
});

function syncUI(p) {
  if (progressEl) progressEl.style.width = `${(p * 100).toFixed(2)}%`;
  setAct(actFromP(p));
  if (hint) hint.classList.toggle("is-hide", p > 0.05);
  const below = document.getElementById("pitch");
  const onBelow = below && below.getBoundingClientRect().top < innerHeight * 0.55;
  nav?.classList.toggle("is-solid", p > 0.9 || onBelow);
}

function smoothFollow(cur, target, vel, dt) {
  const stiffness = FOLLOW_STIFF;
  const damping = 2 * Math.sqrt(stiffness);
  const accel = (target - cur) * stiffness - vel * damping;
  vel += accel * dt;
  cur += vel * dt;
  if (Math.abs(target - cur) < 0.00015 && Math.abs(vel) < 0.00015) return [target, 0];
  return [cur, vel];
}

function seekToProgress(p) {
  if (!track) return;
  const vh = innerHeight || 1;
  const total = Math.max(1, track.offsetHeight - vh);
  const y = track.getBoundingClientRect().top + scrollY + clamp(p) * total;
  scrollTo({ top: y, behavior: "smooth" });
}

stageDock?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-seek]");
  if (!btn) return;
  seekToProgress(Number(btn.dataset.seek));
});

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
  resize();
  try {
    try {
      video.src = await loadFilmBlob();
    } catch (err) {
      console.warn("STRADA blob failed, streaming", err);
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
          console.warn("STRADA video error", video.error);
          done();
        }, { once: true });
        setTimeout(done, 12000);
      }
      try {
        video.load();
      } catch {
        done();
      }
    });

    try {
      video.pause();
      const p = video.play();
      if (p && typeof p.then === "function") await p.catch(() => {});
      video.pause();
    } catch {}

    try {
      await new Promise((resolve) => {
        const finish = () => resolve();
        video.addEventListener("seeked", finish, { once: true });
        try {
          video.currentTime = 0.001;
        } catch {
          finish();
        }
        setTimeout(finish, 800);
      });
    } catch {}

    if (loaderBar) loaderBar.style.width = "100%";
    ready = duration > 0;
    paint();
    if (!ready) {
      document.body.classList.add("no-film");
      const lateFilmRecover = () => {
        if (!(video.duration > 0)) return;
        duration = video.duration;
        ready = true;
        document.body.classList.remove("no-film");
        paint();
      };
      video.addEventListener("loadedmetadata", lateFilmRecover);
      video.addEventListener("canplay", lateFilmRecover);
    }
  } catch (err) {
    console.warn("STRADA boot:", err);
  } finally {
    loader?.classList.add("is-done");
  }

  addEventListener(
    "scroll",
    () => {
      targetP = readProgress();
    },
    { passive: true }
  );

  let last = performance.now();
  function raf(time) {
    const dt = Math.min(0.05, (time - last) / 1000);
    last = time;
    [currentP, velocity] = smoothFollow(currentP, targetP, velocity, dt);
    if (ready) seek(currentP * duration);
    else paintStill(currentP);
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
  setAct(0);
}

boot();
