/**
 * IZDEN — ticket board · compose modal · receipt cart · checkout
 * Distinct from smash-house UI patterns.
 */
const MONEY = (n) => `₺${Math.round(n).toLocaleString("tr-TR")}`;

const MILKS = [
  { id: "dairy", name: "İnek", price: 0 },
  { id: "oat", name: "Yulaf", price: 20 },
  { id: "almond", name: "Badem", price: 20 },
];

const EXTRAS = [
  { id: "extra-shot", name: "Ekstra shot", price: 25 },
  { id: "vanilla", name: "Vanilya", price: 15 },
  { id: "caramel", name: "Karamel", price: 15 },
  { id: "honey", name: "Bal", price: 15 },
  { id: "decaf", name: "Decaf", price: 0 },
];

const IMG = (name) => `./public/menu/${name}.jpg?v=cold1`;
/* Size morph: same specialty ribbed glass photo, CSS-scaled — no plastic cups */
const CUP = {
  s: "./public/menu/iced-latte.jpg?v=cold1",
  m: "./public/menu/iced-latte.jpg?v=cold1",
  l: "./public/menu/iced-latte.jpg?v=cold1",
};
/* Only cold drinks use clear-cup size morph — hot drinks keep ceramic/glass product photo */
const CLEAR_CUPS = new Set(["iced-latte", "cold-brew", "espresso-tonic"]);
const SIZE_NOTE = {
  s: "12 oz — kısa şeffaf bardak. Tek yudumda net shot.",
  m: "16 oz — house clear. Katmanlar en net burada.",
  l: "20 oz — tall clear. Uzun yudum, bol buz.",
};

const CATALOG = {
  espresso: {
    label: "Espresso bar",
    blurb: "Kısa, yoğun, crema odaklı.",
    items: [
      { id: "espresso", name: "Espresso", desc: "Kalın crema · günlük blend", note: "18g → 36g", img: IMG("espresso"), base: 90, milky: false, extras: true, badge: "House",
        sizes: [{ id: "s", name: "Single", mult: 1 }, { id: "m", name: "Double", mult: 1.35 }, { id: "l", name: "Lungo", mult: 1.2 }] },
      { id: "americano", name: "Americano", desc: "Shot + sıcak su", note: "Uzun gövde", img: IMG("americano"), base: 110, milky: false, extras: true,
        sizes: [{ id: "s", name: "8oz", mult: 1 }, { id: "m", name: "12oz", mult: 1.25 }, { id: "l", name: "16oz", mult: 1.5 }] },
      { id: "filter", name: "Filter", desc: "V60 · günlük tek köken", note: "Pour-over", img: IMG("filter"), base: 140, milky: false, extras: false, badge: "Origin",
        sizes: [{ id: "s", name: "Cup", mult: 1 }, { id: "m", name: "Mug", mult: 1.3 }, { id: "l", name: "Share", mult: 1.7 }] },
    ],
  },
  milk: {
    label: "Sütlü",
    blurb: "Buhar, mikro köpük, dengeli shot.",
    items: [
      { id: "latte", name: "Latte", desc: "İpek süt · dengeli shot", note: "Microfoam", img: IMG("latte"), base: 150, milky: true, extras: true,
        sizes: [{ id: "s", name: "8oz", mult: 1 }, { id: "m", name: "12oz", mult: 1.25 }, { id: "l", name: "16oz", mult: 1.5 }] },
      { id: "flat", name: "Flat White", desc: "Çift shot · ince köpük", note: "Yoğun", img: IMG("flat"), base: 155, milky: true, extras: true, badge: "Signature",
        sizes: [{ id: "s", name: "Cup", mult: 1 }, { id: "m", name: "Large", mult: 1.3 }, { id: "l", name: "Strong", mult: 1.45 }] },
      { id: "cappuccino", name: "Cappuccino", desc: "Klasik oran · köpük", note: "1:1:1", img: IMG("cappuccino"), base: 145, milky: true, extras: true,
        sizes: [{ id: "s", name: "8oz", mult: 1 }, { id: "m", name: "12oz", mult: 1.25 }, { id: "l", name: "16oz", mult: 1.5 }] },
    ],
  },
  cold: {
    label: "Soğuk hat",
    blurb: "Buz, büğu, uzun yudum.",
    items: [
      { id: "iced-latte", name: "Iced Latte", desc: "Katmanlı · büğu", note: "Bugün", img: IMG("iced-latte"), base: 160, milky: true, extras: true, badge: "Featured",
        sizes: [{ id: "s", name: "12oz", mult: 1 }, { id: "m", name: "16oz", mult: 1.25 }, { id: "l", name: "20oz", mult: 1.5 }] },
      { id: "cold-brew", name: "Cold Brew", desc: "18 saat demleme", note: "Düşük asit", img: IMG("cold-brew"), base: 155, milky: true, extras: true,
        sizes: [{ id: "s", name: "12oz", mult: 1 }, { id: "m", name: "16oz", mult: 1.25 }, { id: "l", name: "20oz", mult: 1.5 }] },
      { id: "espresso-tonic", name: "Espresso Tonic", desc: "Shot · tonic · limon", note: "Parlak", img: IMG("tonic"), base: 170, milky: false, extras: false,
        sizes: [{ id: "s", name: "Tek", mult: 1 }, { id: "m", name: "Double", mult: 1.3 }, { id: "l", name: "Tall", mult: 1.5 }] },
    ],
  },
  bites: {
    label: "Yanında",
    blurb: "Fırından, fincanın yanına.",
    items: [
      { id: "croissant", name: "Croissant", desc: "Tereyağlı katman", note: "Fırın", img: IMG("croissant"), base: 95, milky: false, extras: false,
        sizes: [{ id: "s", name: "Adet", mult: 1 }] },
      { id: "cookie", name: "Cookie", desc: "Dark chocolate chunk", note: "Sıcak kenar", img: IMG("cookie"), base: 75, milky: false, extras: false,
        sizes: [{ id: "s", name: "Adet", mult: 1 }] },
    ],
  },
};

const cart = [];
let draft = null;
let activeTab = "all";
let payMethod = "card";
let payPhase = 1;

const grid = document.getElementById("menuGrid");
const rail = document.getElementById("boardRail");
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
const payBody = document.getElementById("payBody");
const success = document.getElementById("success");
const confettiCanvas = document.getElementById("confetti");

const findItem = (id) => {
  for (const cat of Object.values(CATALOG)) {
    const hit = cat.items.find((x) => x.id === id);
    if (hit) return hit;
  }
  return null;
};

function linePrice(cfg) {
  const item = findItem(cfg.id);
  if (!item) return 0;
  const size = item.sizes.find((s) => s.id === cfg.size) || item.sizes[0];
  const milk = item.milky ? MILKS.find((m) => m.id === cfg.milk)?.price || 0 : 0;
  const extras = (cfg.extras || []).map((id) => EXTRAS.find((e) => e.id === id)?.price || 0).reduce((a, b) => a + b, 0);
  return Math.round(item.base * size.mult + milk + extras + (cfg.tip || 0)) * (cfg.qty || 1);
}

const cartSum = () => cart.reduce((a, l) => a + l.unit * l.qty, 0);

const AUTH_KEY = "izden_members_v1";
const AUTH_SESSION = "izden_session_v1";
const authEl = document.getElementById("auth");
const authBtn = document.getElementById("authBtn");
let authMode = "login";

function readMembers() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "[]"); } catch { return []; }
}
function writeMembers(list) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(list));
}
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
  closeCompose();
  closeCart();
  closePay();
  authMode = mode;
  authEl.classList.add("is-open");
  authEl.setAttribute("aria-hidden", "false");
  syncAuthMode();
  syncLock();
  document.getElementById("authErr").textContent = "";
  setTimeout(() => authEl.querySelector('input[name="email"]')?.focus(), 50);
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
  const form = document.getElementById("authForm");
  authEl?.querySelectorAll("[data-auth-tab]").forEach((b) => b.classList.toggle("is-on", b.dataset.authTab === authMode));
  if (authMode === "register") {
    if (heading) heading.textContent = "Üye ol";
    if (submit) submit.textContent = "Hesap oluştur";
    if (nameWrap) nameWrap.hidden = false;
    form?.querySelector('input[name="password"]')?.setAttribute("autocomplete", "new-password");
  } else {
    if (heading) heading.textContent = "Giriş yap";
    if (submit) submit.textContent = "Giriş yap";
    if (nameWrap) nameWrap.hidden = true;
    form?.querySelector('input[name="password"]')?.setAttribute("autocomplete", "current-password");
  }
}

function anyOpen() {
  return sheet.classList.contains("is-open")
    || cartPanel.classList.contains("is-open")
    || !pay.hidden
    || !success.hidden
    || !!authEl?.classList.contains("is-open");
}

function syncLock() {
  const locked = anyOpen();
  document.body.classList.toggle("sheet-open", locked);
  locked ? window.__anvilLenis?.stop() : window.__anvilLenis?.start();
  backdrop.classList.toggle("is-open", locked && success.hidden);
}

function trapWheel(el) {
  if (!el || el.dataset.trap) return;
  el.dataset.trap = "1";
  el.addEventListener("wheel", (e) => {
    e.stopPropagation();
    const t = e.currentTarget;
    if ((t.scrollTop <= 0 && e.deltaY < 0) || (t.scrollTop + t.clientHeight >= t.scrollHeight - 1 && e.deltaY > 0)) e.preventDefault();
  }, { passive: false });
}

function imgTag(src, alt) {
  return `<img src="${src}" alt="${alt}" width="700" height="700" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='./public/kie/05-glass.jpg';" />`;
}

function renderMenu() {
  const chunks = [];
  for (const [key, cat] of Object.entries(CATALOG)) {
    if (activeTab !== "all" && activeTab !== key) continue;
    chunks.push(`<section class="menu-sec" id="cat-${key}">
      <header class="menu-sec__head">
        <div>
          <h3>${cat.label}</h3>
          <p>${cat.blurb || ""}</p>
        </div>
      </header>
      <div class="cards">
        ${cat.items
          .map(
            (item, i) => `
          <button type="button" class="card" data-id="${item.id}" style="--i:${i}">
            <div class="card__media">
              ${item.badge ? `<span class="card__badge">${item.badge}</span>` : ""}
              ${imgTag(item.img, item.name)}
            </div>
            <div class="card__body">
              <div class="card__top">
                <h4>${item.name}</h4>
                <span class="card__price">${MONEY(item.base)}</span>
              </div>
              <p>${item.desc}</p>
              <div class="card__foot">
                <small>${item.note}</small>
                <span class="card__cta">Özelleştir</span>
              </div>
            </div>
          </button>`
          )
          .join("")}
      </div>
    </section>`);
  }
  grid.innerHTML = chunks.join("") || `<p class="ticket__empty">Bu hatta ürün yok.</p>`;
}

rail?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tab]");
  if (!btn) return;
  activeTab = btn.dataset.tab;
  rail.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-on", b === btn));
  renderMenu();
});

document.getElementById("feature")?.addEventListener("click", (e) => {
  const id = e.target.closest("[data-open]")?.dataset.open;
  if (id) openCompose(id);
});

function cupMorphHTML(item, sizeId) {
  const clear = CLEAR_CUPS.has(item.id) && item.sizes.length > 1;
  if (!clear) return imgTag(item.img, item.name);
  /* Prefer the item's own photo; fall back to iced-latte scale morph */
  const src = item.img || CUP[sizeId] || CUP.m;
  return `<div class="cup-morph" data-size="${sizeId}" id="cupMorph">
      <img src="${src}" alt="${item.name} ${sizeId}" />
      <span class="cup-morph__label" id="cupMorphLabel">${SIZE_NOTE[sizeId] || ""}</span>
    </div>`;
}

function syncCupMorph() {
  const morph = document.getElementById("cupMorph");
  if (!morph || !draft) return;
  morph.dataset.size = draft.size;
  const lab = document.getElementById("cupMorphLabel");
  if (lab) lab.textContent = SIZE_NOTE[draft.size] || "";
}

function openCompose(id) {
  const item = findItem(id);
  if (!item) return;
  closeCart();
  closePay();
  closeAuth();
  draft = {
    id,
    size: item.sizes[Math.min(1, item.sizes.length - 1)].id,
    milk: item.milky ? "dairy" : null,
    extras: [],
    qty: 1,
  };
  sheetBody.innerHTML = `
    <button type="button" class="compose__x" data-close aria-label="Kapat">×</button>
    <div class="compose__media">${cupMorphHTML(item, draft.size)}</div>
    <div class="compose__scroll" id="composeScroll">
      <p class="eyebrow">Kurulum</p>
      <h3>${item.name}</h3>
      <p class="compose__desc">${item.desc}${CLEAR_CUPS.has(item.id) ? " · Şeffaf soğuk bardak." : ""}</p>

      <p class="seg-label">Boy</p>
      <div class="seg" role="radiogroup" aria-label="Boy">
        ${item.sizes.map((s) => `
          <label class="${s.id === draft.size ? "is-on" : ""}">
            <input type="radio" name="size" value="${s.id}" ${s.id === draft.size ? "checked" : ""} />
            <b>${s.name}</b>
            <i>${MONEY(item.base * s.mult)}</i>
          </label>`).join("")}
      </div>

      ${item.milky ? `
      <p class="seg-label">Süt</p>
      <div class="seg seg--wrap" role="radiogroup">
        ${MILKS.map((m) => `
          <label class="${m.id === draft.milk ? "is-on" : ""}">
            <input type="radio" name="milk" value="${m.id}" ${m.id === draft.milk ? "checked" : ""} />
            <b>${m.name}</b>
            <i>${m.price ? "+" + MONEY(m.price) : "dahil"}</i>
          </label>`).join("")}
      </div>` : ""}

      ${item.extras ? `
      <p class="seg-label">Ekstra</p>
      <div class="pills">
        ${EXTRAS.map((x) => `
          <label>
            <input type="checkbox" name="extra" value="${x.id}" />
            <span>${x.name}${x.price ? ` · +${MONEY(x.price)}` : ""}</span>
          </label>`).join("")}
      </div>` : ""}

      <div class="compose__qty">
        <span>Adet</span>
        <div>
          <button type="button" data-qty="-1">−</button>
          <strong id="qtyVal">1</strong>
          <button type="button" data-qty="1">+</button>
        </div>
      </div>
    </div>
    <div class="compose__foot">
      <strong id="sheetTotal">${MONEY(linePrice(draft))}</strong>
      <button type="button" class="btn" id="addBtn">Fişe yaz</button>
    </div>`;

  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
  syncLock();
  trapWheel(document.getElementById("composeScroll"));
  bindCompose();
}

function refreshPrice() {
  const el = document.getElementById("sheetTotal");
  const q = document.getElementById("qtyVal");
  if (el) el.textContent = MONEY(linePrice(draft));
  if (q) q.textContent = String(draft.qty);
}

function bindCompose() {
  const syncSeg = (name) => {
    sheetBody.querySelectorAll(`input[name="${name}"]`).forEach((inp) => {
      inp.closest("label")?.classList.toggle("is-on", inp.checked);
    });
  };
  sheetBody.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeCompose));
  sheetBody.querySelectorAll('input[name="size"]').forEach((inp) => {
    inp.addEventListener("change", () => {
      draft.size = inp.value;
      syncSeg("size");
      syncCupMorph();
      refreshPrice();
    });
  });
  sheetBody.querySelectorAll('input[name="milk"]').forEach((inp) => {
    inp.addEventListener("change", () => { draft.milk = inp.value; syncSeg("milk"); refreshPrice(); });
  });
  sheetBody.querySelectorAll('input[name="extra"]').forEach((inp) => {
    inp.addEventListener("change", () => {
      draft.extras = [...sheetBody.querySelectorAll('input[name="extra"]:checked')].map((x) => x.value);
      refreshPrice();
    });
  });
  sheetBody.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      draft.qty = Math.max(1, Math.min(12, draft.qty + Number(btn.dataset.qty)));
      refreshPrice();
    });
  });
  document.getElementById("addBtn")?.addEventListener("click", () => {
    const item = findItem(draft.id);
    const size = item.sizes.find((s) => s.id === draft.size);
    cart.push({
      ...draft,
      name: item.name,
      sizeLabel: size.name,
      milkLabel: item.milky ? MILKS.find((m) => m.id === draft.milk)?.name : null,
      unit: linePrice({ ...draft, qty: 1 }),
      key: `${draft.id}-${Date.now()}`,
    });
    closeCompose();
    renderCart();
    pulseDock();
  });
}

function closeCompose() {
  if (!sheet.classList.contains("is-open")) return;
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  draft = null;
  syncLock();
}

function renderCart() {
  const n = cart.reduce((a, l) => a + l.qty, 0);
  const sum = cartSum();
  cartBar.hidden = !(n > 0 && success.hidden);
  cartCount.textContent = String(n);
  cartTotal.textContent = MONEY(sum);
  cartPanelTotal.textContent = MONEY(sum);

  if (!cart.length) {
    cartList.innerHTML = `<p class="ticket-cart__empty">Fiş boş.</p>`;
    return;
  }
  cartList.innerHTML = cart.map((line) => {
    const bits = [line.sizeLabel, line.milkLabel, ...(line.extras || []).map((id) => EXTRAS.find((e) => e.id === id)?.name)].filter(Boolean).join(" · ");
    return `<article data-key="${line.key}">
      <div>
        <strong>${line.name}</strong>
        <p>${bits}</p>
        <div class="compose__qty compose__qty--sm">
          <div>
            <button type="button" data-cqty="-1">−</button>
            <strong>${line.qty}</strong>
            <button type="button" data-cqty="1">+</button>
          </div>
        </div>
      </div>
      <div class="ticket-cart__right">
        <span>${MONEY(line.unit * line.qty)}</span>
        <button type="button" data-rm>Sil</button>
      </div>
    </article>`;
  }).join("");

  cartList.querySelectorAll("article").forEach((row) => {
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
  closeCompose();
  closePay();
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
  closeCompose();
  cartPanel.classList.remove("is-open");
  pay.hidden = false;
  pay.classList.add("is-open");
  payMethod = "card";
  payPhase = 1;
  renderPay1();
  syncLock();
}

function closePay() {
  if (pay.hidden) return;
  pay.classList.remove("is-open");
  pay.hidden = true;
  syncLock();
}

function renderPay1() {
  document.getElementById("payTitle").textContent = "Ödeme yolu";
  const tip = window.__izdenPay?.tip || 0;
  payBody.innerHTML = `
    <div class="checkout__scroll" id="payScroll">
      <p class="checkout__amount">${MONEY(cartSum() + tip)}</p>
      <div class="ways">
        <button type="button" class="way ${payMethod === "card" ? "is-on" : ""}" data-way="card">
          <strong>Kart</strong><span>Demo · anında onay</span>
        </button>
        <button type="button" class="way ${payMethod === "counter" ? "is-on" : ""}" data-way="counter">
          <strong>Kasada</strong><span>Nakit / POS · bar’da</span>
        </button>
      </div>
      <label class="field">
        <span>Çağrı adı</span>
        <input id="payPickup" type="text" maxlength="32" placeholder="Barista seni nasıl çağırsın" />
      </label>
      <p class="seg-label">Bahşiş</p>
      <div class="seg tip-seg">
        ${[0, 15, 25, 40].map((t) => `
          <label class="${t === tip ? "is-on" : ""}">
            <input type="radio" name="tip" value="${t}" ${t === tip ? "checked" : ""} />
            <b>${t ? MONEY(t) : "Yok"}</b>
          </label>`).join("")}
      </div>
      <button type="button" class="btn btn--block" id="payNext">İlerle</button>
    </div>`;
  trapWheel(document.getElementById("payScroll"));
  payBody.querySelectorAll("[data-way]").forEach((b) => b.addEventListener("click", () => {
    payMethod = b.dataset.way;
    window.__izdenPay = { ...(window.__izdenPay || {}), tip: Number(payBody.querySelector('input[name="tip"]:checked')?.value || 0) };
    renderPay1();
  }));
  payBody.querySelectorAll('input[name="tip"]').forEach((inp) => {
    inp.addEventListener("change", () => {
      window.__izdenPay = { ...(window.__izdenPay || {}), tip: Number(inp.value) };
      renderPay1();
      document.getElementById("payPickup").value = window.__izdenPay.pickup || "";
    });
  });
  document.getElementById("payNext")?.addEventListener("click", () => {
    const pickup = document.getElementById("payPickup")?.value.trim();
    if (!pickup) return document.getElementById("payPickup")?.focus();
    const tipVal = Number(payBody.querySelector('input[name="tip"]:checked')?.value || 0);
    window.__izdenPay = { pickup, tip: tipVal };
    if (payMethod === "counter") return finishOrder({ pickup, tip: tipVal, method: "counter" });
    payPhase = 2;
    renderPay2();
  });
}

function renderPay2() {
  document.getElementById("payTitle").textContent = "Kart";
  const tip = window.__izdenPay?.tip || 0;
  payBody.innerHTML = `
    <form class="checkout__scroll" id="payForm">
      <p class="checkout__amount">${MONEY(cartSum() + tip)}</p>
      <div class="card-face">
        <span id="pvNum">•••• •••• •••• ••••</span>
        <em id="pvName">IZDEN</em>
      </div>
      <label class="field"><span>İsim</span><input name="name" required maxlength="48" autocomplete="cc-name" /></label>
      <label class="field"><span>Numara</span><input name="card" required inputmode="numeric" maxlength="19" autocomplete="cc-number" placeholder="4242 4242 4242 4242" /></label>
      <div class="field-row">
        <label class="field"><span>SKT</span><input name="exp" required inputmode="numeric" maxlength="5" placeholder="AA/YY" /></label>
        <label class="field"><span>CVC</span><input name="cvc" required inputmode="numeric" maxlength="4" /></label>
      </div>
      <p class="pay-note">Demo — gerçek tahsilat yok.</p>
      <button class="btn btn--block" type="submit">Onayla</button>
    </form>`;
  const form = document.getElementById("payForm");
  trapWheel(form);
  form.card.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    document.getElementById("pvNum").textContent = e.target.value || "•••• •••• •••• ••••";
  });
  form.name.addEventListener("input", (e) => {
    document.getElementById("pvName").textContent = e.target.value.trim().toUpperCase() || "IZDEN";
  });
  form.exp.addEventListener("input", (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });
  form.cvc.addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    payPhase = 3;
    payBody.innerHTML = `<div class="brew"><div class="brew__ring"></div><p class="eyebrow">Demleniyor</p><h3>Onaylanıyor…</h3></div>`;
    await new Promise((r) => setTimeout(r, 1400));
    finishOrder({ pickup: window.__izdenPay.pickup, tip: window.__izdenPay.tip || 0, method: "card" });
  });
}

function finishOrder({ pickup, tip, method }) {
  const total = cartSum() + tip;
  const code = `IZD-${1000 + Math.floor(Math.random() * 9000)}`;
  const eta = Math.max(3, Math.min(12, 2 + cart.reduce((a, l) => a + l.qty, 0) * 2));
  cart.length = 0;
  renderCart();
  closePay();
  closeCart();
  document.getElementById("successTitle").textContent = `${pickup.split(" ")[0]}, yolda`;
  document.getElementById("successBody").textContent =
    method === "counter" ? `${MONEY(total)} kasada. İsmini söyle.` : `${MONEY(total)} alındı. İsmini söyle.`;
  document.getElementById("successCode").textContent = code;
  document.getElementById("successEta").textContent = `~${eta} dk`;
  success.hidden = false;
  success.classList.add("is-open");
  syncLock();
  cartBar.hidden = true;
  burst();
}

function closeSuccess() {
  if (!success) return;
  success.classList.remove("is-open");
  success.hidden = true;
  success.setAttribute("hidden", "");
  syncLock();
  document.body.classList.remove("sheet-open");
}

function pulseDock() {
  cartBar.classList.remove("is-pulse");
  void cartBar.offsetWidth;
  cartBar.classList.add("is-pulse");
}

function burst() {
  const c = confettiCanvas;
  if (!c) return;
  const ctx = c.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  c.style.width = `${innerWidth}px`;
  c.style.height = `${innerHeight}px`;
  c.classList.add("is-on");
  const colors = ["#c4a574", "#8a6a3e", "#f3ebe0", "#3d2a1a"];
  const parts = Array.from({ length: 70 }, () => ({
    x: innerWidth * 0.5 * dpr, y: innerHeight * 0.4 * dpr,
    vx: (Math.random() - 0.5) * 10 * dpr, vy: (-5 - Math.random() * 9) * dpr,
    g: 0.2 * dpr, w: (4 + Math.random() * 5) * dpr, h: (6 + Math.random() * 6) * dpr,
    rot: Math.random(), vr: (Math.random() - 0.5) * 0.3,
    color: colors[(Math.random() * colors.length) | 0], life: 1, bean: Math.random() > 0.5,
  }));
  const t0 = performance.now();
  (function frame(t) {
    const e = (t - t0) / 1000;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life = Math.max(0, 1 - e / 2.2);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      if (p.bean) { ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (e < 2.4) requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, c.width, c.height); c.classList.remove("is-on"); }
  })(t0);
}

grid?.addEventListener("click", (e) => {
  const id = e.target.closest(".card[data-id]")?.dataset.id;
  if (id) openCompose(id);
});
backdrop?.addEventListener("click", () => { closeCompose(); closeCart(); if (!pay.hidden) { closePay(); if (cart.length) openCart(); } });
cartBar?.addEventListener("click", openCart);
document.getElementById("cartClose")?.addEventListener("click", closeCart);
document.getElementById("checkoutBtn")?.addEventListener("click", openPay);
document.getElementById("payClose")?.addEventListener("click", () => { closePay(); if (cart.length) openCart(); });
document.getElementById("payBack")?.addEventListener("click", () => {
  if (payPhase === 2) { payPhase = 1; return renderPay1(); }
  closePay(); if (cart.length) openCart();
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
  btn.addEventListener("click", () => { authMode = btn.dataset.authTab; syncAuthMode(); document.getElementById("authErr").textContent = ""; });
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
      if (err) err.textContent = "Bar için bir isim yaz.";
      return;
    }
    const user = { email, password, name, stamps: 0, createdAt: Date.now() };
    members.push(user);
    writeMembers(members);
    setSession({ email, name, stamps: 0 });
    closeAuth();
    return;
  }
  const found = members.find((m) => m.email === email && m.password === password);
  if (!found) {
    if (err) err.textContent = "E-posta veya şifre hatalı.";
    return;
  }
  setSession({ email: found.email, name: found.name, stamps: found.stamps || 0 });
  closeAuth();
});
document.addEventListener("wheel", (e) => {
  if (!document.body.classList.contains("sheet-open")) return;
  if (e.target.closest(".compose__scroll, .ticket-cart__list, .checkout__scroll, .success__card, .auth__panel")) return;
  e.preventDefault();
}, { passive: false });
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (authEl?.classList.contains("is-open")) return closeAuth();
  if (!success.hidden) return closeSuccess();
  if (!pay.hidden) {
    if (payPhase === 2) { payPhase = 1; return renderPay1(); }
    closePay(); return openCart();
  }
  closeCompose(); closeCart();
});

/* Cup showcase on page */
const cupNotes = {
  s: "12 oz — kısa şeffaf bardak. Tek yudumda net shot.",
  m: "16 oz — barın varsayılan soğuk boyu. Katmanlar en net burada okunur.",
  l: "20 oz — tall clear. Uzun yudum, bol buz, gezinti için.",
};
document.getElementById("cupShowcase")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cup]");
  if (!btn) return;
  document.querySelectorAll("#cupShowcase [data-cup]").forEach((b) => b.classList.toggle("is-on", b === btn));
  const note = document.getElementById("cupNote");
  if (note) note.textContent = cupNotes[btn.dataset.cup] || "";
});

document.getElementById("memberForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  e.currentTarget.hidden = true;
  const ok = document.getElementById("memberOk");
  if (ok) ok.hidden = false;
});

closeSuccess();
closePay();
closeCompose();
closeCart();
closeAuth();
syncAuthBtn();
renderMenu();
renderCart();
