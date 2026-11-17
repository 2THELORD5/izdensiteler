ObjC.import("Foundation");
const ROOT = "/Users/anil/Desktop/izdensiteler/public/demos";

function writeFile(fp, content) {
  const ns = $.NSString.alloc.initWithUTF8String(content);
  ns.writeToFileAtomicallyEncodingError(fp, true, $.NSUTF8StringEncoding, null);
}

function pathJoin() {
  return Array.prototype.slice.call(arguments).join("/");
}

const demos = [
  {
    slug: "atelier-meridian",
    title: "MERIDIAN",
    tagline: "Coastal architecture shaped by tide and light.",
    theme: "#082f49",
    themeColor: "#082f49",
    accent: "#0e7490",
    text: "#e7e5e4",
    fonts: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Space+Grotesk:wght@400;500;600;700&display=swap",
    display: '"Fraunces", Georgia, serif',
    body: '"Space Grotesk", system-ui, sans-serif',
    motion: "snap",
    sigId: "coast",
    sigTitle: "Horizon panels",
    sigLede:
      "Scroll snaps through coastal studies — each panel draws its seam line as it lands.",
    images: ["hero", "facade", "silos", "cliff", "deck", "plan"],
    brand: "Meridian Atelier",
    cta: "Request dossier",
    locale: "en",
  },
  {
    slug: "atelier-velvet",
    title: "VELVET CELLAR",
    tagline: "Wine cellar identity for slow evenings.",
    theme: "#1c0a00",
    themeColor: "#1c0a00",
    accent: "#7c2d12",
    text: "#f5e6d3",
    fonts: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@400;500;600&display=swap",
    display: '"Libre Baskerville", Georgia, serif',
    body: '"Outfit", system-ui, sans-serif',
    motion: "velvet",
    sigId: "vintage",
    sigTitle: "Vintage chapters",
    sigLede: "Chapters crossfade as cork count climbs — one harvest per scroll stop.",
    images: ["hero", "cellar", "barrel", "pour", "vineyard", "cork"],
    brand: "Velvet Cellar",
    cta: "Taste by appointment",
    locale: "en",
  },
  {
    slug: "atelier-atlas",
    title: "ATLAS FIELD",
    tagline: "Outdoor systems for routes that never repeat.",
    theme: "#14532d",
    themeColor: "#14532d",
    accent: "#365314",
    text: "#f0fdf4",
    fonts: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@400;500;600&display=swap",
    display: '"Bebas Neue", system-ui, sans-serif',
    body: '"Source Sans 3", system-ui, sans-serif',
    motion: "atlas",
    sigId: "route",
    sigTitle: "Route pin",
    sigLede: "A short scrub advances the map pin; gear icons stagger in as altitude rises.",
    images: ["hero", "peak", "camp", "trail", "gear", "field"],
    brand: "Atlas Field",
    cta: "Plan expedition",
    locale: "en",
  },
  {
    slug: "atelier-solace",
    title: "SOLACE",
    tagline: "Spa rituals measured in breath, not minutes.",
    theme: "#042f2e",
    themeColor: "#042f2e",
    accent: "#0f766e",
    text: "#ecfeff",
    fonts: "https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,400;0,600;1,400&family=Figtree:wght@400;500;600&display=swap",
    display: '"Cormorant Infant", Georgia, serif',
    body: '"Figtree", system-ui, sans-serif',
    motion: "solace",
    sigId: "ritual",
    sigTitle: "Ritual wipes",
    sigLede: "Slow horizontal wipes reveal each treatment step — calm, sequential, tactile.",
    images: ["hero", "pool", "stone", "ritual", "mist", "calm"],
    brand: "Solace Spa",
    cta: "Book a ritual",
    locale: "en",
  },
  {
    slug: "atelier-forge",
    title: "FORGE",
    tagline: "Coffee roasted for predawn crews.",
    theme: "#1c1917",
    themeColor: "#1c1917",
    accent: "#78350f",
    text: "#fafaf9",
    fonts: "https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
    display: '"Anton", system-ui, sans-serif',
    body: '"IBM Plex Sans", system-ui, sans-serif',
    motion: "forge",
    sigId: "grind",
    sigTitle: "Grind & steam",
    sigLede: "Micron counter ticks up while steam drifts in a soft ken-burns loop.",
    images: ["hero", "beans", "steam", "roast", "pour", "cafe"],
    brand: "Forge Coffee",
    cta: "Subscribe roast",
    locale: "en",
  },
  {
    slug: "atelier-rivet",
    title: "RIVET DETAIL",
    tagline: "Auto finishing studio for gloss that holds.",
    theme: "#0f172a",
    themeColor: "#0f172a",
    accent: "#64748b",
    text: "#e2e8f0",
    fonts: "https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600&family=Barlow:wght@400;500;600&display=swap",
    display: '"Teko", system-ui, sans-serif',
    body: '"Barlow", system-ui, sans-serif',
    motion: "rivet",
    sigId: "gloss",
    sigTitle: "Gloss wipe",
    sigLede: "Drag the divider — before oxidation meets after ceramic gloss in one gesture.",
    images: ["hero", "before", "after", "gloss", "detail", "studio"],
    brand: "Rivet Detail",
    cta: "Book bay time",
    locale: "tr",
  },
  {
    slug: "atelier-amber",
    title: "AMBER JEWELS",
    tagline: "Macro gold for collectors who read light.",
    theme: "#1c1917",
    themeColor: "#1c1917",
    accent: "#b45309",
    text: "#fbbf24",
    fonts: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Karla:wght@400;500;600&display=swap",
    display: '"Playfair Display", Georgia, serif',
    body: '"Karla", system-ui, sans-serif',
    motion: "amber",
    sigId: "orbit",
    sigTitle: "Orbit vitrine",
    sigLede: "Pieces orbit on a subtle axis while vitrine slots fade in sequence.",
    images: ["hero", "macro", "vitrine", "gold", "craft", "studio"],
    brand: "Amber Jewels",
    cta: "Private viewing",
    locale: "en",
  },
];

function sharedNav(d) {
  return `
  <header class="site-nav" id="nav" data-open="false">
    <button type="button" class="site-nav__burger" id="navBurger" aria-label="Open menu" aria-expanded="false" aria-controls="navDrawer">
      <span></span><span></span><span></span>
    </button>
    <a class="site-nav__brand" href="#top">${d.title.split(" ")[0]}</a>
    <nav class="site-nav__links" aria-label="Primary">
      <a href="#${d.sigId}">Signature</a>
      <a href="#story">Story</a>
      <a href="#craft">Craft</a>
      <a href="#gallery">Gallery</a>
      <a href="#journal">Journal</a>
      <a href="#contact" class="site-nav__cta">${d.cta}</a>
    </nav>
  </header>
  <div class="nav-drawer-backdrop" id="navBackdrop" hidden></div>
  <aside class="nav-drawer" id="navDrawer" aria-hidden="true" data-open="false">
    <div class="nav-drawer__head">
      <strong>${d.title.split(" ")[0]}</strong>
      <button type="button" class="nav-drawer__close" id="navClose" aria-label="Close menu">×</button>
    </div>
    <nav class="nav-drawer__links" aria-label="Mobile">
      <a href="#${d.sigId}">Signature</a>
      <a href="#story">Story</a>
      <a href="#craft">Craft</a>
      <a href="#process">Process</a>
      <a href="#gallery">Gallery</a>
      <a href="#journal">Journal</a>
      <a href="#faq">FAQ</a>
      <a href="#contact">${d.cta}</a>
    </nav>
  </aside>`;
}

function signatureHtml(d) {
  const [a, b, c] = d.images.slice(1, 4);
  switch (d.motion) {
    case "snap":
      return `
    <section class="sig sig--snap" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="sig__head iz-reveal">
        <p class="sig__kicker">${d.sigTitle}</p>
        <h2 class="sig__title">${d.sigLede}</h2>
      </div>
      <div class="snap-rail" id="snapRail">
        <div class="snap-rail__track" id="snapTrack">
          <article class="snap-panel" data-panel="0">
            <figure><img src="media/${a}.jpg" alt="Coastal facade study" loading="lazy" /><svg class="line-draw" viewBox="0 0 400 120" aria-hidden="true"><path d="M8 100 L120 40 L220 72 L392 28" /></svg></figure>
            <h3>Tide line</h3>
            <p>Concrete set back from surge — openings sized for salt air, not spectacle.</p>
          </article>
          <article class="snap-panel" data-panel="1">
            <figure><img src="media/${b}.jpg" alt="Silhouette against horizon" loading="lazy" /><svg class="line-draw" viewBox="0 0 400 120" aria-hidden="true"><path d="M20 90 L180 50 L260 88 L380 20" /></svg></figure>
            <h3>Meridian cut</h3>
            <p>Roof angles track sun path; shadows become the secondary elevation.</p>
          </article>
          <article class="snap-panel" data-panel="2">
            <figure><img src="media/${c}.jpg" alt="Cliffside deck" loading="lazy" /><svg class="line-draw" viewBox="0 0 400 120" aria-hidden="true"><path d="M4 70 L140 30 L300 60 L396 44" /></svg></figure>
            <h3>Lantern deck</h3>
            <p>Glass decks float above stone — privacy without losing the horizon.</p>
          </article>
        </div>
      </div>
    </section>`;
    case "velvet":
      return `
    <section class="sig sig--velvet" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="velvet-stage" id="velvetStage">
        <div class="velvet-chapter is-active" data-chapter="0">
          <img src="media/${a}.jpg" alt="Cellar vault" loading="lazy" />
          <div class="velvet-copy"><h2>1998</h2><p>First reserve laid down in limestone.</p></div>
        </div>
        <div class="velvet-chapter" data-chapter="1">
          <img src="media/${b}.jpg" alt="Barrel row" loading="lazy" />
          <div class="velvet-copy"><h2>2009</h2><p>Oak tension tuned for velvet tannin.</p></div>
        </div>
        <div class="velvet-chapter" data-chapter="2">
          <img src="media/${c}.jpg" alt="Pour ritual" loading="lazy" />
          <div class="velvet-copy"><h2>2018</h2><p>Evening releases — cork by cork.</p></div>
        </div>
        <div class="velvet-counter" aria-live="polite">Corks pulled: <span id="corkCount">0</span></div>
      </div>
    </section>`;
    case "atlas":
      return `
    <section class="sig sig--atlas" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="atlas-pin-wrap" id="atlasPinWrap">
        <img class="atlas-map" src="media/${d.images[3]}.jpg" alt="Trail map terrain" loading="lazy" />
        <div class="atlas-pin" id="atlasPin" style="--pin-p:0"></div>
        <ul class="atlas-gear" id="atlasGear">
          <li data-i="0">Shell</li>
          <li data-i="1">Bivy</li>
          <li data-i="2">Stove</li>
          <li data-i="3">Filter</li>
        </ul>
        <p class="atlas-hint iz-reveal">${d.sigLede}</p>
      </div>
    </section>`;
    case "solace":
      return `
    <section class="sig sig--solace" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="ritual-steps" id="ritualSteps">
        <article class="ritual-step is-active" data-step="0"><div class="ritual-wipe"></div><img src="media/${a}.jpg" alt="Stone pool" /><h2>Arrive</h2><p>Foot bath, mineral warm — phones stay in the locker.</p></article>
        <article class="ritual-step" data-step="1"><div class="ritual-wipe"></div><img src="media/${b}.jpg" alt="Stone chamber" /><h2>Steam</h2><p>Eucalyptus veil — seven slow breaths at the rail.</p></article>
        <article class="ritual-step" data-step="2"><div class="ritual-wipe"></div><img src="media/${c}.jpg" alt="Treatment room" /><h2>Restore</h2><p>Oils pressed in house; pressure mapped to fascia map.</p></article>
      </div>
      <div class="ritual-dots" role="tablist" aria-label="Ritual steps">
        <button type="button" class="is-active" data-go="0">01</button>
        <button type="button" data-go="1">02</button>
        <button type="button" data-go="2">03</button>
      </div>
    </section>`;
    case "forge":
      return `
    <section class="sig sig--forge" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="grind-stage">
        <div class="grind-steam ken-burns" aria-hidden="true">
          <img src="media/${d.images[2]}.jpg" alt="Steam rising" />
        </div>
        <div class="grind-data">
          <p class="grind-label">Micron target</p>
          <p class="grind-num" id="grindNum" data-target="420">000</p>
          <p class="grind-note iz-reveal">${d.sigLede}</p>
        </div>
      </div>
    </section>`;
    case "rivet":
      return `
    <section class="sig sig--rivet" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="gloss-compare" id="glossCompare">
        <img class="gloss-before" src="media/${d.images[1]}.jpg" alt="Before finish" />
        <div class="gloss-after-wrap">
          <img class="gloss-after" src="media/${d.images[2]}.jpg" alt="After gloss" />
        </div>
        <input type="range" class="gloss-slider" id="glossSlider" min="0" max="100" value="42" aria-label="Before after gloss wipe" />
        <span class="gloss-handle" id="glossHandle" aria-hidden="true"></span>
      </div>
      <p class="gloss-caption iz-reveal">${d.sigLede}</p>
    </section>`;
    case "amber":
      return `
    <section class="sig sig--amber" id="${d.sigId}" aria-label="${d.sigTitle}">
      <div class="orbit-stage">
        <div class="orbit-core" aria-hidden="true">
          <img src="media/${d.images[1]}.jpg" alt="Macro amber stone" />
        </div>
        <ul class="vitrine" id="vitrine">
          <li class="is-visible"><img src="media/${d.images[2]}.jpg" alt="Vitrine piece one" loading="lazy" /></li>
          <li><img src="media/${d.images[3]}.jpg" alt="Gold band" loading="lazy" /></li>
          <li><img src="media/${d.images[4]}.jpg" alt="Craft bench" loading="lazy" /></li>
        </ul>
      </div>
    </section>`;
    default:
      return "";
  }
}

function heroPic() {
  return `<picture>
          <source media="(max-width:900px)" srcset="media/hero-mob.jpg" />
          <img src="media/hero.jpg" alt="" width="1920" height="1280" fetchpriority="high" />
        </picture>`;
}

function heroHtml(d) {
  const m = d.motion;
  const pic = heroPic();
  if (m === "snap") {
    return `
    <section class="hero hero--split" aria-labelledby="hero-title">
      <div class="hero__split-media">
        ${pic}
      </div>
      <div class="hero__split-copy">
        <p class="hero__eyebrow iz-reveal">Coastal dossier</p>
        <h1 class="hero__wordmark iz-reveal" id="hero-title">${d.title}</h1>
        <p class="hero__tag iz-reveal" data-d="1">${d.tagline}</p>
        <a class="hero__btn iz-reveal" data-d="2" href="#${d.sigId}">${d.cta}</a>
      </div>
    </section>`;
  }
  if (m === "velvet") {
    return `
    <section class="hero hero--center" aria-labelledby="hero-title">
      <div class="hero__media">
        ${pic}
      </div>
      <div class="hero__veil hero__veil--vignette"></div>
      <div class="hero__inner hero__inner--center">
        <p class="hero__eyebrow iz-reveal">Reserve evenings</p>
        <h1 class="hero__wordmark iz-reveal" id="hero-title">${d.title}</h1>
        <p class="hero__tag iz-reveal" data-d="1">${d.tagline}</p>
        <a class="hero__btn iz-reveal" data-d="2" href="#${d.sigId}">${d.cta}</a>
      </div>
    </section>`;
  }
  if (m === "atlas") {
    return `
    <section class="hero hero--stack" aria-labelledby="hero-title">
      <div class="hero__stack-band">
        <p class="hero__eyebrow iz-reveal">Field systems</p>
        <h1 class="hero__wordmark iz-reveal" id="hero-title">${d.title}</h1>
        <p class="hero__tag iz-reveal" data-d="1">${d.tagline}</p>
        <a class="hero__btn iz-reveal" data-d="2" href="#${d.sigId}">${d.cta}</a>
      </div>
      <div class="hero__stack-media">
        ${pic}
      </div>
    </section>`;
  }
  if (m === "solace") {
    return `
    <section class="hero hero--float" aria-labelledby="hero-title">
      <div class="hero__media">
        ${pic}
      </div>
      <div class="hero__veil"></div>
      <div class="hero__float-card iz-reveal">
        <p class="hero__eyebrow">Breath-measured care</p>
        <h1 class="hero__wordmark" id="hero-title">${d.title}</h1>
        <p class="hero__tag">${d.tagline}</p>
        <a class="hero__btn" href="#${d.sigId}">${d.cta}</a>
      </div>
    </section>`;
  }
  if (m === "forge") {
    return `
    <section class="hero hero--bottom ken" aria-labelledby="hero-title">
      <div class="hero__media ken-burns">
        ${pic}
      </div>
      <div class="hero__veil hero__veil--hard"></div>
      <div class="hero__inner hero__inner--wide">
        <p class="hero__eyebrow iz-reveal">Predawn roast</p>
        <h1 class="hero__wordmark iz-reveal" id="hero-title">${d.title}</h1>
        <p class="hero__tag iz-reveal" data-d="1">${d.tagline}</p>
        <a class="hero__btn iz-reveal" data-d="2" href="#${d.sigId}">${d.cta}</a>
      </div>
    </section>`;
  }
  if (m === "rivet") {
    return `
    <section class="hero hero--rail" aria-labelledby="hero-title">
      <div class="hero__rail-media">
        ${pic}
      </div>
      <aside class="hero__rail-copy">
        <p class="hero__eyebrow iz-reveal">Bay 03 · Gloss</p>
        <h1 class="hero__wordmark iz-reveal" id="hero-title">${d.title}</h1>
        <p class="hero__tag iz-reveal" data-d="1">${d.tagline}</p>
        <a class="hero__btn iz-reveal" data-d="2" href="#${d.sigId}">${d.cta}</a>
      </aside>
    </section>`;
  }
  // amber default unique: magazine masthead
  return `
    <section class="hero hero--mast" aria-labelledby="hero-title">
      <div class="hero__mast-top">
        <p class="hero__eyebrow iz-reveal">Collectors edition</p>
        <h1 class="hero__wordmark iz-reveal" id="hero-title">${d.title}</h1>
        <p class="hero__tag iz-reveal" data-d="1">${d.tagline}</p>
        <a class="hero__btn iz-reveal" data-d="2" href="#${d.sigId}">${d.cta}</a>
      </div>
      <div class="hero__mast-media">
        ${pic}
      </div>
    </section>`;
}

function storyCopy(d) {
  const map = {
    snap: ["Horizon first", "Tide sets the grid — openings follow salt air, not spectacle."],
    velvet: ["Cellar patience", "Years in limestone before a cork is pulled for guests."],
    atlas: ["Route before gear", "Pin the altitude; pack only what the ridge demands."],
    solace: ["Ritual over rush", "Each step is timed to breath — never to the clock."],
    forge: ["Micron honesty", "Roast curves printed, not mythologized."],
    rivet: ["Before / after truth", "One wipe reveals the ceramic film — no filter gloss."],
    amber: ["Light as material", "Stones are graded under the same lamp collectors use."],
  };
  return map[d.motion] || ["Signature craft", d.tagline];
}

function html(d) {
  const [img4, img5, img6] = d.images.slice(3, 6);
  const [storyTitle, storyLede] = storyCopy(d);
  const faq1 =
    d.locale === "tr"
      ? "Detay seansı nasıl ayırtılır?"
      : "How do I book the signature experience?";
  const faq1a =
    d.locale === "tr"
      ? "Bize yazın veya arayın; İstanbul stüdyosunda demo randevusu onaylarız."
      : "Email or call — we confirm studio slots within one business day.";
  return `<!DOCTYPE html>
<html lang="${d.locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${d.title} — ${d.brand}</title>
  <meta name="description" content="${d.tagline}" />
  <meta name="theme-color" content="${d.themeColor}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${d.fonts}" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="/demos/_shared/izden-afterglow.css" />
  <link rel="stylesheet" href="/demos/_shared/izden-agency.css" />
  <link rel="stylesheet" href="/demos/_shared/izden-atelier-mobile.css" />
</head>
<body class="motion-${d.motion}">
${sharedNav(d)}
  <main id="top">
${heroHtml(d)}
${signatureHtml(d)}
    <div class="marquee" aria-hidden="true"><div class="marquee__track"><span>${d.brand} · ${d.title} · ${d.sigTitle} · </span><span>${d.brand} · ${d.title} · ${d.sigTitle} · </span></div></div>
    <section class="chapter" id="story">
      <div class="chapter__grid">
        <div class="chapter__copy">
          <p class="chapter__kicker iz-reveal">01 — Story</p>
          <h2 class="chapter__title iz-reveal" data-d="1">${storyTitle}</h2>
          <p class="chapter__lede iz-reveal" data-d="2">${storyLede}</p>
          <a class="chapter__link iz-reveal" href="#craft">See craft</a>
        </div>
        <figure class="chapter__frame iz-reveal"><img src="media/${img4}.jpg" alt="Brand story visual" loading="lazy" /></figure>
      </div>
    </section>
    <section class="chapter chapter--flip" id="craft">
      <div class="chapter__grid">
        <figure class="chapter__frame iz-reveal"><img src="media/${img5}.jpg" alt="Craft detail" loading="lazy" /></figure>
        <div class="chapter__copy">
          <p class="chapter__kicker iz-reveal">02 — Craft</p>
          <h2 class="chapter__title iz-reveal">${d.sigTitle}</h2>
          <p class="chapter__lede iz-reveal">${d.sigLede}</p>
        </div>
      </div>
    </section>
    <section class="process" id="process">
      <header class="section-head"><p class="section-head__kicker iz-reveal">03 — Process</p><h2 class="section-head__title iz-reveal">How we ship</h2></header>
      <ol class="process__list">
        <li class="iz-reveal"><strong>Listen</strong><span>Stakeholder interviews, site walk, constraint map.</span></li>
        <li class="iz-reveal" data-d="1"><strong>Compose</strong><span>One viewport, one idea — type and photo in tension.</span></li>
        <li class="iz-reveal" data-d="2"><strong>Motion</strong><span>Single signature interaction, reduced-motion safe.</span></li>
        <li class="iz-reveal" data-d="3"><strong>Handoff</strong><span>Static HTML demo + media kit for your engineers.</span></li>
      </ol>
    </section>
    <section class="gallery" id="gallery">
      <header class="section-head"><p class="section-head__kicker iz-reveal">04 — Gallery</p><h2 class="section-head__title iz-reveal">Field notes</h2></header>
      <div class="gallery__grid">
        <figure class="iz-reveal"><img src="media/${d.images[1]}.jpg" alt="Gallery 1" loading="lazy" /></figure>
        <figure class="iz-reveal" data-d="1"><img src="media/${d.images[2]}.jpg" alt="Gallery 2" loading="lazy" /></figure>
        <figure class="iz-reveal" data-d="2"><img src="media/${img6}.jpg" alt="Gallery 3" loading="lazy" /></figure>
      </div>
    </section>
    <section class="journal" id="journal">
      <header class="section-head"><p class="section-head__kicker iz-reveal">05 — Journal</p><h2 class="section-head__title iz-reveal">Release notes</h2></header>
      <article class="journal__card iz-reveal">
        <time datetime="2026-03-01">Mar 2026</time>
        <h3>Motion pass</h3>
        <p>Signature interaction tuned for thumb scroll on mobile — hamburger nav, 44px targets, prefers-reduced-motion fallbacks.</p>
      </article>
      <article class="journal__card iz-reveal" data-d="1">
        <time datetime="2026-02-10">Feb 2026</time>
        <h3>Photography</h3>
        <p>Licensed Pexels stills, cropped per viewport — no remote hotlinking in production build.</p>
      </article>
    </section>
    <section class="faq" id="faq">
      <header class="section-head"><p class="section-head__kicker iz-reveal">06 — FAQ</p><h2 class="section-head__title iz-reveal">Before you write</h2></header>
      <article class="faq__item iz-reveal">
        <button type="button" class="faq__q" aria-expanded="false">${faq1}<span class="faq__icon" aria-hidden="true"></span></button>
        <div class="faq__a" hidden><p>${faq1a}</p></div>
      </article>
      <article class="faq__item iz-reveal" data-d="1">
        <button type="button" class="faq__q" aria-expanded="false">${d.locale === "tr" ? "Bu site canlı mı?" : "Is this a live product?"}<span class="faq__icon" aria-hidden="true"></span></button>
        <div class="faq__a" hidden><p>${d.locale === "tr" ? "Hayır — İzden Creative marka demolarıdır." : "No — this is a fictional brand demo by İzden Creative."}</p></div>
      </article>
    </section>
    <section class="contact" id="contact">
      <div class="contact__inner iz-reveal">
        <h2>Studio</h2>
        <p class="contact__brand">${d.brand} — demo by İzden Creative.</p>
        <ul class="contact__list">
          <li><a href="mailto:info@izdencreative.com">info@izdencreative.com</a></li>
          <li><a href="tel:+902120000000">+90 212 000 00 00</a></li>
          <li><a href="https://www.izdencreative.com" target="_blank" rel="noopener noreferrer">izdencreative.com</a></li>
        </ul>
        <img class="contact__logo" src="/demos/_shared/izden-creative.jpg" alt="İzden Creative" width="180" height="61" loading="lazy" />
      </div>
    </section>
  </main>
  <script src="/demos/_shared/izden-afterglow.js"></script>
  <script src="/demos/_shared/izden-agency.js"></script>
  <script src="main.js"></script>
  <script src="/demos/_shared/izden-contact-rewrite.js" defer></script>
</body>
</html>`;
}

function css(d) {
  const inkRgb = d.theme;
  return `:root {
  --ink: ${d.theme};
  --accent: ${d.accent};
  --text: ${d.text};
  --text-dim: color-mix(in srgb, ${d.text} 72%, transparent);
  --line: color-mix(in srgb, ${d.accent} 35%, transparent);
  --font-display: ${d.display};
  --font-body: ${d.body};
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{margin:0;font-family:var(--font-body);font-size:1rem;line-height:1.55;color:var(--text);background:var(--ink);-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:inherit}
.site-nav{position:fixed;inset:0 0 auto;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:max(.85rem,env(safe-area-inset-top)) 1.25rem .85rem;background:linear-gradient(180deg,color-mix(in srgb,var(--ink) 92%,transparent),transparent)}
.site-nav__brand{font-family:var(--font-display);font-weight:600;font-size:1rem;letter-spacing:.18em;text-decoration:none;margin:auto}
.site-nav__links{display:none;align-items:center;gap:1rem}
.site-nav__links a{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;opacity:.78;min-height:44px;display:inline-flex;align-items:center}
.site-nav__links a:hover,.site-nav__links a:focus-visible{opacity:1;outline:none}
.site-nav__cta{border:1px solid var(--accent);padding:0 1rem!important;opacity:1!important}
@media (min-width:960px){.site-nav__burger{display:none}.site-nav__brand{margin:0}.site-nav__links{display:flex}}
.site-nav__burger{width:44px;height:44px;border:0;background:transparent;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:10px;cursor:pointer}
.site-nav__burger span{display:block;height:1px;background:var(--text);width:22px}
.nav-drawer-backdrop{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.55)}
.nav-drawer-backdrop[hidden]{display:none}
.nav-drawer{position:fixed;top:0;right:0;z-index:70;width:min(18rem,88vw);height:100%;background:color-mix(in srgb,var(--ink) 92%,#000);border-left:1px solid var(--line);padding:max(1rem,env(safe-area-inset-top)) 1.25rem 2rem;transform:translateX(100%);transition:transform .35s cubic-bezier(.22,1,.36,1)}
.nav-drawer[data-open="true"]{transform:none}
.nav-drawer__head{display:flex;justify-content:space-between;align-items:center;font-family:var(--font-display);letter-spacing:.12em;margin-bottom:1.5rem}
.nav-drawer__close{width:44px;height:44px;border:0;background:transparent;color:var(--text);font-size:1.75rem;cursor:pointer}
.nav-drawer__links{display:flex;flex-direction:column;gap:.25rem}
.nav-drawer__links a{min-height:44px;display:flex;align-items:center;text-decoration:none;border-bottom:1px solid var(--line)}
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;padding:6rem 1.25rem max(2.5rem,env(safe-area-inset-bottom));overflow:hidden}
.hero__media{position:absolute;inset:0}
.hero__media img,.hero__split-media img,.hero__stack-media img,.hero__rail-media img,.hero__mast-media img{width:100%;height:100%;object-fit:cover}
.hero__media.ken-burns img{animation:ken-burns 18s ease-in-out infinite alternate}
@keyframes ken-burns{from{transform:scale(1.02)}to{transform:scale(1.08) translateY(-1.5%)}}
@media (prefers-reduced-motion:reduce){.hero__media.ken-burns img,.grind-steam.ken-burns img,.orbit-core img{animation:none}}
.hero__veil{position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--ink) 55%,transparent),color-mix(in srgb,var(--ink) 92%,transparent) 85%)}
.hero__veil--vignette{background:radial-gradient(ellipse at center,transparent 20%,color-mix(in srgb,var(--ink) 88%,transparent) 100%)}
.hero__veil--hard{background:linear-gradient(90deg,color-mix(in srgb,var(--ink) 88%,transparent),transparent 55%),linear-gradient(0deg,color-mix(in srgb,var(--ink) 80%,transparent),transparent 50%)}
.hero__inner{position:relative;max-width:40rem}
.hero__inner--center{margin:0 auto;text-align:center}
.hero__inner--wide{max-width:min(52rem,100%)}
.hero__eyebrow{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--text-dim);margin:0 0 .75rem}
.hero__wordmark{font-family:var(--font-display);font-size:clamp(2.4rem,8vw,4.5rem);line-height:.95;margin:0}
.hero__tag{margin:.85rem 0 1.5rem;max-width:32ch;color:var(--text-dim)}
.hero__btn{display:inline-flex;align-items:center;min-height:44px;padding:0 1.35rem;border:1px solid var(--accent);text-decoration:none;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text)}
/* Distinct hero grammars */
.hero--split{display:grid;grid-template-columns:1fr;padding:0;min-height:100svh}
.hero--split .hero__split-media{min-height:52svh}
.hero--split .hero__split-copy{padding:2.5rem 1.25rem max(2rem,env(safe-area-inset-bottom));display:flex;flex-direction:column;justify-content:center}
@media (min-width:900px){.hero--split{grid-template-columns:1.15fr .85fr}.hero--split .hero__split-media{min-height:100svh}}
.hero--center{align-items:center;justify-content:center;text-align:center}
.hero--stack{display:flex;flex-direction:column;padding:0;min-height:100svh}
.hero--stack .hero__stack-band{padding:max(5rem,env(safe-area-inset-top)) 1.25rem 1.5rem;background:var(--ink)}
.hero--stack .hero__stack-media{flex:1;min-height:55svh}
.hero--float{align-items:center;justify-content:flex-end}
.hero--float .hero__float-card{position:relative;margin:0 1.25rem max(2rem,env(safe-area-inset-bottom));padding:1.5rem 1.35rem;background:color-mix(in srgb,var(--ink) 78%,transparent);border:1px solid var(--line);backdrop-filter:blur(10px);max-width:26rem}
.hero--rail{display:grid;grid-template-columns:1fr;padding:0;min-height:100svh}
.hero--rail .hero__rail-media{min-height:48svh}
.hero--rail .hero__rail-copy{padding:2rem 1.25rem max(2rem,env(safe-area-inset-bottom));border-top:1px solid var(--line);background:color-mix(in srgb,var(--ink) 94%,#000)}
@media (min-width:960px){.hero--rail{grid-template-columns:1.4fr .7fr}.hero--rail .hero__rail-media{min-height:100svh}.hero--rail .hero__rail-copy{border-top:0;border-left:1px solid var(--line);display:flex;flex-direction:column;justify-content:center}}
.hero--mast{display:flex;flex-direction:column;padding:0;min-height:100svh;background:var(--ink)}
.hero--mast .hero__mast-top{padding:max(5.5rem,env(safe-area-inset-top)) 1.25rem 1.25rem;border-bottom:1px solid var(--line)}
.hero--mast .hero__mast-media{flex:1;min-height:58svh}
.hero--mast .hero__wordmark{font-size:clamp(2.8rem,10vw,5.5rem);letter-spacing:-.04em}
.marquee{border-block:1px solid var(--line);overflow:hidden;padding:.65rem 0}
.marquee__track{display:flex;width:max-content;animation:marquee 22s linear infinite}
.marquee__track span{padding-right:3rem;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;opacity:.7}
@keyframes marquee{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.marquee__track{animation:none}}
.chapter{padding:clamp(3rem,8vw,6rem) 1.25rem}
.chapter__grid{max-width:72rem;margin:0 auto;display:grid;gap:2rem}
@media (min-width:900px){.chapter__grid{grid-template-columns:1fr 1fr;align-items:center}.chapter--flip .chapter__grid{direction:rtl}.chapter--flip .chapter__grid>*{direction:ltr}}
.chapter__kicker{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0}
.chapter__title{font-family:var(--font-display);font-size:clamp(2rem,5vw,3rem);margin:.35rem 0 1rem}
.chapter__title em{font-style:italic;color:var(--accent)}
.chapter__lede{color:var(--text-dim);max-width:38ch}
.chapter__link{display:inline-flex;margin-top:1rem;min-height:44px;align-items:center;color:var(--accent)}
.chapter__frame{border:1px solid var(--line);overflow:hidden}
.section-head{max-width:72rem;margin:0 auto;padding:0 1.25rem 1.5rem}
.section-head__kicker{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0}
.section-head__title{font-family:var(--font-display);font-size:clamp(1.8rem,4vw,2.6rem);margin:.35rem 0 0}
.process{padding:0 1.25rem clamp(3rem,8vw,5rem)}
.process__list{list-style:none;max-width:52rem;margin:0 auto;padding:0;display:grid;gap:.85rem}
.process__list li{border:1px solid var(--line);padding:1rem 1.15rem;display:grid;gap:.25rem}
.process__list strong{font-family:var(--font-display);letter-spacing:.06em}
.process__list span{color:var(--text-dim);font-size:.92rem}
.gallery{padding:0 1.25rem clamp(3rem,8vw,5rem)}
.gallery__grid{max-width:72rem;margin:0 auto;display:grid;gap:1rem}
@media (min-width:768px){.gallery__grid{grid-template-columns:repeat(3,1fr)}}
.gallery figcaption{font-size:.75rem;opacity:.7;margin-top:.35rem}
.journal{padding:0 1.25rem clamp(3rem,8vw,5rem)}
.journal__card{max-width:40rem;margin:0 auto 1rem;border-left:2px solid var(--accent);padding-left:1rem}
.journal__card time{font-size:.72rem;letter-spacing:.12em;opacity:.65}
.journal__card h3{font-family:var(--font-display);margin:.25rem 0}
.faq{padding:0 1.25rem clamp(3rem,8vw,5rem);max-width:40rem;margin:0 auto}
.faq__q{width:100%;min-height:44px;border:0;background:transparent;color:var(--text);text-align:left;display:flex;justify-content:space-between;align-items:center;font:inherit;cursor:pointer;border-bottom:1px solid var(--line);padding:.75rem 0}
.faq__a{padding:.75rem 0;color:var(--text-dim)}
.contact{padding:clamp(3rem,8vw,5rem) 1.25rem;border-top:1px solid var(--line)}
.contact__inner{max-width:40rem;margin:0 auto;text-align:center}
.contact__list{list-style:none;padding:0;margin:1rem 0;display:flex;flex-direction:column;gap:.35rem}
.contact__list a{min-height:44px;display:inline-flex;align-items:center;justify-content:center}
.contact__logo{margin:1.25rem auto 0;opacity:.9}
/* signature blocks */
.sig{padding:clamp(3rem,8vw,6rem) 1.25rem;border-top:1px solid var(--line)}
.sig__kicker{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0}
.sig__title{font-family:var(--font-display);font-size:clamp(1.5rem,4vw,2.25rem);max-width:30ch;margin:.5rem 0 2rem}
.sig--snap .snap-rail{overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.sig--snap .snap-rail::-webkit-scrollbar{display:none}
.sig--snap .snap-rail__track{display:flex;gap:1rem;padding-bottom:.5rem}
.sig--snap .snap-panel{flex:0 0 min(82vw,22rem);scroll-snap-align:center;border:1px solid var(--line);padding:1rem}
.sig--snap .snap-panel figure{position:relative;margin:0 0 .75rem}
.sig--snap .line-draw{position:absolute;inset:auto 0 .5rem 0;width:100%;height:auto;stroke:var(--accent);stroke-width:2;fill:none;stroke-dasharray:400;stroke-dashoffset:400;transition:stroke-dashoffset 1.2s ease}
.sig--snap .snap-panel.is-drawn .line-draw{stroke-dashoffset:0}
.sig--velvet .velvet-stage{position:relative;max-width:56rem;margin:0 auto;aspect-ratio:16/10;border:1px solid var(--line);overflow:hidden}
.sig--velvet .velvet-chapter{position:absolute;inset:0;opacity:0;transition:opacity 1.1s ease}
.sig--velvet .velvet-chapter.is-active{opacity:1}
.sig--velvet img{width:100%;height:100%;object-fit:cover}
.sig--velvet .velvet-copy{position:absolute;left:1rem;bottom:1rem;background:color-mix(in srgb,var(--ink) 70%,transparent);padding:.75rem 1rem}
.sig--velvet .velvet-counter{position:absolute;top:1rem;right:1rem;font-variant-numeric:tabular-nums}
.sig--atlas .atlas-pin-wrap{max-width:56rem;margin:0 auto;position:relative}
.sig--atlas .atlas-map{width:100%;border:1px solid var(--line)}
.sig--atlas .atlas-pin{--pin-p:0;position:absolute;left:calc(12% + var(--pin-p) * 68%);top:calc(42% - var(--pin-p) * 18%);width:14px;height:14px;border-radius:50%;background:var(--text);box-shadow:0 0 0 6px color-mix(in srgb,var(--accent) 50%,transparent);transition:left .2s linear,top .2s linear}
.sig--atlas .atlas-gear{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0;margin:1rem 0 0}
.sig--atlas .atlas-gear li{border:1px solid var(--line);padding:.35rem .75rem;opacity:.35;transform:translateY(8px);transition:opacity .4s ease,transform .4s ease}
.sig--atlas .atlas-gear li.is-on{opacity:1;transform:none}
.sig--atlas #atlasPinWrap{min-height:120vh;padding-bottom:40vh}
.sig--solace .ritual-steps{max-width:56rem;margin:0 auto;position:relative;aspect-ratio:4/5;border:1px solid var(--line);overflow:hidden}
@media (min-width:768px){.sig--solace .ritual-steps{aspect-ratio:16/10}}
.sig--solace .ritual-step{position:absolute;inset:0;opacity:0;pointer-events:none}
.sig--solace .ritual-step.is-active{opacity:1;pointer-events:auto}
.sig--solace .ritual-wipe{position:absolute;inset:0;background:var(--ink);transform:scaleX(1);transform-origin:left;transition:transform 1.2s cubic-bezier(.22,1,.36,1)}
.sig--solace .ritual-step.is-active .ritual-wipe{transform:scaleX(0)}
.sig--solace .ritual-step img{width:100%;height:100%;object-fit:cover}
.sig--solace .ritual-step h2,.sig--solace .ritual-step p{position:absolute;left:1rem;bottom:3rem;margin:0;max-width:22ch}
.sig--solace .ritual-dots{display:flex;justify-content:center;gap:.5rem;margin-top:1rem}
.sig--solace .ritual-dots button{min-width:44px;min-height:44px;border:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}
.sig--solace .ritual-dots button.is-active{background:var(--accent);color:var(--ink)}
.sig--forge .grind-stage{max-width:56rem;margin:0 auto;display:grid;gap:1.5rem}
@media (min-width:768px){.sig--forge .grind-stage{grid-template-columns:1.2fr 1fr;align-items:end}}
.sig--forge .grind-steam{overflow:hidden;border:1px solid var(--line)}
.sig--forge .grind-steam img{width:100%;height:100%;object-fit:cover;min-height:16rem}
.sig--forge .grind-num{font-family:var(--font-display);font-size:clamp(3rem,12vw,6rem);line-height:1;margin:0;font-variant-numeric:tabular-nums;color:var(--accent)}
.sig--forge .grind-label{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;opacity:.7;margin:0}
.sig--rivet .gloss-compare{position:relative;max-width:56rem;margin:0 auto;aspect-ratio:16/10;border:1px solid var(--line);overflow:hidden;touch-action:none}
.sig--rivet .gloss-before,.sig--rivet .gloss-after{width:100%;height:100%;object-fit:cover;display:block}
.sig--rivet .gloss-after-wrap{position:absolute;inset:0;width:42%;overflow:hidden;border-right:2px solid var(--text)}
.sig--rivet .gloss-after-wrap .gloss-after{height:100%;max-width:none;width:100vw;object-fit:cover}
.sig--rivet .gloss-slider{position:absolute;inset:auto 0 1rem 0;width:calc(100% - 2rem);margin:0 1rem;accent-color:var(--accent)}
.sig--rivet .gloss-handle{position:absolute;top:50%;left:42%;width:2px;height:60%;background:var(--text);transform:translate(-50%,-50%);pointer-events:none}
.sig--amber .orbit-stage{max-width:56rem;margin:0 auto;display:grid;gap:1.5rem}
@media (min-width:768px){.sig--amber .orbit-stage{grid-template-columns:1fr 1fr;align-items:center}}
.sig--amber .orbit-core img{border:1px solid var(--line);animation:orbit 24s linear infinite}
@keyframes orbit{to{transform:rotate(360deg)}}
.sig--amber .vitrine{list-style:none;margin:0;padding:0;display:grid;gap:.75rem}
.sig--amber .vitrine li{opacity:.25;transform:translateY(6px);transition:opacity .6s ease,transform .6s ease}
.sig--amber .vitrine li.is-visible{opacity:1;transform:none}
`;
}

function js(d) {
  return `(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("navBackdrop");
  const closeBtn = document.getElementById("navClose");
  const nav = document.getElementById("nav");
  const setOpen = (open) => {
    if (!drawer || !nav) return;
    nav.dataset.open = open ? "true" : "false";
    drawer.dataset.open = open ? "true" : "false";
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger?.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () => setOpen(true));
  closeBtn?.addEventListener("click", () => setOpen(false));
  backdrop?.addEventListener("click", () => setOpen(false));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = btn.parentElement?.querySelector(".faq__a");
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });
  ${motionJs(d.motion)}
})();`;
}

function motionJs(motion) {
  const blocks = {
    snap: `
  const rail = document.getElementById("snapRail");
  const panels = document.querySelectorAll(".snap-panel");
  if (rail && panels.length && !reduced) {
    const draw = () => {
      const x = rail.scrollLeft + rail.clientWidth / 2;
      panels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const c = r.left + r.width / 2;
        if (Math.abs(c - window.innerWidth / 2) < r.width * 0.45) p.classList.add("is-drawn");
      });
    };
    rail.addEventListener("scroll", draw, { passive: true });
    draw();
  } else panels.forEach((p) => p.classList.add("is-drawn"));`,
    velvet: `
  const stage = document.getElementById("velvetStage");
  const chapters = stage ? [...stage.querySelectorAll(".velvet-chapter")] : [];
  const cork = document.getElementById("corkCount");
  let ch = 0;
  const setChapter = (i) => {
    ch = i;
    chapters.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
    if (cork) cork.textContent = String(i + 1);
  };
  if (stage && chapters.length) {
    if (!reduced) {
      window.addEventListener("scroll", () => {
        const r = stage.getBoundingClientRect();
        const p = 1 - Math.min(1, Math.max(0, (r.bottom - window.innerHeight * 0.35) / r.height));
        setChapter(Math.min(chapters.length - 1, Math.floor(p * chapters.length)));
      }, { passive: true });
    } else setChapter(chapters.length - 1);
  }`,
    atlas: `
  const wrap = document.getElementById("atlasPinWrap");
  const pin = document.getElementById("atlasPin");
  const gear = document.getElementById("atlasGear");
  const onAtlas = () => {
    if (!wrap || !pin) return;
    const rect = wrap.getBoundingClientRect();
    const h = wrap.offsetHeight - window.innerHeight;
    const t = h > 0 ? Math.min(1, Math.max(0, (-rect.top) / h)) : 0;
    pin.style.setProperty("--pin-p", String(t));
    if (gear) [...gear.children].forEach((li, i) => li.classList.toggle("is-on", t > i * 0.22));
  };
  if (wrap && !reduced) { let tick=false; const run=()=>{if(!tick){tick=true;requestAnimationFrame(()=>{onAtlas();tick=false;});}}; window.addEventListener("scroll",run,{passive:true}); window.addEventListener("resize",run); onAtlas(); } else if (gear) [...gear.children].forEach((li)=>li.classList.add("is-on"));`,
    solace: `
  const steps = [...document.querySelectorAll(".ritual-step")];
  const dots = [...document.querySelectorAll(".ritual-dots button")];
  let step = 0;
  const go = (i) => {
    step = i;
    steps.forEach((s,idx)=>s.classList.toggle("is-active",idx===i));
    dots.forEach((b,idx)=>b.classList.toggle("is-active",idx===i));
  };
  dots.forEach((b)=>b.addEventListener("click",()=>go(Number(b.dataset.go)||0)));
  if (!reduced && steps.length) {
    let timer = setInterval(()=>go((step+1)%steps.length), 4500);
    document.getElementById("ritualSteps")?.addEventListener("pointerenter",()=>clearInterval(timer));
  }`,
    forge: `
  const grind = document.getElementById("grindNum");
  if (grind) {
    const target = Number(grind.dataset.target)||420;
    if (reduced) grind.textContent = String(target);
    else {
      const tick = (start) => (now) => {
        const t = Math.min(1,(now-start)/1400);
        grind.textContent = String(Math.round(t*target)).padStart(3,"0");
        if (t<1) requestAnimationFrame(tick(start));
      };
      const io = new IntersectionObserver((e)=>{if(e[0]?.isIntersecting){requestAnimationFrame(tick(performance.now()));io.disconnect();}},{threshold:.4});
      io.observe(grind);
    }
  }`,
    rivet: `
  const slider = document.getElementById("glossSlider");
  const afterWrap = document.querySelector(".gloss-after-wrap");
  const handle = document.getElementById("glossHandle");
  const setGloss = (v) => {
    const p = v + "%";
    if (afterWrap) afterWrap.style.width = p;
    if (handle) handle.style.left = p;
  };
  slider?.addEventListener("input", () => setGloss(slider.value));
  setGloss(slider?.value || 42);`,
    amber: `
  const vitrine = document.getElementById("vitrine");
  if (vitrine && !reduced) {
    let i = 0;
  const items = [...vitrine.children];
    setInterval(()=>{items.forEach((li,idx)=>li.classList.toggle("is-visible",idx===i));i=(i+1)%items.length;}, 3200);
  } else if (vitrine) [...vitrine.children].forEach((li,idx)=>li.classList.toggle("is-visible",idx===0));`,
  };
  return blocks[motion] || "";
}

for (const d of demos) {
  const dir = ROOT + "/" + d.slug;
  const page = html(d);
  writeFile(pathJoin(dir, "index.html"), page);
  writeFile(pathJoin(dir, "styles.css"), css(d));
  writeFile(pathJoin(dir, "main.js"), js(d));
  console.log("wrote " + d.slug);
}
