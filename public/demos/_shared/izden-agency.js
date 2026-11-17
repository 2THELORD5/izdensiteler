(() => {
  if (document.querySelector(".izden-agency")) return;

  const AGENCY = {
    name: "İzden Creative",
    credit: "Bu site İzden Creative tarafından yapılmıştır.",
    url: "https://www.izdencreative.com",
    email: "info@izdencreative.com",
    phone: "+90 850 000 00 00",
    logo: "../_shared/izden-creative.jpg",
  };

  // Depth: if page is nested under demos/*/sub/, adjust — demos are flat index.html
  const path = location.pathname;
  if (path.includes("/demos/") && path.split("/demos/")[1]?.includes("/") && !path.endsWith("/index.html") === false) {
    /* keep default for /demos/slug/index.html → ../_shared works */
  }

  const el = document.createElement("footer");
  el.className = "izden-agency";
  el.setAttribute("aria-label", "İzden Creative");
  el.innerHTML = `
    <div class="izden-agency__inner">
      <div>
        <p class="izden-agency__eyebrow">Made by</p>
        <p class="izden-agency__credit">${AGENCY.credit}</p>
        <div class="izden-agency__links">
          <a href="${AGENCY.url}" target="_blank" rel="noopener noreferrer">izdencreative.com</a>
          <a href="mailto:${AGENCY.email}">${AGENCY.email}</a>
          <a href="/#siteler">İZDEN Siteler</a>
        </div>
      </div>
      <a class="izden-agency__brand" href="${AGENCY.url}" target="_blank" rel="noopener noreferrer" aria-label="${AGENCY.name}">
        <img src="${AGENCY.logo}" alt="${AGENCY.name}" width="220" height="75" loading="lazy" />
      </a>
    </div>
  `;
  document.body.appendChild(el);
})();
