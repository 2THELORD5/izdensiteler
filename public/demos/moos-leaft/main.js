/* Leaft — homepage interactions */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── sticky header ─────────────────────────────────────── */
  var head = document.getElementById('siteHead');
  var onScroll = function () {
    head.classList.toggle('is-stuck', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── mobile menu ───────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');

  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    mobileNav.hidden = open;
  });

  mobileNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      mobileNav.hidden = true;
    }
  });

  /* ── scroll reveal ─────────────────────────────────────── */
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ── dusk sweep: day → night across the whole portfolio ── */
  var projects = document.getElementById('projects');
  var duskSwitch = document.getElementById('duskSwitch');
  var duskHint = document.getElementById('duskHint');

  duskSwitch.addEventListener('click', function () {
    var night = duskSwitch.getAttribute('aria-checked') === 'true';
    duskSwitch.setAttribute('aria-checked', String(!night));
    projects.classList.toggle('is-night', !night);
    duskHint.textContent = night
      ? 'Move the whole portfolio into evening light'
      : 'Bring the whole portfolio back to daylight';
  });

  /* ── project rail ──────────────────────────────────────── */
  var rail = document.getElementById('rail');
  var prev = document.getElementById('railPrev');
  var next = document.getElementById('railNext');
  var now = document.getElementById('railNow');
  var cards = rail.querySelectorAll('.proj');

  var step = function () {
    if (cards.length < 2) return rail.clientWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  };

  var scrollByCard = function (dir) {
    rail.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
  };

  prev.addEventListener('click', function () { scrollByCard(-1); });
  next.addEventListener('click', function () { scrollByCard(1); });

  var syncRail = function () {
    var i = Math.round(rail.scrollLeft / step());
    i = Math.max(0, Math.min(cards.length - 1, i));
    now.textContent = String(i + 1).padStart(2, '0');

    var atStart = rail.scrollLeft <= 2;
    var atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = atStart;
    next.disabled = atEnd;
  };

  syncRail();
  rail.addEventListener('scroll', function () {
    window.requestAnimationFrame(syncRail);
  }, { passive: true });
  window.addEventListener('resize', syncRail);

  rail.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCard(-1); }
  });

  /* ── approach steps ────────────────────────────────────── */
  var STEPS = {
    1: {
      title: 'Listen and map',
      text: 'We learn the site, architecture and the way you want to live outdoors.',
      img: 'assets/img/step-1.jpg',
      alt: 'An overhead plan view of a courtyard garden with stone terraces and a square water basin.'
    },
    2: {
      title: 'Compose',
      text: 'Space, shade, water, material and planting become one coherent concept.',
      img: 'assets/img/step-2.jpg',
      alt: 'An overhead view of a linear garden with a long pool, gravel beds and clipped planting.'
    },
    3: {
      title: 'Detail',
      text: 'Every edge, level, light and species is resolved for confident delivery.',
      img: 'assets/img/step-3.jpg',
      alt: 'A close view of a hardscape junction where stone paving meets a planted gravel edge.'
    },
    4: {
      title: 'Grow in',
      text: 'We help the finished landscape establish, mature and become truly yours.',
      img: 'assets/img/step-4.jpg',
      alt: 'A close view of an olive tree in a stone planter with underplanted grasses.'
    }
  };

  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var panel = document.getElementById('stepPanel');
  var stepImg = document.getElementById('stepImg');
  var stepNum = document.getElementById('stepNum');
  var stepTitle = document.getElementById('stepTitle');
  var stepText = document.getElementById('stepText');

  // preload step imagery so swaps stay instant
  Object.keys(STEPS).forEach(function (k) {
    var pre = new Image();
    pre.src = STEPS[k].img;
  });

  var selectStep = function (chip, focus) {
    var n = chip.dataset.step;
    var data = STEPS[n];
    if (!data) return;

    chips.forEach(function (c) {
      var on = c === chip;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-selected', String(on));
      c.tabIndex = on ? 0 : -1;
    });
    if (focus) chip.focus();

    panel.setAttribute('aria-labelledby', chip.id);

    var apply = function () {
      stepImg.src = data.img;
      stepImg.alt = data.alt;
      stepNum.textContent = '0' + n;
      stepTitle.textContent = data.title;
      stepText.textContent = data.text;
      panel.classList.remove('is-swapping');
    };

    if (reduced) { apply(); return; }
    panel.classList.add('is-swapping');
    window.setTimeout(apply, 320);
  };

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { selectStep(chip, false); });

    chip.addEventListener('keydown', function (e) {
      var i = chips.indexOf(chip);
      var target = null;
      if (e.key === 'ArrowRight') target = chips[(i + 1) % chips.length];
      if (e.key === 'ArrowLeft') target = chips[(i - 1 + chips.length) % chips.length];
      if (e.key === 'Home') target = chips[0];
      if (e.key === 'End') target = chips[chips.length - 1];
      if (!target) return;
      e.preventDefault();
      selectStep(target, true);
    });
  });

  /* ── nav: mark the section in view ─────────────────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ── footer year ───────────────────────────────────────── */
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
