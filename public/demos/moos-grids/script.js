/* =====================================================================
   GRID — interactions
   ===================================================================== */
(function () {
  "use strict";

  var start = Date.now();
  var MIN_LOADER = 1300;   /* let the mark orbit at least this long */
  var MAX_LOADER = 4500;   /* safety net if assets stall */

  /* ---------- loading screen ---------- */
  var loader = document.querySelector("[data-loader]");

  function revealSite() {
    if (!loader || loader.classList.contains("is-done")) return;
    loader.classList.add("is-done");
    document.body.classList.add("is-ready");
    window.setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 700);
  }

  function finishLoading() {
    var waited = Date.now() - start;
    var remaining = Math.max(0, MIN_LOADER - waited);
    window.setTimeout(revealSite, remaining);
  }

  if (document.readyState === "complete") {
    finishLoading();
  } else {
    window.addEventListener("load", finishLoading);
  }
  window.setTimeout(revealSite, MAX_LOADER);   /* guarantee reveal */


  /* ---------- true masonry: pack tiles into the shortest column ---------- */
  var grid = document.querySelector(".grid");
  var storedTiles = grid ? Array.prototype.slice.call(grid.querySelectorAll(".tile")) : [];
  var lastCols = -1;

  /* column count derived from the grid's own measured width (robust against
     window.innerWidth being unavailable when the script runs early) */
  function columnCountFor(width) {
    if (width >= 1360) return 4;
    if (width >= 760) return 3;
    if (width >= 460) return 2;
    return 1;
  }

  function buildMasonry() {
    if (!grid || !storedTiles.length) return;
    var width = grid.getBoundingClientRect().width || grid.clientWidth;
    if (!width) return;                 /* not laid out yet — ResizeObserver will retry */
    var cols = columnCountFor(width);
    if (cols === lastCols) return;      /* rebuild only when the column count changes */
    lastCols = cols;

    grid.classList.add("is-masonry");
    grid.textContent = "";
    var colEls = [];
    var colH = [];
    for (var c = 0; c < cols; c++) {
      var col = document.createElement("div");
      col.className = "grid__col";
      grid.appendChild(col);
      colEls.push(col);
      colH.push(0);
    }
    var gapPx = parseFloat(getComputedStyle(grid).columnGap) ||
                parseFloat(getComputedStyle(grid).gap) || 14;
    var colWidth = (width - (cols - 1) * gapPx) / cols;
    storedTiles.forEach(function (tile) {
      var img = tile.querySelector("img");
      var w = parseFloat(img.getAttribute("width")) || 1;
      var h = parseFloat(img.getAttribute("height")) || 1;
      var tileH = colWidth * (h / w);          /* pixel-accurate predicted height */
      var shortest = 0;
      for (var i = 1; i < cols; i++) { if (colH[i] < colH[shortest]) shortest = i; }
      colEls[shortest].appendChild(tile);
      colH[shortest] += tileH + gapPx;
    });
  }

  /* keep polling (with backoff) until the grid reports a real width and the
     first build succeeds — robust to environments that lay out late */
  (function poll(n) {
    buildMasonry();
    if (lastCols === -1 && n < 40) {
      window.setTimeout(function () { poll(n + 1); }, Math.min(50 + n * 40, 1000));
    }
  })(0);
  if ("ResizeObserver" in window && grid) {
    new ResizeObserver(function () { buildMasonry(); }).observe(grid);
  }
  window.addEventListener("load", buildMasonry);
  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildMasonry, 150);
  });


  /* ---------- mosaic overlay: split the photo into pieces that flip to white ---------- */
  /* injected once; each piece is a mini flip-card (photo slice → white back) that
     flips on hover, staggered in a diagonal wave (see CSS) */
  (function buildMosaics() {
    var COLS = 3, ROWS = 3;                         /* ≈9 pieces */
    var maxDist = (COLS - 1) + (ROWS - 1) || 1;
    storedTiles.forEach(function (tile) {
      var inner = tile.querySelector(".tile__inner");
      if (!inner || inner.querySelector(".tile__mosaic")) return;   /* build once */
      var img = tile.querySelector("img");
      var src = img.currentSrc || img.src;

      var mosaic = document.createElement("span");
      mosaic.className = "tile__mosaic";
      mosaic.setAttribute("aria-hidden", "true");
      mosaic.style.gridTemplateColumns = "repeat(" + COLS + ", 1fr)";
      mosaic.style.gridTemplateRows = "repeat(" + ROWS + ", 1fr)";

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var cell = document.createElement("span");
          cell.className = "mcell";

          var piece = document.createElement("span");
          piece.className = "mcell__inner";
          piece.style.transitionDelay = Math.round((r + c) / maxDist * 380) + "ms";

          var front = document.createElement("span");
          front.className = "mcell__face mcell__front";
          front.style.backgroundImage = "url('" + src + "')";
          front.style.backgroundSize = (COLS * 100) + "% " + (ROWS * 100) + "%";
          front.style.backgroundPosition =
            (COLS > 1 ? (c / (COLS - 1)) * 100 : 0) + "% " +
            (ROWS > 1 ? (r / (ROWS - 1)) * 100 : 0) + "%";

          var back = document.createElement("span");
          back.className = "mcell__face mcell__back";

          piece.appendChild(front);
          piece.appendChild(back);
          cell.appendChild(piece);
          mosaic.appendChild(cell);
        }
      }
      inner.insertBefore(mosaic, tile.querySelector(".tile__back"));   /* photo < mosaic < card */
    });
  })();


  /* ---------- header scroll state ---------- */
  var header = document.querySelector("[data-header]");
  var film = document.querySelector("[data-iz-film-scrub]");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    /* white header while the pinned film owns the top of the viewport */
    if (film) {
      var r = film.getBoundingClientRect();
      header.classList.toggle("on-film", r.bottom > 64 && !document.body.classList.contains("is-locked"));
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });


  /* ---------- menu overlay ---------- */
  var menu = document.querySelector("[data-menu]");
  var menuToggles = document.querySelectorAll("[data-menu-toggle]");
  var menuOpeners = document.querySelectorAll("[data-menu-open]");
  var menuBtn = document.querySelector("[data-menu-toggle][aria-controls]");

  if (menu) menu.removeAttribute("hidden");   /* JS present → manage via class */

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    onScroll();
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var first = menu.querySelector(".menu__link");
      if (first) first.focus({ preventScroll: true });
    } else if (menuBtn) {
      menuBtn.focus({ preventScroll: true });
    }
  }

  Array.prototype.forEach.call(menuToggles, function (btn) {
    btn.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
  });
  Array.prototype.forEach.call(menuOpeners, function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      setMenu(true);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("is-open")) setMenu(false);
  });
  /* close the overlay when navigating to Work (the live page) */
  if (menu) {
    Array.prototype.forEach.call(menu.querySelectorAll(".menu__link"), function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
  }


  /* ---------- tiles: navigate on click; on touch, first tap reveals ---------- */
  var coarse = window.matchMedia("(hover: none)").matches;
  /* also switch to tap-reveal the first time a real touch occurs (hybrid devices) */
  window.addEventListener("touchstart", function once() {
    coarse = true;
    window.removeEventListener("touchstart", once);
  }, { passive: true });
  var tiles = document.querySelectorAll("[data-tile]");

  Array.prototype.forEach.call(tiles, function (tile) {
    tile.addEventListener("click", function (e) {
      if (coarse && !tile.classList.contains("is-flipped")) {
        /* first tap on touch → reveal the mosaic card instead of navigating */
        e.preventDefault();
        Array.prototype.forEach.call(tiles, function (t) { t.classList.remove("is-flipped"); });
        tile.classList.add("is-flipped");
      }
      /* fine pointer, or a second tap on touch → follow the link */
    });
  });


  /* ---------- About: cursor-driven sketch → render reveal ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-reveal]"), function (el) {
    var render = el.getAttribute("data-render");
    if (!render) return;
    var COLS = parseInt(el.getAttribute("data-cols"), 10) || 20;
    var ROWS = parseInt(el.getAttribute("data-rows"), 10) || 11;
    var bs = (COLS * 100) + "% " + (ROWS * 100) + "%";

    var grid = document.createElement("div");
    grid.className = "fgrid";
    grid.setAttribute("aria-hidden", "true");
    grid.style.gridTemplateColumns = "repeat(" + COLS + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + ROWS + ", 1fr)";

    var cells = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement("div");
        cell.className = "fcell";
        var piece = document.createElement("div");
        piece.className = "fcell__inner";
        var front = document.createElement("div");
        front.className = "fcell__face fcell__front";
        var back = document.createElement("div");
        back.className = "fcell__face fcell__back";
        back.style.backgroundImage = "url('" + render + "')";
        back.style.backgroundSize = bs;
        back.style.backgroundPosition =
          (COLS > 1 ? (c / (COLS - 1)) * 100 : 0) + "% " +
          (ROWS > 1 ? (r / (ROWS - 1)) * 100 : 0) + "%";
        piece.appendChild(front);
        piece.appendChild(back);
        cell.appendChild(piece);
        grid.appendChild(cell);
        cells.push({ el: cell, c: c, r: r });
      }
    }
    el.appendChild(grid);

    var RADIUS = 2.5;                       /* reveal radius, in grid cells */
    var ptrX = 0, ptrY = 0, active = false;
    function apply() {
      var rect = el.getBoundingClientRect();
      if (!rect.width) return;
      var cx = (ptrX - rect.left) / (rect.width / COLS);
      var cy = (ptrY - rect.top) / (rect.height / ROWS);
      for (var i = 0; i < cells.length; i++) {
        var o = cells[i];
        var dx = (o.c + 0.5) - cx, dy = (o.r + 0.5) - cy;
        o.el.classList.toggle("is-lit", active && (dx * dx + dy * dy) <= RADIUS * RADIUS);
      }
    }
    function move(x, y) {
      ptrX = x; ptrY = y; active = true;
      el.classList.add("is-touched");
      apply();
    }
    function clear() { active = false; apply(); }
    el.addEventListener("mousemove", function (e) { move(e.clientX, e.clientY); });
    el.addEventListener("mouseleave", clear);
    el.addEventListener("touchmove", function (e) {
      var t = e.touches[0]; if (t) move(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener("touchend", clear);
  });


  /* ---------- Project: hero plan revealed on load (pieces flip away) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-hero]"), function (el) {
    var COLS = parseInt(el.getAttribute("data-cols"), 10) || 14;
    var ROWS = parseInt(el.getAttribute("data-rows"), 10) || 8;
    var maxDist = (COLS - 1) + (ROWS - 1) || 1;

    var grid = document.createElement("div");
    grid.className = "fgrid";
    grid.setAttribute("aria-hidden", "true");
    grid.style.gridTemplateColumns = "repeat(" + COLS + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + ROWS + ", 1fr)";

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement("div");
        cell.className = "fcell";
        var piece = document.createElement("div");
        piece.className = "fcell__inner";
        piece.style.setProperty("--fd", (150 + Math.round((r + c) / maxDist * 520)) + "ms");
        var front = document.createElement("div");
        front.className = "fcell__face fcell__front";
        var back = document.createElement("div");
        back.className = "fcell__face fcell__back";
        piece.appendChild(front);
        piece.appendChild(back);
        cell.appendChild(piece);
        grid.appendChild(cell);
      }
    }
    el.appendChild(grid);
  });
})();
