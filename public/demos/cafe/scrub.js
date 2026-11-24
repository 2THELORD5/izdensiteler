/**
 * IZDEN — continuous coffee film scrubbed by scroll.
 */
const ACTS = [
  { at: 0.0, act: "01 — Çuval", title: "Çekirdek bekliyor", body: "Kavrulmuş. Karanlık. Hazır." },
  { at: 0.12, act: "02 — Öğütme", title: "Değirmene", body: "Taneler burr’lara doğru düşer." },
  { at: 0.32, act: "03 — Shot", title: "Crema yükselir", body: "Espresso kalın ve altın akar." },
  { at: 0.55, act: "04 — Döküm", title: "Buzun üstüne", body: "Shot soğuk sütle buluşur." },
  { at: 0.78, act: "05 — Bardak", title: "İçime hazır", body: "Buğu. Sessiz bar. Sıra sende." },
  { at: 0.92, act: "06 — Kart", title: "Fincanı seç", body: "Aynı kavrum. Farklı haller." },
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
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const stageUi = document.querySelector(".stage-ui");
const chaptersEl = document.getElementById("chapters");

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
const SEEK_EPS_LIVE = IS_MOBILE ? 0.016 : SEEK_EPS;
const FOLLOW_STIFF = IS_MOBILE ? 28 : 18;

/* Prefer 720 for reliable scroll-scrub (Safari + fast metadata). */
video.preload = "auto";
video.muted = true;
video.playsInline = true;
video.setAttribute("playsinline", "");
video.setAttribute("webkit-playsinline", "");
if (!String(video.getAttribute("src") || "").includes("film-full-720")) {
  video.src = "./public/film-full-720.mp4";
}

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
  ctx.fillStyle = "#050403";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(video, (cw - vw * s) / 2, (ch - vh * s) / 2, vw * s, vh * s);
}

function buildChapters() {
  if (!chaptersEl) return;
  chaptersEl.innerHTML = ACTS.map(
    (a, i) =>
      `<li><button type="button" data-act="${i}" aria-label="${a.act}" title="${a.title}"></button></li>`
  ).join("");
  chaptersEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn || !track) return;
    const i = Number(btn.getAttribute("data-act"));
    const p = ACTS[i]?.at ?? 0;
    const vh = innerHeight || 1;
    const total = Math.max(1, track.offsetHeight - vh);
    const top = track.getBoundingClientRect().top + scrollY + p * total;
    scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
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
  chaptersEl?.querySelectorAll("button").forEach((btn, idx) => {
    btn.classList.toggle("is-on", idx === i);
    btn.setAttribute("aria-current", idx === i ? "true" : "false");
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
  hint.style.opacity = p > 0.015 && p < 0.08 ? "0.4" : "0";
  const board = document.getElementById("board");
  const onBoard = board && board.getBoundingClientRect().top < innerHeight * 0.55;
  nav.classList.toggle("is-light", p > 0.92 || onBoard);
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

async function boot() {
  buildChapters();
  try {
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
          console.warn("IZDEN video error", video.error);
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

    const t0 = performance.now();
    await new Promise((resolve) => {
      const step = () => {
        const t = clamp((performance.now() - t0) / 500);
        if (loaderBar) loaderBar.style.width = `${Math.round(t * 100)}%`;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

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
    console.warn("IZDEN boot media:", err);
  } finally {
    loader?.classList.add("is-done");
  }

  /* Native scroll only — Lenis transform breaks sticky and draws a mid-viewport hairline. */
  addEventListener("scroll", () => { targetP = readProgress(); }, { passive: true });
  window.__anvilLenis = null;

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

  /* Mobile hamburger drawer — cafe only */
  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  const closeDrawer = () => {
    if (!drawer || !burger || !nav) return;
    drawer.classList.remove("is-open");
    drawer.hidden = true;
    nav.classList.remove("is-drawer");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menüyü aç");
    document.body.style.overflow = "";
  };
  const openDrawer = () => {
    if (!drawer || !burger || !nav) return;
    drawer.hidden = false;
    drawer.classList.add("is-open");
    nav.classList.add("is-drawer");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menüyü kapat");
    document.body.style.overflow = "hidden";
  };
  burger?.addEventListener("click", () => {
    if (drawer?.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  });
  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
    const a = e.target.closest("a");
    if (a) closeDrawer();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

const STILLS = [
  "./public/kie/01-sack.jpg",
  "./public/kie/02-grind.jpg",
  "./public/kie/03-shot.jpg",
  "./public/kie/04-pour.jpg",
  "./public/kie/05-glass.jpg",
];
const stillImgs = STILLS.map((src) => {
  const im = new Image();
  im.src = src;
  return im;
});

function paintStill(p) {
  resize();
  const idx = Math.min(STILLS.length - 1, Math.floor(p * (STILLS.length - 0.001)));
  const im = stillImgs[idx];
  if (!im?.complete || !im.naturalWidth) {
    ctx.fillStyle = "#050403";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  const cw = canvas.width;
  const ch = canvas.height;
  const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
  ctx.fillStyle = "#050403";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(im, (cw - im.naturalWidth * s) / 2, (ch - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
}

boot();
