(() => {
  const root = document.querySelector("[data-iz-scrub]");
  if (!root) return;

  const frames = [...root.querySelectorAll(".iz-scrub__frame")];
  const act = root.querySelector("[data-iz-act]");
  const title = root.querySelector("[data-iz-title]");
  const body = root.querySelector("[data-iz-body]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chapters = frames.map((f, i) => ({
    el: f,
    act: f.dataset.act || `0${i + 1}`,
    title: f.dataset.title || "",
    body: f.dataset.body || "",
  }));

  let last = -1;
  const paint = (i) => {
    if (i === last) return;
    last = i;
    chapters.forEach((c, n) => c.el.classList.toggle("is-on", n === i));
    const c = chapters[i];
    if (!c) return;
    if (act) act.textContent = c.act;
    if (title) title.textContent = c.title;
    if (body) body.textContent = c.body;
  };

  paint(0);
  if (reduced || chapters.length < 2) return;

  const onScroll = () => {
    const r = root.getBoundingClientRect();
    const total = root.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -r.top / total));
    const i = Math.min(chapters.length - 1, Math.floor(p * chapters.length));
    paint(i);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );
  onScroll();
})();
