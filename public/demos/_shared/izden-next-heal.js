/**
 * İZDEN — Next.js mirror heal (moos-blok, moos-niche, …)
 *
 * Why: these demos are static exports of Next apps that hydrate the whole
 * <document>. Anything injected into the static HTML (film scrub, agency
 * footer, shared CSS) is deleted when React hydrates, and Next <Link> hrefs
 * point at site-root paths ("/projects") that 404 under /demos/<slug>/.
 *
 * What: runs once in <head>, then
 *   1. rewrites internal links to /demos/<slug>/<route>/index.html
 *      (capture-phase click guard beats the React router),
 *   2. swallows Next RSC prefetch requests (they 404 on a static host),
 *   3. re-injects shared CSS + film scrub + agency footer after hydration,
 *      and again if React ever wipes them.
 */
(() => {
  "use strict";
  const m = location.pathname.match(/^\/demos\/(moos-[a-z0-9-]+)\//);
  if (!m || window.__izdenNextHeal) return;
  window.__izdenNextHeal = true;

  const SLUG = m[1];
  const BASE = `/demos/${SLUG}/`;
  const SHARED = "/demos/_shared/";

  const SITES = {
    "moos-blok": {
      routes: [
        "projects",
        "services",
        "about",
        "insights",
        "contact",
        "privacy",
        "terms",
        "projects/coastal-residences",
        "projects/creek-edge-masterplan",
        "projects/dubai-mobility-hub",
        "projects/desert-arts-centre",
        "projects/al-shindagha-museum-extension",
        "projects/dubai-south-campus",
        "projects/desert-retreat",
        "projects/downtown-vertical-district",
      ],
      // Hero scrub (hero-scrub.mp4) is owned by React <VideoHero>; the Kie film
      // chapter follows it instead of competing with it as a second hero.
      film: {
        mount: { after: ".vhero" },
        chapters: [
          { act: "01 Model", title: "City in hand.", body: "Maket sahnesi." },
          { act: "02 Creek", title: "Water route.", body: "Su hattı." },
          { act: "03 Arts", title: "Public form.", body: "Kamusal form." },
          { act: "04 Coast", title: "Shore light.", body: "Kıyı." },
        ],
      },
      gallery: false,
    },
    "moos-niche": {
      routes: [],
      film: {
        mount: { prepend: "body" },
        chapters: [
          { act: "01 Brief", title: "Ask first.", body: "Brief başlar." },
          { act: "02 Form", title: "Massing.", body: "Kütle arayışı." },
          { act: "03 Craft", title: "Detail hold.", body: "Detay." },
          { act: "04 Handover", title: "Lived in.", body: "Teslim." },
        ],
      },
      gallery: true,
    },
    "moos-retro": {
      routes: [
        "projects",
        "about",
        "contact",
        "projects/sunset-lounge",
        "projects/cobalt-house",
        "projects/velvet-library",
        "projects/riviera-apartment",
        "projects/studio-74",
        "projects/nightcap-bar",
      ],
      // site-owned layer: header offset, hero lockup, era strip, motion
      css: ["/demos/moos-retro/izden-retro.css"],
      film: {
        mount: { prepend: "#main" },
        hero: [
          '<div class="rt-hero">',
          '<p class="rt-hero__eyebrow">Retro Interior Co. &middot; Interior design studio</p>',
          '<h1 class="rt-hero__title">Old soul.<br>New rooms.</h1>',
          '<p class="rt-hero__lede">We restore the best ideas of the late sixties and seventies &mdash; conversation pits, lacquer, walnut and brass &mdash; and make them work for the way you live now.</p>',
          '<div class="rt-hero__cta">',
          '<a class="rt-btn rt-btn--solid" href="/demos/moos-retro/projects/index.html"><span>Explore projects</span><span aria-hidden="true">&rarr;</span></a>',
          '<a class="rt-btn rt-btn--line" href="/demos/moos-retro/contact/index.html#enquiry"><span>Start a project</span></a>',
          '</div></div>',
        ].join(""),
        after:
          '<div class="rt-ticker" role="presentation"><div class="rt-ticker__track" aria-hidden="true">' +
          '<div class="rt-ticker__set"><span>Burnt velvet</span><i aria-hidden=\"true\">&#9679;</i><span>Terrazzo</span><i aria-hidden=\"true\">&#9679;</i><span>Walnut</span><i aria-hidden=\"true\">&#9679;</i><span>Cobalt lacquer</span><i aria-hidden=\"true\">&#9679;</i><span>Chrome</span><i aria-hidden=\"true\">&#9679;</i><span>Travertine</span><i aria-hidden=\"true\">&#9679;</i><span>Moss velvet</span><i aria-hidden=\"true\">&#9679;</i><span>Aged brass</span><i aria-hidden=\"true\">&#9679;</i><span>Oxblood leather</span><i aria-hidden=\"true\">&#9679;</i></div>' +
          '<div class="rt-ticker__set"><span>Burnt velvet</span><i aria-hidden=\"true\">&#9679;</i><span>Terrazzo</span><i aria-hidden=\"true\">&#9679;</i><span>Walnut</span><i aria-hidden=\"true\">&#9679;</i><span>Cobalt lacquer</span><i aria-hidden=\"true\">&#9679;</i><span>Chrome</span><i aria-hidden=\"true\">&#9679;</i><span>Travertine</span><i aria-hidden=\"true\">&#9679;</i><span>Moss velvet</span><i aria-hidden=\"true\">&#9679;</i><span>Aged brass</span><i aria-hidden=\"true\">&#9679;</i><span>Oxblood leather</span><i aria-hidden=\"true\">&#9679;</i></div></div></div>',
        chapters: [
          { act: "01 Era", title: "Start with the sunken room.", body: "Plaster arches, a low amber lamp and a conversation pit: the late-sixties plan, kept intact." },
          { act: "02 Craft", title: "Velvet, lacquer, walnut.", body: "Hand-finished surfaces chosen to survive daily life, not just a photo shoot." },
          { act: "03 Light", title: "Linen filters the afternoon.", body: "Sheer layers and warm bulbs soften the palette so loud colour stays livable." },
          { act: "04 Detail", title: "Brass down to the last screw.", body: "Every handle, switch and hem is specified before install day." },
        ],
      },
      gallery: false,
    },
    "moos-peak": {
      routes: [
        "projects",
        "about",
        "contact",
        "privacy",
      ],
      css: ["/demos/moos-peak/izden-peak.css"],
      film: {
        mount: { prepend: "#main" },
        hero: [
          '<div class="pk-hero container">',
          '<p class="pk-hero__eyebrow">Peak &middot; Interior studio &middot; Dubai</p>',
          '<h1 class="pk-hero__title">Interiors with clarity, warmth and lasting character.</h1>',
          '<p class="pk-hero__lede">A Dubai interior studio creating calm, considered spaces &mdash; planned around how people move, live and gather.</p>',
          '<div class="pk-hero__cta">',
          '<a class="pk-btn pk-btn--solid" href="/demos/moos-peak/projects/index.html"><span>View projects</span><span aria-hidden="true">&rarr;</span></a>',
          '<a class="pk-btn pk-btn--line" href="/demos/moos-peak/about/index.html"><span>About the studio</span></a>',
          '</div></div>',
        ].join(""),
        after:
          '<div class="pk-strip"><div class="container pk-strip__in"><p class="pk-strip__lead">Recent work</p>' +
          '<ul class="pk-strip__list"><li>Al Wasl</li><li>Palm Jumeirah</li><li>Dubai Creek</li><li>Downtown</li><li>Jumeirah</li></ul></div></div>',
        chapters: [
          { act: "01 Horizon", title: "Start with the view.", body: "In a high-rise the skyline is the first material. Plans begin from it." },
          { act: "02 Material", title: "Stone, oak, linen.", body: "A sample board is built before a room is drawn, so texture and tone agree from day one." },
          { act: "03 Rest", title: "A calm bedroom.", body: "Warm timber, limestone and soft layers keep the quietest rooms balanced." },
          { act: "04 Handover", title: "Resolved to the detail.", body: "Joinery, lighting and finishes are coordinated so the space feels complete on handover." },
        ],
      },
      gallery: false,
    },
  };
  const cfg = SITES[SLUG] || { routes: [], film: null, gallery: false };
  const isHome = /^\/demos\/moos-[a-z0-9-]+\/(index\.html)?$/.test(location.pathname);

  /* ───────────── 1. links ───────────── */
  const routes = new Set(cfg.routes);
  const SKIP_PREFIX = ["/demos/", "/_next/", "/brand/", "/previews/", "/api/"];

  function mapPath(pathname) {
    const clean = pathname.replace(/\/+$/, "").replace(/^\/+/, "");
    if (!clean) return `${BASE}index.html`;
    const parts = clean.split("/");
    while (parts.length) {
      const probe = parts.join("/");
      if (routes.has(probe)) return `${BASE}${probe}/index.html`;
      parts.pop();
    }
    return `${BASE}index.html`;
  }

  /** Returns a corrected href string, or null when the link should be left alone. */
  function fix(raw) {
    if (!raw) return null;
    if (/^(#|mailto:|tel:|javascript:|data:|blob:)/i.test(raw)) return null;
    let u;
    try {
      u = new URL(raw, location.href);
    } catch {
      return null;
    }
    if (u.origin !== location.origin) return null;
    // Portal return link stays at the portal root
    if (u.pathname === "/" && /^#siteler/.test(u.hash)) return null;
    // Already inside this demo
    if (u.pathname.startsWith(BASE)) {
      // directory URL → explicit index.html (Next static server drops the slash redirect target)
      if (u.pathname.endsWith("/")) return `${u.pathname}index.html${u.search}${u.hash}`;
      return null;
    }
    if (SKIP_PREFIX.some((p) => u.pathname.startsWith(p))) return null;
    // Site-root route from the original Next app ("/projects?sector=X#y")
    return `${mapPath(u.pathname)}${u.hash}`;
  }

  function fixAnchor(a) {
    const raw = a.getAttribute("href");
    const next = fix(raw);
    if (next && next !== raw) a.setAttribute("href", next);
  }
  const fixAll = (root = document) => root.querySelectorAll("a[href]").forEach(fixAnchor);

  // capture on window → runs before React's root listeners
  window.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href");
      if (!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      let dest;
      try {
        dest = new URL(fix(raw) || raw, location.href);
      } catch {
        return;
      }
      if (dest.origin !== location.origin || !dest.pathname.startsWith(BASE)) return;
      // Always own in-demo navigation: React's <Link> would router.push the
      // original site-root href ("/contact") and leave the demo.
      e.preventDefault();
      e.stopImmediatePropagation();
      if (dest.pathname === location.pathname && dest.search === location.search) {
        if (dest.hash) {
          const el = document.getElementById(decodeURIComponent(dest.hash.slice(1)));
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", dest.hash);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        location.assign(dest.href);
      }
    },
    true
  );

  /* ───────────── 2. kill RSC prefetch / soft-nav fetches ───────────── */
  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  if (nativeFetch) {
    window.fetch = function (input, init) {
      try {
        const url = typeof input === "string" ? input : input && input.url;
        if (url && /[?&]_rsc=/.test(url)) {
          return Promise.resolve(new Response("", { status: 204 }));
        }
      } catch {
        /* fall through */
      }
      return nativeFetch(input, init);
    };
  }

  /* ───────────── 3. re-inject shared layer after hydration ───────────── */
  const need = {
    css: ["izden-image-scrub.css", "izden-afterglow.css", "izden-scroll-visuals.css", "izden-agency.css"],
  };
  let healCount = 0;

  function ensureCss() {
    need.css.forEach((file) => {
      if (document.querySelector(`link[data-iz-heal="${file}"]`)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = SHARED + file;
      l.dataset.izHeal = file;
      document.head.appendChild(l);
    });
    (cfg.css || []).forEach((href) => {
      if (document.querySelector(`link[data-iz-heal-site="${href}"]`) || document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.dataset.izHealSite = href;
      document.head.appendChild(l);
    });
    if (!document.getElementById("iz-scrub-tall")) {
      const s = document.createElement("style");
      s.id = "iz-scrub-tall";
      s.textContent =
        ".iz-scrub--film{height:380vh!important}" +
        ".iz-scrub__ui,.iz-scrub__title,.iz-scrub__body,.iz-scrub__act{color:#f4f0ea!important;text-shadow:0 2px 24px rgba(0,0,0,.6)!important}" +
        "@media(max-width:720px){.iz-scrub--film{height:300vh!important}}";
      document.head.appendChild(s);
    }
  }

  function loadScript(file) {
    const s = document.createElement("script");
    s.src = `${SHARED}${file}?h=${healCount}`;
    s.defer = true;
    document.body.appendChild(s);
  }

  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function buildFilm() {
    const f = cfg.film;
    const poster = `${BASE}assets/kie-scrub/pc/01.jpg`;
    const sec = document.createElement("section");
    sec.className = "iz-scrub iz-scrub--film iz-scrub--kie";
    sec.setAttribute("data-iz-film-scrub", "");
    sec.setAttribute("aria-label", "Film chapter scrub");
    sec.dataset.filmPc = `${BASE}assets/kie-scrub/film-pc.mp4`;
    sec.dataset.filmMob = `${BASE}assets/kie-scrub/film-mob.mp4`;
    sec.dataset.poster = poster;
    sec.dataset.posterMob = `${BASE}assets/kie-scrub/mob/01.jpg`;
    if (f.hero) sec.classList.add("iz-scrub--has-hero");
    sec.innerHTML =
      `<div class="iz-scrub__pin">` +
      `<div class="iz-scrub__stage"><video class="iz-film" muted playsinline preload="auto" poster="${esc(poster)}" disablePictureInPicture></video></div>` +
      `<div class="iz-scrub__veil" aria-hidden="true"></div>` +
      (f.hero ? `<div class="iz-scrub__hero">${f.hero}</div>` : "") +
      `<div class="iz-scrub__ui"><p class="iz-scrub__act" data-iz-act></p><h2 class="iz-scrub__title" data-iz-title></h2><p class="iz-scrub__body" data-iz-body></p></div>` +
      `<p class="iz-scrub__hint">Scroll</p></div>` +
      `<script type="application/json" data-iz-chapters>${JSON.stringify(f.chapters)}</script>`;
    return sec;
  }

  function mountFilm() {
    if (!cfg.film || !isHome) return false;
    if (document.querySelector("[data-iz-film-scrub]")) return false;
    const { mount } = cfg.film;
    let host = null;
    const sec = buildFilm();
    if (mount.after) {
      host = document.querySelector(mount.after);
      if (!host) return false;
      host.after(sec);
    } else if (mount.prepend) {
      host = document.querySelector(mount.prepend);
      if (!host) return false;
      host.prepend(sec);
    }
    if (cfg.film.after) sec.insertAdjacentHTML("afterend", cfg.film.after);
    return true;
  }

  function ensureAgency() {
    if (document.querySelector(".izden-agency")) return;
    loadScript("izden-agency.js");
  }

  function heal() {
    if (!document.body || !document.head) return;
    healCount += 1;
    ensureCss();
    fixAll();
    const filmAdded = mountFilm();
    if (filmAdded) loadScript("izden-film-scrub.js");
    if (healCount === 1 || filmAdded) {
      if (cfg.gallery) loadScript("izden-scroll-gallery.js");
      loadScript("izden-afterglow.js");
    }
    ensureAgency();
  }

  // Debounced watcher: heal when DOM settles, and whenever React removes our nodes.
  let t = 0;
  let healed = 0;
  const schedule = (delay) => {
    clearTimeout(t);
    t = setTimeout(() => {
      const missing =
        (cfg.film && isHome && !document.querySelector("[data-iz-film-scrub]")) ||
        !document.querySelector(".izden-agency") ||
        !document.querySelector('link[data-iz-heal="izden-agency.css"]');
      if (missing && healed < 4) {
        healed += 1;
        heal();
      } else {
        fixAll();
      }
    }, delay);
  };

  const start = () => {
    fixAll();
    const mo = new MutationObserver((muts) => {
      let anchors = false;
      for (const mu of muts) {
        for (const n of mu.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (n.tagName === "A") fixAnchor(n);
          else if (n.querySelector) n.querySelectorAll("a[href]").forEach(fixAnchor);
          anchors = true;
        }
      }
      if (anchors) schedule(450);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    // first pass after load + hydration; safety passes later
    const first = () => schedule(700);
    if (document.readyState === "complete") first();
    else window.addEventListener("load", first, { once: true });
    setTimeout(() => schedule(0), 2500);
    setTimeout(() => schedule(0), 5000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
