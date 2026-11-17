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
  
  const wrap = document.getElementById("atlasPinWrap");
  const pin = document.getElementById("atlasPin");
  const gear = document.getElementById("atlasGear");
  const onAtlas = () => {
    if (!wrap || !pin) return;
    const rect = wrap.getBoundingClientRect();
    const h = wrap.offsetHeight - window.innerHeight;
    const t = h > 0 ? Math.min(1, Math.max(0, (-rect.top) / h)) : 0;
    pin.style.setProperty("--pin-p", String(t));
    if (gear) [...gear.children].forEach((li, i) => li.classList.toggle("is-on", t > i * 0.22));
  };
  if (wrap && !reduced) { let tick=false; const run=()=>{if(!tick){tick=true;requestAnimationFrame(()=>{onAtlas();tick=false;});}}; window.addEventListener("scroll",run,{passive:true}); window.addEventListener("resize",run); onAtlas(); } else if (gear) [...gear.children].forEach((li)=>li.classList.add("is-on"));
})();