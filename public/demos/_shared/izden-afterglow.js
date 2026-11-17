(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = document.querySelectorAll(".iz-reveal");
  if (!nodes.length) return;
  if (reduced || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  nodes.forEach((n) => io.observe(n));
})();
