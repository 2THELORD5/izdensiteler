(() => {
  const path = location.pathname || "";
  if (/\/demos\/(kumrucu|junesun)(\/|$)/i.test(path)) return;

  const EMAIL = "info@izdencreative.com";
  const PHONE = "+90 212 000 00 00";
  const PHONE_HREF = "tel:+902120000000";
  const WEB = "https://www.izdencreative.com";

  // Soft-replace obvious placeholder contact strings in visible text nodes / hrefs
  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("mailto:") && !/izdencreative\.com/i.test(href)) {
      a.setAttribute("href", `mailto:${EMAIL}`);
      if (/@/.test(a.textContent || "")) a.textContent = EMAIL;
    }
    if (href.startsWith("tel:") && !/2120000000|212\s*000/.test(href.replace(/\s/g, ""))) {
      // Keep demo brand phones for UX fiction unless clearly fake US 555
      if (/555|000\s*00|XXXX|\+1\s*415/i.test(href) || /555|000\s*00/i.test(a.textContent || "")) {
        a.setAttribute("href", PHONE_HREF);
        a.textContent = PHONE;
      }
    }
  });

  // Ensure a compact contact chip exists near end if missing
  if (!document.querySelector("[data-izden-contact-chip]") && document.body) {
    const chip = document.createElement("aside");
    chip.dataset.izdenContactChip = "1";
    chip.setAttribute("aria-label", "İzden Creative iletişim");
    chip.style.cssText =
      "max-width:72rem;margin:0 auto;padding:1rem 1.25rem;display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;font-size:.85rem;opacity:.85";
    chip.innerHTML = `<a href="mailto:${EMAIL}">${EMAIL}</a><a href="${PHONE_HREF}">${PHONE}</a><a href="${WEB}" target="_blank" rel="noopener">izdencreative.com</a>`;
    const agency = document.querySelector(".izden-agency");
    if (agency) agency.before(chip);
    else document.body.appendChild(chip);
  }
})();
