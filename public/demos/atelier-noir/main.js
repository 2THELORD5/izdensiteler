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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  /* Signature: sillage chapters + mist */
  const sillage = document.querySelector("[data-sillage]");
  const sillageImgs = sillage ? [...sillage.querySelectorAll("[data-sillage-img]")] : [];
  const sillagePanels = sillage ? [...sillage.querySelectorAll("[data-sillage-panel]")] : [];
  const sillageBars = sillage ? [...sillage.querySelectorAll("[data-bar]")] : [];

  const setSillage = (index) => {
    const i = Math.max(0, Math.min(index, sillagePanels.length - 1));
    sillagePanels.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
    sillageImgs.forEach((el, idx) => el.classList.toggle("is-on", idx === i));
    sillageBars.forEach((el, idx) => el.classList.toggle("is-on", idx === i));
  };

  const updateSillage = () => {
    if (!sillage || reduced) return;
    const rect = sillage.getBoundingClientRect();
    const scrollable = sillage.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = clamp01(-rect.top / scrollable);
    sillage.style.setProperty("--sillage-p", String(p));
    setSillage(Math.min(2, Math.floor(p * 3.001)));
  };

  if (sillage && !reduced) {
    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        updateSillage();
        tick = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateSillage();
  } else {
    setSillage(0);
  }

  /* Bottle reveal */
  const bottle = document.querySelector("[data-bottle]");
  const bottleRail = bottle?.querySelector(".bottle__rail");

  const updateBottle = () => {
    if (!bottle || !bottleRail || reduced) return;
    const rect = bottleRail.getBoundingClientRect();
    const scrollable = bottleRail.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const raw = clamp01(-rect.top / scrollable);
    const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    bottle.style.setProperty("--bottle-reveal", String(eased));
  };

  if (bottle && !reduced) {
    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        updateBottle();
        tick = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateBottle();
  } else if (bottle) {
    bottle.style.setProperty("--bottle-reveal", "1");
  }

  /* Notes pyramid cascade */
  const pyramid = document.querySelector("[data-pyramid]");
  const tiers = pyramid ? [...pyramid.querySelectorAll(".notes__tier")] : [];
  if (tiers.length) {
    if (reduced) {
      tiers.forEach((t) => t.classList.add("is-on"));
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            tiers.forEach((tier, i) => {
              window.setTimeout(() => tier.classList.add("is-on"), i * 160);
            });
            io.disconnect();
          });
        },
        { threshold: 0.35 }
      );
      io.observe(pyramid);
    } else {
      tiers.forEach((t) => t.classList.add("is-on"));
    }
  }

  const form = document.getElementById("newsletterForm");
  const status = document.getElementById("newsletterStatus");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const value = input?.value?.trim() ?? "";
    if (!status) return;
    status.hidden = false;
    if (!value || !input?.validity.valid) {
      status.textContent = "Enter a valid email to continue — demo only.";
      return;
    }
    status.textContent = "Thank you. This demo does not store addresses.";
    form.reset();
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return;
    link.addEventListener("click", (e) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
})();
