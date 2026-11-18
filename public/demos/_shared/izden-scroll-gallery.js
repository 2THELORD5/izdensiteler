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
      // static: first item, no pin, no tall section (CSS collapses .iz-sg in reduced motion)
      apply(0, 0, 0);
      return;
    }
    let tick = false;
    let lastIndex = -1;
    const run = () => {
      tick = false;
      const p = progress(root);
      const raw = p * count;
      const i = Math.min(count - 1, Math.floor(raw));
      const local = Math.min(1, Math.max(0, raw - i));
      root.style.setProperty("--iz-sg-p", p.toFixed(4));
      root.style.setProperty("--iz-sg-local", local.toFixed(4));
      // apply() only when the active index changes — avoids layout thrash per wheel tick
      if (i !== lastIndex) {
        lastIndex = i;
        apply(i, p, local);
      }
      root.dispatchEvent(
        new CustomEvent("iz-sg", { detail: { index: i, p, local, count } })
      );
    };
    const on = () => {
      if (tick) return; // rAF-coalesce scroll / resize bursts
      tick = true;
      requestAnimationFrame(run);
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", () => {
      lastIndex = -1;
      on();
    }, { passive: true });
    run();
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

  /* ——— Leaft / Greenit project rail (prev/next → scroll) ——— */
  document.querySelectorAll("#projects, .projects-rail, [data-projects-rail]").forEach((section) => {
    if (section.hasAttribute("data-iz-scroll-gallery")) return; // generic mode owns it
    const list =
      section.querySelector("#rail, .rail-track, .proj-track, ul.rail, ul.projects, .projects__list, .rail__list") ||
      section.querySelector("ul");
    if (!list) return;
    const items = [...list.children].filter((el) => el.tagName === "LI" || el.classList.contains("proj"));
    if (items.length < 2) return;
    section.classList.add("iz-sg");
    section.style.minHeight = `${Math.max(240, items.length * 70)}vh`;
    const pin =
      section.querySelector(".wrap") ||
      (() => {
        const w = document.createElement("div");
        section.insertBefore(w, section.firstChild);
        while (section.children.length > 1) w.appendChild(section.children[1]);
        return w;
      })();
    pin.style.position = "sticky";
    pin.style.top = "0";
    pin.style.minHeight = "100svh";
    pin.style.display = "flex";
    pin.style.flexDirection = "column";
    pin.style.justifyContent = "center";
    section.querySelectorAll("#railPrev, #railNext, .rail-ctrl__btns").forEach((b) => {
      b.style.pointerEvents = "none";
      b.style.opacity = "0.35";
    });
    const now = section.querySelector("#railNow");
    const apply = (index) => {
      items.forEach((el, i) => {
        el.classList.toggle("is-on", i === index);
        el.classList.toggle("is-active", i === index);
        el.style.opacity = i === index ? "1" : "0.22";
        el.style.transform = i === index ? "none" : "scale(0.96)";
      });
      if (now) now.textContent = String(index + 1).padStart(2, "0");
      // horizontal translate if track is a row
      const gap = parseFloat(getComputedStyle(list).gap) || 24;
      const item = items[index];
      if (item && getComputedStyle(list).display.includes("flex")) {
        const x = pin.clientWidth / 2 - item.offsetWidth / 2 - index * (item.offsetWidth + gap);
        list.style.transform = `translateX(${x}px)`;
        list.style.transition = reduced ? "none" : "transform 0.45s cubic-bezier(.22,1,.36,1)";
      }
    };
    items.forEach((el) => {
      el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
    });
    bindScroll(section, items.length, apply);
  });

  /* ——— Generic [data-iz-scroll-gallery] ———
     data-iz-scroll-gallery="<slide selector>"   (default [data-iz-slide])
     data-iz-sg-pin       child that sticks (default first child)
     data-iz-sg-track     selector: row translated so active slide is centred
     data-iz-sg-counter   selector: element whose text becomes "01"
     data-iz-sg-vh        height per slide in vh (default 80)
     sets --iz-sg-p / --iz-sg-local on root, toggles .is-on, fires "iz-sg". */
  document.querySelectorAll("[data-iz-scroll-gallery]").forEach((root) => {
    const sel = root.dataset.izScrollGallery || "[data-iz-slide]";
    const slides = [...root.querySelectorAll(sel)];
    if (slides.length < 2) return;
    root.classList.add("iz-sg", "iz-sg--generic");
    const perSlide = parseFloat(root.dataset.izSgVh) || 80;
    root.style.setProperty("--iz-sg-n", String(slides.length));
    root.style.setProperty("--iz-sg-vh", `${Math.max(220, slides.length * perSlide)}vh`);
    const pin = root.querySelector("[data-iz-sg-pin]") || root.firstElementChild;
    if (pin) pin.classList.add("iz-sg__pin");
    const track = root.dataset.izSgTrack ? root.querySelector(root.dataset.izSgTrack) : null;
    const counter = root.dataset.izSgCounter ? root.querySelector(root.dataset.izSgCounter) : null;
    const apply = (index) => {
      slides.forEach((el, i) => {
        const on = i === index;
        el.classList.toggle("is-on", on);
        el.classList.toggle("is-past", i < index);
        el.setAttribute("aria-hidden", on || track ? "false" : "true");
      });
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      if (track) {
        // offset of the item inside the track is invariant under the track's own
        // translate (both rects are read at the same instant) → safe mid-transition
        const item = slides[index];
        const host = track.parentElement;
        const tr = track.getBoundingClientRect();
        const ir = item.getBoundingClientRect();
        const x = host.clientWidth / 2 - (ir.left - tr.left) - ir.width / 2;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      const dots = root.querySelectorAll("[data-iz-sg-dot]");
      dots.forEach((d, i) => d.classList.toggle("is-on", i === index));
    };
    if (track) {
      track.style.overflow = "visible";
      track.style.scrollSnapType = "none";
      track.style.willChange = "transform";
    }
    bindScroll(root, slides.length, apply);
  });
})();
