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
  
  const stage = document.getElementById("velvetStage");
  const chapters = stage ? [...stage.querySelectorAll(".velvet-chapter")] : [];
  const cork = document.getElementById("corkCount");
  let ch = 0;
  const setChapter = (i) => {
    ch = i;
    chapters.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
    if (cork) {
      cork.textContent = String(i + 1);
      const counter = cork.closest('.velvet-counter');
      if (counter) {
        counter.classList.remove('is-tick');
        void counter.offsetWidth;
        counter.classList.add('is-tick');
      }
    }
  };
  if (stage && chapters.length) {
    if (!reduced) {
      window.addEventListener("scroll", () => {
        const r = stage.getBoundingClientRect();
        const p = 1 - Math.min(1, Math.max(0, (r.bottom - window.innerHeight * 0.35) / r.height));
        setChapter(Math.min(chapters.length - 1, Math.floor(p * chapters.length)));
      }, { passive: true });
    } else setChapter(chapters.length - 1);
  }
})();