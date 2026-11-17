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
  
  const steps = [...document.querySelectorAll(".ritual-step")];
  const dots = [...document.querySelectorAll(".ritual-dots button")];
  let step = 0;
  const go = (i) => {
    step = i;
    steps.forEach((s,idx)=>s.classList.toggle("is-active",idx===i));
    dots.forEach((b,idx)=>b.classList.toggle("is-active",idx===i));
  };
  dots.forEach((b)=>b.addEventListener("click",()=>go(Number(b.dataset.go)||0)));
  const ritual = document.getElementById("ritualSteps") || document.querySelector(".sig--solace");
  if (!reduced && steps.length && ritual) {
    let locked = false;
    const onScroll = () => {
      if (locked) return;
      const rect = ritual.getBoundingClientRect();
      const span = Math.max(1, ritual.offsetHeight);
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / span));
      go(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    let tick = false;
    window.addEventListener("scroll", () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        onScroll();
        tick = false;
      });
    }, { passive: true });
    onScroll();
    dots.forEach((b) => b.addEventListener("click", () => { locked = true; }));
  } else if (steps.length) go(0);
})();