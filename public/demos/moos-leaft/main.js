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

  /* ── projects + approach are scroll-driven ─────────────────
     izden-scroll-gallery.js owns them: pinned stage, rail glide, dusk sweep
     (--iz-sg-p) and the step chips. No buttons, no click state here. */

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
