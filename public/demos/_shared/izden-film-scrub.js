(() => {
  /**
   * Continuous film scrub — currentTime seek, NOT still opacity crossfade.
   *
   * Markup:
   * <section class="iz-scrub iz-scrub--film" data-iz-film-scrub
   *          data-film-pc="…" data-film-mob="…" data-poster="…" data-poster-mob="…">
   *   <div class="iz-scrub__pin">
   *     <div class="iz-scrub__stage"><video class="iz-film" muted playsinline preload="auto"></video></div>
   *     <div class="iz-scrub__veil"></div>
   *     optional: <div class="iz-scrub__hero">…brand hero copy, fades out by p≈0.1…</div>
   *     <div class="iz-scrub__ui">… data-iz-act/title/body …</div>
   *   </div>
   *   optional: <script type="application/json" data-iz-chapters>[…]</script>
   * </section>
   *
   * Exposes on the section:
   *   --iz-p            0..1 scroll progress (CSS can fade hero / drift video)
   *   .is-past-hero     added once p > HERO_END (hero overlay no longer interactive)
   *   data-iz-chapter   current chapter index
   *
   * Jank rules:
   *   - scroll handler only stores a target (no seeking per wheel tick)
   *   - all seeks happen inside one rAF loop, one in flight at a time (coalesced)
   *   - rAF loop sleeps when settled / section offscreen
   *   - prefers-reduced-motion → poster only, video is never downloaded
   */
  const root = document.querySelector("[data-iz-film-scrub]");
  if (!root) return;

  const HERO_END = 0.1;
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
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.removeAttribute("loop");
  video.removeAttribute("autoplay");

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

  const pickPoster = () => {
    const mob = mobileMq.matches;
    return (
      (mob && root.dataset.posterMob) ||
      root.dataset.poster ||
      root.querySelector(".iz-scrub__frame img")?.getAttribute("src") ||
      video.getAttribute("poster") ||
      ""
    );
  };
  const applyPoster = () => {
    const p = pickPoster();
    if (p && video.getAttribute("poster") !== p) video.setAttribute("poster", p);
  };
  applyPoster();

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  let duration = 0;
  let ready = false;
  let seeking = false;
  let pending = null;
  let lastApplied = -1;
  let lastChapter = -1;
  let lastPublished = -1;
  let pastHero = null;
  let targetP = 0;
  let currentP = 0;
  let raf = 0;
  let inView = true;
  let last = 0;
  /* Stiffer follow on desktop, softer on touch (momentum scroll already smooth) */
  const SEEK_EPS = () => (mobileMq.matches ? 0.024 : 0.014);
  const STIFF = () => (mobileMq.matches ? 18 : 22);

  const applyChapter = (p) => {
    if (!chapters.length) return;
    const i = Math.min(chapters.length - 1, Math.floor(p * chapters.length));
    if (i === lastChapter) return;
    lastChapter = i;
    const c = chapters[i];
    if (actEl) actEl.textContent = c.act || "";
    if (titleEl) titleEl.textContent = c.title || "";
    if (bodyEl) bodyEl.textContent = c.body || "";
    root.dataset.izChapter = String(i);
  };

  const publish = (p) => {
    if (Math.abs(p - lastPublished) < 0.0006 && lastPublished >= 0) return;
    lastPublished = p;
    root.style.setProperty("--iz-p", p.toFixed(4));
    const past = p > HERO_END;
    if (past !== pastHero) {
      pastHero = past;
      root.classList.toggle("is-past-hero", past);
    }
  };

  const seek = (t) => {
    if (!ready || duration <= 0) return;
    const next = clamp(t, 0, Math.max(0, duration - 0.04));
    if (
      Math.abs(next - lastApplied) < SEEK_EPS() &&
      Math.abs(next - video.currentTime) < SEEK_EPS() * 1.5
    ) {
      return;
    }
    if (seeking) {
      pending = next; // coalesce: only the latest wanted time survives
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

  const flush = () => {
    if (pending == null) return;
    const t = pending;
    pending = null;
    seek(t);
  };

  video.addEventListener("seeked", () => {
    seeking = false;
    flush();
  });
  // never let a stalled seek freeze the scrub forever
  video.addEventListener("error", () => {
    seeking = false;
  });

  const readP = () => {
    const total = Math.max(1, root.offsetHeight - window.innerHeight);
    const top = root.getBoundingClientRect().top;
    return clamp(-top / total);
  };

  const markReady = () => {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0) {
      duration = d;
      ready = true;
    }
  };

  const loadSrc = () => {
    const src = pickSrc();
    applyPoster();
    if (!src) return;
    if (video.getAttribute("src") === src) {
      markReady();
      return;
    }
    ready = false;
    duration = 0;
    lastApplied = -1;
    seeking = false;
    pending = null;
    video.src = src;
    video.load();
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const tick = (now) => {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    const k = 1 - Math.exp(-STIFF() * dt);
    currentP += (targetP - currentP) * k;
    const settled = Math.abs(targetP - currentP) < 0.00035;
    if (settled) currentP = targetP;
    if (ready && duration > 0) {
      seek(currentP * Math.max(0.05, duration - 0.05));
      /* Chapters follow decoded frame time — avoids text racing ahead of video */
      const played = duration > 0 ? clamp(video.currentTime / duration) : currentP;
      applyChapter(played);
    } else {
      applyChapter(currentP);
    }
    publish(currentP);
    // keep looping while moving; sleep once settled (wake() on next scroll)
    if (!settled || seeking || pending != null) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const onScroll = () => {
    targetP = readP();
    if (hintEl) hintEl.classList.toggle("is-hide", targetP > 0.04);
    // Always wake on scroll — IO can briefly mark offscreen during sticky pin
    // and leave the scrub frozen mid-section on mobile.
    inView = true;
    wake();
  };

  /* ——— reduced motion: poster only, hero copy readable, no video download ——— */
  if (reduced) {
    root.classList.add("iz-scrub--static");
    applyPoster();
    video.removeAttribute("src");
    video.preload = "none";
    applyChapter(0);
    publish(0);
    if (hintEl) hintEl.style.display = "none";
    return;
  }

  /* ——— warm the decoder so the first seeks paint a frame ——— */
  const warm = async () => {
    await new Promise((resolve) => {
      if (video.readyState >= 1 && video.duration > 0) return resolve();
      video.addEventListener("loadedmetadata", resolve, { once: true });
      video.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, mobileMq.matches ? 3500 : 8000);
    });
    markReady();
    if (!ready) return;
    try {
      video.pause();
      const p = video.play();
      if (p && typeof p.then === "function") await p.catch(() => {});
      video.pause();
    } catch {
      /* autoplay blocked — unlock() on first touch handles it */
    }
    try {
      video.currentTime = Math.max(0.02, readP() * duration);
    } catch {
      /* ignore */
    }
    targetP = readP();
    currentP = targetP;
    applyChapter(currentP);
    publish(currentP);
    wake();
  };

  video.addEventListener("loadedmetadata", () => {
    markReady();
    wake();
  });
  video.addEventListener("durationchange", markReady);

  const unlock = () => {
    try {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => video.pause()).catch(() => {});
      } else video.pause();
    } catch {
      /* ignore */
    }
    markReady();
  };

  loadSrc();
  warm();

  mobileMq.addEventListener?.("change", () => {
    loadSrc();
    warm();
  });

  // only run the loop while the section is on / near screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView) {
          targetP = readP();
          wake();
        } else if (Math.abs(targetP - currentP) < 0.002 && !seeking && pending == null) {
          stop();
        }
      },
      { rootMargin: "40% 0px 40% 0px" }
    ).observe(root);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("load", onScroll, { once: true });

  targetP = readP();
  currentP = targetP;
  applyChapter(currentP);
  publish(currentP);

  // Hide legacy still frames — film owns the stage
  root.querySelectorAll(".iz-scrub__frame").forEach((f) => {
    f.style.opacity = "0";
    f.style.pointerEvents = "none";
  });
  root.classList.add("iz-scrub--film");
})();
