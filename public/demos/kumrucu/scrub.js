/**
 * Kumrucu Kale — continuous film scrub.
 * Primary: HQ variety film (1080p / 9:16). House film only as short warm-in on desktop.
 * No still opacity crossfade.
 */
const HOUSE_END = 0.1; /* desktop only micro-intro; mobile skips to variety */
const ACTS = [
  { at: 0.0, act: "Fiş 01", title: "Un henüz soğuk", body: "Sabahın ilk tezgâhı. Alaçatı uyanmadan hamur yoğrulur.", idx: "01 / 08", rail: "Tezgâh" },
  { at: 0.1, act: "Fiş 02", title: "Köz tutar", body: "Taş fırın ısınır. Susam kabuğu kızarır.", idx: "02 / 08", rail: "Köz" },
  { at: 0.2, act: "Fiş 03", title: "Somun kabarır", body: "Kumrunun sırrı ekmekte — oval, susamlı, çıtır.", idx: "03 / 08", rail: "Somun" },
  { at: 0.3, act: "Fiş 04", title: "Meşhur Çeşme", body: "Kaşar, biber, domates — susamlı ekmekte klasik kumru.", idx: "04 / 08", rail: "Klasik" },
  { at: 0.42, act: "Fiş 05", title: "Sucuklu Domatesli", body: "Izgara sucuk, domates, eriyen kaşar — tok tezgâh hali.", idx: "05 / 08", rail: "Sucuklu" },
  { at: 0.54, act: "Fiş 06", title: "Yengen Kumru", body: "İzmir’in kurusu — Kale tezgâhında tanıdık lezzet.", idx: "06 / 08", rail: "Yengen" },
  { at: 0.66, act: "Fiş 07", title: "Sıcak Kumru", body: "Izgara sıcaklığıyla; peynir erir, ekmek çıtır kalır.", idx: "07 / 08", rail: "Sıcak" },
  { at: 0.8, act: "Fiş 08", title: "Sakızlı Kurabiye", body: "%100 doğal damla sakız — Alaçatı’nın meşhuru.", idx: "08 / 08", rail: "Kurabiye" },
];

const BOOT_STILLS = [
  "./public/kie/scroll-v2/boot/01-flour.jpg",
  "./public/kie/scroll-v2/boot/02-oven.jpg",
  "./public/kie/scroll-v2/boot/03-somun.jpg",
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const isMobile =
  typeof matchMedia === "function" &&
  matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches;
const reduced =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const video = document.getElementById("v");
const variety = document.getElementById("vVariety");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
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
let varietyDuration = 0;
let varietyReady = false;
let varietySeeking = false;
let varietyPending = null;
let targetP = 0;
let currentP = 0;
let velocity = 0;
let activeAct = -1;
const SEEK_EPS = isMobile ? 0.028 : 0.016;
const SEEK_EPS_VAR = isMobile ? 0.032 : 0.018;
/** Mobile: variety-only. Desktop: tiny house warm-in then variety. */
const useHouse = !isMobile && !reduced;

if (video) {
  video.preload = useHouse ? "auto" : "none";
  video.muted = true;
  video.playsInline = true;
  if (useHouse) {
    video.src = "./public/film-house-v2.mp4";
    try { video.load(); } catch {}
  }
}

if (variety) {
  variety.preload = "auto";
  variety.muted = true;
  variety.playsInline = true;
  variety.src = isMobile
    ? "./public/kie/scroll-v2/variety-scrub-mobile.mp4"
    : "./public/kie/scroll-v2/variety-scrub-pc.mp4";
  try { variety.load(); } catch {}
}

const bootImgs = BOOT_STILLS.map((src) => {
  const im = new Image();
  im.decoding = "async";
  im.src = src;
  return im;
});

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, isMobile ? 1.75 : 2.25);
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

function paintBoot(p) {
  const i = Math.min(2, Math.floor(p * 2.99));
  const im = bootImgs[i];
  if (!im?.complete || !im.naturalWidth) {
    ctx.fillStyle = "#1a100c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  coverDraw(im.naturalWidth, im.naturalHeight, (x, y, w, h) => ctx.drawImage(im, x, y, w, h));
}

function inHouse(p) {
  return useHouse && p < HOUSE_END;
}

function paint() {
  resize();
  if (reduced) {
    paintBoot(0);
    return;
  }
  if (inHouse(currentP)) {
    if (ready && video.readyState >= 1 && video.videoWidth) {
      coverDraw(video.videoWidth, video.videoHeight, (x, y, w, h) => ctx.drawImage(video, x, y, w, h));
    } else paintBoot(currentP);
    return;
  }
  if (variety && varietyReady && variety.readyState >= 1 && variety.videoWidth) {
    coverDraw(variety.videoWidth, variety.videoHeight, (x, y, w, h) =>
      ctx.drawImage(variety, x, y, w, h)
    );
    return;
  }
  paintBoot(Math.min(currentP, 0.35));
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
  if (actEl) actEl.textContent = a.act;
  if (titleEl) titleEl.textContent = a.title;
  if (bodyEl) bodyEl.textContent = a.body;
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
  seekFilm(p);
}

function seekFilm(t) {
  if (!useHouse || !ready || !Number.isFinite(t) || duration <= 0) return;
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
  try { video.currentTime = next; } catch { seeking = false; return; }
  clearTimeout(seekFilm.timer);
  seekFilm.timer = setTimeout(() => {
    if (!seeking) return;
    seeking = false;
    paint();
    flushPending();
  }, 100);
}

function flushVariety() {
  if (varietyPending == null) return;
  const t = varietyPending;
  varietyPending = null;
  seekVariety(t);
}

function seekVariety(t) {
  if (!variety || !varietyReady || varietyDuration <= 0) return;
  const next = clamp(t, 0, Math.max(0, varietyDuration - 0.05));
  if (varietySeeking) {
    varietyPending = next;
    return;
  }
  if (Math.abs(variety.currentTime - next) < SEEK_EPS_VAR) {
    paint();
    return;
  }
  varietySeeking = true;
  try { variety.currentTime = next; } catch { varietySeeking = false; return; }
  clearTimeout(seekVariety.timer);
  seekVariety.timer = setTimeout(() => {
    if (!varietySeeking) return;
    varietySeeking = false;
    flushVariety();
  }, isMobile ? 110 : 75);
}

video?.addEventListener("seeked", () => {
  seeking = false;
  clearTimeout(seekFilm.timer);
  paint();
  flushPending();
});

variety?.addEventListener("seeked", () => {
  varietySeeking = false;
  clearTimeout(seekVariety.timer);
  paint();
  flushVariety();
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
  const stiffness = isMobile ? 13 : 16;
  const damping = 2 * Math.sqrt(stiffness);
  const accel = (target - cur) * stiffness - vel * damping;
  vel += accel * dt;
  cur += vel * dt;
  if (Math.abs(target - cur) < 0.00012 && Math.abs(vel) < 0.00012) return [target, 0];
  return [cur, vel];
}

function kickDecode(el) {
  if (!el) return;
  try {
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => { try { el.pause(); } catch {} }).catch(() => {});
    } else el.pause();
  } catch {}
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
    if (useHouse && video) {
      await new Promise((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          duration = Number.isFinite(video?.duration) && video.duration > 0 ? video.duration : 0;
          resolve();
        };
        if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) done();
        else {
          video.addEventListener("loadedmetadata", done, { once: true });
          video.addEventListener("error", () => done(), { once: true });
          setTimeout(done, 4000);
        }
        try { video.load(); } catch { done(); }
      });
      kickDecode(video);
      try {
        await new Promise((resolve) => {
          const finish = () => resolve();
          video.addEventListener("seeked", finish, { once: true });
          try { video.currentTime = 0.001; } catch { finish(); }
          setTimeout(finish, 500);
        });
      } catch {}
      ready = duration > 0;
    }

    if (variety) {
      await new Promise((resolve) => {
        const done = () => {
          varietyDuration =
            Number.isFinite(variety.duration) && variety.duration > 0 ? variety.duration : 0;
          varietyReady = varietyDuration > 0;
          resolve();
        };
        if (variety.readyState >= 1 && variety.duration > 0) done();
        else {
          variety.addEventListener("loadedmetadata", done, { once: true });
          variety.addEventListener("error", () => resolve(), { once: true });
          try { variety.load(); } catch { resolve(); }
          setTimeout(done, isMobile ? 4500 : 8000);
        }
      });
      if (varietyReady) {
        kickDecode(variety);
        try { variety.currentTime = 0.04; } catch {}
      }
    }

    const t0 = performance.now();
    await new Promise((resolve) => {
      const step = () => {
        const t = clamp((performance.now() - t0) / 520);
        if (loaderBar) loaderBar.style.width = `${Math.round(t * 100)}%`;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    paint();
    if (useHouse && !ready) {
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

  const unlock = () => {
    kickDecode(video);
    kickDecode(variety);
    if (useHouse && !ready && video?.duration > 0) {
      duration = video.duration;
      ready = true;
      document.body.classList.remove("no-film");
    }
    if (variety && !varietyReady && variety.duration > 0) {
      varietyDuration = variety.duration;
      varietyReady = true;
    }
    paint();
  };
  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("pointerdown", unlock, { once: true });

  addEventListener("scroll", () => { targetP = readProgress(); }, { passive: true });

  let last = performance.now();
  function raf(time) {
    const dt = Math.min(0.05, (time - last) / 1000);
    last = time;
    [currentP, velocity] = smoothFollow(currentP, targetP, velocity, dt);

    if (reduced) {
      paint();
      syncUI(currentP);
      requestAnimationFrame(raf);
      return;
    }

    if (inHouse(currentP) && ready && duration > 0) {
      /* Map micro-intro across first ~35% of house film for sharpness */
      seekFilm((currentP / HOUSE_END) * 0.35 * duration);
    } else if (varietyReady && varietyDuration > 0) {
      const start = useHouse ? HOUSE_END : 0;
      const local = (currentP - start) / Math.max(0.001, 1 - start);
      seekVariety(clamp(local) * Math.max(0.05, varietyDuration - 0.06));
    }
    paint();
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
