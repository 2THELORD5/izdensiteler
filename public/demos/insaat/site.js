const ROOMS = [
  {
    tag: "01 Living",
    title: "The Living",
    blurb: "Perde aralanır — camdan orman ve teras.",
    img: "./public/rooms/living.jpg",
    curtain: true,
  },
  {
    tag: "02 Kitchen",
    title: "The Kitchen",
    blurb: "Kireç taşı ada, meşe, avlu. Sessiz bir işlik.",
    img: "./public/rooms/kitchen.jpg",
  },
  {
    tag: "03 Bedroom",
    title: "The Bedroom",
    blurb: "Tül perdeler rüzgârda — balkon ve sabah ışığı.",
    img: "./public/rooms/bedroom.jpg",
    curtain: true,
  },
  {
    tag: "04 Terrace",
    title: "The Terrace",
    blurb: "Sonsuzluk havuz, taş deck, mavi saat. Dışarıda bitiş.",
    img: "./public/rooms/terrace.jpg",
  },
];

const HOMES = [
  {
    id: "blue-hour",
    title: "House Blue Hour",
    place: "Bodrum · Yalıkavak",
    sqm: 420,
    rooms: "5+1",
    status: "Anahtar teslim",
    priceFrom: 48500000,
    img: "./public/homes/villa-dusk.jpg",
    blurb: "Cam, taş, su aynası. Alacakaranlık vitrini — özel pool villa.",
  },
  {
    id: "stone-walk",
    title: "Stone Walk Villa",
    place: "Çeşme · Alaçatı",
    sqm: 310,
    rooms: "4+1",
    status: "Satışa açık",
    priceFrom: 32800000,
    img: "./public/homes/villa-stone.jpg",
    blurb: "Kayrak yol, ahşap cephe, tam cam salon. Bahçe ve otopark dahil.",
  },
  {
    id: "limestone-pool",
    title: "Limestone Edge",
    place: "Bodrum · Türkbükü",
    sqm: 360,
    rooms: "4+1",
    status: "Satışa açık",
    priceFrom: 39800000,
    img: "./public/homes/villa-stone-2.jpg",
    blurb: "Kireç taşı cephe, zeytinlik, sonsuzluk havuz kenarı. Öğlen ışığı.",
  },
  {
    id: "forest-glow",
    title: "Forest Glow",
    place: "İstanbul · Beykoz",
    sqm: 280,
    rooms: "3+1",
    status: "Ön talep",
    priceFrom: 44200000,
    img: "./public/homes/villa-forest.jpg",
    blurb: "Orman eşiği, cam salon, mavi saat. İçten dışa süreklilik.",
  },
];

const PROJECTS = [
  { hero: true, img: "./public/homes/villa-dusk.jpg", tag: "Villa · Bodrum", title: "House Blue Hour", blurb: "Cam, taş ve su aynası. Alacakaranlıkta yanar." },
  { img: "./public/rooms/terrace.jpg", tag: "Teras", title: "Blue Hour Deck", blurb: "Havuz kenarı, mavi saat." },
  { img: "./public/rooms/living.jpg", tag: "İç", title: "The Living", blurb: "Çift yükseklik, orman camı." },
  { img: "./public/kie/02-frame.jpg", tag: "Şantiye", title: "Skeleton Rise", blurb: "İskelet yükselirken oranlar kilitlenir." },
  { img: "./public/kie/01-site.jpg", tag: "Temel", title: "First Pour", blurb: "Boş arazi. İlk beton. İlk ışık." },
];

const MATS = [
  { name: "Kayrak taş", note: "Yürüyüş ve teras zeminleri.", color: "linear-gradient(135deg,#4a463f,#9a9186)" },
  { name: "Yanmış ahşap", note: "Cephe şeritleri, sıcak doku.", color: "linear-gradient(135deg,#1a1410,#5c4030)" },
  { name: "Pirinç", note: "Armatür ve ince metal detay.", color: "linear-gradient(135deg,#8a6b3d,#e2c48a)" },
  { name: "Düşük demir cam", note: "Tam yükseklik açıklıklar.", color: "linear-gradient(135deg,#1c2a33,#9eb6c4)" },
];

const STEPS = [
  ["01", "Keşif", "Arsa, bakı, rüzgâr, imar ve ışık ölçümü. Tek sayfalık brief."],
  ["02", "Kavram filmi", "Beş karelik sinematik hat — onay kapısı."],
  ["03", "Uygulama projesi", "Statik, mekanik, detay ve malzeme seçimi."],
  ["04", "Şantiye", "İskelet, kabuk, ince iş — haftalık film raporu."],
  ["05", "Teslim / satış", "Alacakaranlık çekimi, dosya arşivi; satılıkta teklif PDF."],
];

const SERVICES = [
  { t: "Mimari tasarım", d: "Konseptten ruhsata. Villa ve özel konut odağında." },
  { t: "İnşaat yönetimi", d: "Anahtar teslim saha, taşeron koordinasyonu, maliyet kontrol." },
  { t: "İç mimari", d: "Eşik, mutfak, aydınlatma — filmle aynı dil." },
  { t: "Satış danışmanlığı", d: "Örnek evler, fiyat bandı ve yatırımcı sunumu." },
];

const FAQ = [
  ["Örnek ev fiyatları net mi?", "Listede ‘den itibaren’ bandı. Güncel teklif 48 saat içinde PDF."],
  ["Süreç ne kadar sürer?", "Villa kavram 4–8 hafta, uygulama 4–10 ay. Ruhsat ayrı."],
  ["Film zorunlu mu?", "Hayır — brief onayı için beş kare önerilir."],
  ["Şehir dışı?", "Evet. İstanbul merkez; Ege ve Akdeniz sahalarında aktifiz."],
];

const RATES = { villa: 42000, apt: 31000, interior: 18000, reno: 24000 };
const MONEY = (n) => `₺${(n / 1000000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M’den`;

const quote = document.getElementById("quote");
let activeHome = null;

const roomsSlides = document.getElementById("roomsSlides");
const roomsTrack = document.getElementById("roomsTrack");
const roomAct = document.getElementById("roomAct");
const roomTitle = document.getElementById("roomTitle");
const roomBody = document.getElementById("roomBody");
const roomIdx = document.getElementById("roomIdx");
const roomsUi = document.querySelector(".rooms-ui");
let activeRoom = -1;

if (roomsSlides) {
  roomsSlides.innerHTML = ROOMS.map(
    (r, i) => `
    <article class="room-slide${r.curtain ? " room-slide--curtain" : ""}${i === 0 ? " is-on" : ""}" data-room="${i}">
      <img src="${r.img}?v=film3" alt="${r.title}" loading="lazy" width="1600" height="900" />
      <div class="room-slide__fade"></div>
      ${
        r.curtain
          ? `<div class="room-curtain" aria-hidden="true">
              <div class="room-curtain__l"><i></i><i></i><i></i><i></i></div>
              <div class="room-curtain__r"><i></i><i></i><i></i><i></i></div>
            </div>`
          : ""
      }
    </article>`
  ).join("");
}

function setRoom(i, local = 0) {
  const r = ROOMS[i];
  if (!r) return;
  if (i !== activeRoom) {
    activeRoom = i;
    roomsSlides?.querySelectorAll(".room-slide").forEach((el, n) => {
      el.classList.toggle("is-on", n === i);
    });
    roomsUi?.classList.remove("is-swap");
    void roomsUi?.offsetWidth;
    roomsUi?.classList.add("is-swap");
    if (roomAct) roomAct.textContent = r.tag;
    if (roomTitle) roomTitle.textContent = r.title;
    if (roomBody) roomBody.textContent = r.blurb;
    if (roomIdx) roomIdx.textContent = `${String(i + 1).padStart(2, "0")} / ${String(ROOMS.length).padStart(2, "0")}`;
  }
  const slide = roomsSlides?.querySelector(`.room-slide[data-room="${i}"]`);
  if (slide?.classList.contains("room-slide--curtain")) {
    /* First half of the room segment: curtains part. Second half: hold open + soft sway. */
    const open = Math.pow(Math.min(1, local * 1.55), 0.85);
    const shift = open * 56;
    const sway = Math.sin(performance.now() / 700 + i) * (1.2 + open * 1.8);
    const l = slide.querySelector(".room-curtain__l");
    const rr = slide.querySelector(".room-curtain__r");
    if (l) {
      l.style.transform = `translate3d(-${shift}%,0,0) skewX(${(-1.2 + sway * 0.15).toFixed(2)}deg)`;
      l.style.setProperty("--curtain-open", String(open));
    }
    if (rr) {
      rr.style.transform = `translate3d(${shift}%,0,0) skewX(${(1.2 - sway * 0.15).toFixed(2)}deg)`;
      rr.style.setProperty("--curtain-open", String(open));
    }
    slide.classList.toggle("is-open", open > 0.82);
  }
}

/** Keep fabric alive while the curtain room is on-screen. */
let curtainRaf = 0;
function tickCurtain() {
  curtainRaf = 0;
  if (activeRoom < 0) return;
  const slide = roomsSlides?.querySelector(`.room-slide.is-on.room-slide--curtain`);
  if (!slide) return;
  syncRoomsScrub();
  curtainRaf = requestAnimationFrame(tickCurtain);
}
function armCurtainLoop() {
  if (!curtainRaf) curtainRaf = requestAnimationFrame(tickCurtain);
}

function syncRoomsScrub() {
  if (!roomsTrack) return;
  const vh = innerHeight || 1;
  const rect = roomsTrack.getBoundingClientRect();
  const total = Math.max(1, roomsTrack.offsetHeight - vh);
  const p = Math.min(1, Math.max(0, -rect.top / total));
  const seg = 1 / ROOMS.length;
  const i = Math.min(ROOMS.length - 1, Math.floor(p / seg + 0.0001));
  const local = (p - i * seg) / seg;
  setRoom(i, local);
}

addEventListener(
  "scroll",
  () => {
    syncRoomsScrub();
    armCurtainLoop();
  },
  { passive: true }
);
addEventListener("resize", syncRoomsScrub);
setRoom(0, 0);
armCurtainLoop();

document.getElementById("homesGrid").innerHTML = HOMES.map(
  (h) => `
  <article class="home">
    <div class="home__media"><img src="${h.img}?v=film3" alt="${h.title}" loading="lazy" width="1600" height="900" /></div>
    <div class="home__body">
      <span class="eyebrow">${h.place} · ${h.status}</span>
      <h3>${h.title}</h3>
      <p>${h.blurb}</p>
      <ul class="home__specs">
        <li><b>${h.sqm}</b> m²</li>
        <li><b>${h.rooms}</b></li>
        <li class="home__price">${MONEY(h.priceFrom)}</li>
      </ul>
      <button type="button" class="btn" data-quote="${h.id}">Fiyat al</button>
    </div>
  </article>`
).join("");

document.getElementById("projects").innerHTML = PROJECTS.map(
  (p) => `
  <article class="card${p.hero ? " card--hero" : ""}">
    <img src="${p.img}?v=film3" alt="${p.title}" loading="lazy" width="1600" height="900" />
    <div class="card__body">
      <span>${p.tag}</span>
      <strong>${p.title}</strong>
      <p>${p.blurb}</p>
    </div>
  </article>`
).join("");

document.getElementById("mats").innerHTML = MATS.map(
  (m) => `
  <div class="mat">
    <div>
      <div class="mat__swatch" style="background:${m.color}"></div>
      <h3>${m.name}</h3>
    </div>
    <p>${m.note}</p>
  </div>`
).join("");

document.getElementById("steps").innerHTML = STEPS.map(
  ([n, t, d]) => `<li><b>${n}</b><strong>${t}</strong><span>${d}</span></li>`
).join("");

document.getElementById("servicesGrid").innerHTML = SERVICES.map(
  (s) => `<article class="svc"><h3>${s.t}</h3><p>${s.d}</p></article>`
).join("");

document.getElementById("faqList").innerHTML = FAQ.map(
  ([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`
).join("");

function openQuote(id) {
  const h = HOMES.find((x) => x.id === id);
  if (!h || !quote) return;
  activeHome = h;
  document.getElementById("quoteTitle").textContent = h.title;
  document.getElementById("quoteMeta").textContent = `${h.place} · ${h.sqm} m² · ${h.rooms} · ${MONEY(h.priceFrom)}`;
  document.getElementById("quoteHomeId").value = h.id;
  document.getElementById("quoteNote").hidden = true;
  quote.hidden = false;
  document.body.classList.add("is-locked");
}

function closeQuote() {
  if (!quote) return;
  quote.hidden = true;
  document.body.classList.remove("is-locked");
  activeHome = null;
}

document.getElementById("homesGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-quote]");
  if (btn) openQuote(btn.dataset.quote);
});

document.getElementById("quoteClose")?.addEventListener("click", closeQuote);
quote?.addEventListener("click", (e) => {
  if (e.target === quote) closeQuote();
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeQuote();
});

document.getElementById("quoteForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const note = document.getElementById("quoteNote");
  const h = HOMES.find((x) => x.id === fd.get("homeId")) || activeHome;
  const code = `FRM-Q-${Math.floor(1000 + Math.random() * 9000)}`;
  note.hidden = false;
  note.textContent = `Talebin alındı (${code}). ${h?.title || "Ev"} için 48 saat içinde ${fd.get("email")} adresine PDF teklif gider.`;
  e.target.reset();
});

document.getElementById("estimateForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const type = fd.get("type");
  const sqm = Number(fd.get("sqm")) || 0;
  const tier = Number(fd.get("tier")) || 1;
  const base = RATES[type] || 30000;
  const low = Math.round((base * sqm * tier) / 100000) * 100000;
  const high = Math.round(low * 1.28);
  const fmt = (n) => n.toLocaleString("tr-TR");
  document.getElementById("estimateOut").textContent =
    `Yönlendirici band: ₺${fmt(low)} – ₺${fmt(high)} · ${sqm} m² · keşif sonrası netleşir.`;
});

document.getElementById("briefForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const note = document.getElementById("formNote");
  if (!fd.get("privacy")) {
    note.hidden = false;
    note.textContent = "Devam için onay kutusunu işaretleyin.";
    return;
  }
  const code = `FRM-${Math.floor(1000 + Math.random() * 9000)}`;
  note.hidden = false;
  note.textContent = `Brief alındı (${code}). 48 saat içinde ${fd.get("email")} adresine film çerçevesi ile döneriz.`;
  e.target.reset();
});

/* Elegant section reveals */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}
