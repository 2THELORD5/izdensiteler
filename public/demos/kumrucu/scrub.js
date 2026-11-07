/**
 * Kumrucu Kale — fırın fişi scrub (ticket copy, not film-chapter template)
 */
const ACTS = [
  { at: 0.0, act: "Fiş 01", title: "Un henüz soğuk", body: "Sabahın ilk tezgâhı. Alaçatı uyanmadan hamur yoğrulur.", idx: "01 / 06", rail: "Tezgâh" },
  { at: 0.14, act: "Fiş 02", title: "Köz tutar", body: "Taş fırın ısınır. Susam kabuğu kızarır.", idx: "02 / 06", rail: "Köz" },
  { at: 0.28, act: "Fiş 03", title: "Somun kabarır", body: "Kumrunun sırrı ekmekte — oval, susamlı, çıtır.", idx: "03 / 06", rail: "Somun" },
  { at: 0.44, act: "Fiş 04", title: "Meşhur Çeşme", body: "Kaşar, biber, domates — susamlı ekmekte klasik kumru.", idx: "04 / 06", rail: "Kumru" },
  { at: 0.66, act: "Fiş 05", title: "Damla sakız", body: "Doğal sakız reçinesi. Kurabiye kokusu sokakta.", idx: "05 / 06", rail: "Sakız" },
  { at: 0.84, act: "Fiş 06", title: "İki tezgâh", body: "Çarşı ve yol kenarı. Aynı fırın, aynı dil.", idx: "06 / 06", rail: "Çarşı" },
];

const STILLS = [
  "./public/kie/01-flour.jpg",
  "./public/kie/02-oven.jpg",
  "./public/kie/07-ekmek-stack.jpg",
  "./public/kie/03c-klasik-dolu.jpg",
  "./public/kie/04-sakiz.jpg",
  "./public/kie/05-alacati.jpg",
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
const chapterIdx = document.getElementById("chapterIdx");
const railLabel = document.getElementById("railLabel");
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

video.preload = "auto";
video.muted = true;
video.playsInline = true;
video.setAttribute("playsinline", "");
video.setAttribute("webkit-playsinline", "");
video.src = "./public/film-house-v2.mp4";
try {
  video.load();
} catch {}

const stillImgs = STILLS.map((src) => {
  const im = new Image();
  im.decoding = "async";
  im.src = src;
  return im;
});

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
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
  const s = Math.max(cw / srcW, ch / srcH);
  ctx.fillStyle = "#1a100c";
  ctx.fillRect(0, 0, cw, ch);
  draw((cw - srcW * s) / 2, (ch - srcH * s) / 2, srcW * s, srcH * s);
}

function paintStill(p) {
  resize();
  const idx = Math.min(STILLS.length - 1, Math.floor(p * (STILLS.length - 0.001)));
  const im = stillImgs[idx];
  if (!im?.complete || !im.naturalWidth) {
    ctx.fillStyle = "#1a100c";
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

function actFromP(p) {
  let idx = 0;
  for (let i = 0; i < ACTS.length; i++) if (p >= ACTS[i].at) idx = i;
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
  if (hint) hint.classList.toggle("is-hide", p > 0.035);
  const below = document.getElementById("manifesto");
  const onBelow = below && below.getBoundingClientRect().top < innerHeight * 0.55;
  nav?.classList.toggle("is-solid", p > 0.9 || onBelow);
}

function smoothFollow(cur, target, vel, dt) {
  const stiffness = 14;
  const damping = 2 * Math.sqrt(stiffness);
  const accel = (target - cur) * stiffness - vel * damping;
  vel += accel * dt;
  cur += vel * dt;
  if (Math.abs(target - cur) < 0.00015 && Math.abs(vel) < 0.00015) return [target, 0];
  return [cur, vel];
}

document.getElementById("chapterNav")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-seek]");
  if (!btn || !track) return;
  const p = Number(btn.dataset.seek);
  const vh = innerHeight || 1;
  const total = Math.max(1, track.offsetHeight - vh);
  const y = track.getBoundingClientRect().top + scrollY + p * total;
  scrollTo({ top: y, behavior: "smooth" });
});

async function boot() {
  resize();
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
        video.addEventListener("error", () => done(), { once: true });
        setTimeout(done, 9000);
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
        setTimeout(finish, 700);
      });
    } catch {}

    const t0 = performance.now();
    await new Promise((resolve) => {
      const step = () => {
        const t = clamp((performance.now() - t0) / 650);
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
      const late = () => {
        if (!(video.duration > 0)) return;
        duration = video.duration;
        ready = true;
        document.body.classList.remove("no-film");
        paint();
      };
      video.addEventListener("loadedmetadata", late);
      video.addEventListener("canplay", late);
    }
  } catch (err) {
    console.warn("Kumru boot:", err);
  } finally {
    loader?.classList.add("is-done");
  }

  addEventListener("scroll", () => { targetP = readProgress(); }, { passive: true });

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
