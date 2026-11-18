(() => {
  "use strict";
  const IZ = window.IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* plate rail arrows */
  const rail = $("#rail");
  const step = () => ($(".plate", rail)?.getBoundingClientRect().width || 300) + 24;
  $("#railPrev")?.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
  $("#railNext")?.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
  rail?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") rail.scrollBy({ left: step(), behavior: "smooth" });
    if (e.key === "ArrowLeft") rail.scrollBy({ left: -step(), behavior: "smooth" });
  });

  /* signature — the loupe: scroll position drives the glass; the mouse can take it */
  const section = $("#loupe");
  const stage = $("#loupeStage");
  const img = $("#loupeImg");
  const lens = $("#lens");
  const notes = $$("#loupeNotes li");
  if (!section || !stage || !img || !lens) return;

  const Z = 2.7;
  let hover = null;
  let progress = IZ.reduced ? 0.45 : 0;
  let queued = false;
  let on = -1;

  const render = () => {
    queued = false;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    const d = Math.round(Math.min(w * (IZ.mobile ? 0.5 : 0.28), 250));
    let x, y;
    if (hover) ({ x, y } = hover);
    else {
      const p = progress;
      x = w * (0.26 + 0.52 * p);
      y = h * (0.8 - 0.5 * p + 0.06 * Math.sin(p * Math.PI * 4));
    }
    x = Math.min(w - d / 2, Math.max(d / 2, x));
    y = Math.min(h - d / 2, Math.max(d / 2, y));
    lens.style.setProperty("--d", d + "px");
    lens.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    const src = img.currentSrc || img.src;
    if (lens.dataset.src !== src) {
      lens.style.backgroundImage = `url("${src}")`;
      lens.dataset.src = src;
    }
    lens.style.backgroundSize = `${w * Z}px ${h * Z}px`;
    lens.style.backgroundPosition = `${(d / 2 - x * Z).toFixed(1)}px ${(d / 2 - y * Z).toFixed(1)}px`;
    const idx = hover ? Math.min(2, Math.floor((x / w) * 3)) : progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
    if (idx !== on) {
      on = idx;
      notes.forEach((li, i) => li.classList.toggle("is-on", i === idx));
    }
  };
  const ask = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  };

  IZ.scrub(section, (p) => {
    progress = p;
    ask();
  });

  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || IZ.reduced) return;
    const r = stage.getBoundingClientRect();
    hover = { x: e.clientX - r.left, y: e.clientY - r.top };
    ask();
  });
  stage.addEventListener("pointerleave", () => {
    hover = null;
    ask();
  });
  addEventListener("resize", ask);
  img.addEventListener("load", ask);
  ask();
})();
