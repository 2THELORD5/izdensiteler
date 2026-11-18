(() => {
  "use strict";
  const IZ = window.IZ;
  const { clamp, lerp, reduced } = IZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ───── page progress → survey ruler / top bar ───── */
  const ruler = $("#rulerLat");
  let rq = false;
  const page = () => {
    rq = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = clamp(scrollY / max);
    document.documentElement.style.setProperty("--page", p.toFixed(4));
    if (ruler) ruler.textContent = (36.2 + p * 0.83).toFixed(2) + "°N";
  };
  addEventListener("scroll", () => !rq && ((rq = true), requestAnimationFrame(page)), { passive: true });
  addEventListener("resize", page);
  page();

  /* ───── 02 manifesto — words light up with scroll ───── */
  const mf = $("#manifestoText");
  if (mf) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) frag.appendChild(document.createTextNode(tok));
            else {
              const s = document.createElement("span");
              s.className = "w";
              s.textContent = tok;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(mf);
    const words = $$(".w", mf);
    IZ.scrub(
      mf,
      (p) => {
        // start lighting when the block is ~60% up the viewport, finish at ~30%
        const q = clamp((p - 0.28) / 0.34);
        words.forEach((w, i) => w.style.setProperty("--o", clamp(q * words.length * 1.15 - i + 0.2, 0.16, 1).toFixed(2)));
      },
      { view: true, rest: 1 }
    );
  }

  /* ───── 03 plot to dusk — tide-line wipe ───── */
  const tide = $("#plot");
  if (tide) {
    const frames = $$(".tide__frame", tide);
    const edge = $("#tideEdge");
    const copy = $(".tide__copy", tide);
    const stage = $("#tideStage");
    const no = $("#tideNo"), title = $("#tideTitle"), body = $("#tideBody");
    const gLevel = $("#gaugeLevel"), gTime = $("#gaugeTime"), gFill = $(".gauge__scale i", tide), hint = $("#tideHint");
    const gauge = $(".gauge", tide);
    const chapters = [
      ["Plot", "Sunrise on the cleared plot. Survey pegs, no assumptions — we read the surge line before we draw one."],
      ["Frame", "Steel first, set 38 m back from the surge line. The frame is the sketch; nothing is added that it can’t carry."],
      ["Skin", "Local limestone and low-iron glass. Openings face 196°, turned away from the weather and toward the evening."],
      ["Threshold", "Interior meets terrace without a step. Salt air moves through the house instead of around it."],
      ["Dusk", "Lit from inside, reflected in the water it respects. The vermilion datum on the wall is the storm line."],
    ];
    const level = [0, 4.5, 7.8, 8.4, 9.2];
    const mins = [348, 570, 790, 1005, 1180]; // 05:48 → 19:40
    const n = frames.length;
    let shown = -1;
    const setCopy = (i) => {
      if (i === shown) return;
      const first = shown === -1;
      shown = i;
      const apply = () => {
        no.textContent = String(i + 1).padStart(2, "0");
        title.textContent = chapters[i][0];
        body.textContent = chapters[i][1];
        copy.classList.remove("is-swap");
      };
      if (first || reduced) return apply();
      copy.classList.add("is-swap");
      setTimeout(apply, 170);
    };
    const interp = (arr, t) => {
      const i = Math.min(arr.length - 2, Math.floor(t));
      return lerp(arr[i], arr[i + 1], t - i);
    };
    IZ.scrub(
      tide,
      (p) => {
        const t = clamp(p * (n - 1), 0, n - 1 - 1e-6);
        const i = Math.floor(t);
        const f = smooth(clamp((t - i - 0.3) / 0.7)); // hold each stage, then lift the tide line
        frames.forEach((el, j) => {
          if (j <= i) {
            el.classList.add("is-on");
            el.style.clipPath = "";
          } else if (j === i + 1) {
            el.classList.add("is-on");
            el.style.clipPath = `inset(${((1 - f) * 100).toFixed(2)}% 0 0 0)`;
          } else {
            el.classList.remove("is-on");
            el.style.clipPath = "";
          }
        });
        if (edge) {
          const live = f > 0.004 && f < 0.996;
          edge.style.opacity = live ? "1" : "0";
          edge.style.top = `${((1 - f) * stage.clientHeight).toFixed(1)}px`;
        }
        setCopy(f > 0.5 ? i + 1 : i);
        const tt = clamp(i + f, 0, n - 1);
        if (gLevel) gLevel.textContent = "+" + interp(level, Math.min(tt, n - 1.0001)).toFixed(1) + " m";
        if (gTime) {
          const m = Math.round(interp(mins, Math.min(tt, n - 1.0001)));
          gTime.textContent = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
        }
        if (gauge) gauge.style.setProperty("--f", p.toFixed(3));
        if (gFill) gFill.parentElement.style.setProperty("--f", p.toFixed(3));
        if (hint) hint.classList.toggle("is-gone", p > 0.03);
      },
      { rest: 1 }
    );
    if (reduced) {
      // all stages readable, stacked order preserved: show the finished house
      frames.forEach((el) => (el.style.clipPath = ""));
    }
  }

  /* ───── 04 index of works ───── */
  const list = $("#indexList");
  if (list) {
    const rows = $$("li", list);
    const imgs = $$("#plate img");
    const cap = $("#plateCap");
    const hoverable = matchMedia("(hover:hover) and (pointer:fine)");
    let active = -1;
    const set = (i) => {
      if (i === active) return;
      active = i;
      rows.forEach((r, k) => r.classList.toggle("is-on", k === i));
      imgs.forEach((im, k) => im.classList.toggle("is-on", k === i));
      const r = rows[i];
      cap.textContent = $(".t", r).textContent + " — " + $(".c", r).textContent;
    };
    rows.forEach((r, i) => {
      r.addEventListener("mouseenter", () => hoverable.matches && set(i));
      r.addEventListener("focusin", () => set(i));
      r.addEventListener("click", () => set(i));
    });
    // scroll picks the row nearest the reading line (primary behaviour on touch)
    let q = false;
    const pick = () => {
      q = false;
      if (hoverable.matches && matchMedia("(min-width:901px)").matches) return;
      const line = innerHeight * (IZ.mobile ? 0.62 : 0.5);
      let best = 0, d = 1e9;
      rows.forEach((r, i) => {
        const b = r.getBoundingClientRect();
        const c = Math.abs(b.top + b.height / 2 - line);
        if (c < d) ((d = c), (best = i));
      });
      set(best);
    };
    addEventListener("scroll", () => !q && ((q = true), requestAnimationFrame(pick)), { passive: true });
    pick();
    set(0);
  }

  /* ───── 05 sun path ───── */
  const sun = $("#sun");
  if (sun) {
    const dot = $("#sunDot"), arc = $("#sunArc");
    const time = $("#sunTime"), az = $("#sunAz"), alt = $("#sunAlt");
    const room = $("#sunRoom"), note = $("#sunNote");
    const imgs = $$(".sun__rooms img", sun);
    const pin = $("#sunPin");
    const states = [
      ["Bedroom", "East light arrives at the pillow, low and warm. Nothing is drawn at dawn — the eave only starts working at ten."],
      ["Living room", "At midday the deep eave holds the high sun out. The room stays in soft light reflected off the limestone floor."],
      ["Terrace", "Low sun skims the water and lights the terrace from below. This is the hour the whole plan is drawn for."],
    ];
    const stops = [
      [0, [255, 190, 150], [138, 140, 170]],
      [0.5, [200, 235, 250], [150, 200, 225]],
      [1, [255, 122, 69], [11, 29, 51]],
    ];
    const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
    const sky = (p) => {
      const k = p < 0.5 ? 0 : 1;
      const t = (p - stops[k][0]) / 0.5;
      return [mix(stops[k][1], stops[k + 1][1], t), mix(stops[k][2], stops[k + 1][2], t)];
    };
    let st = -1;
    IZ.scrub(
      sun,
      (p) => {
        const th = Math.PI * (1 - p);
        dot.setAttribute("cx", (400 + 340 * Math.cos(th)).toFixed(1));
        dot.setAttribute("cy", (360 - 300 * Math.sin(th)).toFixed(1));
        arc.style.strokeDashoffset = (1 - p).toFixed(4);
        const m = Math.round(lerp(372, 1241, p));
        time.textContent = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
        az.textContent = "AZ " + String(Math.round(lerp(76, 284, p))).padStart(3, "0") + "°";
        alt.textContent = "ALT " + String(Math.round(62 * Math.sin(p * Math.PI))).padStart(2, "0") + "°";
        const [a, b] = sky(p);
        pin.style.setProperty("--br", (1 + 0.85 * Math.sin(p * Math.PI)).toFixed(3));
        pin.style.setProperty("--sky-a", `rgb(${a})`);
        pin.style.setProperty("--sky-b", `rgb(${b})`);
        const s = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        if (s !== st) {
          st = s;
          imgs.forEach((im, k) => im.classList.toggle("is-on", k === s));
          room.textContent = states[s][0];
          note.textContent = states[s][1];
        }
      },
      { rest: 0.5 }
    );
  }

  /* ───── 06 palette ───── */
  const sw = $$("#swatches li");
  if (sw.length) {
    if (IZ.mobile) sw[0].classList.add("is-open");
    sw.forEach((li) =>
      li.addEventListener("click", () => {
        const open = li.classList.contains("is-open");
        sw.forEach((o) => o.classList.remove("is-open"));
        if (!open) li.classList.add("is-open");
      })
    );
    sw.forEach((li) =>
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      })
    );
  }
})();
