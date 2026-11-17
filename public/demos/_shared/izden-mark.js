(() => {
  // Portal preview already has chrome — don't stack a second İZDEN pill in the iframe.
  try {
    if (window.top !== window.self) return;
  } catch (_) {
    // cross-origin top: still skip to avoid double chrome when embedded
    return;
  }

  const params = new URLSearchParams(location.search);
  const fromPortal =
    params.has("izden") ||
    document.referrer.includes("izdemo") ||
    document.referrer.includes("izdensiteler");
  if (!fromPortal && !params.has("izden")) return;

  const a = document.createElement("a");
  a.className = "izden-mark is-on";
  a.href = "/#siteler";
  a.setAttribute("aria-label", "İZDEN portala dön");
  a.innerHTML = `<img src="/brand/logo-mark-white.png" alt="" width="18" height="18" /><span>İZDEN</span>`;
  a.addEventListener("click", () => {
    try {
      sessionStorage.setItem("izden-scroll-to", "siteler");
    } catch (_) {}
  });
  document.body.appendChild(a);
})();
