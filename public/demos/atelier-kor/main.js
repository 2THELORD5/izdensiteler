(() => {
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
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buttons = document.querySelectorAll(".tabs__btn");
  const panels = document.querySelectorAll(".tabs__panel");

  const showPanel = (id) => {
    buttons.forEach((btn) => {
      const active = btn.getAttribute("data-panel") === id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach((panel) => {
      const match = panel.getAttribute("data-panel-id") === id;
      panel.hidden = !match;
      panel.classList.toggle("is-visible", match);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => showPanel(btn.getAttribute("data-panel")));
  });

  const chapterIds = ["fire", "plate", "night"];
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (!id || !chapterIds.includes(id)) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showPanel(id);
      document.getElementById("fire")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  const runCounter = (el) => {
    const target = Number(el.getAttribute("data-target")) || 0;
    if (reduced) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(t * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll(".counter");
  if (counters.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((c) => io.observe(c));
  }
})();