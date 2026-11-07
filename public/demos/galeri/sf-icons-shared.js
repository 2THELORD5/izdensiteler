/**
 * iOS SF Symbols–style inline icons (24px optical, 1.5 stroke, round caps).
 * Usage: SF.replaceIcons(root) replaces [data-sf="name"] with SVG.
 */
(function (global) {
  const P = {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
  };

  const PATHS = {
    flame: '<path d="M12 3c2 3 1 5 1 7a4 4 0 1 1-8 0c0-3 3-5 4-7 1 2 2 3 3 0z"/><path d="M12 22a7 7 0 0 0 7-7c0-3-2-5-3-7"/>',
    burger: '<path d="M4 10h16"/><path d="M5 14h14"/><path d="M4 18h16"/><path d="M5 7c2-2 4-2 7-2s5 0 7 2"/>',
    fries: '<path d="M7 10v10h10V10"/><path d="M9 10V6"/><path d="M12 10V5"/><path d="M15 10V7"/><path d="M6 10h12"/>',
    cup: '<path d="M6 8h10v7a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8z"/><path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16"/><path d="M9 3s1 1 1 2-1 2-1 2"/><path d="M12 3s1 1 1 2-1 2-1 2"/>',
    bean: '<path d="M12 4c4 2 6 6 6 10s-2 6-6 6-6-2-6-6 2-8 6-10z"/><path d="M12 6c0 4-1 8-1 12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    map: '<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    phone: '<path d="M7 3h4l1 4-2 1a10 10 0 0 0 4 4l1-2 4 1v4a2 2 0 0 1-2 2A13 13 0 0 1 5 5a2 2 0 0 1 2-2z"/>',
    cart: '<path d="M3 5h2l2 12h11l2-8H7"/><circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M7 10v9h10v-9"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/>',
    ruler: '<path d="M4 16 16 4l4 4L8 20 4 16z"/><path d="M8 12l2 2"/><path d="M11 9l2 2"/><path d="M14 6l2 2"/>',
    key: '<circle cx="8" cy="15" r="3"/><path d="M10.5 13.5 20 4"/><path d="M16 5l3 3"/>',
    gauge: '<path d="M5 19a9 9 0 1 1 14 0"/><path d="M12 19V11"/><path d="M12 11l4-3"/>',
    car: '<path d="M3 13h18l-1.5-5H4.5L3 13z"/><path d="M5 13v4h2v-2h10v2h2v-4"/><circle cx="7.5" cy="17.5" r="1"/><circle cx="16.5" cy="17.5" r="1"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    check: '<path d="M5 13l4 4L19 7"/>',
    spark: '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="M5.5 5.5 8 8"/><path d="M16 16l2.5 2.5"/><path d="M18.5 5.5 16 8"/><path d="M8 16l-2.5 2.5"/>',
    bag: '<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    drop: '<path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/>',
    building: '<path d="M4 21V5l8-2 8 2v16"/><path d="M9 9h1"/><path d="M14 9h1"/><path d="M9 13h1"/><path d="M14 13h1"/><path d="M9 17h1"/><path d="M14 17h1"/><path d="M10 21v-4h4v4"/>',
  };

  function svg(name) {
    const inner = PATHS[name];
    if (!inner) return "";
    const attrs = Object.entries(P)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
    return `<svg ${attrs}>${inner}</svg>`;
  }

  function replaceIcons(root = document) {
    root.querySelectorAll("[data-sf]").forEach((el) => {
      const name = el.getAttribute("data-sf");
      const mark = svg(name);
      if (!mark) return;
      el.classList.add("sf");
      if (el.childNodes.length === 0) el.innerHTML = mark;
      else if (!el.querySelector("svg")) el.insertAdjacentHTML("afterbegin", mark);
    });
  }

  global.SF = { svg, replaceIcons, PATHS };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => replaceIcons());
  } else {
    replaceIcons();
  }
})(window);
