(() => {
  "use strict";
  const IZ = window.IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const smooth = (t) => t * t * (3 - 2 * t);

  const section = $("#iris");
  const pin = section?.querySelector(".iris__pin");
  const layers = $$(".iris__l");
  const edge = $("#irisEdge");
  if (!section || !pin || !layers.length) return;

  const no = $("#irisNo"), title = $("#irisTitle"), note = $("#irisNote"), breath = $("#irisBreath"), copy = $(".iris__copy");
  const romans = ["I", "II", "III"];
  const stages = [
    ["Arrive", "Cold spring water over the hands, then slippers. Nothing is asked of you yet."],
    ["Soak", "A private stone bath at 39 °C and a single window. The steam does the talking."],
    ["Rest", "Warm basalt, long slow lines of oil, and a room with the lights almost off."],
  ];
  const breaths = ["Breathe in", "Hold", "Breathe out"];
  let on = -1, bi = -1;

  const draw = (p) => {
    const w = innerWidth, h = innerHeight;
    const rMax = Math.hypot(w / 2, h * 0.52) + 8;
    const rMin = Math.min(w, h) * 0.12;
    const n = layers.length;
    const t = p * n;                    /* 0..3: each layer owns one unit */
    let edgeR = 0, edgeO = 0;
    layers.forEach((l, i) => {
      const f = IZ.clamp(t - i);       /* layer i opens during [i, i+1] */
      const k = i === 0 ? smooth(IZ.clamp(t / 0.85)) : smooth(IZ.clamp((t - i + 0.05) / 0.85));
      const r = IZ.lerp(rMin, rMax, k);
      l.style.setProperty("--r", (f <= 0 && i > 0 ? 0 : r).toFixed(1) + "px");
      if (k > 0 && k < 1) { edgeR = r; edgeO = Math.sin(k * Math.PI); }
    });
    edge.style.setProperty("--er", edgeR.toFixed(1) + "px");
    edge.style.setProperty("--eo", edgeO.toFixed(3));

    const idx = Math.min(n - 1, Math.floor(t + 0.15));
    if (idx !== on) {
      on = idx;
      copy.style.opacity = 0;
      setTimeout(() => {
        no.textContent = romans[idx];
        title.textContent = stages[idx][0];
        note.textContent = stages[idx][1];
        copy.style.opacity = 1;
      }, IZ.reduced ? 0 : 180);
    }
    /* breathing label: 3 phases per room, tied to scroll position */
    const b = Math.min(2, Math.floor(((t % 1) + 1e-6) * 3));
    if (b !== bi) {
      bi = b;
      breath.textContent = breaths[b];
      breath.style.setProperty("--bs", b === 0 ? 1.6 : b === 1 ? 1.6 : 1);
      pin.querySelector(".iris__breath")?.style.setProperty("--bs", b === 2 ? 1 : 1.6);
    }
  };
  IZ.scrub(section, draw, { rest: 0.5 });
  addEventListener("resize", () => draw(IZ.clamp(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - innerHeight))));
})();
