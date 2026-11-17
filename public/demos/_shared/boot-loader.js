window.IzdenBoot = function IzdenBoot(opts) {
  const loader = document.getElementById(opts.loaderId || "loader");
  const bar = document.getElementById(opts.barId || "loaderBar");
  const pct = document.getElementById(opts.pctId || "loaderPct");
  const minMs = opts.minMs || 600;
  const maxMs = opts.maxMs || 4200;
  const onDone = opts.onDone || (() => {});

  document.body.classList.add("is-loading");
  const start = performance.now();
  let progress = 0;

  const tick = (p) => {
    progress = Math.max(progress, p);
    if (bar) bar.style.width = `${Math.min(100, progress)}%`;
    if (pct) pct.textContent = String(Math.round(Math.min(100, progress)));
  };

  tick(8);

  const imgs = [...document.images];
  let loaded = 0;
  const total = Math.max(1, imgs.length);
  const mark = () => {
    loaded += 1;
    tick(20 + (loaded / total) * 70);
  };
  imgs.forEach((img) => {
    if (img.complete) mark();
    else {
      img.addEventListener("load", mark, { once: true });
      img.addEventListener("error", mark, { once: true });
    }
  });

  const fontsReady = document.fonts?.ready || Promise.resolve();
  fontsReady.then(() => tick(Math.max(progress, 88)));

  const finish = () => {
    tick(100);
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minMs - elapsed);
    setTimeout(() => {
      document.body.classList.remove("is-loading");
      loader?.classList.add("is-done");
      onDone();
    }, wait + 180);
  };

  const hard = setTimeout(finish, maxMs);
  Promise.all([
    fontsReady,
    new Promise((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", r, { once: true });
    }),
  ]).then(() => {
    clearTimeout(hard);
    // slight delay so bar can hit 100 visually
    setTimeout(finish, 120);
  });
};
