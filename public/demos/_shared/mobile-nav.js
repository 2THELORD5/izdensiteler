window.IzdenNav = function IzdenNav(opts) {
  const brand = opts.brand || "İZDEN";
  const links = opts.links || [];
  const header = document.querySelector(opts.header || "header, .nav, .site-head");
  if (!header) return;

  header.setAttribute("data-nav-open", "false");

  const burger = document.createElement("button");
  burger.type = "button";
  burger.className = "iz-burger";
  burger.setAttribute("aria-label", "Menüyü aç");
  burger.setAttribute("aria-expanded", "false");
  burger.innerHTML = "<span></span><span></span><span></span>";

  // Prefer left side
  header.insertBefore(burger, header.firstChild);

  const backdrop = document.createElement("div");
  backdrop.className = "iz-drawer-backdrop";
  backdrop.hidden = true;

  const drawer = document.createElement("aside");
  drawer.className = "iz-drawer";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div class="iz-drawer__head">
      <strong>${brand}</strong>
      <button type="button" class="iz-drawer__close" aria-label="Kapat">×</button>
    </div>
    <nav class="iz-drawer__links" aria-label="Mobil menü"></nav>
  `;
  const linkBox = drawer.querySelector(".iz-drawer__links");
  links.forEach((l) => {
    const a = document.createElement("a");
    a.href = l.href;
    a.textContent = l.label;
    linkBox.appendChild(a);
  });

  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);

  const setOpen = (open) => {
    header.setAttribute("data-nav-open", open ? "true" : "false");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    drawer.classList.toggle("is-on", open);
    backdrop.classList.toggle("is-on", open);
    backdrop.hidden = !open;
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("nav-open", open);
  };

  burger.addEventListener("click", () => setOpen(header.getAttribute("data-nav-open") !== "true"));
  drawer.querySelector(".iz-drawer__close").addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  linkBox.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
};
