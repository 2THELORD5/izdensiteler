(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* —— Mobile nav —— */
  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("navBackdrop");
  const closeBtn = document.getElementById("navClose");
  const nav = document.getElementById("nav");

  const setOpen = (open) => {
    if (!drawer || !nav) return;
    nav.dataset.open = open ? "true" : "false";
    drawer.dataset.open = open ? "true" : "false";
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger?.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger?.addEventListener("click", () => setOpen(true));
  closeBtn?.addEventListener("click", () => setOpen(false));
  backdrop?.addEventListener("click", () => setOpen(false));
  drawer?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  /* —— Collection counter —— */
  const counter = document.querySelector(".counter");
  if (counter) {
    const target = Number(counter.getAttribute("data-target")) || 0;
    if (reduced) {
      counter.textContent = String(target);
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const start = performance.now();
            const duration = 1200;
            const tick = (now) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - (1 - t) ** 3;
              counter.textContent = String(Math.round(eased * target));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          });
        },
        { threshold: 0.35 }
      );
      io.observe(counter);
    } else {
      counter.textContent = String(target);
    }
  }

  /* —— Floor ascent scrub (01 → 34) —— */
  const ascent = document.getElementById("ascent");
  const floorNum = document.getElementById("floorNum");

  const padFloor = (n) => String(n).padStart(2, "0");

  const updateFloor = () => {
    if (!ascent || !floorNum) return;
    const min = Number(floorNum.dataset.min) || 1;
    const max = Number(floorNum.dataset.max) || 34;
    const rect = ascent.getBoundingClientRect();
    const scrollable = ascent.offsetHeight - window.innerHeight;
    if (scrollable <= 0) {
      floorNum.textContent = padFloor(min);
      return;
    }
    const traveled = Math.min(scrollable, Math.max(0, -rect.top));
    const p = traveled / scrollable;
    const value = Math.round(min + p * (max - min));
    floorNum.textContent = padFloor(value);
  };

  if (ascent && floorNum && !reduced) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateFloor();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateFloor();
  } else if (floorNum) {
    floorNum.textContent = padFloor(Number(floorNum.dataset.max) || 34);
  }

  /* —— Horizontal look rail —— */
  const lookRail = document.getElementById("lookRail");
  const lookTrack = document.getElementById("lookTrack");

  const updateLookRail = () => {
    if (!lookRail || !lookTrack) return;
    const viewport = lookRail.querySelector(".look-rail__viewport");
    if (!viewport) return;
    const trackW = lookTrack.scrollWidth;
    const viewW = viewport.clientWidth;
    const maxShift = Math.max(0, trackW - viewW);
    if (maxShift === 0) {
      lookTrack.style.transform = "translate3d(0,0,0)";
      return;
    }
    const rect = lookRail.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const end = -rect.height * 0.15;
    const span = start - end;
    const raw = (start - rect.top) / span;
    const p = Math.min(1, Math.max(0, raw));
    const x = -p * maxShift;
    lookTrack.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  if (lookRail && lookTrack && !reduced) {
    let railTick = false;
    const onRail = () => {
      if (railTick) return;
      railTick = true;
      requestAnimationFrame(() => {
        updateLookRail();
        railTick = false;
      });
    };
    window.addEventListener("scroll", onRail, { passive: true });
    window.addEventListener("resize", onRail);
    updateLookRail();
  }

  /* —— FAQ accordion —— */
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = btn.parentElement?.querySelector(".faq__a");
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });
})();