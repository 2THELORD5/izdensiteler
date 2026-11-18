(() => {
  "use strict";
  const IZ = window.IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const smooth = (t) => t * t * (3 - 2 * t);

  /* nav altimeter follows the whole page (1,240 m at the top → 4,310 m at the bottom) */
  const altNav = $("#altNav");
  const page = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  let navQ = false;
  const navAlt = () => {
    navQ = false;
    if (altNav) altNav.textContent = fmt(IZ.lerp(1240, 4310, page()));
  };
  addEventListener("scroll", () => !navQ && ((navQ = true), requestAnimationFrame(navAlt)), { passive: true });
  navAlt();

  /* signature — scroll position drives a horizontal ascent + elevation profile */
  const section = $("#route");
  const track = $("#track");
  const line = $("#profLine");
  const dot = $("#profDot");
  const altBig = $("#altBig");
  const stops = $$(".profile__stops li");
  const hint = $(".route__hint");
  if (!section || !track || !line || !dot) return;

  const len = line.getTotalLength();
  line.style.strokeDasharray = len;
  const prof = $(".profile svg");
  let on = -1;

  const draw = (p) => {
    const n = 3;
    const t = p * n;
    const i = Math.min(n - 1, Math.floor(t));
    const f = t - i;
    const eased = i + smooth(IZ.clamp((f - 0.32) / 0.68));
    const x = p >= 1 ? n : eased;
    track.style.transform = `translate3d(${(-x * 100).toFixed(3)}vw,0,0)`;

    /* marker sits on the profile at the same fraction as the track */
    const k = IZ.clamp(x / n);
    const pt = line.getPointAtLength(k * len);
    line.style.strokeDashoffset = len * (1 - k);
    const box = prof.getBoundingClientRect();
    const vb = prof.viewBox.baseVal;
    dot.style.left = (pt.x / vb.width) * box.width + "px";
    dot.style.top = (pt.y / vb.height) * box.height + "px";

    if (altBig) altBig.textContent = fmt(1240 + ((108 - pt.y) / (108 - 8)) * (4310 - 1240));

    const s = Math.round(x);
    if (s !== on) {
      on = s;
      stops.forEach((li, j) => li.classList.toggle("is-on", j === s));
    }
    hint?.classList.toggle("is-gone", p > 0.04);
  };

  IZ.scrub(section, draw, { rest: 0 });
  addEventListener("resize", () => draw(IZ.clamp(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - innerHeight))));
})();
