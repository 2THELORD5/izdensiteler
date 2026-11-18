(() => {
  "use strict";
  const IZ = window.IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* roast data: [minutes, bean temp °C]; chart box is 20..780 × 20..320 */
  const pts = [[0, 200], [1.2, 96], [3, 128], [5, 160], [7, 183], [8.5, 197], [10.5, 208], [11, 210]];
  const T0 = 60, T1 = 230, TMAX = 11;
  const X = (m) => 20 + (m / TMAX) * 760;
  const Y = (t) => 320 - ((t - T0) / (T1 - T0)) * 300;
  const P = pts.map(([m, t]) => [X(m), Y(t)]);
  /* Catmull-Rom → cubic Bézier */
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const bg = $("#curveBg"), line = $("#curveLine"), dot = $("#curveDot"), marks = $("#marks");
  if (!bg || !line) return;
  bg.setAttribute("d", d);
  line.setAttribute("d", d);
  const len = line.getTotalLength();
  line.style.strokeDasharray = len;

  const stages = [
    { at: 0, m: 0, title: "Charge", note: "Green beans drop into a drum already at 200 °C. The temperature falls fast — that is the beans taking the heat.", level: "Green" },
    { at: 0.27, m: 3, title: "Drying & browning", note: "Moisture leaves, sugars start to brown. We keep the climb steady so the inside cooks as evenly as the outside.", level: "Yellow" },
    { at: 0.62, m: 7.6, title: "First crack", note: "A dry pop from the drum: the bean has opened. This is the moment each lot gets its own decision.", level: "Medium" },
    { at: 0.9, m: 10.5, title: "Drop", note: "Out of the drum and into the cooling tray inside a minute. Then it rests, then it goes in a bag.", level: "Roasted" },
  ];
  /* bean colour by progress */
  const stopsC = [[0, [125, 139, 60]], [0.3, [196, 168, 70]], [0.55, [150, 96, 44]], [0.8, [92, 52, 26]], [1, [44, 24, 14]]];
  const beanColour = (p) => {
    for (let i = 0; i < stopsC.length - 1; i++) {
      const [a, ca] = stopsC[i], [b, cb] = stopsC[i + 1];
      if (p <= b) { const t = (p - a) / (b - a); return ca.map((v, j) => Math.round(v + (cb[j] - v) * t)); }
    }
    return stopsC[stopsC.length - 1][1];
  };

  /* stage markers on the chart */
  const NS = "http://www.w3.org/2000/svg";
  const labelAt = [[0, "Charge"], [1.2, "Turn"], [8.5, "1st crack"], [10.5, "Drop"]];
  const markEls = labelAt.map(([m, name]) => {
    const t = (function (mm) { for (let i = 0; i < pts.length - 1; i++) if (mm <= pts[i + 1][0]) { const k = (mm - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k; } return pts[pts.length - 1][1]; })(m);
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", X(m)); c.setAttribute("cy", Y(t)); c.setAttribute("r", 6);
    const tx = document.createElementNS(NS, "text");
    tx.setAttribute("x", Math.min(740, Math.max(40, X(m)))); tx.setAttribute("y", Y(t) + (name === "Charge" ? 26 : 32));
    tx.setAttribute("text-anchor", name === "Drop" ? "end" : name === "Charge" ? "start" : "middle");
    tx.textContent = name;
    marks.append(c, tx);
    return { c, m };
  });

  const imgs = $$(".curve__stage img");
  const title = $("#stageTitle"), note = $("#stageNote"), copy = $(".curve__copy");
  const tTemp = $("#tTemp"), tTime = $("#tTime"), tLevel = $("#tLevel"), bean = $("#bean");
  let on = -1;

  const draw = (p) => {
    const k = IZ.clamp(p);
    line.style.strokeDashoffset = len * (1 - k);
    const pt = line.getPointAtLength(k * len);
    dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
    const mins = ((pt.x - 20) / 760) * TMAX;
    const temp = T0 + ((320 - pt.y) / 300) * (T1 - T0);
    tTemp.innerHTML = `${Math.round(temp)}<small>°C</small>`;
    const s = Math.round(mins * 60);
    tTime.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    bean.style.setProperty("--bean", `rgb(${beanColour(k)})`);
    markEls.forEach((e) => e.c.classList.toggle("is-on", mins >= e.m - 0.02));

    let idx = 0;
    stages.forEach((st, i) => { if (k >= st.at) idx = i; });
    if (idx !== on) {
      on = idx;
      const st = stages[idx];
      copy.style.opacity = 0;
      setTimeout(() => { title.textContent = st.title; note.textContent = st.note; copy.style.opacity = 1; }, IZ.reduced ? 0 : 160);
      tLevel.textContent = st.level;
      imgs.forEach((im, i) => im.classList.toggle("is-on", i === idx));
    }
  };
  IZ.scrub($("#curve"), draw, { rest: 0.5 });
})();
