/** STRADA — professional inventory desk */
const CARS = [
  {
    id: "mercedes-s63",
    cat: "gt",
    brand: "Mercedes-Benz",
    name: "S 63 AMG Coupé",
    year: 2020,
    condition: "used",
    km: 22400,
    price: 9850000,
    currency: "TRY",
    hp: 612,
    zero: 3.5,
    fuel: "Benzin",
    trans: "9G-Tronic",
    drive: "4MATIC+",
    color: "Obsidian Siyah",
    owners: 1,
    blurb: "Vault’un ilk bay’i. Dıştan kırmızı ambiyanslı kokpite — tek sahiplik, PPI temiz.",
    img: "./public/cars/mercedes-film.jpg",
    status: "Vitrin",
  },
  {
    id: "bmw-m8",
    cat: "gt",
    brand: "BMW",
    name: "M8 Competition",
    year: 2023,
    condition: "used",
    km: 9800,
    price: 10250000,
    currency: "TRY",
    hp: 617,
    zero: 3.2,
    fuel: "Benzin",
    trans: "8 İleri M Steptronic",
    drive: "xDrive",
    color: "Alpine White",
    owners: 1,
    blurb: "Yan bay. Alpine white, karbon paket, M kokpit — düşük km, hazır teslim.",
    img: "./public/cars/bmw-m8.jpg",
    status: "Vitrin",
  },
  {
    id: "porsche-911",
    cat: "gt",
    brand: "Porsche",
    name: "911 Carrera S",
    year: 2024,
    condition: "new",
    km: 120,
    price: 11250000,
    currency: "TRY",
    hp: 443,
    zero: 3.5,
    fuel: "Benzin",
    trans: "PDK",
    drive: "RWD",
    color: "Guards Red",
    owners: 0,
    blurb: "Sıfır km. PDK, Sport Chrono, PASM. Fatura / garanti açık.",
    img: "./public/cars/porsche-911.jpg",
    status: "Sıfır",
  },
  {
    id: "aston-db11",
    cat: "gt",
    brand: "Aston Martin",
    name: "DB11 V8",
    year: 2019,
    condition: "used",
    km: 31200,
    price: 7400000,
    currency: "TRY",
    hp: 503,
    zero: 4.0,
    fuel: "Benzin",
    trans: "8 İleri ZF",
    drive: "RWD",
    color: "Satin Black",
    owners: 2,
    blurb: "Grand tourer. Mesh grille, winged badge — private vault klasmanı.",
    img: "./public/cars/aston-db11.jpg",
    status: "Hazır",
  },
  {
    id: "genesis-g90",
    cat: "sedan",
    brand: "Genesis",
    name: "G90 3.5T AWD",
    year: 2023,
    condition: "used",
    km: 18400,
    price: 6850000,
    currency: "TRY",
    hp: 380,
    zero: 5.2,
    fuel: "Benzin",
    trans: "8 İleri Otomatik",
    drive: "AWD",
    color: "Mat Grafit",
    owners: 1,
    blurb: "Flagship sedan. Crest grille, dual LED, full options. PPI temiz.",
    img: "./public/cars/genesis-g90.jpg",
    status: "Hazır",
  },
  {
    id: "mclaren-720s",
    cat: "hyper",
    brand: "McLaren",
    name: "720S Spider",
    year: 2021,
    condition: "used",
    km: 6400,
    price: 18600000,
    currency: "TRY",
    hp: 710,
    zero: 2.9,
    fuel: "Benzin",
    trans: "7 İleri SSG",
    drive: "RWD",
    color: "Volcano Orange",
    owners: 1,
    blurb: "Hyper bay. Spot altında dihedral kapı — vault’un en yüksek dosyası.",
    img: "./public/cars/mclaren-720s.jpg",
    status: "Vitrin",
  },
];

const HOW = [
  ["01", "Keşif", "Filmi kaydır, vault’u filtrele (sıfır / 2. el), dosyayı aç."],
  ["02", "Dosya", "Km, sahiplik, PPI ve fiyat desk tarafından kilitlenir."],
  ["03", "Randevu", "Gece slotu. Adres SMS ile — vale dahil."],
  ["04", "Showroom", "Tek araç. Test sürüşü ehliyet + sigorta ile."],
  ["05", "Teslim", "Noter, ödeme, kapalı kasa nakliye."],
];

const FINANCE = [
  { t: "Ön ekspertiz", d: "Şasi, boya, servis geçmişi — randevu öncesi PDF." },
  { t: "Finans desk", d: "Banka / leasing. Onay genelde 24–72 saat." },
  { t: "Takas", d: "Mevcut araç değerlemesi; fark vault bakiyesine." },
  { t: "Nakliye", d: "Kapalı kasa Türkiye içi. Avrupa opsiyonel." },
];

const FAQ = [
  ["Sıfır ve 2. el karışık mı?", "Evet. Filtrelerden ayırabilirsin. Sıfırlarda fatura ve garanti açık."],
  ["Km garanti mi?", "İlan km’si ekspertizle doğrulanır; sapma varsa fiyat güncellenir."],
  ["Test sürüşü?", "Ehliyet, depozito ve desk onayı ile. Hyper’da kapalı pist opsiyonu."],
  ["Online satış?", "Yok. Teslim showroom veya noter eşliğinde."],
];

const MONEY = (n) =>
  n >= 1000000
    ? `₺${(n / 1000000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}M`
    : `₺${n.toLocaleString("tr-TR")}`;
const KM = (n) => `${n.toLocaleString("tr-TR")} km`;
const label = (c) => `${c.brand} ${c.name}`;
const condLabel = (c) => (c.condition === "new" ? "Sıfır" : "2. El");

const list = document.getElementById("vaultList");
const filters = document.getElementById("filters");
const detail = document.getElementById("detail");
const lane1 = document.getElementById("lane1");
const lane2 = document.getElementById("lane2");
const dropCar = document.getElementById("dropCar");
let filter = "all";

document.getElementById("howSteps").innerHTML = HOW.map(
  ([n, t, d]) => `<li><b>${n}</b><div><strong>${t}</strong><p>${d}</p></div></li>`
).join("");
document.getElementById("financeGrid").innerHTML = FINANCE.map(
  (f) => `<article><h3>${f.t}</h3><p>${f.d}</p></article>`
).join("");
document.getElementById("faqList").innerHTML = FAQ.map(
  ([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`
).join("");

function matchFilter(c) {
  if (filter === "all") return true;
  if (filter === "new") return c.condition === "new";
  if (filter === "used") return c.condition === "used";
  return c.cat === filter;
}

function renderVault() {
  const rows = CARS.filter(matchFilter);
  list.innerHTML = rows
    .map(
      (c) => `
    <article class="car" data-id="${c.id}">
      <div class="car__img"><img src="${c.img}?v=obs2" alt="${label(c)}" loading="lazy" width="1200" height="1200" /></div>
      <div class="car__fade"></div>
      <div class="car__badges">
        <span class="badge ${c.condition === "new" ? "badge--new" : "badge--used"}">${condLabel(c)}</span>
        <span class="badge badge--soft">${c.year}</span>
      </div>
      <div class="car__body">
        <span class="eyebrow">${c.brand} · ${c.status}</span>
        <strong>${c.name}</strong>
        <div class="car__price">${MONEY(c.price)}</div>
        <div class="car__meta">
          <span><b>${KM(c.km)}</b></span>
          <span><b>${c.hp}</b> hp</span>
          <span><b>${c.zero}s</b> 0–100</span>
          <span>${c.trans}</span>
        </div>
        <span class="car__cta">Dosyayı aç →</span>
      </div>
    </article>`
    )
    .join("");
}

function openDetail(id) {
  const c = CARS.find((x) => x.id === id);
  if (!c) return;
  document.getElementById("detailImg").src = `${c.img}?v=obs2`;
  document.getElementById("detailImg").alt = label(c);
  document.getElementById("detailYear").textContent = `${c.brand} · ${c.year} · ${condLabel(c)}`;
  document.getElementById("detailName").textContent = c.name;
  document.getElementById("detailBlurb").textContent = c.blurb;
  document.getElementById("detailSpecs").innerHTML = [
    ["Fiyat", MONEY(c.price)],
    ["Durum", condLabel(c)],
    ["Km", KM(c.km)],
    ["Yıl", String(c.year)],
    ["Güç", `${c.hp} hp`],
    ["0–100", `${c.zero}s`],
    ["Yakıt", c.fuel],
    ["Vites", c.trans],
    ["Çekiş", c.drive],
    ["Renk", c.color],
    ["Sahiplik", c.owners === 0 ? "Sıfır / bayi" : `${c.owners}. el`],
    ["Stok", c.status],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("");
  detail.hidden = false;
  document.body.classList.add("is-locked");
  document.getElementById("detailBook").onclick = () => {
    closeDetail();
    dropCar.value = c.id;
    document.getElementById("drop")?.scrollIntoView({ behavior: "smooth" });
  };
  document.getElementById("detailRace").onclick = () => {
    if (lane2) lane2.value = c.id;
    closeDetail();
    document.getElementById("race")?.scrollIntoView({ behavior: "smooth" });
  };
}

function closeDetail() {
  detail.hidden = true;
  document.body.classList.remove("is-locked");
}

filters?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-f]");
  if (!btn) return;
  filter = btn.dataset.f;
  filters.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === btn));
  renderVault();
});

list?.addEventListener("click", (e) => {
  const card = e.target.closest(".car");
  if (card) openDetail(card.dataset.id);
});

document.getElementById("detailClose")?.addEventListener("click", closeDetail);
detail?.addEventListener("click", (e) => {
  if (e.target === detail) closeDetail();
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetail();
});

function fillSelects() {
  const raceable = CARS.filter((c) => c.id !== "pagani-ref");
  const opts = CARS.map(
    (c) => `<option value="${c.id}">${c.year} ${label(c)} — ${MONEY(c.price)} · ${KM(c.km)}</option>`
  ).join("");
  const raceOpts = raceable
    .map((c) => `<option value="${c.id}">${c.year} ${label(c)}</option>`)
    .join("");
  lane1.innerHTML = raceOpts;
  lane2.innerHTML = raceOpts;
  lane2.selectedIndex = Math.min(1, raceable.length - 1);
  dropCar.innerHTML = opts;
}

function race() {
  const a = CARS.find((c) => c.id === lane1.value);
  const b = CARS.find((c) => c.id === lane2.value);
  if (!a || !b) return;
  const score = (c) => c.zero * 0.55 + (c.zero + 8) * 0.2;
  const sa = score(a);
  const sb = score(b);
  const max = Math.max(sa, sb);
  const car1 = document.getElementById("car1");
  const car2 = document.getElementById("car2");
  car1.style.left = "0%";
  car2.style.left = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      car1.style.left = `${8 + (1 - sa / max) * 78}%`;
      car2.style.left = `${8 + (1 - sb / max) * 78}%`;
    });
  });
  const winner = sa <= sb ? a : b;
  document.getElementById("raceStats").innerHTML = `
    <div><strong>${label(a)}</strong><br/>${KM(a.km)} · ${a.hp} hp · ${a.zero}s · ${MONEY(a.price)}</div>
    <div><strong>${label(b)}</strong><br/>${KM(b.km)} · ${b.hp} hp · ${b.zero}s · ${MONEY(b.price)}</div>
    <div style="grid-column:1/-1;color:var(--ink);font-family:var(--display);font-weight:600">Winner: ${label(winner)}</div>`;
}

document.getElementById("raceGo")?.addEventListener("click", race);

document.getElementById("dropForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const note = document.getElementById("dropNote");
  if (!fd.get("privacy")) {
    note.hidden = false;
    note.textContent = "Devam için gizlilik onayını işaretleyin.";
    note.style.color = "var(--danger)";
    return;
  }
  const car = CARS.find((c) => c.id === fd.get("car"));
  const code = `STR-${Math.floor(1000 + Math.random() * 9000)}`;
  note.hidden = false;
  note.style.color = "var(--accent)";
  note.textContent = `Talep alındı (${code}). ${label(car)} · ${MONEY(car.price)} · ${KM(car.km)} · ${fd.get("slot")} — desk ${fd.get("phone")} arayacak.`;
  e.target.reset();
  fillSelects();
});

fillSelects();
renderVault();
