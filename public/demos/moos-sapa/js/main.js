/* ============================================================
   SAPA RESIDENCES — interactions
   reveal · focus-peek sliders · faq · interactive landmark map
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll (parent-based stagger ≤6 × 150ms) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(
          el.parentElement.children,
          function (c) { return c.classList.contains('reveal'); }
        );
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = (Math.min(Math.max(idx, 0), 5) * 150) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- focus-peek sliders (auto-init every .gallery-track) ---------- */
  function initGallery(track) {
    var stub = track.getAttribute('data-stub');
    var items = Array.prototype.slice.call(track.children);
    var counter = document.getElementById(stub + '-counter');
    var progress = document.getElementById(stub + '-progress');
    var arrows = Array.prototype.slice.call(
      document.querySelectorAll('.g-arrow[data-target="' + stub + '"]')
    );
    var index = 0;

    function pad(n) { return String(n).padStart(2, '0'); }

    function renderGallery() {
      var shell = track.parentElement;
      var item = items[index];
      var gap = parseFloat(getComputedStyle(track).gap) || 26;
      var x = shell.clientWidth / 2 - item.offsetWidth / 2 - index * (item.offsetWidth + gap);
      track.style.transform = 'translateX(' + x + 'px)';
      items.forEach(function (el, i) {
        el.classList.toggle('active', i === index);
        el.classList.toggle('peek', Math.abs(i - index) === 1);
      });
      if (counter) counter.innerHTML = '<b>' + pad(index + 1) + '</b> / ' + pad(items.length);
      if (progress) progress.style.width = ((index + 1) / items.length * 100) + '%';
      arrows.forEach(function (btn) {
        var d = parseInt(btn.getAttribute('data-dir'), 10);
        btn.disabled = index + d < 0 || index + d > items.length - 1;
      });
    }

    function scrollGallery(dir) {
      index = Math.max(0, Math.min(items.length - 1, index + dir));
      renderGallery();
    }

    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        scrollGallery(parseInt(btn.getAttribute('data-dir'), 10));
      });
    });
    items.forEach(function (el, i) {
      el.addEventListener('click', function () { if (i !== index) { index = i; renderGallery(); } });
    });
    window.addEventListener('resize', renderGallery);
    renderGallery();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.gallery-track'), initGallery);

  /* ---------- FAQ accordion ---------- */
  window.toggleFaq = function (btn) {
    var item = btn.closest('.faq-item');
    var answer = item.querySelector('.faq-a');
    var isOpen = item.classList.contains('open');
    // close others
    Array.prototype.forEach.call(document.querySelectorAll('.faq-item.open'), function (other) {
      if (other !== item) {
        other.classList.remove('open');
        var otherA = other.querySelector('.faq-a');
        otherA.style.maxHeight = '0px';
        otherA.setAttribute('aria-hidden', 'true');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', !isOpen);
    answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
    answer.setAttribute('aria-hidden', String(isOpen));
    btn.setAttribute('aria-expanded', String(!isOpen));
  };

  /* ---------- interactive landmark map ---------- */
  var LANDMARKS = {
    rak:  { mins: 5,  short: 'Ras Al Khor Sanctuary' },
    bk:   { mins: 15, short: 'Burj Khalifa' },
    dm:   { mins: 15, short: 'Dubai Mall' },
    difc: { mins: 20, short: 'DIFC' },
    dxb:  { mins: 10, short: 'DXB Airport' },
    baa:  { mins: 30, short: 'Burj Al Arab' }
  };

  var mapEta = document.querySelector('.map-eta');

  function selectLandmark(id, animate) {
    var lm = LANDMARKS[id];
    if (!lm) return;

    Array.prototype.forEach.call(document.querySelectorAll('.lm-pin'), function (pin) {
      pin.classList.toggle('active', pin.getAttribute('data-lm') === id);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.loc-item'), function (item) {
      item.classList.toggle('active', item.getAttribute('data-lm') === id);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.eta-chip'), function (chip) {
      chip.classList.toggle('on', chip.id === 'chip-' + id);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.route'), function (route) {
      var on = route.id === 'route-' + id;
      route.classList.toggle('on', on);
      if (on && animate && !reduceMotion && route.getTotalLength) {
        var len = route.getTotalLength();
        route.style.transition = 'none';
        route.style.strokeDasharray = len;
        route.style.strokeDashoffset = len;
        route.getBoundingClientRect(); // reflow
        route.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)';
        route.style.strokeDashoffset = '0';
      } else if (on) {
        route.style.strokeDasharray = 'none';
        route.style.strokeDashoffset = '0';
      }
    });

    if (mapEta) {
      mapEta.innerHTML = '<b>' + lm.mins + ' min</b> · ' + lm.short;
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.loc-item'), function (item) {
    item.addEventListener('click', function () {
      selectLandmark(item.getAttribute('data-lm'), true);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.lm-pin'), function (pin) {
    pin.addEventListener('click', function () {
      selectLandmark(pin.getAttribute('data-lm'), true);
    });
    pin.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectLandmark(pin.getAttribute('data-lm'), true);
      }
    });
  });

  // default selection — animate the route once the section scrolls into view
  var locSection = document.getElementById('location');
  selectLandmark('bk', false);
  if (locSection && 'IntersectionObserver' in window && !reduceMotion) {
    var mapIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          selectLandmark('bk', true);
          mapIo.disconnect();
        }
      });
    }, { threshold: 0.35 });
    mapIo.observe(locSection);
  }

  /* ---------- enquiry form ---------- */
  var form = document.getElementById('enquiry-form');
  if (form) {
    // native validation gates submit (no novalidate) — this only fires when valid
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('form-ok').style.display = 'block';
      form.reset();
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
