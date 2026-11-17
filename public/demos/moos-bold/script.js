/* BOLD Architects — interactions
   cursor · side menu · scroll reveals · parallax · project hover reveal
   Reveals and parallax run straight off scroll events so they work even
   where rAF / IntersectionObserver are throttled; rAF only adds smoothing. */

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- header state ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  /* ---------- side glass menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('menuOverlay');

  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    sideMenu.setAttribute('aria-hidden', String(!open));
  };
  menuBtn.addEventListener('click', () =>
    setMenu(!document.body.classList.contains('menu-open'))
  );
  overlay.addEventListener('click', () => setMenu(false));
  sideMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => setMenu(false))
  );
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- anchor watchdog ----------
     smooth scroll needs animation frames; in throttled contexts it never
     starts. If the page hasn't moved shortly after an anchor click, jump. */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      const before = window.scrollY;
      const targetY = id === 'top'
        ? 0
        : target.getBoundingClientRect().top + window.scrollY;
      setTimeout(() => {
        if (Math.abs(window.scrollY - before) < 8 && Math.abs(targetY - before) > 40) {
          // 'auto' would defer to CSS scroll-behavior:smooth — force the jump
          window.scrollTo({ top: targetY, behavior: 'instant' });
          window.dispatchEvent(new Event('scroll'));
        }
      }, 450);
    });
  });

  /* ---------- scroll reveals ---------- */
  let pendingReveal = [...document.querySelectorAll('.reveal')];

  const viewH = () =>
    window.innerHeight || document.documentElement.clientHeight || 800;

  const revealCheck = () => {
    if (!pendingReveal.length) return;
    const limit = viewH() * 0.92;
    pendingReveal = pendingReveal.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < limit && r.bottom > 0) {
        el.classList.add('in');
        return false;
      }
      return true;
    });
  };

  if (reducedMotion) {
    pendingReveal.forEach((el) => el.classList.add('in'));
    pendingReveal = [];
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    pendingReveal.forEach((el) => io.observe(el));
  }

  /* ---------- parallax (direct on scroll) ---------- */
  const heroImg = document.getElementById('heroImg');
  const caseSection = document.getElementById('case-study');
  const caseImg = document.getElementById('caseImg');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];

  const applyParallax = () => {
    const vh = viewH();
    const y = window.scrollY;

    if (y < vh * 1.2) {
      heroImg.style.transform = `scale(1.12) translateY(${y * 0.22}px)`;
    }

    const cr = caseSection.getBoundingClientRect();
    if (cr.top < vh && cr.bottom > 0) {
      const progress = (vh - cr.top) / (vh + cr.height); // 0..1
      caseImg.style.transform =
        `translateY(${(progress - 0.5) * cr.height * 0.24}px) scale(1.08)`;
    }

    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) return;
      const speed = parseFloat(el.dataset.parallax);
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  const onScroll = () => {
    onScrollHeader();
    revealCheck();
    if (!reducedMotion) applyParallax();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  // late layout shifts (fonts/images) can leave first-screen items unrevealed
  window.addEventListener('load', onScroll);
  setTimeout(onScroll, 600);

  /* ---------- custom cursor (difference dot) ---------- */
  const cursor = document.querySelector('.cursor');
  if (cursor && finePointer && !reducedMotion) {
    let cx = -100, cy = -100, tx = -100, ty = -100;
    let lastTick = 0;

    const place = () => {
      cursor.style.transform =
        `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    };

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      // rAF starved (hidden tab, throttled pane): position directly
      if (performance.now() - lastTick > 150) {
        cx = tx; cy = ty;
        place();
      }
    }, { passive: true });

    const tick = (now) => {
      lastTick = now;
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      place();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
  }

  /* ---------- projects: cursor-following image reveal ---------- */
  const index = document.getElementById('workIndex');
  const flare = document.getElementById('workFlare');
  const flareImg = flare ? flare.querySelector('img') : null;

  if (index && flare && finePointer && !reducedMotion) {
    index.querySelectorAll('.work').forEach((row) => {
      const img = new Image();
      img.src = row.dataset.img;
    });

    const host = index.closest('.projects');
    let fx = 0, fy = 0, gx = 0, gy = 0;
    let flaring = false;
    let lastFollow = 0;

    const placeFlare = () => {
      flare.style.left = gx + 'px';
      flare.style.top = gy + 'px';
    };

    const follow = (now) => {
      lastFollow = now;
      gx += (fx - gx) * 0.16;
      gy += (fy - gy) * 0.16;
      placeFlare();
      if (flaring) requestAnimationFrame(follow);
    };

    index.addEventListener('mousemove', (e) => {
      const hostRect = host.getBoundingClientRect();
      fx = e.clientX - hostRect.left;
      fy = e.clientY - hostRect.top;
      if (performance.now() - lastFollow > 150) {
        gx = fx; gy = fy;
        placeFlare();
      }
    }, { passive: true });

    index.addEventListener('mouseenter', (e) => {
      const hostRect = host.getBoundingClientRect();
      gx = fx = e.clientX - hostRect.left;
      gy = fy = e.clientY - hostRect.top;
      flaring = true;
      placeFlare();
      requestAnimationFrame(follow);
    });
    index.addEventListener('mouseleave', () => {
      flaring = false;
      flare.classList.remove('on');
    });

    index.querySelectorAll('.work').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        flareImg.src = row.dataset.img;
        flare.classList.add('on');
      });
    });
  }
})();
