/* Peak — header tone over the film (scroll position is the source of truth). */
(() => {
  "use strict";
  if (window.__pkTone) return;
  window.__pkTone = true;
  const root = document.documentElement;
  const isHome = /^\/demos\/moos-peak\/(index\.html)?$/.test(location.pathname);
  if (!isHome) return;
  root.classList.add("pk-home", "pk-on-film");

  function tone() {
    const film = document.querySelector("[data-iz-film-scrub]");
    if (!film) return; // film not mounted yet — keep the last state
    const h = (document.querySelector(".site-header") || { offsetHeight: 80 }).offsetHeight;
    root.classList.toggle("pk-on-film", film.getBoundingClientRect().bottom > h * 0.6);
  }
  window.addEventListener("scroll", tone, { passive: true });
  window.addEventListener("resize", tone);
  // film is injected after hydration — poll briefly until it exists
  let n = 0;
  const iv = setInterval(() => {
    tone();
    if (document.querySelector("[data-iz-film-scrub]") || ++n > 40) clearInterval(iv);
  }, 250);
  tone();
})();
