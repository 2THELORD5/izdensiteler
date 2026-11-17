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
  if (!reduced && steps.length) {
    let timer = setInterval(()=>go((step+1)%steps.length), 4500);
    document.getElementById("ritualSteps")?.addEventListener("pointerenter",()=>clearInterval(timer));
  }
})();