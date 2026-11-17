(() => {
  const path = location.pathname || "";
  // Brand-owned demos — keep their own identity
  if (/\/demos\/(kumrucu|junesun)(\/|$)/i.test(path)) return;
  if (document.querySelector(".izden-agency")) return;

  const AGENCY = {
    name: "İzden Creative",
    credit: "Bu site İzden Creative tarafından yapılmıştır.",
    url: "https://www.izdencreative.com",
    email: "info@izdencreative.com",
    phone: "+90 212 000 00 00",
    phoneHref: "tel:+902120000000",
    logo: "/demos/_shared/izden-creative.jpg",
    portal: "/#siteler",
  };

  const el = document.createElement("footer");
  el.className = "izden-agency";
  el.setAttribute("aria-label", "İzden Creative");
  el.innerHTML = `
    <div class="izden-agency__inner">
      <div>
        <p class="izden-agency__eyebrow">Made by İZDEN</p>
        <p class="izden-agency__credit">${AGENCY.credit}</p>
        <div class="izden-agency__links">
          <a href="${AGENCY.url}" target="_blank" rel="noopener noreferrer">izdencreative.com</a>
          <a href="mailto:${AGENCY.email}">${AGENCY.email}</a>
          <a href="${AGENCY.phoneHref}">${AGENCY.phone}</a>
          <a href="${AGENCY.portal}">İZDEN Siteler</a>
        </div>
      </div>
      <a class="izden-agency__brand" href="${AGENCY.url}" target="_blank" rel="noopener noreferrer" aria-label="${AGENCY.name}">
        <img src="${AGENCY.logo}" alt="${AGENCY.name}" width="220" height="75" loading="lazy" />
      </a>
    </div>
  `;
  document.body.appendChild(el);
})();
