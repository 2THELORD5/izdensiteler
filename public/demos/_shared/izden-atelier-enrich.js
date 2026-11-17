(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.body;

  /* Spotlight catalog scrub */
  const spot = document.querySelector("[data-enrich='spotlight'] .enrich-catalog");
  if (spot) {
    const imgs = [...spot.querySelectorAll(".enrich-catalog__stage img")];
    const items = [...spot.querySelectorAll(".enrich-catalog__item")];
    const set = (i) => {
      const idx = Math.max(0, Math.min(i, items.length - 1));
      imgs.forEach((el, n) => el.classList.toggle("is-on", n === idx));
      items.forEach((el, n) => el.classList.toggle("is-on", n === idx));
    };
    const update = () => {
      const rect = spot.getBoundingClientRect();
      const scrollable = spot.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / scrollable));
      set(Math.min(items.length - 1, Math.floor(p * items.length)));
    };
    if (!reduced) {
      let tick = false;
      const on = () => {
        if (tick) return;
        tick = true;
        requestAnimationFrame(() => {
          update();
          tick = false;
        });
      };
      window.addEventListener("scroll", on, { passive: true });
      window.addEventListener("resize", on, { passive: true });
      update();
    } else set(0);
  }

  /* Rail draw-on-center */
  const rail = document.querySelector("[data-enrich='rail'] .enrich-rail__track");
  if (rail) {
    const cards = [...rail.querySelectorAll(".enrich-rail__card")];
    const draw = () => {
      const mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const c = r.left + r.width / 2;
        card.classList.toggle("is-drawn", Math.abs(c - mid) < r.width * 0.45);
      });
    };
    if (!reduced) {
      rail.addEventListener("scroll", draw, { passive: true });
      draw();
    } else cards.forEach((c) => c.classList.add("is-drawn"));
  }

  /* Stack cascade IO */
  const stack = document.querySelector("[data-enrich='stack'] .enrich-stack");
  if (stack) {
    const figs = [...stack.querySelectorAll("figure")];
    if (reduced) {
      figs.forEach((f) => f.classList.add("is-in"));
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            figs.forEach((fig, i) => {
              window.setTimeout(() => fig.classList.add("is-in"), i * 140);
            });
            io.disconnect();
          });
        },
        { threshold: 0.2 }
      );
      io.observe(stack);
    } else figs.forEach((f) => f.classList.add("is-in"));
  }

  /* Generic gallery / lookbook reveal */
  document.querySelectorAll('.gallery__grid, .lookbook__grid').forEach((grid) => {
    const figs = [...grid.querySelectorAll('figure, .lookbook__cell')];
    if (!figs.length) return;
    if (reduced) {
      figs.forEach((f) => f.classList.add('is-in'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      figs.forEach((f) => f.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        figs.forEach((fig, i) => window.setTimeout(() => fig.classList.add('is-in'), i * 110));
        io.disconnect();
      });
    }, { threshold: 0.15 });
    io.observe(grid);
  });
})();
