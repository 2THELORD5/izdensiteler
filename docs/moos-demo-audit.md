# Moos-up Hostinger Demos — Section Audit

Full structural audit of all 13 Moos-up demo sites. Each site's HTML was fetched directly (static HTML for 12 sites; the 13th — QAD — ships an empty React/Vite shell and was rendered headlessly to inspect the live DOM). For every site below, in order: headings (H1/H2/H3), nav links, video/canvas presence, forms, and the ordered list of major sections with their ids/classes.

---

## retro — Retro

- Source: https://powderblue-alligator-428563.hostingersite.com/
- Stack: Next.js (hashed `_next/static/chunks` + CSS-module class names, e.g. `HeroSequence_hero__aODwa`)
- Headings:
  - H1: "Old soul. New rooms."
  - H2: The studio · The best rooms of the seventies never went out of style. They went out of production. · Selected projects · We keep the character. We improve the living. · How we work · All projects · Have a room with history—or one that needs it? Let's talk.
  - H3: Sunset Lounge · Cobalt House · Velvet Library (featured, repeated again in the "all projects" rail) · Discover · Collect · Compose · Complete (4-step process) · Riviera Apartment · Studio 74 · Nightcap Bar
- Nav: Two parallel nav lists share the same targets — a plain nav (Home `/`, About `/about/`, Projects `/projects/`, Contact `/contact/`) and a numbered variant (01 Home, 02 About, 03 Projects, 04 Contact), plus a CTA "Start a project" → `/contact/#enquiry`. The duplication indicates a visible header nav plus a hidden/overlay mobile nav sharing markup.
- Motion: A `<canvas>` sits inside the hero section (`HeroSequence_hero`), implying a canvas-drawn, scroll-scrubbed image-sequence hero animation. No external animation libraries detected in script list (all first-party Next.js chunks).
- Sections (ordered, under `<main id="main">`):
  1. Hero sequence — `section.HeroSequence_hero__aODwa` (canvas-driven hero)
  2. Intro — `section.home_intro__R_zLE`
  3. Selected projects — `section.home_selected__yByQ7` → 1 large + 2 small `ProjectCard` articles (Sunset Lounge, Cobalt House, Velvet Library)
  4. Point-of-view statement — `section.home_pov__B5WiA` ("We keep the character…")
  5. How we work — `section.home_how__nTf6Y` (Discover / Collect / Compose / Complete)
  6. All-projects rail — `section.home_rail__bXeT9` → 6 compact `ProjectCard` articles (Riviera Apartment, Studio 74, Nightcap Bar, +3)
  7. Closing CTA band — `section.CtaBand_band__zOOvV.CtaBand_forest__RPjRJ.dark-section`
- Media: No `<video>` tags; 1 `<canvas>` (unnamed id) inside the hero.
- Forms: None on the homepage — the enquiry form lives on the separate `/contact/` route (CTA links to `/contact/#enquiry`).
- Notes: Header + footer both present. Component/class naming (`HeroSequence`, `ProjectCard`, `CtaBand`) and dual numbered-nav pattern are shared with **blok** and **peak**, suggesting a common template family reused across three different brands.

---

## grids — Grids

- Source: https://greenyellow-wren-837445.hostingersite.com/
- Stack: Static HTML/CSS/JS (`script.js`, Google Fonts "Space Grotesk")
- Headings: None — this page uses no `<h1>/<h2>/<h3>` tags at all; it's a pure visual tile grid with text carried in spans/aria-labels only.
- Nav: No visible top nav. A hamburger-style "grid glyph" button opens a full-screen overlay menu (`#site-menu`) containing: **01 Work** → `index.html`, **02 About** → `about.html`, plus a mailto link and placeholder social links (Instagram / LinkedIn / Journal).
- Motion: CSS-staggered tile animations (`--i` custom property per tile) driving a flip-card hover effect (`tile__front` / `tile__back`); a square-based preloader animation (`loader__mark`) plays before content reveals. No scroll library hints.
- Sections (ordered):
  1. Preloader — `div.loader` (animated squares, ARIA live region)
  2. Header — `header.header` (brand logo + hamburger menu toggle)
  3. Menu overlay — `div.menu#site-menu` (nav + contact + socials)
  4. Work grid — `main.work#top` → `section.grid` containing 10 flip-card project tiles: Pleated Museum, Tension Span, Glass Monolith, Terracotta Weave, Parametric Canopy, Earth Campus, Helix Atrium, Observation Spire, Civic Mass, Metal Overture
  5. Footer — `footer.footer` (copyright line only)
- Media: No `<video>` or `<canvas>`; visuals are purely `<img>` tiles with CSS flip transitions.
- Forms: None.
- Notes: The entire homepage is essentially one image/portfolio grid; real content detail lives on `project.html?p=<slug>` and `about.html`, which were not part of this audit's scope.

---

## bold — Bold

- Source: https://slategray-marten-505602.hostingersite.com/
- Stack: Static HTML/CSS/JS (`script.js`)
- Headings:
  - H1: "Landmarks. Nothing less."
  - H2: One commission at a time. · Mission · Vision · Selected works · Tidal Hall · Awards · The architects · From the studio · Have a site worth a landmark?
  - H3: Tidal Hall · Dune Monolith · Delta Campus · Observatory Club · Cliff Pavilion · Oculus Baths · Prism Gallery (7 projects) · International Landmark Prize — Winner · Civic Icon Award · Structural Art Medal · Future Heritage Prize · World Waterfront Award (5 awards) · Rayan Al-Masri · Mirei Kanda · Elias Marchetti (3 architects) · First lines · By hand · Night studies (3 studio stories)
- Nav: Single-page anchor nav inside a slide-out `#sideMenu`: Home `#top`, About `#about`, Mission & Vision `#mission`, Projects `#projects`, Case Study `#case-study`, Awards `#awards`, Architects `#architects`, Stories `#stories`, Contact `#contact`.
- Motion: Widespread `reveal` utility class on cards (`glass-panel reveal`, `team-card reveal`, `story-card reveal`) indicating scroll/intersection-observer reveal animations; hamburger menu with full overlay (`#menuBtn` / `#menuOverlay` / `#sideMenu`).
- Sections (ordered, by id):
  1. Hero — `section.hero`
  2. About — `#about` (`section.section.about`)
  3. Mission & Vision — `#mission` (`section.section.mv`) → 2 `glass-panel reveal` cards
  4. Projects — `#projects` (`section.section.section--paper.projects`) — work index list + `#workFlare` visual
  5. Case Study — `#case-study` (`section.case`) — Tidal Hall deep-dive
  6. Awards — `#awards` (`section.section.awards`)
  7. Architects — `#architects` (`section.section.section--paper.architects`) → 3 `team-card reveal` articles
  8. Stories — `#stories` (`section.section.stories`) → 3 `story-card reveal` articles
  9. Contact — `#contact` (`section.section.contact`)
- Media: No `<video>` or `<canvas>`; black-and-white hero photography (`#heroImg.bw`).
- Forms: None in the markup (contact section is CTA/copy-driven, no `<form>`).
- Notes: Paper-texture section variant (`section--paper`) is used to visually separate Projects and Architects from the rest; fully static single-page architecture-studio site.

---

## ores — Ores

- Source: https://deepskyblue-kudu-789550.hostingersite.com/
- Stack: Static HTML + GSAP 3.12.5 + GSAP ScrollTrigger (loaded from cdnjs) + `js/main.js`
- Headings:
  - H1: "Ores Interiors"
  - H2: Our Services · About Company · Our Portfolio · Creating a Cozy Interior
  - H3: Interior Design · Turnkey Renovation · Selection of Materials · Sauna Design · Apartment Design · Kitchen Design (6 services)
- Nav: Header nav `#nav` — Homepage `#home`, Services `#services`, About Us `#about`, Portfolio `#portfolio`, Contacts `#contact` (plus a secondary "About" `#about` link elsewhere on the page).
- Motion: GSAP + ScrollTrigger confirmed via script tags — drives scroll-based reveal/pin effects on services and portfolio panels; a numeric percentage preloader (`#loader`, `#loaderNum`, `#loaderBar`) runs before the page is interactive.
- Sections (ordered):
  1. Preloader — `#loader` (`#loaderNum` / `#loaderBar`)
  2. Header/nav — `header#nav.nav`
  3. Hero — `section#home.hero` (muted background video, poster image)
  4. Services — `section#services.services.section` → 3 `article.service` blocks (one reversed layout)
  5. About — `section#about.about.section`
  6. Portfolio — `section#portfolio.portfolio` → 3 `article.panel` blocks
  7. Contact — `footer#contact.contact` (the footer element itself doubles as the contact section)
- Media: 1 `<video>` — muted, poster `assets/opt/01-hero-living-room.jpg`, no inline `src` (loaded dynamically); no `<canvas>`.
- Forms: None detected in the static markup.
- Notes: Contact info lives directly in the `<footer>` rather than a dedicated contact `<section>`; otherwise a conventional single-page interior-design site.

---

## peak — Peak

- Source: https://darkgoldenrod-goose-740693.hostingersite.com/
- Stack: Next.js (Turbopack build chunk ids)
- Headings:
  - H1: "Interiors with clarity, warmth and lasting character."
  - H2: A quieter approach to interior design. · Selected projects · From first conversation to final detail. · Materials chosen for how they age, feel and belong together. · Have a space in mind?
  - H3: Al Wasl House · Palm Courtyard · Creek Residence · Studio No. 8 (4 projects) · Listen · Define · Refine (3-step process)
- Nav: Home `/`, About `/about/`, Projects `/projects/`, Contact `/contact/`. Link text is rendered with duplicated/overlapping characters (e.g. "HHoommeeHome"), indicating a CSS hover text-scramble/duplicate animation effect on the nav items.
- Motion: A named `hero-sequence` section (`#hero-sequence.hero-seq`) mirrors retro's hero-sequence pattern, but no `<canvas>` or `<video>` tag is present here — the hero animation is likely image/CSS-driven rather than canvas-drawn.
- Sections (ordered, under `<main id="main">`):
  1. Hero sequence — `#hero-sequence.hero-seq`
  2. Intro — `#home-intro-heading` ("A quieter approach to interior design.")
  3. Featured projects — `#featured-heading` → 4 `article.project-card` blocks
  4. Approach — `#approach-heading` (Listen / Define / Refine)
  5. Materials — `#materials-heading`
  6. Closing CTA — `section.spotlight.cta-section` ("Have a space in mind?")
- Media: No `<video>`/`<canvas>` tags found in the fetched HTML despite the hero-sequence naming.
- Forms: None on the homepage (contact form presumably lives on `/contact/`).
- Notes: Structurally near-identical to **retro** and **blok** (same Next.js build system, matching hero-sequence/project-card/CTA-band conventions, duplicated numbered-nav pattern), strongly suggesting a shared template reused for three different brands/verticals.

---

## greenit — Green It

- Source: https://olive-mouse-441609.hostingersite.com/
- Stack: Static HTML/CSS/JS (no external script tags detected — logic appears inlined/bundled)
- Headings:
  - H1: "Let's shape your garden"
  - H2 (sequential quiz questions): What space are we designing · How large is your outdoor space · How should the garden feel to live in · Which garden design feels like you · Would you like a pool · Would you like a pergola · Would you like a BBQ counter · What else belongs in your garden · What light reaches the garden · What construction budget feels comfortable · When would you like to begin · Your garden brief is ready · Ready to grow
  - H3: None
- Nav: No `<nav>`/header links — navigation is a hamburger (`#burger`) opening a slide-out `#drawer` with `#drawer-nav`, plus in-flow `#back` / `#next` step controls.
- Motion: A step-based "wizard"/quiz flow driven by `#back`/`#next`, a progress track (`#track-fill`, `#ticks`, `#num-now`), and a `.magnet` button class suggesting a cursor-following magnetic-button hover effect; a circular `#dial`/`#dial-out` range input for budget selection.
- Sections (ordered, all `section.panel` variants inside `<main id="stage">`):
  1. Welcome — `.panel.p-welcome.is-active` (hero intro)
  2. Ask — `.panel.p-ask` — "What space are we designing"
  3. Ask — `.panel.p-ask` — "How large is your outdoor space"
  4. Living-feel — `.panel.p-living` (with `#tally-living` counter)
  5. Style shots — `.panel.p-shots` — "Which garden design feels like you"
  6. Style shots — `.panel.p-shots` — "Would you like a pool"
  7. Style shots — `.panel.p-shots` — "Would you like a pergola"
  8. Style shots — `.panel.p-shots` — "Would you like a BBQ counter"
  9. Style shots — `.panel.p-shots` — "What else belongs in your garden" (`#tally-features` counter)
  10. Ask — `.panel.p-ask` — "What light reaches the garden"
  11. Budget — `.panel.p-budget` — "What construction budget feels comfortable" (dial input)
  12. Ask — `.panel.p-ask` — "When would you like to begin"
  13. Brief — `.panel.p-brief` — "Your garden brief is ready" (`#brief-view` summary, contact form, "Ready to grow" confirmation `#done`)
- Media: None (no video/canvas).
- Forms: 1 form (`#form.form`) — fields: `name` (text, "Your name"), `email` (email, "name@email.com"), `phone` (tel, "+971").
- Notes: Structurally the most unusual site in the set — a full conversational/quiz-driven lead-gen flow rather than a scroll page, ending in an emailable "garden brief" (`#mail-brief`). No `<footer>` element present. (A naive library scan flagged "three" in this file, but it's a false positive from body copy, not three.js.)

---

## sapa — Sapa

- Source: https://darkslategrey-herring-631609.hostingersite.com/
- Stack: Static HTML/CSS/JS (`js/main.js`), heavy inline SVG
- Headings:
  - H1: "Sapa Residences."
  - H2: Calm waters, elevated living. · Where the creek glows. · The exteriors. · Mornings above the water. · Everything within reach. · Inside the amenities. · The interiors. · A plan that flows. · Connecting you to the city. · Estimated Completion Date · Questions, answered. · Make Sapa yours.
  - H3: Infinity Pool · Fitness Studio · Yoga Studio · Boxing Studio · Kids' Creative Art · Gaming Lounge · Residents' Lounge · Landscaped Gardens · Sauna & Steam · Kids' Play Area · BBQ & Alfresco · 24/7 Concierge (12 amenities) · Enquire now.
- Nav: No `<nav>` tag — header-level CTAs only: "Register Interest" → `#contact`, "Discover" → `#about`.
- Motion: Draggable/scroll-tracked photo galleries with live counters and progress bars (`ext-/amen-/int-counter`, `g-progress`, `gallery-track`); an animated inline-SVG commute map with route paths and ETA "chips" to RAK, BK, DM, DIFC, DXB, BAA; `reveal` utility class on the enquiry form.
- Sections (ordered):
  1. Downloads band — `section.downloads`
  2. About — `#about`
  3. Feature band — `section.feature`
  4. Exteriors gallery — `#exteriors.gallery-section` (`#ext-counter`, `#ext-gallery`, `#ext-progress`)
  5. Unlabeled section (transition/copy band)
  6. Amenities — `#amenities` (`#amen-counter`, `#amen-gallery`, `#amen-progress`)
  7. Unlabeled gallery section
  8. Interiors gallery — `#interiors.gallery-section` (`#int-counter`, `#int-gallery`, `#int-progress`)
  9. Payment plan — `#payment`
  10. Location — `#location` (animated SVG commute-time map)
  11. Completion — `section.completion` ("Estimated Completion Date")
  12. FAQ — `#faq` ("Questions, answered.")
  13. Contact — `#contact.contact` (enquiry form)
- Media: No `<video>`/`<canvas>`; rich inline SVG icon sprite (`<symbol>` defs for every amenity icon) and an animated SVG map.
- Forms: 1 form (`#enquiry-form.enq-form.reveal`) — name (text), email, phone (tel), interest (select), message (textarea).
- Notes: An off-plan real-estate "coming soon" landing page pattern (downloads/brochure band, payment plan, completion date, commute map) distinct from the interior/architecture studios in this set. (The "three" library flag here is also a false positive — matched substrings "three-quarter" and "one- to three-bedroom" in copy, not three.js.)

---

## trio — Trio

- Source: https://seagreen-falcon-336136.hostingersite.com/
- Stack: Static HTML/CSS/JS (`js/main.js`)
- Headings:
  - H1: "Landscapes, engineered."
  - H2: One studio to design, build and sustain Dubai's finest gardens. (marquee/repeated text) · Crafting tailored spaces · The Bonsai Court · Our featured projects · In their words · Recognition · Design it your way · Green with us
  - H3: 9 project names (Emirates Hills · Sunset Court, Al Barari · Sunken Lounge, District One · Plunge Courtyard, Jumeirah Estates · Formal Rill, Dubai Hills · Terrace Kitchen, Palm Jumeirah · Reflecting Court, Bluewaters · Floating Path, Tilal Al Ghaf · Water Pavilion, Meydan · Lawn Pavilion) + 4 awards (Best Residential Landscape, Excellence in Design, Sustainable Merit, Outstanding Grounds)
- Nav: About `#about`, Services `#customise`, Projects `#projects`, Team `#about`, Blog `#top`, Green with Us `#contact`; a services sub-list (Landscape design, Build & execution, Softworks & planting, Maintenance & care) all pointing to `#customise`.
- Motion: True looping/muted hero background video (`assets/hero/hero.mp4`); marquee/ticker text bands; filterable project grid (`filter-item` class suggests category filtering UI); glassmorphism card styling (`glass`, `glass-dark`).
- Sections (ordered, under `<main id="main">`):
  1. Hero — `section.hero` (video background)
  2. Statement/marquee — `section.section.statement`
  3. About — `#about` (`section.section.about`)
  4. Marquee band — `section.marquee-band`
  5. Cover image — `section.cover` ("The Bonsai Court")
  6. Projects — `#projects` (`section.section.projects`) → 9 `article.card.project.filter-item` blocks
  7. Testimonials — `section.section.testimonials` ("In their words")
  8. Awards — `section.section.awards` → 4 `article.card.glass.award` blocks
  9. Customiser — `#customise` (`section.section.customiser`) — "Design it your way"
  10. Contact — `#contact.contact` — "Green with us" enquiry form
- Media: 1 `<video>` (`assets/hero/hero.mp4`, muted); no `<canvas>`.
- Forms: 1 form (`.card.glass-dark.contact__form`) — name, email, phone, location (select), message (textarea).
- Notes: Same Dubai-landscaping vertical as **leaft** and **greenit**, sharing a similar rhythm (hero → about → projects → awards → configurator → contact), but the only one of the three with a looping hero video and filterable project grid.

---

## blok — Black Block

- Source: https://lavender-sparrow-126883.hostingersite.com/
- Stack: Next.js (hashed `_next/static/chunks`)
- Headings:
  - H1: "Built to be understood." (also repeated as an H2)
  - H2: Built to be understood. · See the whole place at once. · Make the concept tangible. · Detail that earns attention. · Digital precision. Human finish. · Physical models for projects that need to be seen clearly. · Selected work · Models shaped around the purpose. · From file to finished model. · Precision with a clear purpose. · Machines give repeatability. Hands give the model its character. · Eight concept models. One consistent method. · Have drawings? We can scope the model. · Studio · Resources · Legal
  - H3: 8 project names (Downtown Vertical District, Creek Edge Masterplan, Desert Arts Centre, Coastal Residences, Dubai Mobility Hub, Desert Retreat, Dubai South Campus, Al Shindagha Museum Extension) · 5-step process (Step 1 of 5: Brief and quotation · Step 2: Model strategy · Step 3: Prototype and approval · Step 4: Fabrication · Step 5: Review and installation) · 5 differentiators (One accountable team, Built for Dubai conditions, Progress you can see, Confidential by default, Serviceable systems) · "Start with a conversation"
- Nav: Projects `/projects/`, Services `/services/`, About `/about/`, Insights `/insights/`, Contact `/contact/` — duplicated again as a numbered variant (01 Projects … 05 Contact), matching the **retro**/**peak** dual-nav pattern.
- Motion: A scroll-pinned 5-step "stack panel" process sequence (`#home-step-1` … `#home-step-5`, class `stack__panel`), consistent with a scrollytelling/pinned-step implementation.
- Sections (ordered, under `<main id="main">`):
  1. Video hero — `section.vhero` (H1 `#vhero-title`)
  2. Secondary hero/intro grid — `section.hero.bleedgrid`
  3. Intro — `section.section` (`#intro-heading`)
  4. Selected work — `section.section.section--flush-top` (`#selected-work-heading`) → 8 `article.pcard` blocks
  5. What we make — `section.section.section--tight` (`#what-we-make-heading`)
  6. Materials/finish copy — `section.section`
  7. Process (pinned steps) — `section.section.ink` (`#process-heading`) → `#home-step-1..5`
  8. Why us — `section.section` (`#why-heading`) — 5 differentiator points
  9. Studio strip — `section.section.section--tight` (`#studio-strip-heading`)
  10. Ink CTA — `section.cta-ink.ink` (`#home-ink-cta`)
  11. Orange CTA/footer nav — `section.cta-orange` (`#cta-orange-heading`) — Studio / Resources / Legal links
- Media: 1 `<video>` (poster `/video/hero-poster.jpg`, muted, no inline `src`); no `<canvas>`.
- Forms: None on the homepage (contact is a separate `/contact/` route).
- Notes: Same Next.js template family as **retro** and **peak** (identical chunk-hash build system, duplicated numbered nav, hero/project-card/CTA-band conventions), applied here to an architectural-model-making business instead of interiors.

---

## kstudio — K Studio

- Source: https://floralwhite-crab-212172.hostingersite.com/
- Stack: Static HTML/CSS/JS (`js/main.js`)
- Headings:
  - H1: "K" (minimal wordmark-style headline)
  - H2: A belief before a building. · A language built on restraint. · Architecture shaped around living. · Progress measured in discipline. · Four movements, one intention. · A selection defined by scale, discipline, and identity. · Designed with precision. Experienced through space. · Strong design begins with strong direction. · A studio is only as strong as the people behind its work. · A future defined by depth, not volume. · Let's begin something exceptional.
  - H3: Listen · Define · Design · Refine (4-step process) · Grand Arrival · Spatial Continuity · Framed Light · Indoor–Outdoor Harmony · Material Discipline (5 design principles)
- Nav: Full-screen overlay nav (`#menuOverlay`) with roman-numeral links — I Home `#home`, II Story `#started`, III Process `#process`, IV Work `#work`, V People `#people`, VI Contact `#contact` — duplicated as plain-text equivalents in the same menu.
- Motion: Sticky `#runningHead` ticker text in the header; `reveal`/`reveal-group` and `k-reveal`/`interlude` utility classes indicate heavy scroll-reveal choreography across alternating light/dark "chapter" sections.
- Sections (ordered):
  1. Hero — `#home.hero` (`#heroBuilding` image, `#runningHead` ticker)
  2. Story — `#started.chapter.chapter--light.editorial` ("It began with a belief")
  3. Chapter (reversed editorial) — `.chapter.chapter--light.editorial.editorial--reverse`
  4. Chapter (editorial) — `.chapter.chapter--light.editorial`
  5. Reveal interstitial — `section.k-reveal`
  6. Achievements — `.chapter.chapter--dark.achievements` ("Progress measured in discipline")
  7. Process — `#process.process` → 4 `article.step` blocks (Listen/Define/Design/Refine)
  8. Work — `#work.work-hero` ("Four movements, one intention")
  9. Principles — `.chapter.chapter--light.principles` (5 principle details)
  10. People/leadership — `#people.chapter.chapter--dark.leadership`
  11. Team — `.chapter.chapter--light.team`
  12. Interlude — `section.interlude.interlude--dark`
  13. Future — `.chapter.chapter--dark.future`
  14. Contact — `#contact.chapter.contact` ("Let's begin something exceptional" + form)
- Media: No `<video>`/`<canvas>`.
- Forms: 1 form (`#contactForm.contact-form.reveal-group`) — fullName, email, phone, location (text), projectType (select), message (textarea), plus `#formStatus` feedback area.
- Notes: The most editorial/long-form page in the set — 12+ alternating light/dark "chapter" sections for a single-letter-branded ("K") villa architecture studio.

---

## leaft — Leaft

- Source: https://royalblue-elk-545181.hostingersite.com/
- Stack: Static HTML/CSS/JS (`main.js`)
- Headings:
  - H1: "Landscapes made for life in Dubai."
  - H2: We compose shade, stone, water and planting as one living system. · Nine garden directions · From first line to living landscape · Designed with Dubai, not against it. · A clear path from idea to garden · Let's shape your outside.
  - H3: 01–09 project names (Wadi House, Ember Court, Sienna Dunes, Palm Veil, Kanso Court, Cypress Line, Sky Grove, Azure Edge, Birch House) · Landscape design · Pools and water · Outdoor living · Planting and aftercare (4 services) · Shade first · Water with purpose · Materials that settle in · Listen and map (approach points)
- Nav: Home `#top`, Projects `#projects`, Services `#services`, Approach `#approach`, Studio `#studio`, Contact `#contact`, plus a mobile variant (`#mobileNav`, `#burger` toggle).
- Motion: An interactive day/night "dusk" image toggle (`#duskSwitch`/`#duskHint`) over the hero/projects imagery; a clickable step-chip process explainer that swaps a content panel (`#step-1..4` chips driving `#stepPanel`/`#stepImg`/`#stepTitle`/`#stepText`); a carousel-style project rail with prev/next controls and counter (`#rail`, `#railPrev`, `#railNext`, `#railNow`).
- Sections (ordered):
  1. Hero — `#top.hero`
  2. Studio intro — `#studio.band.studio`
  3. Projects — `#projects.band.projects` — 9-item rail with day/night toggle
  4. Services — `#services.band.services` — 4 service cards
  5. Climate — `#climate.band.climate-band` ("Designed with Dubai, not against it.")
  6. Approach — `#approach.band.approach` — 4-step chip selector with swapping panel
  7. Contact — `#contact.band.inquiry` ("Let's shape your outside.")
- Media: No `<video>`/`<canvas>`.
- Forms: None detected in the homepage markup (contact is a CTA band, not a `<form>`).
- Notes: Same Dubai-landscaping vertical as **trio**/**greenit**, but the most "classic scroll page" of the three — no video, no quiz, no form — relying instead on an interactive day/night hero toggle and a clickable process explainer.

---

## niche — Niche

- Source: https://lightblue-wildcat-286987.hostingersite.com/#opening
- Stack: Next.js (Turbopack build chunk ids)
- Headings:
  - H1: "How should home feel" (`#opening-title`)
  - H2: Start a conversation · You bring the life We shape the room · It starts with listening · First we listen · The work happens here · Some thoughts begin by hand · See the room before it exists · A room is felt before it is understood · Material studies · Details pass through real hands · Palm Courtyard · A home is never a showroom · Jumeirah Table House · The Evening Residence · The Listening Room · Quiet is part of the brief · The Garden Bath · The Marina Kitchen · One idea carried all the way through · Tell us how you want home to feel
  - H3: Lucent Salon · Mineral House · Atelier Noir · Verdant Retreat · Tidal Suite (5 material-study slide captions)
- Nav: Slide-out `#side-menu` with: Beginning `#opening`, How we think `#point-of-view`, Listening `#listening`, How we work `#approach`, Inside the studio `#studio`, Sketching `#sketching`, Visualising `#visualise`, Materials `#materials`, Making `#making`, plus 6 project anchor links (Palm Courtyard, Jumeirah Table House, The Evening Residence, The Listening Room, The Garden Bath, The Marina Kitchen), and "Start a conversation" `#conversation`.
- Motion: Each project "panel" uses a distinctly named visual-variant class (`v-splitTextFirst`, `v-splitImageFirst`, `v-overlapCharcoal`, `v-splitMerge`, `v-insetBright`, `v-bleedVeil`), implying custom per-project scroll-reveal/image-text compositions; a horizontal slider (`i-slider`/`i-slide`) for the 5 material studies.
- Sections (ordered — 20 `panel`-class sections, the most of any site audited):
  1. Opening — `#opening.panel.openingPanel` (H1 hero)
  2. Point of view — `#point-of-view.panel.povPanel`
  3. Listening — `#listening.panel.listeningPanel`
  4. Approach — `#approach.panel.approachPanel`
  5. Studio — `#studio.panel.studioPanel`
  6. Sketching — `#sketching.panel.sketchPanel`
  7. Visualise — `#visualise.panel.visualPanel`
  8. Materials intro — `#materials.panel.materialsPanel`
  9. Material studies slider — `#material-studies.panel.sliderPanel` (5 slides)
  10. Making — `#making.panel.makingPanel`
  11. Project: Palm Courtyard — `#palm-courtyard.panel.projectPanel.v-splitTextFirst`
  12. Lived-in — `#lived-in.panel.livedPanel`
  13. Project: Jumeirah Table House — `#jumeirah-table-house.panel.projectPanel.v-splitImageFirst`
  14. Project: The Evening Residence — `#evening-residence.panel.projectPanel.v-overlapCharcoal`
  15. Project: The Listening Room — `#listening-room.panel.projectPanel.v-splitMerge`
  16. Quiet — `#quiet.panel.quietPanel`
  17. Project: The Garden Bath — `#garden-bath.panel.projectPanel.v-insetBright`
  18. Project: The Marina Kitchen — `#marina-kitchen.panel.projectPanel.v-bleedVeil`
  19. Continuity — `#continuity.panel.continuityPanel`
  20. Conversation/CTA — `#conversation.panel.conversationPanel`
- Media: No `<video>`/`<canvas>` tags detected.
- Forms: None detected (contact appears to use a drawer, `#contact-drawer-title`, rather than an inline `<form>`).
- Notes: No `<footer>` element present — the page ends in a persistent CTA/drawer instead. The deepest/most section-rich page of the audit, matching the `#opening` anchor given in the URL.

---

## qad — QAD

- Source: https://silver-sandpiper-768901.hostingersite.com/#/v2
- Stack: React/Vite SPA with client-side hash routing (`#/v2`, `#/v2/about`, `#/v2/contact`, …). The raw HTML response is a near-empty shell (`<div id="root"></div>` + a single JS/CSS bundle), so this entry was captured by rendering the page in a headless browser and reading the live DOM.
- Headings (observed across routes reached from the given URL):
  - Home (`/v2`) — H2: Architecture for the desert century. · From first line to final form. · Selected work. · Six people. One line of thought.
  - About (`/v2/about`) — H1: "A studio shaped by desert light." · H2: It began with a sketchbook. · Everything starts by hand. · We build before we build. · Computation in service of climate.
  - Contact (`/v2/contact`) — H1: "Let's build together." · H3: "Start a project."
- Nav: A persistent bottom icon-bar ("Pages" navigation) with brand button "QAD — home" plus Home / About / What we do / Projects / Team / Contact buttons that swap the visible "slide" via hash route, and a V1/V2 toggle switching between two alternate hero tower renders for the same content.
- Motion: The DOM shows `<section class="slide active">` / `<section class="slide">` — a 5-slide deck where JS swaps the active full-screen slide per route rather than a scrolling long page.
- Sections (ordered, one per route/slide):
  1. Home — hero statement + intro paragraph ("Architecture for the desert century.")
  2. Home — process band ("From first line to final form." — six-stage design process copy)
  3. Home — "Selected work." → 5 project buttons: Sahra Veil, Dune Spine, Crescent Court, Oasis Lantern, Sirocco Gate
  4. Home — "Six people. One line of thought." (team teaser)
  5. About — "A studio shaped by desert light." + founder story, with 4 supporting blocks (sketchbook origin, hand-drawing philosophy, physical models, computation/climate)
  6. Contact — "Let's build together." + "Start a project." form
- Media: No `<video>`/`<canvas>` elements in the rendered DOM; visuals are static full-bleed tower-render photography with JS-driven slide transitions.
- Forms: 1 contact form (name, email, message — all required) plus "Write to us" (`mailto:studio@qad.ae`) and "Call the studio" (`tel:+971 4 358 0090`) links and a "SEND MESSAGE" submit button.
- Notes: Only SPA in the set — navigation changes full-screen "slides"/routes instead of scrolling one long page. The V1/V2 toggle offers two alternative hero-visual concepts for identical studio content; the given URL's `#/v2` anchor lands directly on the V2 hero variant of the Home slide.

