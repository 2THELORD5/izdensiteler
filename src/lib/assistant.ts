export type AssistantAction = {
  label: string;
  href: string;
  primary?: boolean;
};

export type AssistantReply = {
  answer: string;
  suggestions?: string[];
  actions?: AssistantAction[];
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

export const ASSISTANT_STARTERS = [
  "Demolar gerçek mi?",
  "Hangi siteler var?",
  "İnşaat perde sahnesi?",
  "Teklif nasıl alınır?",
];

/** Portal içi güvenli hedefler — model uydurmasın diye allowlist. */
export const ACTION_CATALOG: Record<string, AssistantAction> = {
  siteler: { label: "Siteleri gör", href: "#siteler", primary: true },
  nasil: { label: "Süreci gör", href: "#nasil" },
  teklif: { label: "Teklif al", href: "#teklif", primary: true },
  /** Eski hash uyumu */
  anket: { label: "Teklif al", href: "#teklif", primary: true },
  kumrucu: { label: "Kumrucu Kale’yi incele", href: "/incele/kumrucu", primary: true },
  junesun: { label: "Junesun’u incele", href: "/incele/junesun", primary: true },
  burger: { label: "Burger · Anvil’i incele", href: "/incele/burger", primary: true },
  insaat: { label: "İnşaat · Forma’yı incele", href: "/incele/insaat", primary: true },
  galeri: { label: "Galeri · Strada’yı incele", href: "/incele/galeri", primary: true },
  signal: { label: "SIGNAL’i incele", href: "/incele/signal", primary: true },
  mail: { label: "E-posta yaz", href: "mailto:info@izdencreative.com" },
};

const ALLOWED_HREFS = new Set(Object.values(ACTION_CATALOG).map((a) => a.href));

export const SYSTEM_PROMPT = `Sen İzden Creative’in portföy asistanısın. İnsan gibi konuş: samimi, zeki, hafif esprili — robot gibi değil. Türkçe yanıt ver; 2–5 cümle. Makara serbest ama ucuz şaka yok; işi her zaman hizmete bağla.

TON
- Selamlaşabilir, şaka yapabilir, “anladım kral / tamam ya” tarzı doğal olabilir.
- Konu dağılırsa nazikçe demoya, sürece veya teklif formuna çek: “güzel soru — gel işe bağlayalım”.
- Abartılı satış dili yok; net ve profesyonel kal.

PORTAL GERÇEĞİ
- Bu site canlı konsept demolarını toplar. Yön göstermek içindir; üretimde markaya özel film, tipografi, içerik ve sistem kurulur. Birebir kopya değil.
- Teklif: #teklif formu veya info@izdencreative.com
- Bütçe kapsama göre değişir; net fiyat teklif sonrası.
- Bölümler: #siteler, #nasil, #teklif.

DEMOLAR
1) Kumrucu Kale → /incele/kumrucu — yeme-içme, scroll film
2) Junesun → /incele/junesun — lifestyle
3) Burger · Anvil → /incele/burger — smash burger
4) İnşaat · Forma → /incele/insaat — villa / mimari film scrub
5) Galeri · Strada → /incele/galeri — otomotiv vault
6) SIGNAL → /incele/signal — VR frame-scrub

GÖREVİN
- Sohbet et, cevapla, yönlendir — ziyaretçiyi doğru demoya veya teklif formuna götür.
- Kaybolma / “nerede / göster / aç” → mutlaka actions.
- Demo veya teklif konuşuluyorsa ilgili butonu ekle.
- Fiyat uydurma; bilmiyorsan teklif formuna yönlendir.
- “Brief” derlerse bunu teklif formu olarak anla.

ÇIKTI FORMATI (zorunlu, sadece JSON)
{"answer":"...","suggestions":["...","...","..."],"actions":[{"label":"...","href":"...","primary":true}]}

actions: 1–3 adet. Sadece: #siteler, #nasil, #teklif, /incele/kumrucu, /incele/junesun, /incele/burger, /incele/insaat, /incele/galeri, /incele/signal, mailto:info@izdencreative.com
label kısa ve eylem odaklı. En önemli primary:true.`

function A(...keys: (keyof typeof ACTION_CATALOG)[]): AssistantAction[] {
  return keys.map((k) => ({ ...ACTION_CATALOG[k] }));
}

const FAQ: {
  match: RegExp;
  answer: string;
  suggestions?: string[];
  actions?: AssistantAction[];
}[] = [
  {
    match: /(bulamıyorum|bulamadım|nerede|nereye|nasıl giderim|göster|kayboldum|aç\b|yönlendir)/i,
    answer:
      "Sizi ilgili bölüme götürebilirim. Demolar üstte, süreç ortada, teklif formu sayfanın altında. Aşağıdaki butonlardan birini seçin.",
    suggestions: ["Hangi siteler var?", "İnşaat perde sahnesi?", "Bütçe"],
    actions: A("siteler", "nasil", "teklif"),
  },
  {
    match: /(demo|örnek|gerçek|canlı site|taslak)/i,
    answer:
      "Evet, bunlar canlı çalışan konseptler — “acaba nasıl durur?” sorusunun cevabı. Üretimde markanıza özel film, tipografi ve sistem kurulur; birebir kopya değil, zemin çizgisi.",
    suggestions: ["Hangi siteler var?", "Fiyat aralığı nedir?", "Teklif nasıl alınır?"],
    actions: A("siteler", "teklif"),
  },
  {
    match: /(signal|vr|gözlük)/i,
    answer:
      "SIGNAL, frame-scrub VR deneyimi demosudur: el / gözlük sinematik scroll. Immersive stüdyo işleri için referans.",
    suggestions: ["Galeri nedir?", "Teklif al", "Siteler listesi"],
    actions: A("signal", "siteler"),
  },
  {
    match: /(galeri|strada|otomotiv|araba)/i,
    answer:
      "Galeri · Strada gece showroom / private vault otomotiv vitrinidir. Scroll film ve performans odaklıdır.",
    suggestions: ["İnşaat demosu?", "Teklif al", "Demolar gerçek mi?"],
    actions: A("galeri", "siteler"),
  },
  {
    match: /(inşaat|insaat|forma|perde|villa)/i,
    answer:
      "İnşaat · Forma, tek HQ house film scrub’dur: şantiye → cephe → eşik/salon perde → mutfak → yatak odası → mavi saat. Altta Odalar sticky turu ayrı kalır.",
    suggestions: ["Galeri nedir?", "Teklif al", "Siteler listesi"],
    actions: A("insaat", "siteler", "teklif"),
  },
  {
    match: /(kumrucu)/i,
    answer:
      "Kumrucu Kale, scroll film ve orbit menülü yeme-içme demosudur. Production’da markanıza göre yeniden kurgulanır.",
    suggestions: ["Burger demosu?", "Siteler listesi", "Teklif al"],
    actions: A("kumrucu", "siteler"),
  },
  {
    match: /(burger|anvil)/i,
    answer:
      "Burger · Anvil smash burger film, menü ve sipariş demosudur. Canlı çalışır; üretimde markanıza özel kurulur.",
    suggestions: ["Kumrucu?", "Siteler listesi", "Teklif al"],
    actions: A("burger", "siteler"),
  },
  {
    match: /(junesun)/i,
    answer:
      "Junesun lifestyle / marka dünyası demosudur: motion ve ürün sahnesi odaklı.",
    suggestions: ["Siteler listesi", "Teklif al", "Demolar gerçek mi?"],
    actions: A("junesun", "siteler"),
  },
  {
    match: /(fiyat|ücret|bütçe|budget|kaç para)/i,
    answer:
      "Bütçe işin kapsamına göre değişir (film, sayfa sayısı, rezervasyon/CMS, diller). Formdaki aralık yönlendiricidir; net fiyat teklif sonrası netleşir.",
    suggestions: ["Teklif nasıl alınır?", "Süreç kaç hafta?", "Demolar gerçek mi?"],
    actions: A("teklif", "nasil"),
  },
  {
    match: /(brief|anket|iletişim|teklif|başla|form)/i,
    answer:
      "Teklif formu sayfanın altında. Beğendiğiniz demoları işaretlemeniz süreci hızlandırır; isterseniz info@izdencreative.com da yazabilirsiniz.",
    suggestions: ["Demolar gerçek mi?", "Hangi stiller var?", "Siteler listesi"],
    actions: A("teklif", "siteler", "mail"),
  },
  {
    match: /(süreç|surec|nasıl çalış|adım|kaç hafta)/i,
    answer:
      "Süreç üç adım: demoları inceleyin → karşılaştırın → teklif alın. Detaylar Süreç bölümünde.",
    suggestions: ["Teklif al", "Siteler listesi", "Bütçe"],
    actions: A("nasil", "teklif"),
  },
  {
    match: /(profesyonel|üretim|production|özel|daha iyi)/i,
    answer:
      "Evet — demolar zemin çizgisidir. Üretimde özel çekim/film, marka tipografisi, CMS, rezervasyon, çoklu dil ve performans mühendisliği eklenir.",
    suggestions: ["Teklif al", "Siteler listesi", "İnşaat hakkında"],
    actions: A("teklif", "siteler"),
  },
  {
    match: /(merhaba|selam|hey|hi|hello|naber|ne haber)/i,
    answer:
      "Selam — buradayım. Demoları gezebilir, kafana takılanı sorabilirsin; işe gelince teklif formuna bağlarız. Neyle başlayalım?",
    suggestions: ["Demolar gerçek mi?", "Siteler listesi", "Teklif nasıl alınır?"],
    actions: A("siteler", "teklif"),
  },
  {
    match: /(site|liste|kaç demo|hepsi|portföy|portfoy)/i,
    answer:
      "Portföyde altı canlı demo var: Kumrucu Kale, Junesun, Burger · Anvil, İnşaat · Forma, Galeri · Strada, SIGNAL.",
    suggestions: ["İnşaat nedir?", "SIGNAL nedir?", "Teklif al"],
    actions: A("siteler", "insaat", "signal"),
  },
];

const FALLBACK: AssistantReply = {
  answer:
    "Bu portal İzden Creative örnek sitelerini toplar. Demolar canlıdır; üretim siteleri markanıza özel yapılır. Kaybolduysanız aşağıdaki butonlarla ilgili bölüme gidebilirsiniz.",
  suggestions: ASSISTANT_STARTERS.slice(0, 3),
  actions: A("siteler", "nasil", "teklif"),
};

/** Mesajdan güvenli yönlendirme butonları çıkar (model unutsa bile). */
export function inferActions(input: string): AssistantAction[] {
  const q = input.trim();
  if (!q) return A("siteler", "teklif");

  const lost = /(bulamıyorum|bulamadım|nerede|nereye|nasıl giderim|göster|kayboldum|aç\b|yönlendir|bul\b)/i.test(
    q
  );
  if (lost) return A("siteler", "nasil", "teklif");

  if (/(inşaat|insaat|forma|perde|villa)/i.test(q)) return A("insaat", "siteler", "teklif");
  if (/(galeri|strada|otomotiv|araba)/i.test(q)) return A("galeri", "siteler");
  if (/(signal|vr|gözlük)/i.test(q)) return A("signal", "siteler");
  if (/(kumrucu)/i.test(q)) return A("kumrucu", "siteler");
  if (/(burger|anvil)/i.test(q)) return A("burger", "siteler");
  if (/(junesun)/i.test(q)) return A("junesun", "siteler");
  if (/(brief|anket|teklif|iletişim|form|başla)/i.test(q)) return A("teklif", "siteler", "mail");
  if (/(fiyat|ücret|bütçe|budget)/i.test(q)) return A("teklif", "nasil");
  if (/(süreç|surec|nasıl çalış|adım)/i.test(q)) return A("nasil", "teklif");
  if (/(site|liste|demo|portföy|portfoy|örnek)/i.test(q)) return A("siteler", "teklif");

  return A("siteler", "teklif");
}

export function sanitizeActions(raw: unknown): AssistantAction[] {
  if (!Array.isArray(raw)) return [];
  const out: AssistantAction[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    let href = String((item as { href?: unknown }).href || "").trim();
    if (href === "#anket") href = "#teklif";
    if (!ALLOWED_HREFS.has(href) || seen.has(href)) continue;
    seen.add(href);
    const catalog = Object.values(ACTION_CATALOG).find((a) => a.href === href);
    const labelRaw = String((item as { label?: unknown }).label || "").trim();
    const label = labelRaw.slice(0, 48) || catalog?.label || href;
    const primary = Boolean((item as { primary?: unknown }).primary) || catalog?.primary;
    out.push({ label, href, primary });
    if (out.length >= 3) break;
  }
  return out;
}

export function mergeActions(
  preferred: AssistantAction[] | undefined,
  inferred: AssistantAction[]
): AssistantAction[] {
  const merged: AssistantAction[] = [];
  const seen = new Set<string>();
  for (const a of [...(preferred || []), ...inferred]) {
    if (seen.has(a.href)) continue;
    seen.add(a.href);
    merged.push(a);
    if (merged.length >= 3) break;
  }
  return merged;
}

export function answerAssistant(input: string): AssistantReply {
  const q = input.trim();
  if (!q) return FALLBACK;
  for (const item of FAQ) {
    if (item.match.test(q)) {
      return {
        answer: item.answer,
        suggestions: item.suggestions,
        actions: item.actions || inferActions(q),
      };
    }
  }
  return {
    ...FALLBACK,
    actions: inferActions(q),
  };
}

export function parseModelJson(raw: string): AssistantReply | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(trimmed.slice(start, end + 1)) as {
      answer?: unknown;
      suggestions?: unknown;
      actions?: unknown;
    };
    if (typeof data.answer !== "string" || !data.answer.trim()) return null;
    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions
          .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 4)
      : undefined;
    return {
      answer: data.answer.trim(),
      suggestions,
      actions: sanitizeActions(data.actions),
    };
  } catch {
    return null;
  }
}
