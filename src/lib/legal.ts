/** Site sahibi — yasal metinlerde ortak. */
export const LEGAL = {
  brand: "İzden Creative",
  siteName: "İzden Siteler",
  siteUrl: "https://izdensiteler.vercel.app",
  companyUrl: "https://www.izdencreative.com",
  email: "info@izdencreative.com",
  /** Güncelleme tarihi (görünen metin) */
  updatedAt: "7 Kasım 2026",
  /** Veri sorumlusu unvanı */
  controller: "İzden Creative",
} as const;

export const LEGAL_LINKS = [
  { href: "/yasal/aydinlatma", label: "Aydınlatma Metni" },
  { href: "/yasal/gizlilik", label: "Gizlilik Politikası" },
  { href: "/yasal/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/yasal/kullanim-kosullari", label: "Kullanım Koşulları" },
] as const;
