/* ============================================================
   K — interaction layer
   Vanilla JS · IntersectionObserver reveals · bounded parallax
   · running head · process spine · menu · contact form
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var viewportH = function () {
    return window.innerHeight || 900;
  };

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll reveals (viewport-driven — robust everywhere) ---------- */
  var pending = Array.prototype.slice.call(
    document.querySelectorAll(".reveal, .reveal-group, .media")
  );
  function checkReveals(vh) {
    for (var i = pending.length - 1; i >= 0; i--) {
      var r = pending[i].getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > vh * 0.04) {
        pending[i].classList.add("in");
        pending.splice(i, 1);
      }
    }
  }
  if (reduceMotion) {
    pending.forEach(function (el) { el.classList.add("in"); });
    pending = [];
  }

  /* ---------- Running head (book-style chapter name) ---------- */
  var runningHead = document.getElementById("runningHead");
  var runningWrap = runningHead ? runningHead.parentElement : null;
  var chapterSections = Array.prototype.slice.call(document.querySelectorAll("[data-chapter]"));
  var currentChapter = "";
  function updateRunningHead(vh) {
    if (!runningHead) return;
    var mid = vh / 2;
    var name = currentChapter;
    for (var i = 0; i < chapterSections.length; i++) {
      var r = chapterSections[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        name = chapterSections[i].getAttribute("data-chapter") || name;
        break;
      }
    }
    if (name && name !== currentChapter) {
      currentChapter = name;
      if (runningWrap) runningWrap.classList.add("is-swapping");
      window.setTimeout(function () {
        runningHead.textContent = name;
        if (runningWrap) runningWrap.classList.remove("is-swapping");
      }, 220);
    }
  }

  /* ---------- Process spine ("the line grows") ---------- */
  var process = document.querySelector(".process");
  var spineFill = null;
  if (process && !reduceMotion) {
    var spine = document.createElement("div");
    spine.className = "process__spine";
    spineFill = document.createElement("div");
    spineFill.className = "process__spine-fill";
    spine.appendChild(spineFill);
    process.appendChild(spine);
  }

  /* ---------- K reveal (scroll-scrubbed letter mask) ---------- */
  var kReveal = document.querySelector(".k-reveal");
  var kCover = kReveal ? kReveal.querySelector(".k-reveal__cover") : null;
  var kHint = kReveal ? kReveal.querySelector(".k-reveal__hint") : null;
  function updateKReveal(vh) {
    if (!kReveal || !kCover || reduceMotion) return;
    var denom = kReveal.offsetHeight - vh;
    if (denom <= 0) return;
    var p = clamp(-kReveal.getBoundingClientRect().top / denom, 0, 1);
    kCover.style.setProperty("--k-scale", (1 + p * 22).toFixed(3));                 // K grows toward full screen
    kCover.style.setProperty("--k-cover-opacity", clamp(1 - (p - 0.45) / 0.35, 0, 1).toFixed(3)); // then white fades, full image held
    if (kHint) kHint.style.setProperty("--k-hint-opacity", clamp(1 - p * 7, 0, 1).toFixed(3));
  }

  /* ---------- Parallax (bounded — never exposes an edge) ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));

  function onScrollFrame() {
    var vh = viewportH();

    if (!reduceMotion) {
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var parent = el.parentElement;
        var rect = parent.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > vh + 80) continue;
        var range = (el.offsetHeight - parent.clientHeight) / 2;
        if (range <= 0) continue;
        var dist = (rect.top + rect.height / 2) - vh / 2;
        var denom = vh / 2 + rect.height / 2;
        var p = clamp(dist / denom, -1, 1);
        el.style.transform = "translate3d(0," + (-p * range).toFixed(1) + "px,0)";
      }
    }

    if (spineFill && process) {
      var pr = process.getBoundingClientRect();
      var top = pr.top + window.pageYOffset;
      var prog = clamp((window.pageYOffset + vh * 0.5 - top) / process.offsetHeight, 0, 1);
      spineFill.style.height = (prog * 100).toFixed(2) + "%";
    }

    ticking = false;
  }

  var ticking = false;
  function requestFrame() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScrollFrame); }
  }

  /* Reveals + running head run synchronously on scroll so they never depend
     on requestAnimationFrame (which some environments throttle for hidden tabs).
     CSS transitions themselves are composited independently. */
  var lastSync = 0;
  function syncScroll() {
    var vh = viewportH();
    if (kReveal) updateKReveal(vh); // scrub every scroll event for a smooth mask reveal
    var now = (window.performance && performance.now) ? performance.now() : +new Date();
    if (now - lastSync < 50) return; // throttle the heavier work below
    lastSync = now;
    if (pending.length) checkReveals(vh);
    updateRunningHead(vh);
  }

  window.addEventListener("scroll", function () { syncScroll(); requestFrame(); }, { passive: true });
  window.addEventListener("resize", function () { syncScroll(); requestFrame(); }, { passive: true });
  syncScroll();
  onScrollFrame();

  /* ---------- Header: hide on scroll-down, reveal on scroll-up ----------
     Runs synchronously (not rAF-gated) so the solid state — which flips the
     header text from light to dark — is guaranteed to keep pace with scroll. */
  var header = document.getElementById("siteHeader");
  var lastY = window.pageYOffset;
  function headerUpdate() {
    var y = window.pageYOffset;
    var vh = viewportH();
    if (y > vh * 0.82) header.classList.add("header--solid");
    else header.classList.remove("header--solid");

    if (!document.body.classList.contains("menu-open")) {
      if (y > lastY && y > vh * 0.9) header.classList.add("header--hidden");
      else header.classList.remove("header--hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", headerUpdate, { passive: true });
  headerUpdate();

  /* ---------- Menu overlay ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var menuOverlay = document.getElementById("menuOverlay");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuOverlay.setAttribute("aria-hidden", open ? "false" : "true");
    var label = menuToggle.querySelector(".menu-toggle__label");
    if (label) label.textContent = open ? "Close" : "Menu";
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }
  document.querySelectorAll("[data-menu-link]").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.fullName.value.trim();
      var email = form.email.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !okEmail) {
        status.textContent = "Please add your name and a valid email so we can reply.";
        status.classList.add("show");
        return;
      }
      status.textContent = "Thank you, " + name.split(" ")[0] + ". We’ll be in touch shortly to begin the conversation.";
      status.classList.add("show");
      form.reset();
    });
  }

  /* ============================================================
     Hero cursor parallax — only the transparent foreground moves.
     Slow, weighted, inertial camera-depth feel. Desktop + fine
     pointer only. Tune the six values in the CONFIG block below.
     ============================================================ */
  (function heroParallax() {
    var hero = document.querySelector(".hero");
    var building = document.getElementById("heroBuilding");
    if (!hero || !building) return;

    /* -------- CONFIG (tune here) -------- */
    var OVERSCAN = 1.04;   // foreground scale — motion overscan (keep 1.025–1.04)
    var RANGE_X = 16;      // max horizontal travel, px
    var RANGE_Y = 8;       // max vertical travel, px
    var LERP = 0.07;       // interpolation strength (0.055–0.08); lower = more inertia
    var NEUTRAL = "translate3d(0,0,0) scale(" + OVERSCAN + ")";
    var DESKTOP_MIN = 900; // px — cutoff below which motion is disabled
    /* ------------------------------------ */

    var mqCoarse = window.matchMedia("(hover: none), (pointer: coarse)");
    var mqNarrow = window.matchMedia("(max-width: " + (DESKTOP_MIN - 1) + "px)");
    var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    var tx = 0, ty = 0, cx = 0, cy = 0;
    var rafId = null, inView = true;

    function enabled() { return !mqReduce.matches && !mqCoarse.matches && !mqNarrow.matches; }
    function setNeutral() { building.style.transform = NEUTRAL; }

    function loop() {
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      building.style.transform =
        "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0) scale(" + OVERSCAN + ")";
      if (Math.abs(tx - cx) > 0.03 || Math.abs(ty - cy) > 0.03) {
        rafId = window.requestAnimationFrame(loop);
      } else {
        building.style.transform =
          "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0) scale(" + OVERSCAN + ")";
        rafId = null;
      }
    }
    function kick() {
      if (rafId === null && inView && !document.hidden && enabled()) {
        building.style.willChange = "transform";
        rafId = window.requestAnimationFrame(loop);
      }
    }
    function stop() {
      if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
      building.style.willChange = "auto";
    }

    function onMove(e) {
      if (!enabled()) return;
      var r = hero.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      var ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      tx = -nx * RANGE_X; // move opposite the pointer for natural depth
      ty = -ny * RANGE_Y;
      kick();
    }
    function settleNeutral() { tx = 0; ty = 0; kick(); }

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", settleNeutral, { passive: true });
    window.addEventListener("blur", settleNeutral);
    document.addEventListener("visibilitychange", function () { if (document.hidden) { stop(); } });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (!inView) { stop(); }
      }, { threshold: 0 }).observe(hero);
    }

    function onMq() {
      if (!enabled()) { tx = ty = cx = cy = 0; stop(); setNeutral(); }
    }
    [mqCoarse, mqNarrow, mqReduce].forEach(function (mq) {
      if (mq.addEventListener) mq.addEventListener("change", onMq);
      else if (mq.addListener) mq.addListener(onMq);
    });

    setNeutral();
  })();
})();
