(() => {
  /**
   * Continuous film scrub — currentTime seek, NOT still opacity crossfade.
   * Markup:
   * <section data-iz-film-scrub data-film-pc="…" data-film-mob="…" data-poster="…">
   *   <div class="iz-scrub__pin">
   *     <video class="iz-film" muted playsinline preload="auto"></video>
   *     <div class="iz-scrub__ui">… data-iz-act/title/body …</div>
   *   </div>
   *   optional: <script type="application/json" data-iz-chapters>[…]</script>
   * </section>
   */
  const root = document.querySelector("[data-iz-film-scrub]");
  if (!root) return;

  const pin = root.querySelector(".iz-scrub__pin") || root;
  const video =
    root.querySelector("video.iz-film") ||
    root.querySelector("video") ||
    (() => {
      const v = document.createElement("video");
      v.className = "iz-film";
      v.muted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.preload = "auto";
      v.disablePictureInPicture = true;
      const stage = root.querySelector(".iz-scrub__stage") || pin;
      stage.prepend(v);
      return v;
    })();

  const actEl = root.querySelector("[data-iz-act]");
  const titleEl = root.querySelector("[data-iz-title]");
  const bodyEl = root.querySelector("[data-iz-body]");
  const hintEl = root.querySelector(".iz-scrub__hint");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMq = matchMedia(
    "(max-width:900px), (hover: none) and (pointer: coarse), (orientation: portrait)"
  );

  let chapters = [];
  const json = root.querySelector("[data-iz-chapters]");
  if (json) {
    try {
      chapters = JSON.parse(json.textContent || "[]");
    } catch {
      chapters = [];
    }
  }
  if (!chapters.length) {
    root.querySelectorAll(".iz-scrub__frame").forEach((f, i) => {
      chapters.push({
        act: f.dataset.act || `0${i + 1}`,
        title: f.dataset.title || "",
        body: f.dataset.body || "",
      });
    });
  }

  const pickSrc = () => {
    const mob = mobileMq.matches;
    return (
      (mob && root.dataset.filmMob) ||
      root.dataset.filmPc ||
      video.getAttribute("src") ||
      ""
    );
  };

  const poster =
    root.dataset.poster ||
    root.querySelector(".iz-scrub__frame img")?.getAttribute("src") ||
    "";
  if (poster) video.setAttribute("poster", poster);

  let duration = 0;
  let ready = false;
  let seeking = false;
  let pending = null;
  let lastApplied = -1;
  let lastChapter = -1;
  let targetP = 0;
  let currentP = 0;
  let raf = 0;
  const SEEK_EPS = mobileMq.matches ? 0.04 : 0.022;
  const STIFF = mobileMq.matches ? 10 : 14;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const applyChapter = (p) => {
    if (!chapters.length) return;
    const i = Math.min(
      chapters.length - 1,
      Math.floor(p * chapters.length)
    );
    if (i === lastChapter) return;
    lastChapter = i;
    const c = chapters[i];
    if (actEl) actEl.textContent = c.act || "";
    if (titleEl) titleEl.textContent = c.title || "";
    if (bodyEl) bodyEl.textContent = c.body || "";
    root.dataset.izChapter = String(i);
  };

  const flush = () => {
    if (pending == null) return;
    const t = pending;
    pending = null;
    seek(t);
  };

  const seek = (t) => {
    if (!ready || duration <= 0) return;
    const next = clamp(t, 0, Math.max(0, duration - 0.04));
    if (
      Math.abs(next - lastApplied) < SEEK_EPS &&
      Math.abs(next - video.currentTime) < SEEK_EPS * 1.5
    ) {
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
    }
  };

  video.addEventListener("seeked", () => {
    seeking = false;
    flush();
  });

  const readP = () => {
    const total = Math.max(1, root.offsetHeight - window.innerHeight);
    const top = root.getBoundingClientRect().top;
    return clamp(-top / total);
  };

  const loadSrc = () => {
    const src = pickSrc();
    if (!src) return;
    if (video.getAttribute("src") === src && ready) return;
    ready = false;
    duration = 0;
    lastApplied = -1;
    video.src = src;
    video.load();
  };

  const warm = () =>
    new Promise((resolve) => {
      const done = () => {
        duration =
          Number.isFinite(video.duration) && video.duration > 0
            ? video.duration
            : 0;
        ready = duration > 0;
        resolve();
      };
      if (video.readyState >= 1 && video.duration > 0) done();
      else {
        video.addEventListener("loadedmetadata", done, { once: true });
        video.addEventListener("error", () => resolve(), { once: true });
        setTimeout(done, mobileMq.matches ? 3500 : 8000);
      }
      try {
        video.load();
      } catch {
        resolve();
      }
    }).then(async () => {
      if (!ready) return;
      try {
        video.pause();
        const p = video.play();
        if (p && typeof p.then === "function") await p.catch(() => {});
        video.pause();
      } catch {
        /* ignore */
      }
      try {
        video.currentTime = 0.02;
      } catch {
        /* ignore */
      }
    });

  const unlock = () => {
    try {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          try {
            video.pause();
          } catch {
            /* ignore */
          }
        }).catch(() => {});
      } else video.pause();
    } catch {
      /* ignore */
    }
    if (!ready && video.duration > 0) {
      duration = video.duration;
      ready = true;
    }
  };

  if (reduced) {
    loadSrc();
    applyChapter(0);
    if (hintEl) hintEl.style.display = "none";
    return;
  }

  loadSrc();
  warm().then(() => {
    targetP = readP();
    currentP = targetP;
    applyChapter(currentP);
  });

  mobileMq.addEventListener?.("change", () => {
    loadSrc();
    warm();
  });

  window.addEventListener("scroll", () => {
    targetP = readP();
    if (hintEl) hintEl.classList.toggle("is-hide", targetP > 0.04);
  }, { passive: true });

  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("pointerdown", unlock, { once: true });

  let last = performance.now();
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const k = 1 - Math.exp(-STIFF * dt);
    currentP += (targetP - currentP) * k;
    if (ready && duration > 0) {
      seek(currentP * Math.max(0.05, duration - 0.05));
    }
    applyChapter(currentP);
  };
  raf = requestAnimationFrame(tick);

  // Hide legacy still frames — film owns the stage
  root.querySelectorAll(".iz-scrub__frame").forEach((f) => {
    f.style.opacity = "0";
    f.style.pointerEvents = "none";
  });
  root.classList.add("iz-scrub--film");
})();
