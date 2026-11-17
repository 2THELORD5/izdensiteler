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
  const video = document.querySelector(".hero__video");
  if (reduced && video) {
    video.pause();
    video.removeAttribute("autoplay");
  }

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
      panel.classList.toggle("is-active", match);
      panel.hidden = !match;
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => showPanel(btn.getAttribute("data-panel")));
  });

  const chapterToPanel = { fire: "fire", plate: "plate", night: "night" };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const raw = link.getAttribute("href")?.slice(1);
    if (!raw || !(raw in chapterToPanel)) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showPanel(chapterToPanel[raw]);
      document.getElementById("fire")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  const runCounter = (el) => {
    if (el.dataset.done === "1") return;
    const target = Number(el.getAttribute("data-target")) || 0;
    el.dataset.done = "1";
    if (reduced) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const duration = target > 100 ? 1600 : 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = String(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  document.querySelectorAll(".counter").forEach((counter) => {
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
    io.observe(counter);
  });

  const form = document.getElementById("reserveForm");
  const status = document.getElementById("reserveStatus");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (status) {
      status.hidden = false;
      status.textContent = "Teşekkürler — demo talebiniz alındı. Ekibimiz 24 saat içinde dönüş yapacak.";
    }
    form.reset();
  });

  /* Signature: ember heat + scroll-driven Fire→Plate→Night */
  const heatSec = document.querySelector(".fire-heat");
  const heatOrder = ["fire", "plate", "night"];
  const updateHeat = () => {
    if (!heatSec || reduced) return;
    const rect = heatSec.getBoundingClientRect();
    const span = Math.max(1, heatSec.offsetHeight - window.innerHeight * 0.35);
    const traveled = Math.min(span, Math.max(0, -rect.top + window.innerHeight * 0.2));
    const p = traveled / span;
    heatSec.style.setProperty("--heat", String(p));
    const idx = Math.min(heatOrder.length - 1, Math.floor(p * heatOrder.length));
    const id = heatOrder[idx];
    const active = document.querySelector(".tabs__btn.is-active");
    if (active?.getAttribute("data-panel") !== id) showPanel(id);
  };
  if (heatSec && !reduced) {
    let heatTick = false;
    const onHeat = () => {
      if (heatTick) return;
      heatTick = true;
      requestAnimationFrame(() => {
        updateHeat();
        heatTick = false;
      });
    };
    window.addEventListener("scroll", onHeat, { passive: true });
    window.addEventListener("resize", onHeat, { passive: true });
    updateHeat();
  }
})();