/** Full Kumrucu Kale catalog — original site products, complete. */

const MENU = [
  /* —— Kumru —— */
  {
    cat: "kumru",
    hero: true,
    tag: "Meşhur",
    title: "Çeşme Kumrusu",
    blurb: "Susamlı ekmek, kaşar, biber — Alaçatı’nın klasik tezgâh hali.",
    img: "./public/menu/kumru-klasik-real.jpg",
  },
  {
    cat: "kumru",
    hero: true,
    tag: "Sıcak",
    title: "Sıcak Kumru",
    blurb: "Izgara sıcaklığıyla; peynir erir, ekmek çıtır kalır.",
    img: "./public/kie/03c-klasik-dolu.jpg",
  },
  {
    cat: "kumru",
    tag: "Sucuklu",
    title: "Sucuklu Domatesli",
    blurb: "Sucuk, domates, kaşar — isteyene klasik ağır hali.",
    img: "./public/menu/kumru-sucuklu-real.jpg",
  },
  {
    cat: "kumru",
    tag: "Yengen",
    title: "Yengen Kumru",
    blurb: "İzmir’in kurusu — Kale tezgâhında tanıdık lezzet.",
    img: "./public/menu/orig/yengen-kumru.jpg",
  },
  {
    cat: "kumru",
    tag: "Soğuk",
    title: "Soğuk Kumru",
    blurb: "Taze sebze, kaşar, susamlı somun — yazlık Alaçatı.",
    img: "./public/menu/kumru-soguk.jpg",
  },
  {
    cat: "kumru",
    tag: "Fırın",
    title: "Pizza",
    blurb: "Fırın pizza — kumru hamurundan gelen çıtır kenar.",
    img: "./public/menu/orig/pizza.jpg",
  },

  /* —— Kurabiye —— */
  {
    cat: "kurabiye",
    hero: true,
    tag: "Damla sakız",
    title: "Sakızlı Alaçatı Kurabiyesi",
    blurb: "%100 doğal sakız reçinesi — yöresel lezzeti tatmadan geçmeyin.",
    img: "./public/menu/orig/sakizli.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kavala",
    title: "Bademli Kavala",
    blurb: "Ağızda dağılan bademli kavala.",
    img: "./public/menu/orig/kavala.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Lor",
    title: "Portakallı Lorlu",
    blurb: "Portakal ve lor — yöresel aroma.",
    img: "./public/menu/orig/portakalli.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Elma Marmelatlı",
    blurb: "Elma marmelatlı fırın kurabiyesi.",
    img: "./public/menu/orig/elma-kurabiye.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Fındıklı Kurabiye",
    blurb: "Fındıkla zenginleştirilmiş klasik.",
    img: "./public/menu/orig/findikli.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Susamlı Kurabiye",
    blurb: "Susamlı, çıtır kurabiye.",
    img: "./public/menu/orig/susamli-kurabiye.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Tahinli Kurabiye",
    blurb: "Tahin aromalı yumuşak kurabiye.",
    img: "./public/menu/orig/tahinli-kurabiye.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Tuzlu Kurabiyeler",
    blurb: "Çayın yanına tuzlu seçki.",
    img: "./public/menu/orig/tuzlu-kurabiye.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Çikolatalı Kurabiye",
    blurb: "Çikolata parçacıklı fırın kurabiyesi.",
    img: "./public/menu/orig/cikolatali.jpg",
  },
  {
    cat: "kurabiye",
    tag: "Kurabiye",
    title: "Üzümlü Kurabiye",
    blurb: "Üzümlü, yumuşak içli kurabiye.",
    img: "./public/menu/orig/uzumlu.jpg",
  },

  /* —— Sabah / unlu —— */
  {
    cat: "sabah",
    tag: "Sabah",
    title: "Gevrek",
    blurb: "Çıtır klasik — sabah tezgâhının vazgeçilmezi.",
    img: "./public/menu/orig/gevrek.jpg",
  },
  {
    cat: "sabah",
    tag: "Poğaça",
    title: "Kaşarlı Poğaça",
    blurb: "Fırından sıcak kaşarlı poğaça.",
    img: "./public/menu/orig/kasarli-pogaca.jpg",
  },
  {
    cat: "sabah",
    tag: "Poğaça",
    title: "Dereotlu Peynirli Ev Poğaçası",
    blurb: "Dereotu ve peynir — ev usulü.",
    img: "./public/menu/orig/dereotlu-pogaca.jpg",
  },
  {
    cat: "sabah",
    tag: "Poğaça",
    title: "Lor Peynirli Poğaça",
    blurb: "Lor peynirli yumuşak poğaça.",
    img: "./public/menu/orig/lor-pogaca.jpg",
  },
  {
    cat: "sabah",
    tag: "Börek",
    title: "Kıymalı Talaş Böreği",
    blurb: "Kıymalı talaş — her sabah taze.",
    img: "./public/menu/orig/kiymali-borek.jpg",
  },
  {
    cat: "sabah",
    tag: "Börek",
    title: "Peynirli Talaş Böreği",
    blurb: "Peynirli talaş böreği.",
    img: "./public/menu/orig/peynirli-borek.jpg",
  },
  {
    cat: "sabah",
    tag: "Unlu",
    title: "Boyoz",
    blurb: "İzmir klasiği boyoz.",
    img: "./public/menu/orig/boyoz.jpg",
  },
  {
    cat: "sabah",
    tag: "Unlu",
    title: "Sütlü Simit",
    blurb: "Sütlü simit — yumuşak iç, susamlı dış.",
    img: "./public/menu/orig/sutlu-simit.jpg",
  },
  {
    cat: "sabah",
    tag: "Unlu",
    title: "Tahinli Çörek",
    blurb: "Tahinli çörek — fırın kokusu.",
    img: "./public/menu/orig/tahinli-corek.jpg",
  },
  {
    cat: "sabah",
    tag: "Kahvaltı",
    title: "Sucuklu Yumurta",
    blurb: "Sucuklu yumurta — sabah tabağı.",
    img: "./public/menu/orig/sucuklu-yumurta.jpg",
  },
  {
    cat: "sabah",
    tag: "Kahvaltı",
    title: "Kahvaltılık",
    blurb: "Güne Kale ile başlayın.",
    img: "./public/menu/orig/kahvaltilik.jpg",
  },
  {
    cat: "sabah",
    tag: "Tabak",
    title: "Peynir Tabağı",
    blurb: "Taze peynir seçkisi.",
    img: "./public/menu/orig/peynir-tabagi.jpg",
  },
  {
    cat: "sabah",
    tag: "Tabak",
    title: "Söğüş Tabağı",
    blurb: "Söğüş sebze tabağı.",
    img: "./public/menu/orig/sogus.jpg",
  },

  /* —— Ekmek / toptan —— */
  {
    cat: "ekmek",
    hero: true,
    tag: "Ekmek",
    title: "Kumru Ekmeği",
    blurb: "Toptan ve şube — Ege’ye düzenli sevkiyat.",
    img: "./public/kie/07-ekmek-stack.jpg",
  },
  {
    cat: "ekmek",
    tag: "Toptan",
    title: "50’li Koli",
    blurb: "Jelatinli poşet, ezilmeye karşı korumalı kutu.",
    img: "./public/menu/orig/ekmek-50.jpg",
  },
  {
    cat: "ekmek",
    tag: "Toptan",
    title: "100’lü Koli",
    blurb: "İzmir ve tüm Türkiye’ye 100’lü koliler.",
    img: "./public/menu/orig/ekmek-100.jpg",
  },
];

const BRANCHES = [
  {
    tag: "Çarşı",
    title: "Alaçatı Çarşı",
    address: "Alaçatı Mah. Cumhuriyet Caddesi No:2/A\nAlaçatı · Çeşme",
    phone: "0232 716 93 72",
    gsm: "0507 597 98 85",
    hours: "Ziyaret için arayın",
    tel: "+902327169372",
  },
  {
    tag: "Yol kenarı",
    title: "Atatürk Bulvarı",
    address: "Alaçatı Mah. Atatürk Bulvarı No:47/1\nAlaçatı · Çeşme",
    phone: "0232 716 93 63",
    gsm: "0507 597 98 85",
    hours: "H.içi 06:00–23:00 · H.sonu 06:00–24:00",
    tel: "+902327169363",
  },
];

const FALLBACK = {
  kumru: "./public/menu/kumru-klasik-real.jpg",
  kurabiye: "./public/menu/orig/kavala.jpg",
  sabah: "./public/menu/orig/gevrek.jpg",
  ekmek: "./public/kie/07-ekmek-stack.jpg",
};

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add("is-in");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

const menuGrid = document.getElementById("menuGrid");
const menuTabs = document.getElementById("menuTabs");

function renderMenu(filter = "all") {
  if (!menuGrid) return;
  const items = filter === "all" ? MENU : MENU.filter((d) => d.cat === filter);
  menuGrid.innerHTML = items
    .map(
      (d) => `
    <article class="dish reveal${d.hero ? " is-hero" : ""}" data-cat="${d.cat}">
      <div class="dish__media">
        <img src="${d.img}" alt="${d.title}" loading="lazy" width="900" height="720"
          onerror="this.onerror=null;this.src='${FALLBACK[d.cat] || FALLBACK.kumru}'" />
      </div>
      <div class="dish__body">
        <p class="dish__tag">${d.tag}</p>
        <h3>${d.title}</h3>
        <p>${d.blurb}</p>
      </div>
    </article>`
    )
    .join("");
  document.querySelectorAll("#menuGrid .reveal").forEach((el) => {
    io.observe(el);
    requestAnimationFrame(() => el.classList.add("is-in"));
  });
}

if (menuTabs) {
  menuTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    menuTabs.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-on", b === btn));
    renderMenu(btn.dataset.filter);
  });
}
renderMenu("all");

const visitGrid = document.getElementById("visitGrid");
if (visitGrid) {
  visitGrid.innerHTML = BRANCHES.map(
    (b) => `
    <article class="branch reveal">
      <p class="branch__tag">${b.tag}</p>
      <h3>${b.title}</h3>
      <address>${b.address.replace(/\n/g, "<br />")}</address>
      <ul class="branch__meta">
        <li><b>Tel</b> ${b.phone}</li>
        <li><b>GSM</b> ${b.gsm}</li>
        <li><b>Saat</b> ${b.hours}</li>
      </ul>
      <a class="btn" href="tel:${b.tel}">Ara</a>
    </article>`
  ).join("");
}

document.getElementById("contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const note = document.getElementById("formNote");
  if (note) {
    note.hidden = false;
    note.textContent = `Alındı (${fd.get("name")}). ${fd.get("email")} adresine döneceğiz.`;
  }
  e.target.reset();
});

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
