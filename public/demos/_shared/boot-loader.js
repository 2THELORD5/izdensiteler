/**
 * İZDEN boot — keep the page locked until fonts + hero film/images are ready.
 * Safe to call once; auto-injects markup if missing.
 */
(function () {
  "use strict";
  if (window.__izdenBootRunning) return;
  window.__izdenBootRunning = true;

  const opts = window.IZDEN_BOOT || {};
  const minMs = opts.minMs || 700;
  const maxMs = opts.maxMs || 9000;
  const brand =
    opts.brand ||
    document.body?.dataset?.brand ||
    (document.title || "İZDEN").split(/[·|—–-]/)[0].trim() || "İZDEN";

  function ensureMarkup() {
    let loader =
      document.getElementById("iz-boot") ||
      document.querySelector("[data-iz-boot]") ||
      document.getElementById("loader");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "iz-boot";
      loader.className = "iz-boot";
      loader.setAttribute("data-iz-boot", "");
      loader.setAttribute("role", "status");
      loader.setAttribute("aria-live", "polite");
      loader.setAttribute("aria-label", "Loading");
      loader.innerHTML =
        `<p class="iz-boot__mark">${brand}</p>` +
        `<div class="iz-boot__bar" aria-hidden="true"><span class="iz-boot__fill" id="loaderBar"></span></div>` +
        `<p class="iz-boot__pct"><span id="loaderPct">0</span>%</p>`;
      (document.body || document.documentElement).appendChild(loader);
    } else {
      loader.setAttribute("data-iz-boot", "");
      if (!loader.querySelector("#loaderBar, .iz-boot__fill, .loader__fill, .loader__bar > i")) {
        const bar = document.createElement("div");
        bar.className = "iz-boot__bar";
        bar.innerHTML = '<span class="iz-boot__fill" id="loaderBar"></span>';
        loader.appendChild(bar);
      }
      if (!loader.querySelector("#loaderPct, .iz-boot__pct, .loader__pct")) {
        const pct = document.createElement("p");
        pct.className = "iz-boot__pct";
        pct.innerHTML = '<span id="loaderPct">0</span>%';
        loader.appendChild(pct);
      }
    }
    return loader;
  }

  const loader = ensureMarkup();
  const bar =
    document.getElementById("loaderBar") ||
    loader.querySelector(".iz-boot__fill, .loader__fill, .loader__bar > i");
  const pct = document.getElementById("loaderPct") || loader.querySelector(".iz-boot__pct span");

  document.documentElement.classList.add("is-loading");
  document.body && document.body.classList.add("is-loading");

  const start = performance.now();
  let progress = 0;
  let finished = false;

  const tick = (p) => {
    progress = Math.max(progress, Math.min(100, p));
    if (bar) {
      if (bar.style) bar.style.width = `${progress}%`;
      else bar.setAttribute("style", `width:${progress}%`);
    }
    if (pct) pct.textContent = String(Math.round(progress));
  };

  tick(6);

  const waitEvent = (el, ev, ms) =>
    new Promise((resolve) => {
      if (!el) return resolve();
      let done = false;
      const end = () => {
        if (done) return;
        done = true;
        resolve();
      };
      el.addEventListener(ev, end, { once: true });
      setTimeout(end, ms);
    });

  const waitVideo = (video) =>
    new Promise((resolve) => {
      if (!video) return resolve();
      if (video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0) {
        return resolve();
      }
      let done = false;
      const end = () => {
        if (done) return;
        done = true;
        resolve();
      };
      video.addEventListener("loadeddata", end, { once: true });
      video.addEventListener("canplay", end, { once: true });
      video.addEventListener("error", end, { once: true });
      setTimeout(end, Math.min(maxMs, 7000));
    });

  const heroVideo = () =>
    document.querySelector(
      "[data-iz-film-scrub] video, .iz-scrub--film video.iz-film, #vVariety, #v, .vhero__video"
    );

  const waitImages = () => {
    const imgs = [...document.images].filter((img) => {
      const src = img.currentSrc || img.src || "";
      if (!src || src.startsWith("data:")) return false;
      // skip tiny tracking pixels
      return true;
    });
    if (!imgs.length) return Promise.resolve();
    let loaded = 0;
    const total = imgs.length;
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            const mark = () => {
              loaded += 1;
              tick(12 + (loaded / total) * 55);
              resolve();
            };
            if (img.complete && img.naturalWidth > 0) mark();
            else {
              img.addEventListener("load", mark, { once: true });
              img.addEventListener("error", mark, { once: true });
              setTimeout(mark, 5000);
            }
          })
      )
    );
  };

  const fontsReady = document.fonts?.ready || Promise.resolve();

  const finish = () => {
    if (finished) return;
    finished = true;
    tick(100);
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minMs - elapsed);
    setTimeout(() => {
      document.documentElement.classList.remove("is-loading");
      document.body && document.body.classList.remove("is-loading");
      loader.classList.add("is-done");
      loader.setAttribute("aria-hidden", "true");
      window.dispatchEvent(new CustomEvent("izden:boot-done"));
      if (typeof opts.onDone === "function") opts.onDone();
    }, wait + 160);
  };

  const hard = setTimeout(finish, maxMs);

  Promise.resolve()
    .then(() => tick(10))
    .then(() => fontsReady.then(() => tick(Math.max(progress, 22))))
    .then(() => waitImages())
    .then(() => {
      tick(Math.max(progress, 78));
      return waitVideo(heroVideo());
    })
    .then(() =>
      document.readyState === "complete"
        ? Promise.resolve()
        : waitEvent(window, "load", maxMs)
    )
    .then(() => {
      tick(96);
      clearTimeout(hard);
      setTimeout(finish, 100);
    })
    .catch(() => {
      clearTimeout(hard);
      finish();
    });

  window.IzdenBoot = function IzdenBoot() {
    /* already running — keep API for older call sites */
  };
})();
