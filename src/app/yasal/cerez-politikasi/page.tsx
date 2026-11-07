import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Çerez Politikası — ${LEGAL.siteName}`,
  description: "İzden Siteler çerez (cookie) politikası.",
};

export default function CerezPage() {
  return (
    <LegalDoc title="Çerez Politikası">
      <p>
        Bu Çerez Politikası, {LEGAL.siteName} sitesinde kullanılan çerezleri ve benzeri
        teknolojileri açıklar. Kişisel veriler bakımından ayrıca{" "}
        <Link href="/yasal/aydinlatma">Aydınlatma Metni</Link> geçerlidir.
      </p>

      <h2>1. Çerez nedir?</h2>
      <p>
        Çerezler, tarayıcınızda saklanan küçük metin dosyalarıdır. Siteyi çalıştırmak,
        tercihleri hatırlamak veya (izin verirseniz) kullanımı anlamak için kullanılır.
      </p>

      <h2>2. Kullandığımız çerez türleri</h2>
      <ul>
        <li>
          <strong>Zorunlu çerezler:</strong> Güvenlik, oturum ve çerez tercihinin kaydı
          (ör. <code>izden-cookie-consent-v1</code>). Bunlar olmadan temel işlevler
          sunulamaz.
        </li>
        <li>
          <strong>İşlevsel çerezler:</strong> Arayüz tercihleri ve benzeri deneyim
          iyileştirmeleri.
        </li>
        <li>
          <strong>Analitik çerezler (isteğe bağlı):</strong> Yalnızca “Kabul et”
          seçildiğinde etkinleştirilebilir; trafik ve performans ölçümü içindir.
        </li>
      </ul>

      <h2>3. Üçüncü taraf</h2>
      <p>
        Barındırma (ör. Vercel) ve form / e-posta iletimi gibi hizmetler kendi teknik
        çerezlerini kullanabilir. Bu sağlayıcıların politikaları ayrıca geçerlidir.
      </p>

      <h2>4. Yönetim</h2>
      <p>
        İlk ziyarette çerez bandından “Kabul et” veya “Yalnızca zorunlu” seçebilirsiniz.
        Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz; zorunlu
        çerezlerin engellenmesi site işlevlerini bozabilir.
      </p>

      <h2>5. İletişim</h2>
      <p>
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>
    </LegalDoc>
  );
}
