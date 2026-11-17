(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = btn.parentElement?.querySelector(".faq__a");
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });
  
  const rail = document.getElementById("snapRail");
  const panels = document.querySelectorAll(".snap-panel");
  if (rail && panels.length && !reduced) {
    const draw = () => {
      const x = rail.scrollLeft + rail.clientWidth / 2;
      panels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const c = r.left + r.width / 2;
        if (Math.abs(c - window.innerWidth / 2) < r.width * 0.45) p.classList.add("is-drawn");
      });
    };
    rail.addEventListener("scroll", draw, { passive: true });
    draw();
  } else panels.forEach((p) => p.classList.add("is-drawn"));
})();