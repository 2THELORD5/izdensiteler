(() => {
  /**
   * Convert click/arrow image carousels into scroll-driven stages.
   * Marks: [data-iz-scroll-gallery] or auto-detects known patterns.
   */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function progress(el) {
    const rect = el.getBoundingClientRect();
    const scrollable = el.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / scrollable));
  }

  function bindScroll(root, count, apply) {
    if (count < 2) return;
    if (reduced) {
      apply(0);
      return;
    }
    let tick = false;
    const on = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const p = progress(root);
        const i = Math.min(count - 1, Math.floor(p * count));
        apply(i, p);
        tick = false;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    on();
  }

  /* ——— SAPA-style .gallery-section / .gallery-track ——— */
  document.querySelectorAll(".gallery-section").forEach((section) => {
    const track = section.querySelector(".gallery-track");
    if (!track) return;
    const items = [...track.children];
    if (items.length < 2) return;
    section.classList.add("iz-sg");
    section.style.setProperty("--iz-sg-n", String(items.length));
    // Hide arrow click UX — scroll owns the index
    section.querySelectorAll(".g-arrow").forEach((b) => {
      b.setAttribute("aria-hidden", "true");
      b.tabIndex = -1;
      b.style.pointerEvents = "none";
      b.style.opacity = "0.35";
    });
    const counter = section.querySelector(".g-counter");
    const progressEl = section.querySelector("[id$='-progress']");
    const stub = track.getAttribute("data-stub") || "";
    const shell = track.parentElement;

    // Make section tall enough to scrub through all items
    if (!section.style.minHeight) {
      section.style.minHeight = `${Math.max(220, items.length * 70)}vh`;
    }
    if (shell) {
      shell.classList.add("iz-sg__shell");
      shell.style.position = "sticky";
      shell.style.top = "0";
      shell.style.height = "100svh";
      shell.style.display = "grid";
      shell.style.placeItems = "center";
      shell.style.overflow = "hidden";
    }

    const apply = (index) => {
      const item = items[index];
      const gap = parseFloat(getComputedStyle(track).gap) || 26;
      if (shell && item) {
        const x =
          shell.clientWidth / 2 -
          item.offsetWidth / 2 -
          index * (item.offsetWidth + gap);
        track.style.transform = `translateX(${x}px)`;
        track.style.transition = reduced ? "none" : "transform 0.45s cubic-bezier(.22,1,.36,1)";
      }
      items.forEach((el, i) => {
        el.classList.toggle("active", i === index);
        el.classList.toggle("peek", Math.abs(i - index) === 1);
      });
      if (counter) {
        counter.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b> / ${String(items.length).padStart(2, "0")}`;
      }
      if (progressEl) progressEl.style.width = `${((index + 1) / items.length) * 100}%`;
      // Disable site’s own click gallery for this track
      track.dataset.izScrollBound = "1";
    };

    bindScroll(section, items.length, apply);
  });

  /* ——— NICHE .i-slider ——— */
  document.querySelectorAll(".i-slider").forEach((slider) => {
    const slides = [...slider.querySelectorAll(".i-slide")];
    if (slides.length < 2) return;
    const wrap =
      slider.closest(".sliderStageWrap") ||
      (() => {
        const w = document.createElement("div");
        w.className = "iz-sg-wrap";
        slider.parentNode.insertBefore(w, slider);
        w.appendChild(slider);
        return w;
      })();
    wrap.classList.add("iz-sg");
    wrap.style.minHeight = `${Math.max(240, slides.length * 80)}vh`;
    slider.classList.add("iz-sg__pin");
    slider.style.position = "sticky";
    slider.style.top = "0";
    slider.style.minHeight = "100svh";

    // Hide nav if present
    wrap.querySelectorAll("button, .i-nav, [data-slider-prev], [data-slider-next]").forEach((b) => {
      if (b.closest(".i-slide")) return;
      b.style.pointerEvents = "none";
      b.style.opacity = "0.3";
    });

    const apply = (index) => {
      slides.forEach((el, i) => {
        const on = i === index;
        el.classList.toggle("is-on", on);
        el.setAttribute("aria-hidden", on ? "false" : "true");
        if (on) el.removeAttribute("inert");
        else el.setAttribute("inert", "");
        el.style.opacity = on ? "1" : "0";
        el.style.pointerEvents = on ? "auto" : "none";
        el.style.zIndex = on ? "2" : "0";
      });
    };
    // ensure absolute stack
    const stage = slider.querySelector(".i-stage") || slider;
    stage.style.position = "relative";
    slides.forEach((el) => {
      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.transition = "opacity 0.55s ease";
    });
    bindScroll(wrap, slides.length, apply);
  });

  /* ——— BLOK .hero.bleedgrid carousel ——— */
  document.querySelectorAll('section.hero[aria-roledescription="carousel"]').forEach((hero) => {
    const figs = [...hero.querySelectorAll(".hero__figure")];
    if (figs.length < 2) return;
    hero.classList.add("iz-sg");
    hero.style.minHeight = `${Math.max(260, figs.length * 85)}vh`;
    const media = hero.querySelector(".hero__media");
    if (media) {
      media.style.position = "sticky";
      media.style.top = "0";
      media.style.height = "100svh";
      media.style.overflow = "hidden";
    }
    hero.querySelectorAll(".hero__navbtn, .hero__nav").forEach((b) => {
      b.style.pointerEvents = "none";
      b.style.opacity = "0.35";
    });
    const apply = (index) => {
      figs.forEach((el, i) => {
        const on = i === index;
        el.dataset.active = on ? "true" : "false";
        el.setAttribute("aria-hidden", on ? "false" : "true");
        el.style.opacity = on ? "1" : "0";
        el.style.zIndex = on ? "2" : "0";
      });
    };
    figs.forEach((el) => {
      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.transition = "opacity 0.6s ease";
    });
    if (media) media.style.position = media.style.position || "sticky";
    bindScroll(hero, figs.length, apply);
  });

  /* ——— Generic [data-iz-scroll-gallery] ——— */
  document.querySelectorAll("[data-iz-scroll-gallery]").forEach((root) => {
    const sel = root.dataset.izScrollGallery || "[data-iz-slide]";
    const slides = [...root.querySelectorAll(sel)];
    if (slides.length < 2) return;
    root.classList.add("iz-sg");
    root.style.minHeight = `${Math.max(220, slides.length * 75)}vh`;
    const pin = root.querySelector("[data-iz-sg-pin]") || root.firstElementChild;
    if (pin) {
      pin.style.position = "sticky";
      pin.style.top = "0";
      pin.style.minHeight = "100svh";
    }
    const apply = (index) => {
      slides.forEach((el, i) => el.classList.toggle("is-on", i === index));
    };
    bindScroll(root, slides.length, apply);
  });
})();
