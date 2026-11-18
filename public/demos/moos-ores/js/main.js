/* =====================================================================
   ORES INTERIORS — interaction & motion
   ===================================================================== */
(function () {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ------------------------------------------------------------------ *
   * Fallback path — no GSAP or reduced motion: show everything, skip FX *
   * ------------------------------------------------------------------ */
  function revealEverything() {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    doc.classList.remove('is-locked');
    // fill stat counts with their final values
    document.querySelectorAll('.count').forEach((el) => {
      el.textContent = el.getAttribute('data-count');
    });
  }

  if (!hasGSAP) {
    window.addEventListener('DOMContentLoaded', function () {
      revealEverything();
      // still give the hero its footage as an ambient loop
      const v = document.querySelector('.hero__video');
      if (v && v.dataset.src) {
        v.src = v.dataset.src;
        v.loop = true;
        v.muted = true;
        v.setAttribute('autoplay', '');
        const p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
    initNav(); // nav still works without GSAP
    return;
  }

  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);
  const ScrollTrigger = window.ScrollTrigger;

  // Lock scroll during the intro
  doc.classList.add('is-locked');
  window.scrollTo(0, 0);

  /* ------------------------------------------------------------------ *
   * Reduced motion — show content, no orchestration                    *
   * ------------------------------------------------------------------ */
  if (prefersReduced) {
    revealEverything();
    initNav();
    initActiveLinks();
    initCounts(true);
    return;
  }

  const EASE = 'power3.out';
  const heroVideo = document.querySelector('.hero__video');
  const loader = document.getElementById('loader');
  const loaderNum = document.getElementById('loaderNum');
  const loaderBar = document.getElementById('loaderBar');

  // Hero content revealed by the intro (kept out of the scroll batch)
  const heroReveals = gsap.utils.toArray('.hero [data-reveal]');

  /* ------------------------------------------------------------------ *
   * INTRO — counter → circular iris reveal → hero content              *
   * ------------------------------------------------------------------ */
  function playIntro() {
    const counter = { v: 0 };
    const tl = gsap.timeline();

    // 1 · count 0 → 100 with the progress rule filling in step
    tl.to(counter, {
      v: 100,
      duration: 1.9,
      ease: 'power2.inOut',
      onUpdate() {
        const val = Math.round(counter.v);
        if (loaderNum) loaderNum.textContent = val;
        if (loaderBar) loaderBar.style.transform = 'scaleX(' + counter.v / 100 + ')';
      },
    });

    // 2 · settle, then lift the loader veil
    tl.to('.loader__inner', { autoAlpha: 0, y: -14, duration: 0.5, ease: EASE }, '+=0.15');
    tl.to(loader, { autoAlpha: 0, duration: 0.6, ease: EASE, onComplete: () => loader && loader.remove() }, '-=0.15');

    // 3 · iris: the hero footage opens outward from the centre
    tl.fromTo(
      heroVideo,
      { clipPath: 'circle(0% at 50% 50%)', scale: 1.16 },
      { clipPath: 'circle(75% at 50% 50%)', scale: 1, duration: 1.5, ease: 'power2.inOut' },
      '-=0.5'
    );

    // 4 · hero content rises in, staggered
    tl.to(
      heroReveals,
      { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.13 },
      '-=0.85'
    );

    // 5 · release scroll
    tl.add(() => {
      doc.classList.remove('is-locked');
      ScrollTrigger.refresh();
    }, '-=0.7');

    return tl;
  }

  // Prime hero reveal start-state
  gsap.set(heroReveals, { opacity: 0, y: 30 });

  /* ------------------------------------------------------------------ *
   * SCROLL REVEALS — entrances SCRUBBED to scroll progress, so they     *
   * play in as you scroll down and reverse as you scroll up. Elements    *
   * stagger naturally by their position in the flow.                     *
   * ------------------------------------------------------------------ */
  function initReveals() {
    const items = gsap.utils.toArray('[data-reveal]').filter((el) => !el.closest('.hero'));
    items.forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 44 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: 'top 64%',
            scrub: true,
          },
        }
      );
    });
  }

  /* ------------------------------------------------------------------ *
   * CLIP REVEALS — imagery wipes up from behind a mask as it enters,    *
   * scrubbed to scroll (reverses on the way back up).                   *
   * ------------------------------------------------------------------ */
  function clipReveal(el, stOverrides) {
    return gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0% round 4px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 4px)',
        ease: 'none',
        scrollTrigger: Object.assign(
          { trigger: el, start: 'top 90%', end: 'top 58%', scrub: true },
          stOverrides || {}
        ),
      }
    );
  }

  function initClipReveals() {
    gsap.utils
      .toArray('[data-clip]')
      .filter((el) => !el.closest('[data-portfolio]'))
      .forEach((el) => clipReveal(el));
  }

  /* ------------------------------------------------------------------ *
   * PORTFOLIO — a pinned HORIZONTAL scroll gallery on wide, fine-pointer *
   * screens (the section slides sideways as you scroll); a plain        *
   * vertical stack everywhere else. gsap.matchMedia swaps + reverts     *
   * cleanly on resize.                                                  *
   * ------------------------------------------------------------------ */
  function initPortfolio() {
    const section = document.querySelector('[data-portfolio]');
    if (!section) return;
    const track = section.querySelector('[data-portfolio-track]');
    const meter = section.querySelector('[data-portfolio-meter]');
    const panelImgs = gsap.utils.toArray('.panel__img');
    if (!track) return;

    const mm = gsap.matchMedia();

    // Wide + mouse/trackpad + motion allowed → pinned horizontal gallery
    mm.add(
      '(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        section.classList.add('is-horizontal');
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

        const horizontal = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: '.portfolio__inner',
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // lower than the hero pin so it refreshes AFTER (see note there)
            refreshPriority: 5,
            onUpdate: (self) => {
              if (meter) meter.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
            },
          },
        });

        // each picture wipes up as its panel slides into view (horizontal container)
        panelImgs.forEach((fig) => {
          gsap.fromTo(
            fig,
            { clipPath: 'inset(100% 0% 0% 0% round 4px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 4px)',
              ease: 'none',
              scrollTrigger: {
                trigger: fig,
                containerAnimation: horizontal,
                start: 'left 92%',
                end: 'left 55%',
                scrub: true,
              },
            }
          );
        });

        return () => {
          section.classList.remove('is-horizontal');
          if (meter) meter.style.transform = 'scaleX(0)';
        };
      }
    );

    // Narrow / touch → vertical stack, images wipe up on vertical scroll
    mm.add('(max-width: 900px), (pointer: coarse)', () => {
      panelImgs.forEach((fig) => clipReveal(fig));
    });
  }

  /* ------------------------------------------------------------------ *
   * PARALLAX — outlined numerals / vertical wordmark drift             *
   * ------------------------------------------------------------------ */
  function initParallax() {
    // outlined numerals drift behind the content
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const depth = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      gsap.fromTo(
        el,
        { yPercent: -depth * 100 },
        {
          yPercent: depth * 100,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });

    // gentle drift on the vertical ORES rail
    const rail = document.querySelector('.about__rail');
    if (rail) {
      gsap.fromTo(
        rail,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }

    // EDITORIAL: large imagery drifts inside its frame at a slower rate than
    // the page — the scale keeps the frame covered as the picture moves.
    gsap.utils
      .toArray('.service__media img, .about__img img')
      .forEach((img) => {
        gsap.set(img, { scale: 1.22, willChange: 'transform' });
        gsap.fromTo(
          img,
          { yPercent: -9 },
          {
            yPercent: 9,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('figure') || img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

    // slow push on the full-bleed contact backdrop
    const contactImg = document.querySelector('.contact__media img');
    if (contactImg) {
      gsap.set(contactImg, { scale: 1.16 });
      gsap.fromTo(
        contactImg,
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }
  }

  /* ------------------------------------------------------------------ *
   * HERO VIDEO — full-screen, scrubbed frame-by-frame while pinned      *
   * (falls back to an ambient loop on touch, and a static poster        *
   *  under reduced-motion, where currentTime scrubbing is unreliable)   *
   * ------------------------------------------------------------------ */
  function initHeroVideo(mode) {
    const v = heroVideo;
    if (!v) return;
    const src = v.dataset.src;

    if (mode === 'reduced') return; // poster only — never downloads the video

    if (src && !v.src) { v.src = src; v.load(); }

    if (mode === 'ambient') {
      v.loop = true;
      v.muted = true;
      v.setAttribute('autoplay', '');
      const p = v.play();
      if (p && p.catch) p.catch(function () {});
      return;
    }

    // mode === 'scrub'
    function setup() {
      // warm the decoder so the very first seeks actually paint a frame
      try {
        const pp = v.play();
        if (pp && pp.then) pp.then(function () { v.pause(); v.currentTime = 0; }).catch(function () {});
        else { v.pause(); v.currentTime = 0; }
      } catch (e) {}

      const dur = v.duration || 10;

      // ONE pinned, scrubbed timeline drives everything that happens during the
      // hero pin — the frame-by-frame video scrub AND the copy fade. Keeping the
      // pin ON the scrubbed timeline (not a separate trigger) is what keeps the
      // video locked to the pinned range; a separate pin trigger offsets every
      // other hero animation by the pin's spacer height and desyncs the scrub.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '+=280%',
          pin: true,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // topmost pin — must refresh before the portfolio pin (see note in
          // initPortfolio) so the portfolio doesn't pin a screen early.
          refreshPriority: 10,
        },
      });
      tl.to(v, { currentTime: dur - 0.05, ease: 'none', duration: 1 }, 0);
      tl.to('.hero__inner', { autoAlpha: 0, y: -40, ease: 'none', duration: 0.5 }, 0);
      tl.to('.hero__scroll', { autoAlpha: 0, ease: 'none', duration: 0.14 }, 0);

      ScrollTrigger.refresh();
    }

    if (v.readyState >= 1) setup();
    else v.addEventListener('loadedmetadata', setup, { once: true });
  }

  /* ------------------------------------------------------------------ *
   * STAT COUNTERS                                                      *
   * ------------------------------------------------------------------ */
  function initCounts(immediate) {
    gsap.utils.toArray('.count').forEach((el) => {
      const end = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (immediate) { el.textContent = end; return; }
      const o = { v: 0 };
      gsap.to(o, {
        v: end,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.stat') || el,
          start: 'top 86%',
          end: 'top 52%',
          scrub: true,
        },
        onUpdate: () => { el.textContent = Math.round(o.v); },
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * NAV — solid on scroll, hide-on-down/show-on-up, mobile drawer      *
   * ------------------------------------------------------------------ */
  function initNav() {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    const toggle = nav.querySelector('[data-toggle]');
    const drawer = nav.querySelector('[data-drawer]');
    let last = window.scrollY;
    let open = false;

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('is-solid', y > 40);
      if (!open) {
        if (y > 640 && y > last + 6) nav.classList.add('is-hidden');
        else if (y < last - 6) nav.classList.remove('is-hidden');
      }
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        open = !open;
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        nav.classList.remove('is-hidden');
      });
      drawer.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => {
          open = false;
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        })
      );
    }
  }

  /* ------------------------------------------------------------------ *
   * ACTIVE NAV LINK via section position                               *
   * ------------------------------------------------------------------ */
  function initActiveLinks() {
    const links = gsap.utils.toArray('.nav__links a');
    const map = {};
    links.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      if (id) map[id] = a;
    });
    ['home', 'services', 'about', 'portfolio', 'contact'].forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec || !map[id]) return;
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) {
            links.forEach((l) => l.classList.remove('is-active'));
            map[id].classList.add('is-active');
          }
        },
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Smooth anchor scrolling (respects fixed nav offset)                *
   * ------------------------------------------------------------------ */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * BOOT                                                               *
   * ------------------------------------------------------------------ */
  function boot() {
    initReveals();
    initClipReveals();
    initParallax();
    initPortfolio();
    initCounts(false);
    initNav();
    initActiveLinks();
    initAnchors();

    // Always scrub (PC + mobile). Reduced-motion keeps the poster only.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    initHeroVideo(reduced ? 'reduced' : 'scrub');

    const introTL = playIntro();
    // Safety net: if the clock stalls (e.g. the tab loads in the background),
    // never leave content trapped under the loader — jump the intro to its end.
    setTimeout(() => {
      if (introTL && introTL.progress() < 1) introTL.progress(1);
      doc.classList.remove('is-locked');
    }, 6000);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
