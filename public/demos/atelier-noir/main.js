(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("navBackdrop");
  const closeBtn = document.getElementById("navClose");
  const nav = document.getElementById("nav");

  const setOpen = (open) => {
    if (!drawer || !nav) return;
    nav.dataset.open = open ? "true" : "false";
    drawer.dataset.open = open ? "true" : "false";
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger?.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger?.addEventListener("click", () => setOpen(true));
  closeBtn?.addEventListener("click", () => setOpen(false));
  backdrop?.addEventListener("click", () => setOpen(false));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const chapterStack = document.querySelector("[data-chapter-stack]");
  const panels = chapterStack?.querySelectorAll(".chapter-stack__panel");
  const dots = chapterStack?.querySelectorAll(".chapter-stack__progress span");

  const setChapter = (index) => {
    if (!panels?.length) return;
    const i = Math.max(0, Math.min(index, panels.length - 1));
    panels.forEach((panel, idx) => {
      panel.classList.toggle("is-active", idx === i);
    });
    dots?.forEach((dot, idx) => {
      dot.classList.toggle("is-on", idx === i);
    });
  };

  const updateChapterFromScroll = () => {
    if (!chapterStack || reduced) return;
    const rect = chapterStack.getBoundingClientRect();
    const scrollable = chapterStack.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = traveled / scrollable;
    const chapter = Math.min(2, Math.floor(progress * 3.001));
    setChapter(chapter);
  };

  if (chapterStack && !reduced) {
    let chapterTicking = false;
    const onChapterScroll = () => {
      if (chapterTicking) return;
      chapterTicking = true;
      requestAnimationFrame(() => {
        updateChapterFromScroll();
        chapterTicking = false;
      });
    };
    window.addEventListener("scroll", onChapterScroll, { passive: true });
    updateChapterFromScroll();
  } else if (panels?.length) {
    setChapter(0);
  }

  const bottleStage = document.querySelector("[data-bottle-stage]");
  const bottleRail = bottleStage?.querySelector(".bottle-stage__rail");

  const updateBottleReveal = () => {
    if (!bottleStage || !bottleRail || reduced) return;
    const rect = bottleRail.getBoundingClientRect();
    const scrollable = bottleRail.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = traveled / scrollable;
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    bottleStage.style.setProperty("--bottle-reveal", String(eased));
  };

  if (bottleStage && !reduced) {
    let bottleTicking = false;
    const onBottleScroll = () => {
      if (bottleTicking) return;
      bottleTicking = true;
      requestAnimationFrame(() => {
        updateBottleReveal();
        bottleTicking = false;
      });
    };
    window.addEventListener("scroll", onBottleScroll, { passive: true });
    window.addEventListener("resize", updateBottleReveal, { passive: true });
    updateBottleReveal();
  } else if (bottleStage) {
    bottleStage.style.setProperty("--bottle-reveal", "1");
  }

  const form = document.getElementById("newsletterForm");
  const status = document.getElementById("newsletterStatus");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const value = input?.value?.trim() ?? "";
    if (status) {
      status.hidden = false;
      if (!value || !input?.validity.valid) {
        status.textContent = "Enter a valid email to continue — demo only.";
        return;
      }
      status.textContent = "Thank you. This demo does not store addresses — you're on the list in spirit.";
      form.reset();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return;
    link.addEventListener("click", (e) => {
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
    });
  });
})();