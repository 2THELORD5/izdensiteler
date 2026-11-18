/*
 * İZDEN atelier core — nav drawer, faq, scroll-position scrub helper.
 *   IZ.scrub(el, fn)   fn(p, el) with p∈[0,1] = progress through a .scrub block (scroll is source of truth)
 *   [data-scrub]       also writes --p on the element for pure-CSS use
 *   IZ.reduced         prefers-reduced-motion
 *   IZ.mobile          (max-width:900px)
 */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMq = matchMedia("(max-width: 900px)");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const IZ = (window.IZ = { reduced, clamp, lerp: (a, b, t) => a + (b - a) * t });
  Object.defineProperty(IZ, "mobile", { get: () => mobileMq.matches });

  /* progress of a tall block through the viewport (sticky pin pattern) */
  const pinProgress = (el) => {
    const r = el.getBoundingClientRect();
    const travel = Math.max(1, el.offsetHeight - innerHeight);
    return clamp(-r.top / travel);
  };
  /* progress of any element crossing the viewport (0 entering → 1 leaving) */
  IZ.viewProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp((innerHeight - r.top) / (innerHeight + r.height));
  };

  const watchers = [];
  IZ.scrub = (el, fn, opts = {}) => {
    if (!el) return;
    const rest = opts.rest ?? Number(el.dataset.rest ?? 0.5);
    const mode = opts.view ? IZ.viewProgress : pinProgress;
    const w = { el, fn, mode, last: -1 };
    watchers.push(w);
    if (reduced) fn(rest, el);
    else w.run = true;
    schedule();
  };
  let queued = false;
  const frame = () => {
    queued = false;
    for (const w of watchers) {
      if (!w.run) continue;
      const p = w.mode(w.el);
      if (Math.abs(p - w.last) < 0.0004) continue;
      w.last = p;
      w.fn(p, w.el);
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(frame);
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", () => {
    watchers.forEach((w) => (w.last = -1));
    schedule();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-scrub]").forEach((el) =>
      IZ.scrub(el, (p) => el.style.setProperty("--p", p.toFixed(4)), { view: el.dataset.scrub === "view" })
    );

    /* nav + drawer */
    const burger = document.getElementById("navBurger");
    const drawer = document.getElementById("navDrawer");
    const backdrop = document.getElementById("navBackdrop");
    const closeBtn = document.getElementById("navClose");
    const nav = document.getElementById("nav");
    const setOpen = (open) => {
      if (!drawer || !nav) return;
      nav.dataset.open = drawer.dataset.open = open ? "true" : "false";
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) drawer.removeAttribute("inert");
      else drawer.setAttribute("inert", "");
      burger?.setAttribute("aria-expanded", open ? "true" : "false");
      if (backdrop) backdrop.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
      if (open) closeBtn?.focus();
      else if (document.activeElement && drawer.contains(document.activeElement)) burger?.focus();
    };
    if (drawer) drawer.setAttribute("inert", "");
    burger?.addEventListener("click", () => setOpen(true));
    closeBtn?.addEventListener("click", () => setOpen(false));
    backdrop?.addEventListener("click", () => setOpen(false));
    drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
    mobileMq.addEventListener?.("change", (e) => !e.matches && setOpen(false));

    /* nav state after leaving the hero */
    const hero = document.querySelector("[data-hero]");
    if (hero && nav) {
      const io = new IntersectionObserver(([en]) => nav.classList.toggle("is-solid", !en.isIntersecting), { threshold: 0.05 });
      io.observe(hero);
    }

    /* faq */
    document.querySelectorAll(".faq__q").forEach((btn) =>
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        const panel = document.getElementById(btn.getAttribute("aria-controls") || "") || btn.parentElement?.querySelector(".faq__a");
        if (panel) panel.hidden = open;
      })
    );
  });
})();
