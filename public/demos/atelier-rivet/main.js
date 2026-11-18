(() => {
  "use strict";
  const IZ = window.IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const section = $("#polish");
  const stage = $("#pStage");
  if (!section || !stage) return;
  const gloss = $("#gloss"), swirl = $("#swirl"), pass = $("#pass");
  let last = "";

  /* scroll position sets the line; everything else is derived from it */
  IZ.scrub(section, (p) => {
    const x = (1 - 0) * (p * 100);
    stage.style.setProperty("--x", x.toFixed(2) + "%");
    gloss.textContent = Math.round(IZ.lerp(58, 94, p));
    pass.textContent = Math.round(p * 100);
    const s = p < 0.12 ? "High" : p < 0.45 ? "Medium" : p < 0.9 ? "Low" : "Clear";
    if (s !== last) {
      last = s;
      swirl.textContent = s;
    }
  }, { rest: 0.55 });
})();
