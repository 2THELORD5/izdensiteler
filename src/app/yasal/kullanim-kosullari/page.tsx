import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Kullanım Koşulları — ${LEGAL.siteName}`,
  description: "İzden Siteler kullanım koşulları.",
};

export default function KullanimKosullariPage() {
  return (
    <LegalDoc title="Kullanım Koşulları">
      <p>
        {LEGAL.siteName} portalını (“Site”) kullanarak aşağıdaki koşulları kabul etmiş
        sayılırsınız. Kabul etmiyorsanız Site’yi kullanmayınız.
      </p>

      <h2>1. Amaç</h2>
      <p>
        Site, {LEGAL.brand} tarafından sunulan örnek / konsept web demolarını
        incelemeniz ve teklif talebi bırakmanız içindir. Demolar yön göstermek amacıyla
        hazırlanmıştır; üretim teslimi demoya birebir kopya değildir.
      </p>

      <h2>2. Fikri mülkiyet</h2>
      <p>
        Site içeriği, demolar, filmler, tipografi ve marka unsurları {LEGAL.brand} veya
        lisans verenlerine aittir. İzinsiz kopyalama, çoğaltma veya ticari kullanım
        yasaktır.
      </p>

      <h2>3. Kullanıcı yükümlülükleri</h2>
      <ul>
        <li>Form ve asistanı hukuka aykırı, yanıltıcı veya zararlı içerikle kullanmamak</li>
        <li>Site güvenliğini veya erişimini bozacak girişimlerde bulunmamak</li>
        <li>Başkalarına ait kişisel verileri izinsiz paylaşmamak</li>
      </ul>

      <h2>4. Teklif talepleri</h2>
      <p>
        Form gönderimi bağlayıcı sözleşme oluşturmaz. Teklif; kapsam, süre ve ücret
        netleştikten sonra ayrıca yazılı olarak sunulur.
      </p>

      <h2>5. Sorumluluk sınırlaması</h2>
      <p>
        Site “olduğu gibi” sunulur. Demoların kesintisiz veya hatasız çalışacağı garanti
        edilmez. Dolaylı zararlardan {LEGAL.brand} sorumlu tutulamaz; zorunlu tüketici
        hakları saklıdır.
      </p>

      <h2>6. Uygulanacak hukuk</h2>
      <p>
        Anlaşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır; yetkili mahkemeler İzmir
        mahkemeleri ve icra daireleridir (zorunlu tüketici hükümleri saklıdır).
      </p>

      <h2>7. İletişim</h2>
      <p>
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>
    </LegalDoc>
  );
}
