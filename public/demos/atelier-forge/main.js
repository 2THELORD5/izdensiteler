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
  
  const grind = document.getElementById("grindNum");
  if (grind) {
    const target = Number(grind.dataset.target)||420;
    if (reduced) grind.textContent = String(target);
    else {
      const tick = (start) => (now) => {
        const t = Math.min(1,(now-start)/1400);
        grind.textContent = String(Math.round(t*target)).padStart(3,"0");
        if (t<1) requestAnimationFrame(tick(start));
      };
      const io = new IntersectionObserver((e)=>{if(e[0]?.isIntersecting){requestAnimationFrame(tick(performance.now()));io.disconnect();}},{threshold:.4});
      io.observe(grind);
    }
  }
})();