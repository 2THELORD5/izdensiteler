(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function progressOf(el) {
    const rect = el.getBoundingClientRect();
    const scrollable = el.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / scrollable));
  }

  function onScroll(fn) {
    if (reduced) return fn();
    let tick = false;
    const on = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        fn();
        tick = false;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    on();
  }

  /* Tag site id for CSS grammars */
  const host = location.pathname.match(/atelier-([a-z]+)/);
  if (host) document.body.setAttribute("data-site", host[1]);

  /* Spotlight catalog scrub */
  const spot = document.querySelector("[data-enrich='spotlight'] .enrich-catalog");
  if (spot) {
    const imgs = [...spot.querySelectorAll(".enrich-catalog__stage img")];
    const items = [...spot.querySelectorAll(".enrich-catalog__item")];
    let prog = spot.querySelector(".enrich-catalog__progress");
    if (!prog && items.length) {
      prog = document.createElement("div");
      prog.className = "enrich-catalog__progress";
      prog.setAttribute("aria-hidden", "true");
      items.forEach((_, i) => {
        const s = document.createElement("span");
        if (i === 0) s.className = "is-on";
        prog.appendChild(s);
      });
      const pin = spot.querySelector(".enrich-catalog__pin") || spot;
      pin.prepend(prog);
    }
    const bars = prog ? [...prog.querySelectorAll("span")] : [];
    const set = (i) => {
      const idx = Math.max(0, Math.min(i, items.length - 1));
      imgs.forEach((el, n) => el.classList.toggle("is-on", n === idx));
      items.forEach((el, n) => el.classList.toggle("is-on", n === idx));
      bars.forEach((el, n) => el.classList.toggle("is-on", n === idx));
    };
    onScroll(() => {
      const p = progressOf(spot);
      set(Math.min(items.length - 1, Math.floor(p * items.length)));
    });
    if (reduced) set(0);
  }

  /* Rail → rebuild as vertical pin scrub from existing cards */
  const railRoot = document.querySelector("[data-enrich='rail'] .enrich-rail");
  if (railRoot) {
    const track = railRoot.querySelector(".enrich-rail__track");
    const cards = track ? [...track.querySelectorAll(".enrich-rail__card")] : [];
    if (cards.length) {
      let pin = railRoot.querySelector(".enrich-rail__pin");
      if (!pin) {
        pin = document.createElement("div");
        pin.className = "enrich-rail__pin";
        const head = railRoot.querySelector(".enrich-rail__head");
        if (head) pin.appendChild(head);
        const stage = document.createElement("div");
        stage.className = "enrich-rail__stage";
        const caps = document.createElement("div");
        caps.className = "enrich-rail__caps";
        cards.forEach((card, i) => {
          const img = card.querySelector("img");
          if (img) {
            const clone = img.cloneNode(true);
            if (i === 0) clone.classList.add("is-on");
            stage.appendChild(clone);
          }
          const cap = document.createElement("div");
          cap.className = "cap" + (i === 0 ? " is-on" : "");
          const fc = card.querySelector("figcaption");
          cap.textContent = fc ? fc.textContent : `0${i + 1}`;
          caps.appendChild(cap);
        });
        stage.appendChild(caps);
        pin.appendChild(stage);
        railRoot.insertBefore(pin, track);
      }
      const imgs = [...railRoot.querySelectorAll(".enrich-rail__stage > img")];
      const caps = [...railRoot.querySelectorAll(".enrich-rail__caps .cap")];
      const set = (i) => {
        imgs.forEach((el, n) => el.classList.toggle("is-on", n === i));
        caps.forEach((el, n) => el.classList.toggle("is-on", n === i));
      };
      onScroll(() => {
        const p = progressOf(railRoot);
        set(Math.min(imgs.length - 1, Math.floor(p * imgs.length)));
      });
      if (reduced) set(0);
    }
  }

  /* Stack cascade + focus scrub */
  const stackWrap =
    document.querySelector("[data-enrich='stack'] .enrich-stack-wrap") ||
    document.querySelector("[data-enrich='stack'] .enrich-stack")?.parentElement;
  const stack = document.querySelector("[data-enrich='stack'] .enrich-stack");
  if (stack) {
    if (stackWrap && !stackWrap.classList.contains("enrich-stack-wrap")) {
      stackWrap.classList.add("enrich-stack-wrap");
    }
    const figs = [...stack.querySelectorAll("figure")];
    const setFocus = (i) => {
      figs.forEach((f, n) => {
        f.classList.toggle("is-in", n <= i);
        f.classList.toggle("is-focus", n === i);
      });
    };
    if (reduced) {
      figs.forEach((f) => f.classList.add("is-in", "is-focus"));
    } else {
      onScroll(() => {
        const root = stackWrap || stack;
        const p = progressOf(root);
        setFocus(Math.min(figs.length - 1, Math.floor(p * figs.length)));
      });
    }
  }

  /* Generic gallery / lookbook reveal */
  document.querySelectorAll(".gallery__grid, .lookbook__grid").forEach((grid) => {
    const figs = [...grid.querySelectorAll("figure, .lookbook__cell")];
    if (!figs.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      figs.forEach((f) => f.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          figs.forEach((fig, i) => window.setTimeout(() => fig.classList.add("is-in"), i * 110));
          io.disconnect();
        });
      },
      { threshold: 0.15 }
    );
    io.observe(grid);
  });
})();
