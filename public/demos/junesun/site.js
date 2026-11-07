(() => {
  const progress = document.getElementById("progress");
  const stages = [
    { video: document.getElementById("v1"), section: document.getElementById("runway") },
    { video: document.getElementById("v2"), section: document.getElementById("walk") },
  ];

  function bindScrub({ video, section }) {
    if (!video || !section) return;
    const ready = () => {
      video.pause();
      video.currentTime = 0;
    };
    if (video.readyState >= 1) ready();
    else video.addEventListener("loadedmetadata", ready, { once: true });

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0 || !video.duration) return;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = scrolled / total;
      video.currentTime = p * Math.max(video.duration - 0.05, 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  stages.forEach(bindScrub);

  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = `${Math.min(p, 1) * 100}%`;
  }, { passive: true });

  const grid = document.getElementById("grid");
  const products = [
    "m8_1a-2.jpg","m8_1b-2.jpg","m8_2a-2.jpg","m8_2b-1.jpg",
    "m8_3a-2.jpg","m8_3b-2.jpg","acc-1.webp","acc-2.webp","acc-3.jpg","acc-4.webp"
  ];
  if (grid) {
    for (const file of products) {
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.src = "./public/products/" + file;
      img.alt = "";
      img.loading = "lazy";
      fig.appendChild(img);
      grid.appendChild(fig);
    }
  }
})();