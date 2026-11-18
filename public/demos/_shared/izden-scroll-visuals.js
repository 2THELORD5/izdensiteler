/**
 * İZDEN scroll visuals — scrubbed image transitions (clip / parallax / stacks).
 * Works without GSAP. Skips sites that already own a film canvas scrub.
 */
(() => {
  "use strict";
  if (window.__izdenScrollVisuals) return;
  window.__izdenScrollVisuals = true;

  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // Film-scrub demos already drive the hero; still enhance secondary stills.
  const hasFilmCanvas = !!document.querySelector(
    "canvas#film, canvas#c, .film-stage, #world canvas"
  );

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t); // smoothstep

  document.documentElement.classList.add("izden-sv");

  /** Progress of el through viewport: 0 before enter → 1 fully past */
  function viewProgress(el, start = 0.92, end = 0.28) {
    const r = el.getBoundingClientRect();
    const vh = innerHeight || 1;
    const top = r.top;
    const a = vh * start;
    const b = vh * end;
    if (a === b) return top < b ? 1 : 0;
    return clamp((a - top) / (a - b));
  }

  /** Sticky stack progress 0..1 while pinned */
  function pinProgress(section) {
    const r = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - innerHeight);
    return clamp(-r.top / travel);
  }

  function wrapMedia(node) {
    if (node.closest(".izden-sv-media, .izden-sv-stack, #world, .film-stage"))
      return null;
    if (node.closest("canvas, script, style, noscript, svg, button, a nav"))
      return null;
    // Skip tiny icons / logos
    const w = node.naturalWidth || node.videoWidth || node.offsetWidth || 0;
    const h = node.naturalHeight || node.videoHeight || node.offsetHeight || 0;
    if (w && h && (w < 120 || h < 80)) return null;
    if (node.dataset.izdenSv === "off") return null;

    let host = node.parentElement;
    if (
      host &&
      (host.matches("picture, figure, .panel__img, .media, .shot, .visual") ||
        host.classList.contains("izden-sv-media"))
    ) {
      // use host
    } else {
      const wrap = document.createElement("div");
      wrap.className = "izden-sv-media";
      // Next/Image `fill` renders position:absolute — a static wrapper would
      // collapse to 0px height and the picture disappears.
      const abs = getComputedStyle(node).position === "absolute";
      node.parentNode.insertBefore(wrap, node);
      wrap.appendChild(node);
      if (abs) {
        wrap.style.position = "absolute";
        wrap.style.inset = "0";
      }
      host = wrap;
    }
    host.classList.add("izden-sv-media");
    host.classList.add("is-ready");
    // direction variety by index later
    return host;
  }

  const media = [];
  // Prefer editorial media hosts — avoid icons, logos, and film stages
  const candidates = [
    ...document.querySelectorAll(
      [
        "figure img",
        "picture img",
        ".panel__img img",
        ".media img",
        ".shot img",
        ".visual img",
        ".gallery img",
        ".project img",
        ".work img",
        ".card__media img",
        "[data-clip] img",
        "[data-reveal] img",
        ".reveal img",
        "section img",
        "article img",
        "main img",
        "[data-parallax]",
      ].join(",")
    ),
  ].filter((el) => {
    if (el.dataset?.izdenSv === "off") return false;
    if (
      el.closest(
        "header, nav, footer, .logo, .izden-mark, .bag, .cart, .icon, button, a.btn"
      )
    )
      return false;
    if (
      hasFilmCanvas &&
      el.closest("#world, .film-stage, .stage, #track, #loader, .loader")
    )
      return false;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.width < 96) return false;
    return true;
  });

  // Dedupe (picture>img vs section img)
  const seen = new Set();
  candidates.forEach((el, i) => {
    const key = el.currentSrc || el.src || el;
    if (seen.has(key)) return;
    seen.add(key);
    const host = wrapMedia(el);
    if (!host) return;
    if (media.some((m) => m.host === host)) return;
    const modes = ["up", "left", "right", "scale"];
    const mode = host.dataset.svMode || modes[i % modes.length];
    media.push({ host, mode, y: 0, zoom: 1.08, op: 1, clip: 1 });
  });

  // Build scroll stacks from groups of consecutive large images in a section
  const stacks = [];
  document.querySelectorAll("section, .section, main > div").forEach((sec) => {
    if (sec.dataset.svStack === "off") return;
    if (sec.querySelector(".izden-sv-stack")) return;
    const imgs = [
      ...sec.querySelectorAll(
        ":scope > img, :scope > figure img, :scope > .media img, :scope > picture img, :scope > .panel__img img, :scope .gallery img, :scope .shots img"
      ),
    ].filter((img) => (img.naturalWidth || img.width || 0) >= 400);
    if (imgs.length < 3 || imgs.length > 8) return;
    // Only if they look like a sequence (similar sizes / siblings)
    const parents = new Set(imgs.map((i) => i.parentElement));
    if (parents.size > 3) return;

    const stack = document.createElement("section");
    stack.className = "izden-sv-stack";
    stack.style.height = `${imgs.length * 100}vh`;
    const pin = document.createElement("div");
    pin.className = "izden-sv-stack__pin";
    const meter = document.createElement("div");
    meter.className = "izden-sv-stack__meter";
    meter.innerHTML = "<i></i>";
    pin.appendChild(meter);

    const frames = imgs.map((img, idx) => {
      const frame = document.createElement("div");
      frame.className = "izden-sv-stack__frame" + (idx === 0 ? " is-on" : "");
      const clone = img.cloneNode(true);
      clone.loading = "eager";
      clone.decoding = "async";
      frame.appendChild(clone);
      pin.appendChild(frame);
      // hide original to avoid double visual
      const wrap = img.closest(".izden-sv-media") || img;
      wrap.style.display = "none";
      return frame;
    });

    // insert stack before first image's section block
    const first = imgs[0].closest(".izden-sv-media") || imgs[0];
    first.parentNode.insertBefore(stack, first);
    stack.appendChild(pin);
    stacks.push({ stack, frames, meter: meter.firstElementChild, cur: 0 });
  });

  let raf = 0;
  let lastY = -1;

  function paintMedia(item) {
    const p = ease(viewProgress(item.host, 0.95, 0.35));
    const parallax = viewProgress(item.host, 1.05, -0.05);
    const y = lerp(36, -28, parallax);
    const zoom = lerp(1.12, 1.0, p);
    let clipT = 0,
      clipR = 0,
      clipB = 0,
      clipL = 0;
    const rem = (1 - p) * 100;
    if (item.mode === "up") clipT = rem;
    else if (item.mode === "left") clipL = rem;
    else if (item.mode === "right") clipR = rem;
    else {
      clipT = rem * 0.55;
      clipB = rem * 0.45;
    }
    const op = clamp(0.35 + p * 0.65);
    item.host.style.setProperty("--sv-clip-t", clipT.toFixed(2) + "%");
    item.host.style.setProperty("--sv-clip-r", clipR.toFixed(2) + "%");
    item.host.style.setProperty("--sv-clip-b", clipB.toFixed(2) + "%");
    item.host.style.setProperty("--sv-clip-l", clipL.toFixed(2) + "%");
    item.host.style.setProperty("--sv-y", y.toFixed(2) + "px");
    item.host.style.setProperty("--sv-zoom", zoom.toFixed(4));
    item.host.style.setProperty("--sv-op", op.toFixed(3));
  }

  function paintStack(s) {
    const p = pinProgress(s.stack);
    const n = s.frames.length;
    const idx = Math.min(n - 1, Math.floor(p * n));
    if (idx !== s.cur) {
      s.frames[s.cur]?.classList.remove("is-on");
      s.frames[idx]?.classList.add("is-on");
      s.cur = idx;
    }
    // micro crossfade via opacity on neighbors
    const exact = p * n;
    s.frames.forEach((f, i) => {
      const d = Math.abs(exact - i - 0.5);
      const local = clamp(1 - d);
      f.style.opacity = i === idx ? 1 : local * 0.35;
      f.style.transform = `scale(${lerp(1.05, 1, local)})`;
    });
    if (s.meter) s.meter.style.width = (p * 100).toFixed(2) + "%";
  }

  function tick() {
    raf = 0;
    const y =
      window.__lenis && typeof window.__lenis.scroll === "number"
        ? window.__lenis.scroll
        : window.lenis && typeof window.lenis.scroll === "number"
          ? window.lenis.scroll
          : scrollY;
    // always paint — cheap CSS vars; ensures reverse scrub
    media.forEach(paintMedia);
    stacks.forEach(paintStack);
    lastY = y;
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  if (window.lenis?.on) window.lenis.on("scroll", schedule);
  // late Lenis attach (Sedef)
  let tries = 0;
  const waitLenis = setInterval(() => {
    tries++;
    if (window.__lenis?.on) {
      window.__lenis.on("scroll", schedule);
      clearInterval(waitLenis);
    } else if (window.lenis?.on) {
      window.lenis.on("scroll", schedule);
      clearInterval(waitLenis);
    } else if (tries > 40) clearInterval(waitLenis);
  }, 100);

  // Initial + after images load
  schedule();
  addEventListener("load", schedule);
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", schedule, { once: true });
  });
})();
