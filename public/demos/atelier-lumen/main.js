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
    if (burger) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (backdrop) {
      backdrop.hidden = !open;
    }
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

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counter = document.querySelector(".counter");
  if (counter && !reduced) {
    const target = Number(counter.getAttribute("data-target")) || 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const start = performance.now();
          const duration = 1400;
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
      { threshold: 0.4 }
    );
    io.observe(counter);
  } else if (counter) {
    counter.textContent = counter.getAttribute("data-target") || "0";
  }
})();