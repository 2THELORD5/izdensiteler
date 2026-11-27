/**
 * Kumrucu — ikinci scroll: aynı somun, dolgu orbit ile değişir.
 * Pin + GSAP ScrollTrigger; ilk film scrub'a dokunmaz.
 */
(function () {
  "use strict";

  /* Distinct real plates — not the lookalike kie scroll-v2 set */
  const DISHES = [
    {
      title: "Klasik",
      subtitle: "Çeşme",
      eyebrow: "İç malzeme 01",
      body: "Susamlı ekmek, kaşar, biber — meşhur Çeşme hali.",
      img: "./public/menu/orbit/klasik.jpg",
      accent: "#c1946a",
    },
    {
      title: "Sucuklu",
      subtitle: "Domates",
      eyebrow: "İç malzeme 02",
      body: "Sucuk, domates, kaşar — tok tezgâh hali.",
      img: "./public/menu/orbit/sucuklu.jpg",
      accent: "#a8784f",
    },
    {
      title: "Yengen",
      subtitle: "Kuru",
      eyebrow: "İç malzeme 03",
      body: "İzmir’in kurusu — Kale tezgâhında.",
      img: "./public/menu/orbit/yengen.jpg",
      accent: "#8f5f3f",
    },
    {
      title: "Sıcak",
      subtitle: "Izgara",
      eyebrow: "İç malzeme 04",
      body: "Izgara ısısıyla peynir erir; ekmek çıtır kalır.",
      img: "./public/menu/orbit/sicak.jpg",
      accent: "#744c35",
    },
    {
      title: "Soğuk",
      subtitle: "Sebze",
      eyebrow: "İç malzeme 05",
      body: "Taze sebze, kaşar — yazlık servis.",
      img: "./public/menu/orbit/soguk.jpg",
      accent: "#9cb88a",
    },
  ];

  const root = document.getElementById("orbit");
  if (!root) return;

  const reduced =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const track = root.querySelector(".orbit-track");
  const pin = root.querySelector(".orbit-pin");
  const plateA = root.querySelector(".orbit-plate--a");
  const plateB = root.querySelector(".orbit-plate--b");
  const imgA = plateA?.querySelector("img");
  const imgB = plateB?.querySelector("img");
  const eye = root.querySelector("[data-orbit-eye]");
  const title = root.querySelector("[data-orbit-title]");
  const sub = root.querySelector("[data-orbit-sub]");
  const body = root.querySelector("[data-orbit-body]");
  const dots = root.querySelector(".orbit-dots");
  const thumbs = root.querySelector(".orbit-thumbs");

  if (!track || !pin || !imgA || !imgB) return;

  // Preload plates so the pin never flashes empty.
  DISHES.forEach((d) => {
    const im = new Image();
    im.decoding = "async";
    im.src = d.img;
  });

  if (dots) {
    dots.innerHTML = DISHES.map(
      (_, i) =>
        `<button type="button" class="orbit-dot${i === 0 ? " is-on" : ""}" data-i="${i}" aria-label="Çeşit ${i + 1}"></button>`
    ).join("");
  }
  if (thumbs) {
    thumbs.innerHTML = DISHES.map(
      (d, i) =>
        `<button type="button" class="orbit-thumb${i === 0 ? " is-on" : ""}" data-i="${i}" aria-label="${d.title}">` +
        `<img src="${d.img}" alt="" width="56" height="56" loading="lazy" />` +
        `<span>${d.title}</span></button>`
    ).join("");
  }

  let index = 0;
  let frontIsA = true;
  let busy = false;
  let pending = null;

  function paintCopy(i) {
    const d = DISHES[i];
    if (eye) eye.textContent = d.eyebrow;
    if (title) title.textContent = d.title;
    if (sub) sub.textContent = d.subtitle;
    if (body) body.textContent = d.body;
    pin.style.setProperty("--orbit-accent", d.accent);
    dots?.querySelectorAll(".orbit-dot").forEach((el, n) => el.classList.toggle("is-on", n === i));
    thumbs?.querySelectorAll(".orbit-thumb").forEach((el, n) => el.classList.toggle("is-on", n === i));
  }

  function show(i, dir = 1) {
    i = Math.max(0, Math.min(DISHES.length - 1, i));
    if (i === index && imgA.getAttribute("src")) return;
    if (busy) {
      pending = { i, dir };
      paintCopy(i);
      return;
    }
    const d = DISHES[i];
    const outPlate = frontIsA ? plateA : plateB;
    const inPlate = frontIsA ? plateB : plateA;
    const inImg = frontIsA ? imgB : imgA;

    inImg.src = d.img;
    paintCopy(i);

    if (reduced || typeof gsap === "undefined") {
      outPlate?.classList.remove("is-front");
      inPlate?.classList.add("is-front");
      frontIsA = !frontIsA;
      index = i;
      return;
    }

    busy = true;
    const swing = dir >= 0 ? -48 : 48;
    gsap.killTweensOf([outPlate, inPlate]);
    gsap.set(inPlate, { rotation: -swing, opacity: 0, scale: 0.92, transformOrigin: "50% 120%" });
    gsap.set(outPlate, { transformOrigin: "50% 120%" });
    inPlate.classList.add("is-front");

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        outPlate.classList.remove("is-front");
        gsap.set(outPlate, { clearProps: "transform,opacity" });
        gsap.set(inPlate, { clearProps: "transform,opacity" });
        frontIsA = !frontIsA;
        index = i;
        busy = false;
        if (pending && pending.i !== index) {
          const next = pending;
          pending = null;
          show(next.i, next.dir);
        } else pending = null;
      },
    });
    tl.to(outPlate, { rotation: swing, opacity: 0, scale: 0.9, duration: 0.4 }, 0).to(
      inPlate,
      { rotation: 0, opacity: 1, scale: 1, duration: 0.4 },
      0
    );
  }

  // Seed first plate
  imgA.src = DISHES[0].img;
  plateA.classList.add("is-front");
  paintCopy(0);

  function goTo(i) {
    const dir = i >= index ? 1 : -1;
    show(i, dir);
    if (typeof ScrollTrigger !== "undefined") {
      const st = ScrollTrigger.getById("kk-orbit");
      if (st) {
        const steps = DISHES.length - 1;
        const p = steps <= 0 ? 0 : i / steps;
        st.scroll(st.start + (st.end - st.start) * p);
      }
    }
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-i]");
    if (!btn) return;
    goTo(Number(btn.dataset.i));
  });

  function mountScroll() {
    if (reduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      track.style.height = "auto";
      pin.style.position = "relative";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const steps = Math.max(1, DISHES.length - 1);
    ScrollTrigger.create({
      id: "kk-orbit",
      trigger: track,
      start: "top top",
      end: () => "+=" + window.innerHeight * steps * 0.85,
      pin: pin,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const i = Math.round(self.progress * steps);
        if (i !== index) show(i, i > index ? 1 : -1);
      },
    });
  }

  if (document.readyState === "complete") mountScroll();
  else window.addEventListener("load", mountScroll, { once: true });
})();
