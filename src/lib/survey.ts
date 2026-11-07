export type SurveyAnswers = {
  businessName: string;
  sector: string;
  goal: string;
  stylePrefs: string[];
  likedSites: string[];
  budget: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export const SECTORS = [
  "Restoran / Kafe",
  "Burger / Fast food",
  "Hospitality / Bar",
  "İnşaat / Mimari",
  "Galeri / Otomotiv",
  "Teknoloji / Konsept",
  "Perakende",
  "Kurumsal hizmet",
  "Diğer",
];

export const GOALS = [
  "Markayı premium göstermek",
  "Rezervasyon / sipariş",
  "Portföy ve proje vitrini",
  "Lansman / kampanya",
  "Kurumsal tanıtım",
];

export const STYLES = [
  "Sinematik scroll film",
  "Minimal / tipografik",
  "Sıcak gastronomi",
  "Kurumsal ciddi",
  "Editöryal / galeri",
  "HUD / ürün konsepti",
  "Motion ağırlıklı",
];

export const BUDGETS = [
  "15–30 bin ₺",
  "30–60 bin ₺",
  "60–100 bin ₺",
  "100 bin ₺+",
  "Henüz net değil",
];

export const TIMELINES = [
  "2–3 hafta",
  "1 ay",
  "1–2 ay",
  "Esnek",
];

export const emptySurvey = (): SurveyAnswers => ({
  businessName: "",
  sector: "",
  goal: "",
  stylePrefs: [],
  likedSites: [],
  budget: "",
  timeline: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
});
