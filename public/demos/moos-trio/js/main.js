/* ============================================================
   TRIO LANDSCAPING — interactions
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* --------------------------- Footer year --------------------------- */
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------------------------- Header scroll state --------------------------- */
  const header = $("[data-header]");
  const onScrollHeader = () => header && header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* --------------------------- Mobile nav --------------------------- */
  const navToggle = $("[data-nav-toggle]");
  const overlay = $("[data-nav-overlay]");
  const closeNav = () => {
    document.body.classList.remove("nav-open");
    navToggle && navToggle.setAttribute("aria-expanded", "false");
    overlay && overlay.setAttribute("aria-hidden", "true");
  };
  if (navToggle && overlay) {
    navToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(open));
      overlay.setAttribute("aria-hidden", String(!open));
    });
    $$(".nav-overlay__inner a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeNav());
  }

  /* --------------------------- Reveal on scroll --------------------------- */
  const revealEls = $$("[data-reveal]");
  if (reduce) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          const group = el.closest("[data-reveal-group]");
          let delay = 0;
          if (group) {
            const step = parseFloat(group.getAttribute("data-reveal-group")) || 0.08;
            const sibs = $$("[data-reveal]", group);
            delay = sibs.indexOf(el) * step;
          }
          el.style.transitionDelay = delay + "s";
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* --------------------------- Count-up --------------------------- */
  const counts = $$("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    if (reduce) { el.textContent = prefix + target.toLocaleString() + suffix; return; }
    const dur = 1500;
    let start = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = clamp((ts - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counts.length) {
    if ("IntersectionObserver" in window && !reduce) {
      const cio = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        }),
        { threshold: 0.6 }
      );
      counts.forEach((el) => cio.observe(el));
    } else counts.forEach(runCount);
  }

  /* --------------------------- Marquee (seamless) --------------------------- */
  // Duplicate the row's content so the -50% translate loop is seamless.
  const marqueeRow = $("[data-marquee] .marquee__row");
  if (marqueeRow) marqueeRow.innerHTML = marqueeRow.innerHTML + marqueeRow.innerHTML;

  /* --------------------------- Pointer specular + magnetic --------------------------- */
  const setPx = (el, e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  };
  $$(".btn, .glass, [data-glass]").forEach((el) => {
    el.addEventListener("pointermove", (e) => setPx(el, e));
  });
  if (!reduce && !coarse) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.28;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* --------------------------- 3D tilt --------------------------- */
  if (!reduce && !coarse) {
    $$("[data-tilt]").forEach((el) => {
      const max = 6;
      el.style.transformStyle = "preserve-3d";
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* --------------------------- Statement cursor spotlight --------------------------- */
  const statement = $("[data-spotlight]");
  if (statement) {
    const setPct = (x, y) => {
      statement.style.setProperty("--mx", x + "%");
      statement.style.setProperty("--my", y + "%");
    };
    setPct(50, 50);
    if (coarse || reduce) {
      // gentle automatic orbit when the section is on screen
      let raf = null, t = 0, active = false;
      const loop = () => {
        t += 0.012;
        setPct(50 + Math.cos(t) * 34, 50 + Math.sin(t * 1.3) * 40);
        raf = requestAnimationFrame(loop);
      };
      if ("IntersectionObserver" in window && !reduce) {
        new IntersectionObserver((en) => {
          en.forEach((e) => {
            if (e.isIntersecting && !active) { active = true; statement.classList.add("is-live"); loop(); }
            else if (!e.isIntersecting && active) { active = false; statement.classList.remove("is-live"); cancelAnimationFrame(raf); }
          });
        }, { threshold: 0.4 }).observe(statement);
      }
    } else {
      statement.addEventListener("pointermove", (e) => {
        const r = statement.getBoundingClientRect();
        setPct(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
        statement.classList.add("is-live");
      });
      statement.addEventListener("pointerleave", () => statement.classList.remove("is-live"));
    }
  }

  /* --------------------------- Featured cover parallax --------------------------- */
  const parallax = $("[data-parallax]");
  const parallaxScene = $("[data-parallax-scene]");
  if (parallax && parallaxScene && !reduce) {
    let ticking = false;
    const update = () => {
      const r = parallaxScene.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) { ticking = false; return; }
      const prog = clamp((vh - r.top) / (vh + r.height), 0, 1); // 0..1 across viewport
      parallax.style.transform = `translateY(${(prog - 0.5) * 12}%)`;
      ticking = false;
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    update();
  }

  /* --------------------------- HERO scroll-scrub video --------------------------- */
  const hero = $("[data-hero]");
  const heroVideo = $("[data-hero-video]");
  const heroTitles = $$("[data-hero-title]");
  const heroHint = $("[data-hero-hint]");

  // Trigger the masked line reveal shortly after load
  requestAnimationFrame(() => hero && hero.classList.add("is-ready"));

  // band(p): 0 before a, ramps to 1 across [a,b], 1 across [b,c], ramps to 0 across [c,d]
  const band = (p, a, b, c, d) => {
    if (p <= a || p >= d) return 0;
    if (p < b) return (p - a) / (b - a);
    if (p <= c) return 1;
    return 1 - (p - c) / (d - c);
  };

  if (hero && !reduce) {
    let duration = 0, targetTime = 0, curTime = 0, rafing = false;

    if (heroVideo) {
      heroVideo.pause();
      const onMeta = () => {
        duration = heroVideo.duration || 5;
        try { heroVideo.currentTime = 0.02; } catch (e) {}
      };
      if (heroVideo.readyState >= 1) onMeta();
      heroVideo.addEventListener("loadedmetadata", onMeta);
      // Unlock seeking on some mobile browsers after first interaction
      const unlock = () => {
        heroVideo.play().then(() => heroVideo.pause()).catch(() => {});
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("wheel", unlock);
      };
      window.addEventListener("touchstart", unlock, { passive: true, once: true });
      window.addEventListener("wheel", unlock, { passive: true, once: true });
    }

    const smooth = () => {
      curTime = lerp(curTime, targetTime, 0.18);
      if (heroVideo && duration && heroVideo.readyState >= 2 && Math.abs(curTime - heroVideo.currentTime) > 0.015) {
        try { heroVideo.currentTime = curTime; } catch (e) {}
      }
      if (Math.abs(curTime - targetTime) > 0.004) requestAnimationFrame(smooth);
      else rafing = false;
    };

    const bands = [
      [-0.2, -0.1, 0.22, 0.32], // title 0 is fully visible at rest (p = 0)
      [0.34, 0.44, 0.56, 0.66],
      [0.70, 0.80, 1.02, 1.03],
    ];

    let hticking = false;
    const updateHero = () => {
      const rangeH = hero.offsetHeight - window.innerHeight;
      const p = rangeH > 0 ? clamp(-hero.getBoundingClientRect().top / rangeH, 0, 1) : 0;

      // video scrub
      if (duration) {
        targetTime = clamp(p, 0, 0.999) * duration;
        if (!rafing) { rafing = true; requestAnimationFrame(smooth); }
      }
      // subtle zoom parallax
      if (heroVideo) heroVideo.style.transform = `scale(${lerp(1.06, 1.14, p)}) translateY(${p * -2}%)`;

      // titles
      heroTitles.forEach((el, i) => {
        const op = band(p, bands[i][0], bands[i][1], bands[i][2], bands[i][3]);
        el.style.opacity = op.toFixed(3);
        el.style.transform = `translateY(${(1 - op) * (i === 0 ? -18 : 26)}px)`;
      });

      // hint
      if (heroHint) heroHint.style.opacity = String(clamp(1 - p * 8, 0, 1));

      hticking = false;
    };
    const reqHero = () => { if (!hticking) { hticking = true; requestAnimationFrame(updateHero); } };
    window.addEventListener("scroll", reqHero, { passive: true });
    window.addEventListener("resize", reqHero);
    updateHero();
  } else if (hero && reduce && heroVideo) {
    // reduced motion: loop the clip quietly, show first title only
    heroVideo.loop = true;
    heroVideo.muted = true;
    heroVideo.play().catch(() => {});
  }

  /* --------------------------- Projects filter --------------------------- */
  const filterScope = $("[data-filter-scope]");
  if (filterScope) {
    const buttons = $$("[data-filter]", filterScope.parentElement || document);
    const items = $$(".filter-item");
    const apply = (filter) => {
      items.forEach((it) => it.classList.add("is-filtering"));
      setTimeout(() => {
        items.forEach((it) => {
          const match = filter === "all" || it.dataset.category === filter;
          it.classList.toggle("is-hidden", !match);
        });
        requestAnimationFrame(() =>
          requestAnimationFrame(() => items.forEach((it) => it.classList.remove("is-filtering")))
        );
      }, reduce ? 0 : 240);
    };
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        apply(btn.getAttribute("data-filter"));
      });
    });
  }

  /* --------------------------- Testimonials slider --------------------------- */
  $$("[data-slider]").forEach((slider) => {
    const track = $(".slider__track", slider);
    const slides = $$(".slider__slide", slider);
    const dotsWrap = $("[data-slider-dots]", slider);
    const prev = $("[data-slider-prev]", slider);
    const next = $("[data-slider-next]", slider);
    if (!track || !slides.length) return;

    let per = parseInt(slider.getAttribute("data-per") || "1", 10);
    let index = 0, maxIndex = 0, timer = null;

    const layout = () => {
      per = window.innerWidth < 760 ? 1 : parseInt(slider.getAttribute("data-per") || "1", 10);
      slides.forEach((s) => (s.style.flexBasis = 100 / per + "%"));
      maxIndex = Math.max(0, slides.length - per);
      index = Math.min(index, maxIndex);
      buildDots();
      go(index, false);
    };
    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let i = 0; i <= maxIndex; i++) {
        const b = document.createElement("button");
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", () => { go(i); rest(); });
        dotsWrap.appendChild(b);
      }
    };
    const go = (i, animate = true) => {
      index = (i + (maxIndex + 1)) % (maxIndex + 1);
      track.style.transition = animate && !reduce ? "transform .7s cubic-bezier(.16,1,.3,1)" : "none";
      track.style.transform = `translateX(${-index * (100 / per)}%)`;
      if (dotsWrap) $$("button", dotsWrap).forEach((d, di) => d.classList.toggle("is-active", di === index));
    };
    const start = () => { if (!reduce) timer = setInterval(() => go(index + 1), 5600); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const rest = () => { stop(); start(); };

    prev && prev.addEventListener("click", () => { go(index - 1); rest(); });
    next && next.addEventListener("click", () => { go(index + 1); rest(); });
    slider.addEventListener("pointerenter", stop);
    slider.addEventListener("pointerleave", start);
    slider.addEventListener("focusin", stop);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    // drag
    let dragging = false, startX = 0, base = 0, moved = 0;
    const vp = $(".slider__viewport", slider) || slider;
    vp.addEventListener("pointerdown", (e) => {
      dragging = true; startX = e.clientX; moved = 0;
      base = -index * (100 / per);
      track.style.transition = "none";
      vp.setPointerCapture && vp.setPointerCapture(e.pointerId);
      stop();
    });
    vp.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moved = e.clientX - startX;
      const pct = base + (moved / vp.offsetWidth) * 100;
      track.style.transform = `translateX(${pct}%)`;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      const threshold = vp.offsetWidth * 0.16;
      if (moved < -threshold) go(index + 1);
      else if (moved > threshold) go(index - 1);
      else go(index);
      start();
    };
    vp.addEventListener("pointerup", endDrag);
    vp.addEventListener("pointercancel", endDrag);

    window.addEventListener("resize", layout);
    layout();
    start();
  });

  /* --------------------------- Customiser (layout cycler) --------------------------- */
  const stage = $("[data-layout-stage]");
  const customiseBtn = $("[data-customise]");
  if (stage && customiseBtn) {
    const layouts = $$(".customiser__layout", stage);
    const idxEl = $("[data-layout-index]");
    const totalEl = $("[data-layout-total]");
    let cur = layouts.findIndex((l) => l.classList.contains("is-active"));
    if (cur < 0) cur = 0;
    const pad = (n) => String(n).padStart(2, "0");
    if (totalEl) totalEl.textContent = pad(layouts.length);
    if (idxEl) idxEl.textContent = pad(cur + 1);

    let busy = false;
    customiseBtn.addEventListener("click", () => {
      if (busy || layouts.length < 2) return;
      busy = true;
      const nextIdx = (cur + 1) % layouts.length;
      layouts[cur].classList.remove("is-active");
      layouts[nextIdx].classList.add("is-active");
      stage.classList.add("is-switching");
      cur = nextIdx;
      if (idxEl) idxEl.textContent = pad(cur + 1);
      setTimeout(() => { stage.classList.remove("is-switching"); busy = false; }, reduce ? 0 : 850);
    });
  }

  /* --------------------------- Contact form --------------------------- */
  const form = $("[data-contact-form]");
  if (form) {
    const success = $("[data-contact-success]", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (success) {
        success.hidden = false;
        requestAnimationFrame(() => success.classList.add("is-in"));
      }
      form.reset();
    });
  }
})();
