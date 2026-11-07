/**
 * Chain order: customize · cart · checkout · confetti
 * Scroll lock keeps Lenis from stealing sheet/cart wheel.
 */
const MONEY = (n) => `₺${Math.round(n).toLocaleString("tr-TR")}`;

const SAUCES = [
  { id: "anvil", name: "Anvil sos", price: 15 },
  { id: "bbq", name: "BBQ", price: 15 },
  { id: "garlic", name: "Sarımsaklı mayonez", price: 15 },
  { id: "chili", name: "Acı chili", price: 20 },
  { id: "cheddar", name: "Ekstra cheddar", price: 25 },
  { id: "ranch", name: "Ranch", price: 15 },
];

const CATALOG = {
  combos: {
    label: "Menüler",
    blurb: "Burger + patates + içecek",
    items: [
      {
        id: "combo-classic",
        name: "Classic Menü",
        desc: "Double smash + patates + içecek",
        img: "./public/menu/combo-tray.jpg?v=bk1",
        badge: "Fırsat",
        base: 449,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.15 },
          { id: "l", name: "Triple", mult: 1.3 },
        ],
        sauces: true,
      },
      {
        id: "combo-anvil",
        name: "Anvil Menü",
        desc: "House smash + loaded fries + shake",
        img: "./public/menu/anvil.jpg",
        badge: "House",
        base: 489,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.15 },
          { id: "l", name: "Triple", mult: 1.3 },
        ],
        sauces: true,
      },
      {
        id: "combo-flood",
        name: "Flood Menü",
        desc: "Cheddar flood + cheddar fries + cola",
        img: "./public/menu/flood.jpg",
        base: 509,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.12 },
          { id: "l", name: "Triple", mult: 1.28 },
        ],
        sauces: true,
      },
    ],
  },
  burgers: {
    label: "Burgerler",
    blurb: "Tek başına veya menüye ekle",
    items: [
      {
        id: "classic",
        name: "Classic Smash",
        desc: "Çift dantel · American · turşu · soğan",
        img: "./public/menu/classic.jpg",
        base: 320,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.25 },
          { id: "l", name: "Triple", mult: 1.5 },
        ],
        sauces: true,
      },
      {
        id: "triple",
        name: "Triple Smash",
        desc: "Üç patty · eriyen cheddar · turşu",
        img: "./public/menu/triple.jpg?v=bk1",
        badge: "Yeni",
        base: 390,
        sizes: [
          { id: "s", name: "Triple", mult: 1 },
          { id: "m", name: "Quad", mult: 1.2 },
          { id: "l", name: "Tower", mult: 1.4 },
        ],
        sauces: true,
      },
      {
        id: "decon",
        name: "Deconstructed",
        desc: "Açık servis · her katman ayrı",
        img: "./public/menu/decon.jpg",
        base: 340,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.25 },
          { id: "l", name: "Triple", mult: 1.5 },
        ],
        sauces: true,
      },
      {
        id: "flood",
        name: "Cheddar Flood",
        desc: "Üçlü erime · cheddar nehri",
        img: "./public/menu/flood.jpg",
        base: 360,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.25 },
          { id: "l", name: "Triple", mult: 1.5 },
        ],
        sauces: true,
      },
      {
        id: "anvil",
        name: "Anvil House",
        desc: "Crispy onion · pickle brine",
        img: "./public/menu/anvil.jpg",
        badge: "İmza",
        base: 350,
        sizes: [
          { id: "s", name: "Tek", mult: 1 },
          { id: "m", name: "Double", mult: 1.25 },
          { id: "l", name: "Triple", mult: 1.5 },
        ],
        sauces: true,
      },
    ],
  },
  fries: {
    label: "Patates",
    blurb: "Çifte kızartma",
    items: [
      {
        id: "fries",
        name: "Klasik Patates",
        desc: "Deniz tuzu · çıtır",
        img: "./public/menu/fries.jpg",
        base: 90,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.35 },
          { id: "l", name: "Büyük", mult: 1.7 },
        ],
        sauces: true,
      },
      {
        id: "cheddar-fries",
        name: "Cheddar Patates",
        desc: "Sıcak cheddar · yeşil soğan",
        img: "./public/menu/cheddar-fries.jpg",
        base: 140,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.3 },
          { id: "l", name: "Büyük", mult: 1.6 },
        ],
        sauces: true,
      },
      {
        id: "loaded",
        name: "Loaded Fries",
        desc: "Cheddar · bacon · ranch",
        img: "./public/menu/loaded.jpg",
        base: 170,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.3 },
          { id: "l", name: "Büyük", mult: 1.55 },
        ],
        sauces: true,
      },
    ],
  },
  drinks: {
    label: "İçecekler",
    blurb: "Buz gibi",
    items: [
      {
        id: "cola",
        name: "Cola",
        desc: "Buzlu · klasik",
        img: "./public/menu/cola.jpg",
        base: 55,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.25 },
          { id: "l", name: "Büyük", mult: 1.5 },
        ],
        sauces: false,
      },
      {
        id: "ayran",
        name: "Ayran",
        desc: "Soğuk · taze",
        img: "./public/menu/ayran.jpg",
        base: 45,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.2 },
          { id: "l", name: "Büyük", mult: 1.4 },
        ],
        sauces: false,
      },
      {
        id: "lemonade",
        name: "Limonata",
        desc: "Ev yapımı · nane",
        img: "./public/menu/lemonade.jpg",
        base: 65,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.25 },
          { id: "l", name: "Büyük", mult: 1.5 },
        ],
        sauces: false,
      },
      {
        id: "shake",
        name: "Milkshake",
        desc: "Vanilya · çikolata · çilek",
        img: "./public/menu/shake.jpg",
        base: 120,
        sizes: [
          { id: "s", name: "Küçük", mult: 1 },
          { id: "m", name: "Orta", mult: 1.3 },
          { id: "l", name: "Büyük", mult: 1.55 },
        ],
        sauces: false,
      },
    ],
  },
};

let activeCat = "all";

const cart = [];
let draft = null;

const grid = document.getElementById("menuGrid");
const sheet = document.getElementById("sheet");
const sheetBody = document.getElementById("sheetBody");
const cartBar = document.getElementById("cartBar");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartPanel = document.getElementById("cartPanel");
const cartList = document.getElementById("cartList");
const cartPanelTotal = document.getElementById("cartPanelTotal");
const backdrop = document.getElementById("backdrop");
const pay = document.getElementById("pay");
const payForm = document.getElementById("payForm");
const payAmount = document.getElementById("payAmount");
const success = document.getElementById("success");
const confettiCanvas = document.getElementById("confetti");

function findItem(id) {
  for (const cat of Object.values(CATALOG)) {
    const hit = cat.items.find((x) => x.id === id);
    if (hit) return hit;
  }
  return null;
}

function linePrice(cfg) {
  const item = findItem(cfg.id);
  if (!item) return 0;
  const size = item.sizes.find((s) => s.id === cfg.size) || item.sizes[0];
  const sauceSum = (cfg.sauces || [])
    .map((sid) => SAUCES.find((s) => s.id === sid)?.price || 0)
    .reduce((a, b) => a + b, 0);
  return Math.round(item.base * size.mult + sauceSum) * (cfg.qty || 1);
}

function cartSum() {
  return cart.reduce((a, line) => a + line.unit * line.qty, 0);
}

const AUTH_KEY = "anvil_members_v1";
const AUTH_SESSION = "anvil_session_v1";
const authEl = document.getElementById("auth");
const authBtn = document.getElementById("authBtn");
let authMode = "login";

function readMembers() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "[]"); } catch { return []; }
}
function writeMembers(list) { localStorage.setItem(AUTH_KEY, JSON.stringify(list)); }
function currentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_SESSION) || "null"); } catch { return null; }
}
function setSession(user) {
  if (user) localStorage.setItem(AUTH_SESSION, JSON.stringify(user));
  else localStorage.removeItem(AUTH_SESSION);
  syncAuthBtn();
}
function syncAuthBtn() {
  const u = currentUser();
  if (!authBtn) return;
  if (u) {
    authBtn.textContent = u.name ? u.name.split(" ")[0] : "Hesabım";
    authBtn.classList.add("is-in");
    authBtn.dataset.authed = "1";
  } else {
    authBtn.textContent = "Üye girişi";
    authBtn.classList.remove("is-in");
    delete authBtn.dataset.authed;
  }
}
function openAuth(mode = "login") {
  if (!authEl) return;
  closeSheet(); closeCart(); closePay();
  authMode = mode;
  authEl.classList.add("is-open");
  authEl.setAttribute("aria-hidden", "false");
  syncAuthMode();
  syncLock();
  const err = document.getElementById("authErr");
  if (err) err.textContent = "";
}
function closeAuth() {
  if (!authEl?.classList.contains("is-open")) return;
  authEl.classList.remove("is-open");
  authEl.setAttribute("aria-hidden", "true");
  syncLock();
}
function syncAuthMode() {
  const heading = document.getElementById("authHeading");
  const submit = document.getElementById("authSubmit");
  const nameWrap = document.getElementById("authNameWrap");
  authEl?.querySelectorAll("[data-auth-tab]").forEach((b) => b.classList.toggle("is-on", b.dataset.authTab === authMode));
  if (authMode === "register") {
    if (heading) heading.textContent = "Üye ol";
    if (submit) submit.textContent = "Hesap oluştur";
    if (nameWrap) nameWrap.hidden = false;
  } else {
    if (heading) heading.textContent = "Giriş yap";
    if (submit) submit.textContent = "Giriş yap";
    if (nameWrap) nameWrap.hidden = true;
  }
}

function anyOverlayOpen() {
  return (
    sheet.classList.contains("is-open") ||
    cartPanel.classList.contains("is-open") ||
    !pay.hidden ||
    !success.hidden ||
    !!authEl?.classList.contains("is-open")
  );
}

function syncLock() {
  const locked = anyOverlayOpen();
  document.body.classList.toggle("sheet-open", locked);
  const dim = locked && success.hidden;
  backdrop.classList.toggle("is-open", dim);
}

function trapWheel(el) {
  if (!el || el.dataset.wheelTrap) return;
  el.dataset.wheelTrap = "1";
  const stop = (e) => {
    e.stopPropagation();
    const t = e.currentTarget;
    const atTop = t.scrollTop <= 0 && e.deltaY < 0;
    const atBot = t.scrollTop + t.clientHeight >= t.scrollHeight - 1 && e.deltaY > 0;
    if (atTop || atBot) e.preventDefault();
  };
  el.addEventListener("wheel", stop, { passive: false });
  el.addEventListener(
    "touchmove",
    (e) => e.stopPropagation(),
    { passive: true }
  );
}

function renderMenu() {
  const parts = [];
  for (const [key, cat] of Object.entries(CATALOG)) {
    if (activeCat !== "all" && activeCat !== key) continue;
    parts.push(`<div class="menu-cat" id="cat-${key}">
      <div class="menu-cat__head">
        <h3>${cat.label}</h3>
        ${cat.blurb ? `<p>${cat.blurb}</p>` : ""}
      </div>
      <div class="menu-cat__grid ${key === "combos" ? "menu-cat__grid--combo" : ""}">
        ${cat.items
          .map(
            (item) => `
          <button type="button" class="tile" data-id="${item.id}" aria-label="${item.name} sipariş et">
            <div class="tile__media">
              ${item.badge ? `<span class="tile__badge">${item.badge}</span>` : ""}
              <img src="${item.img}" alt="" loading="lazy" decoding="async" />
            </div>
            <div class="tile__body">
              <h4>${item.name}</h4>
              <p>${item.desc}</p>
              <div class="tile__row">
                <strong>${MONEY(item.base)}</strong>
                <span class="tile__add" aria-hidden="true">+</span>
              </div>
            </div>
          </button>`
          )
          .join("")}
      </div>
    </div>`);
  }
  grid.innerHTML = parts.join("");
}

document.getElementById("catRail")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  document.querySelectorAll("#catRail [data-cat]").forEach((b) => b.classList.toggle("is-on", b === btn));
  renderMenu();
  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("deal")?.addEventListener("click", () => {
  const id = document.getElementById("deal")?.dataset.open;
  if (id) openSheet(id);
});

function openSheet(id) {
  const item = findItem(id);
  if (!item) return;
  closeCart();
  closePay();
  closeAuth();
  draft = {
    id: item.id,
    size: item.sizes[1]?.id || item.sizes[0].id,
    sauces: [],
    qty: 1,
  };
  sheetBody.innerHTML = `
    <div class="sheet__hero">
      <img src="${item.img}" alt="" />
      <button type="button" class="sheet__x" data-close aria-label="Kapat">×</button>
    </div>
    <div class="sheet__pad" id="sheetPad">
      <p class="eyebrow">Özelleştir</p>
      <h3>${item.name}</h3>
      <p class="sheet__desc">${item.desc}</p>

      <fieldset class="opt">
        <legend>Boy</legend>
        <div class="opt__row" role="radiogroup">
          ${item.sizes
            .map(
              (s) => `
            <label class="chip">
              <input type="radio" name="size" value="${s.id}" ${s.id === draft.size ? "checked" : ""} />
              <span>${s.name}<small>${MONEY(item.base * s.mult)}</small></span>
            </label>`
            )
            .join("")}
        </div>
      </fieldset>

      ${
        item.sauces
          ? `<fieldset class="opt">
        <legend>Sos ekle</legend>
        <div class="opt__row opt__row--wrap">
          ${SAUCES.map(
            (s) => `
            <label class="chip chip--check">
              <input type="checkbox" name="sauce" value="${s.id}" />
              <span>${s.name}<small>+${MONEY(s.price)}</small></span>
            </label>`
          ).join("")}
        </div>
      </fieldset>`
          : ""
      }

      <div class="qty">
        <span>Adet</span>
        <div class="qty__ctrl">
          <button type="button" data-qty="-1" aria-label="Azalt">−</button>
          <strong id="qtyVal">1</strong>
          <button type="button" data-qty="1" aria-label="Arttır">+</button>
        </div>
      </div>
    </div>
    <div class="sheet__foot">
      <div>
        <small>Toplam</small>
        <strong id="sheetTotal">${MONEY(linePrice(draft))}</strong>
      </div>
      <button type="button" class="btn" id="addBtn">Sepete ekle</button>
    </div>`;

  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  syncLock();
  trapWheel(document.getElementById("sheetPad"));
  bindSheet();
  refreshDraftPrice();
}

function refreshDraftPrice() {
  const el = document.getElementById("sheetTotal");
  const q = document.getElementById("qtyVal");
  if (el) el.textContent = MONEY(linePrice(draft));
  if (q) q.textContent = String(draft.qty);
}

function bindSheet() {
  sheetBody.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeSheet));
  sheetBody.querySelectorAll('input[name="size"]').forEach((inp) => {
    inp.addEventListener("change", () => {
      draft.size = inp.value;
      refreshDraftPrice();
    });
  });
  sheetBody.querySelectorAll('input[name="sauce"]').forEach((inp) => {
    inp.addEventListener("change", () => {
      draft.sauces = [...sheetBody.querySelectorAll('input[name="sauce"]:checked')].map((x) => x.value);
      refreshDraftPrice();
    });
  });
  sheetBody.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      draft.qty = Math.max(1, Math.min(12, draft.qty + Number(btn.dataset.qty)));
      refreshDraftPrice();
    });
  });
  document.getElementById("addBtn")?.addEventListener("click", () => {
    const item = findItem(draft.id);
    const size = item.sizes.find((s) => s.id === draft.size);
    cart.push({
      ...draft,
      name: item.name,
      sizeLabel: size.name,
      unit: linePrice({ ...draft, qty: 1 }),
      key: `${draft.id}-${draft.size}-${[...draft.sauces].sort().join("+")}-${Date.now()}`,
    });
    closeSheet();
    renderCart();
    pulseCart();
  });
}

function closeSheet() {
  if (!sheet.classList.contains("is-open")) return;
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  draft = null;
  syncLock();
}

function renderCart() {
  const n = cart.reduce((a, l) => a + l.qty, 0);
  const sum = cartSum();
  cartBar.classList.toggle("is-show", n > 0 && success.hasAttribute("hidden"));
  cartCount.textContent = String(n);
  cartTotal.textContent = MONEY(sum);
  cartPanelTotal.textContent = MONEY(sum);

  if (!cart.length) {
    cartList.innerHTML = `<p class="cart-empty">Sepetin boş. Menüden bir şey seç.</p>`;
    return;
  }

  cartList.innerHTML = cart
    .map((line) => {
      const sauceNames = (line.sauces || [])
        .map((id) => SAUCES.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(" · ");
      return `<article class="cart-line" data-key="${line.key}">
        <div>
          <strong>${line.name}</strong>
          <p>${line.sizeLabel}${sauceNames ? ` · ${sauceNames}` : ""}</p>
          <div class="qty__ctrl qty__ctrl--sm">
            <button type="button" data-cqty="-1" aria-label="Azalt">−</button>
            <span>${line.qty}</span>
            <button type="button" data-cqty="1" aria-label="Arttır">+</button>
          </div>
        </div>
        <div class="cart-line__right">
          <span>${MONEY(line.unit * line.qty)}</span>
          <button type="button" data-rm aria-label="Kaldır">Sil</button>
        </div>
      </article>`;
    })
    .join("");

  cartList.querySelectorAll(".cart-line").forEach((row) => {
    const key = row.dataset.key;
    row.querySelector("[data-rm]")?.addEventListener("click", () => {
      const i = cart.findIndex((l) => l.key === key);
      if (i >= 0) cart.splice(i, 1);
      renderCart();
      if (!cart.length) closeCart();
    });
    row.querySelectorAll("[data-cqty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const line = cart.find((l) => l.key === key);
        if (!line) return;
        line.qty = Math.max(1, Math.min(12, line.qty + Number(btn.dataset.cqty)));
        renderCart();
      });
    });
  });
}

function openCart() {
  if (!cart.length) return;
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  draft = null;
  pay.classList.remove("is-open");
  pay.hidden = true;
  cartPanel.classList.add("is-open");
  syncLock();
  trapWheel(cartList);
}

function closeCart() {
  if (!cartPanel.classList.contains("is-open")) return;
  cartPanel.classList.remove("is-open");
  syncLock();
}

function openPay() {
  if (!cart.length) return;
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  draft = null;
  cartPanel.classList.remove("is-open");
  payAmount.textContent = MONEY(cartSum());
  pay.hidden = false;
  pay.classList.add("is-open");
  syncLock();
  trapWheel(payForm);
  payForm.querySelector('[name="name"]')?.focus();
}

function closePay() {
  if (pay.hidden) return;
  pay.classList.remove("is-open");
  pay.hidden = true;
  syncLock();
}

function formatCard(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExp(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

payForm?.querySelector('[name="card"]')?.addEventListener("input", (e) => {
  e.target.value = formatCard(e.target.value);
});
payForm?.querySelector('[name="exp"]')?.addEventListener("input", (e) => {
  e.target.value = formatExp(e.target.value);
});
payForm?.querySelector('[name="cvc"]')?.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
});

payForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!cart.length) return;
  const btn = document.getElementById("paySubmit");
  const fd = new FormData(payForm);
  const name = String(fd.get("pickup") || fd.get("name") || "Misafir").trim();
  const total = cartSum();
  const code = `ANV-${String(1000 + Math.floor(Math.random() * 9000))}`;

  btn.disabled = true;
  btn.textContent = "İşleniyor…";
  await new Promise((r) => setTimeout(r, 900));

  cart.length = 0;
  renderCart();
  pay.classList.remove("is-open");
  pay.hidden = true;
  cartPanel.classList.remove("is-open");
  sheet.classList.remove("is-open");

  document.getElementById("successTitle").textContent = `Teşekkürler, ${name.split(" ")[0]}`;
  document.getElementById("successBody").textContent =
    `${MONEY(total)} alındı. Tezgâha gelince adını söyle — hazır olunca çağırırız.`;
  document.getElementById("successCode").textContent = code;

  success.hidden = false;
  success.classList.add("is-open");
  syncLock();
  cartBar.classList.remove("is-show");
  burstConfetti();

  btn.disabled = false;
  btn.textContent = "Ödemeyi tamamla";
  payForm.reset();
});

function closeSuccess() {
  if (success.hidden) return;
  success.classList.remove("is-open");
  success.hidden = true;
  syncLock();
}

function pulseCart() {
  cartBar.classList.remove("is-pulse");
  void cartBar.offsetWidth;
  cartBar.classList.add("is-pulse");
}

/* —— Confetti (no deps) —— */
function burstConfetti() {
  const c = confettiCanvas;
  if (!c) return;
  const ctx = c.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  c.style.width = `${innerWidth}px`;
  c.style.height = `${innerHeight}px`;
  c.classList.add("is-on");

  const colors = ["#d9782f", "#f0c27a", "#14110e", "#ffffff", "#e8a05a", "#2d6a4f"];
  const parts = Array.from({ length: 140 }, () => ({
    x: (0.35 + Math.random() * 0.3) * c.width,
    y: c.height * 0.35,
    vx: (Math.random() - 0.5) * 14 * dpr,
    vy: (-8 - Math.random() * 12) * dpr,
    g: (0.22 + Math.random() * 0.18) * dpr,
    w: (4 + Math.random() * 7) * dpr,
    h: (6 + Math.random() * 10) * dpr,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.35,
    color: colors[(Math.random() * colors.length) | 0],
    life: 1,
  }));

  const t0 = performance.now();
  function frame(t) {
    const elapsed = (t - t0) / 1000;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - elapsed / 2.6);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (elapsed < 2.8) requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, c.width, c.height);
      c.classList.remove("is-on");
    }
  }
  requestAnimationFrame(frame);
}

grid?.addEventListener("click", (e) => {
  const btn = e.target.closest(".tile[data-id], .dish[data-id]");
  if (btn) openSheet(btn.dataset.id);
});

backdrop?.addEventListener("click", () => {
  closeSheet();
  closeCart();
  if (!pay.hidden) {
    closePay();
    if (cart.length) openCart();
  }
});

document.getElementById("cartOpen")?.addEventListener("click", openCart);
document.getElementById("cartClose")?.addEventListener("click", closeCart);
document.getElementById("checkoutBtn")?.addEventListener("click", openPay);
document.getElementById("payClose")?.addEventListener("click", () => {
  closePay();
  if (cart.length) openCart();
});
document.getElementById("payBack")?.addEventListener("click", () => {
  closePay();
  if (cart.length) openCart();
});
document.getElementById("successDone")?.addEventListener("click", closeSuccess);

authBtn?.addEventListener("click", () => {
  if (authBtn.dataset.authed) {
    if (confirm(`${currentUser()?.name || currentUser()?.email}\nÇıkış yapılsın mı?`)) setSession(null);
    return;
  }
  openAuth("login");
});
document.getElementById("authClose")?.addEventListener("click", closeAuth);
authEl?.addEventListener("click", (e) => { if (e.target === authEl) closeAuth(); });
authEl?.querySelectorAll("[data-auth-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    authMode = btn.dataset.authTab;
    syncAuthMode();
    const err = document.getElementById("authErr");
    if (err) err.textContent = "";
  });
});
document.getElementById("authForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const name = String(fd.get("name") || "").trim();
  const err = document.getElementById("authErr");
  if (!email || password.length < 4) {
    if (err) err.textContent = "E-posta ve en az 4 karakter şifre gerekli.";
    return;
  }
  const members = readMembers();
  if (authMode === "register") {
    if (members.some((m) => m.email === email)) {
      if (err) err.textContent = "Bu e-posta zaten kayıtlı — giriş yap.";
      return;
    }
    if (!name) {
      if (err) err.textContent = "Tezgâh için bir isim yaz.";
      return;
    }
    members.push({ email, password, name, createdAt: Date.now() });
    writeMembers(members);
    setSession({ email, name });
    closeAuth();
    return;
  }
  const found = members.find((m) => m.email === email && m.password === password);
  if (!found) {
    if (err) err.textContent = "E-posta veya şifre hatalı.";
    return;
  }
  setSession({ email: found.email, name: found.name });
  closeAuth();
});

document.addEventListener(
  "wheel",
  (e) => {
    if (!document.body.classList.contains("sheet-open")) return;
    if (e.target.closest(".sheet__pad, .cart-panel__list, .pay__form, .success__card, .auth__panel")) return;
    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (authEl?.classList.contains("is-open")) return closeAuth();
  if (!success.hidden) return closeSuccess();
  if (!pay.hidden) {
    closePay();
    return openCart();
  }
  closeSheet();
  closeCart();
});

closeAuth();
syncAuthBtn();
renderMenu();
renderCart();
