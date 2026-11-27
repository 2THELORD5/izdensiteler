/**
 * Kumrucu Kale — continuous film scrub from real 1080p Kie clips.
 * PC: variety-scrub-pc.mp4 (16:9). Mobile: variety-scrub-mobile.mp4 (9:16).
 * House film removed from the primary path (was 720p + desynced chapters).
 */
/* Orta köz bölümü çıkarıldı; un → somun bağlandı; sakızlı kurabiye sonda. */
const ACTS_PC = [
  { at: 0.0, act: "01", title: "Sabah unu", body: "İlk tezgâh açılır. Hamur yoğrulur, fırın ısınır.", idx: "01 / 08", rail: "Tezgâh" },
  { at: 0.112, act: "02", title: "Susamlı somun", body: "Oval, susamlı kumru ekmeği — çıtır kabuk, yumuşak iç.", idx: "02 / 08", rail: "Somun" },
  { at: 0.223, act: "03", title: "Meşhur Çeşme", body: "Kaşar, biber, domates — susamlı ekmekte klasik kumru.", idx: "03 / 08", rail: "Klasik" },
  { at: 0.334, act: "04", title: "Klasik servis", body: "Aynı masa, aynı ışık — klasik kumru servise hazır.", idx: "04 / 08", rail: "Klasik" },
  { at: 0.445, act: "05", title: "Sucuklu Domatesli", body: "Izgara sucuk, domates ve eriyen kaşar ile doyurucu servis.", idx: "05 / 08", rail: "Sucuklu" },
  { at: 0.556, act: "06", title: "Sucuklu servis", body: "Buhar dağılır; sucuklu kumru tezgâhta tamamlanır.", idx: "06 / 08", rail: "Sucuklu" },
  { at: 0.667, act: "07", title: "Yengen Kumru", body: "İzmir usulü kuru yengen — Kale tezgâhında.", idx: "07 / 08", rail: "Yengen" },
  { at: 0.888, act: "08", title: "Sakızlı Alaçatı", body: "Doğal damla sakızlı kurabiye — günün tatlı seçkisi.", idx: "08 / 08", rail: "Kurabiye" },
];

/* Mobil: aynı çeşitler, 9:16 çekimlerle (7 kesit). Metinler PC ile aynı. */
const ACTS_MOB = [
  { at: 0.0, act: "01", title: "Sabah unu", body: "İlk tezgâh açılır. Hamur yoğrulur, fırın ısınır.", idx: "01 / 07", rail: "Tezgâh" },
  { at: 0.148, act: "02", title: "Susamlı somun", body: "Oval, susamlı kumru ekmeği — çıtır kabuk, yumuşak iç.", idx: "02 / 07", rail: "Somun" },
  { at: 0.289, act: "03", title: "Meşhur Çeşme", body: "Kaşar, biber, domates — susamlı ekmekte klasik kumru.", idx: "03 / 07", rail: "Klasik" },
  { at: 0.430, act: "04", title: "Klasik servis", body: "Aynı masa, aynı ışık — klasik kumru servise hazır.", idx: "04 / 07", rail: "Klasik" },
  { at: 0.570, act: "05", title: "Sucuklu Domatesli", body: "Izgara sucuk, domates ve eriyen kaşar ile doyurucu servis.", idx: "05 / 07", rail: "Sucuklu" },
  { at: 0.711, act: "06", title: "Yengen Kumru", body: "İzmir usulü kuru yengen — Kale tezgâhında.", idx: "06 / 07", rail: "Yengen" },
  { at: 0.852, act: "07", title: "Sakızlı Alaçatı", body: "Doğal damla sakızlı kurabiye — günün tatlı seçkisi.", idx: "07 / 07", rail: "Kurabiye" },
];

const BOOT_STILLS_PC = [
  "./public/kie/scroll-v2/boot/01-flour.jpg",
  "./public/kie/scroll-v2/boot/03-somun.jpg",
];
const BOOT_STILLS_MOB = [
  "./public/kie/scroll-v2/boot/m-01-flour.jpg",
  "./public/kie/scroll-v2/boot/m-02-oven.jpg",
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const isMobile =
  typeof matchMedia === "function" &&
  matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches;
const reduced =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const ACTS = isMobile ? ACTS_MOB : ACTS_PC;
const BOOT_STILLS = isMobile ? BOOT_STILLS_MOB : BOOT_STILLS_PC;

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

let varietyDuration = 0;
let varietyReady = false;
let varietySeeking = false;
let varietyPending = null;
let targetP = 0;
let currentP = 0;
let velocity = 0;
let activeAct = -1;
/* Repaint only when something changed (new frame, resize) — not 60x/s. */
let dirty = true;
const SEEK_EPS_VAR = isMobile ? 0.022 : 0.012;

if (video) {
  video.removeAttribute("src");
  try { video.load(); } catch {}
}

if (variety) {
  variety.preload = "auto";
  variety.muted = true;
  variety.playsInline = true;
  variety.setAttribute("playsinline", "");
  variety.setAttribute("webkit-playsinline", "");
  /* src is assigned in boot(): the whole film is downloaded into memory first,
     so scrubbing never waits on the network (that was the stutter). */
}

const FILM_URL = isMobile
  ? "./public/kie/scroll-v2/variety-scrub-mobile-v3.mp4"
  : "./public/kie/scroll-v2/variety-scrub-pc-v3.mp4";
const FILM_BYTES = isMobile ? 16819422 : 33452026;
const loaderPct = document.getElementById("loaderPct");

function showLoad(frac) {
  const f = clamp(frac);
  if (loaderBar) loaderBar.style.width = `${(f * 100).toFixed(1)}%`;
  if (loaderPct) loaderPct.textContent = `%${Math.round(f * 100)}`;
}

/* Download the scrub film completely, with real progress. Resolves to a blob:
   URL; rejects on error or when the connection stalls (caller falls back to
   the plain URL so the page is never trapped). */
async function fetchFilm(url, onProgress) {
  const ctrl = new AbortController();
  let stallTimer = 0;
  const arm = () => {
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => ctrl.abort(), 25000);
  };
  arm();
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "force-cache" });
    if (!res.ok || !res.body) throw new Error(`film ${res.status}`);
    const total = Number(res.headers.get("content-length")) || FILM_BYTES;
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.byteLength;
      arm();
      onProgress(Math.min(0.99, got / total));
    }
    onProgress(1);
    return URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
  } finally {
    clearTimeout(stallTimer);
  }
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

/* Mobil: 9:16 kaynak, uzun telefon ekranında yanlardan fazla kırpılmasın diye
   cover ile fit-width arası bir ölçek; kalan ince şerit aynı karenin bulanık
   arka planıyla dolar (siyah bant yok). */
const MOB_FIT = 0.55;
const bgCanvas = document.createElement("canvas");
bgCanvas.width = 40;
bgCanvas.height = 72;
const bgCtx = bgCanvas.getContext("2d", { alpha: false });

function coverDraw(srcW, srcH, draw, srcEl) {
  const cw = canvas.width;
  const ch = canvas.height;
  const cover = Math.max(cw / srcW, ch / srcH);
  const fit = cw / srcW;
  const s = isMobile && srcEl ? cover + MOB_FIT * (fit - cover) * (cover > fit ? 1 : 0) : cover;
  const dw = srcW * s;
  const dh = srcH * s;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.fillStyle = "#1a100c";
  ctx.fillRect(0, 0, cw, ch);
  if (isMobile && srcEl && (dh < ch - 1 || dw < cw - 1)) {
    try {
      bgCtx.drawImage(srcEl, 0, 0, bgCanvas.width, bgCanvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bgCanvas, 0, 0, cw, ch);
      ctx.fillStyle = "rgba(26,16,12,.38)";
      ctx.fillRect(0, 0, cw, ch);
    } catch {}
  }
  draw(dx, dy, dw, dh);
  if (isMobile && srcEl && dh < ch - 1) {
    const f = Math.max(2, Math.round(Math.min(48, (ch - dh) * 0.9)));
    const top = Math.max(0, dy);
    const bot = Math.min(ch, dy + dh);
    let g = ctx.createLinearGradient(0, top, 0, top + f);
    g.addColorStop(0, "rgba(26,16,12,.55)");
    g.addColorStop(1, "rgba(26,16,12,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, top, cw, f);
    g = ctx.createLinearGradient(0, bot - f, 0, bot);
    g.addColorStop(0, "rgba(26,16,12,0)");
    g.addColorStop(1, "rgba(26,16,12,.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, bot - f, cw, f);
  }
}

function paintBoot(p) {
  const i = Math.min(bootImgs.length - 1, Math.floor(p * Math.max(1, bootImgs.length - 0.01)));
  const im = bootImgs[i];
  if (!im?.complete || !im.naturalWidth) {
    ctx.fillStyle = "#1a100c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  coverDraw(im.naturalWidth, im.naturalHeight, (x, y, w, h) => ctx.drawImage(im, x, y, w, h));
}

function paint() {
  dirty = false;
  resize();
  if (reduced) {
    paintBoot(0);
    return;
  }
  if (variety && varietyReady && variety.readyState >= 1 && variety.videoWidth) {
    coverDraw(
      variety.videoWidth,
      variety.videoHeight,
      (x, y, w, h) => ctx.drawImage(variety, x, y, w, h),
      variety
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
  document.querySelectorAll("#chapterNav [data-seek]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.textContent.trim() === a.rail);
  });
}

function readProgress() {
  const vh = innerHeight || 1;
  const total = Math.max(1, track.offsetHeight - vh);
  return clamp(-track.getBoundingClientRect().top / total);
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
  try {
    if (typeof variety.fastSeek === "function") variety.fastSeek(next);
    else variety.currentTime = next;
  } catch {
    varietySeeking = false;
    return;
  }
  clearTimeout(seekVariety.timer);
  seekVariety.timer = setTimeout(() => {
    if (!varietySeeking) return;
    varietySeeking = false;
    flushVariety();
  }, isMobile ? 70 : 45);
}

variety?.addEventListener("seeked", () => {
  varietySeeking = false;
  clearTimeout(seekVariety.timer);
  paint();
  dirty = true; // one more pass on the next frame, once the decoder has presented it
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
  // Tight follow — previous soft spring lagged the film by 1–2s.
  const stiffness = isMobile ? 48 : 56;
  const damping = 2 * Math.sqrt(stiffness);
  const accel = (target - cur) * stiffness - vel * damping;
  vel += accel * dt;
  cur += vel * dt;
  if (Math.abs(target - cur) < 0.00005 && Math.abs(vel) < 0.00005) return [target, 0];
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
  const hit = isMobile ? ACTS.find((x) => x.rail === btn.textContent.trim()) : null;
  const p = hit ? hit.at : Number(btn.dataset.seek);
  const vh = innerHeight || 1;
  const total = Math.max(1, track.offsetHeight - vh);
  const y = track.getBoundingClientRect().top + scrollY + p * total;
  scrollTo({ top: y, behavior: "smooth" });
});

async function boot() {
  resize();
  try {
    if (variety) {
      let src = FILM_URL;
      try {
        src = await fetchFilm(FILM_URL, (f) => showLoad(f * 0.97));
      } catch (err) {
        console.warn("Kumru film (stream fallback):", err);
      }
      variety.src = src;
      try { variety.load(); } catch {}
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

    // Hold the gate until the variety film can actually scrub (not just metadata).
    if (variety && varietyReady) {
      await new Promise((resolve) => {
        let done = false;
        const end = () => {
          if (done) return;
          done = true;
          resolve();
        };
        if (variety.readyState >= 3) end();
        else {
          variety.addEventListener("canplaythrough", end, { once: true });
          variety.addEventListener("canplay", end, { once: true });
          variety.addEventListener("error", end, { once: true });
          setTimeout(end, isMobile ? 6000 : 10000);
        }
      });
      try { variety.currentTime = 0.04; } catch {}
      await new Promise((r) => {
        const fin = () => r();
        variety.addEventListener("seeked", fin, { once: true });
        setTimeout(fin, 500);
      });
    }

    showLoad(1);
    await new Promise((r) => setTimeout(r, 220));

    paint();
  } catch (err) {
    console.warn("Kumru boot:", err);
  } finally {
    // Only unlock after paint attempt — page content stays gated.
    loader?.classList.add("is-done");
    document.documentElement.classList.remove("is-loading");
    document.body?.classList.remove("is-loading");
  }

  const unlock = () => {
    kickDecode(variety);
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

    if (varietyReady && varietyDuration > 0) {
      seekVariety(clamp(currentP) * Math.max(0.05, varietyDuration - 0.06));
    }
    if (dirty || !varietyReady) paint();
    syncUI(currentP);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  addEventListener("resize", () => {
    dirty = true;
    paint();
    targetP = readProgress();
  });

  targetP = readProgress();
  currentP = targetP;
  setAct(0);
}

boot();
