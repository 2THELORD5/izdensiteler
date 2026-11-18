(() => {
  "use strict";
  const IZ = window.IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const smooth = (t) => t * t * (3 - 2 * t);
  const section = $("#descent");
  const pin = $("#dPin");
  const a = pin?.querySelector(".dv__a");
  const b = $("#dvB"), c = $("#dvC");
  if (!section || !pin || !a || !b || !c) return;
  const title = $("#dTitle"), note = $("#dNote"), copy = $(".descent__copy");
  const year = $("#dYear"), depth = $("#dDepth"), meters = $("#dMeters");
  const stations = [
    ["The door", "Twenty-two stone steps below Cihangir. The street noise stops at the fourth."],
    ["The vault", "Brick, oak and a constant 14 °C. Everything in here is waiting for something."],
    ["The glass", "One pour, no flourish. A bottle opened tonight was put down before some of you were born."],
  ];
  let on = -1;

  const draw = (p) => {
    const mobile = IZ.mobile;
    /* A: dolly toward the vanishing point, darkening as we descend */
    const zA = IZ.lerp(1, mobile ? 2.1 : 2.6, smooth(IZ.clamp(p / 0.62)));
    const bA = IZ.lerp(1, 0.28, smooth(IZ.clamp((p - 0.3) / 0.35)));
    a.style.setProperty("--za", zA.toFixed(3));
    a.style.setProperty("--ba", bA.toFixed(3));
    pin.querySelector(".descent__vig").style.setProperty("--v", IZ.lerp(72, 24, smooth(IZ.clamp(p / 0.55))).toFixed(1) + "%");

    /* B and C dissolve in; on desktop they sit in a label-frame, on mobile full-bleed */
    const kb = smooth(IZ.clamp((p - 0.46) / 0.14));
    const kc = smooth(IZ.clamp((p - 0.8) / 0.12));
    b.style.opacity = (kb * (1 - kc)).toFixed(3);
    b.style.transform = `scale(${IZ.lerp(1.12, 1, IZ.clamp((p - 0.46) / 0.4)).toFixed(3)})`;
    c.style.opacity = kc.toFixed(3);
    c.style.transform = `scale(${IZ.lerp(1.12, 1, IZ.clamp((p - 0.8) / 0.2)).toFixed(3)})`;

    year.textContent = Math.round(IZ.lerp(2024, 1994, smooth(p)));
    depth.parentElement.style.setProperty("--d", p.toFixed(3));
    meters.textContent = "−" + (p * 11).toFixed(1).replace(".0", "") + " m";

    const idx = p < 0.42 ? 0 : p < 0.78 ? 1 : 2;
    if (idx !== on) {
      on = idx;
      copy.style.opacity = 0;
      setTimeout(() => {
        title.textContent = stations[idx][0];
        note.textContent = stations[idx][1];
        copy.style.opacity = 1;
      }, IZ.reduced ? 0 : 180);
    }
  };
  IZ.scrub(section, draw, { rest: 0.5 });
})();
