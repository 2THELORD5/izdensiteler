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

  const tabs = document.querySelectorAll(".panels__tab");
  const cards = document.querySelectorAll(".panels__card");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const activate = (step) => {
    const idx = Number(step);
    tabs.forEach((tab) => {
      const on = Number(tab.getAttribute("data-step")) === idx;
      tab.classList.toggle("is-on", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    cards.forEach((card) => {
      const on = Number(card.getAttribute("data-step")) === idx;
      card.hidden = !on;
      card.classList.toggle("is-active", on);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.getAttribute("data-step")));
  });

  const anchorMap = { notes: 0, ritual: 1, collection: 2 };
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (id && id in anchorMap) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        activate(anchorMap[id]);
        const target = document.getElementById(id) || document.getElementById("notes");
        target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
    }
  });
})();