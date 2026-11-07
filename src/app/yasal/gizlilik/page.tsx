import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Gizlilik Politikası — ${LEGAL.siteName}`,
  description: "İzden Siteler gizlilik politikası.",
};

export default function GizlilikPage() {
  return (
    <LegalDoc title="Gizlilik Politikası">
      <p>
        Bu politika, {LEGAL.siteName} portalını ziyaret ettiğinizde kişisel verilerinizin
        nasıl toplandığını, kullanıldığını ve korunduğunu özetler. Ayrıntılı KVKK bilgilendirmesi
        için <Link href="/yasal/aydinlatma">Aydınlatma Metni</Link>’ne bakınız.
      </p>

      <h2>1. Topladığımız bilgiler</h2>
      <p>
        Teklif formuna girdiğiniz bilgiler, asistan sohbetinde paylaştığınız mesajlar ve
        teknik günlük kayıtları (güvenlik / performans) toplanabilir.
      </p>

      <h2>2. Kullanım</h2>
      <p>
        Bilgiler yalnızca teklif hazırlama, iletişim ve site işletimi için kullanılır;
        izniniz olmadan pazarlama listelerine satılmaz veya üçüncü taraflara ticari amaçla
        verilmez.
      </p>

      <h2>3. Güvenlik</h2>
      <p>
        Makul teknik ve idari tedbirler uygulanır. İnternet üzerinden iletimde mutlak güvenlik
        garanti edilemez; hassas bilgileri form dışında paylaşmamanızı öneririz.
      </p>

      <h2>4. Çocuklar</h2>
      <p>
        Portal, 18 yaş altı kişilere yönelik değildir. Bilerek çocuk verisi toplamayız.
      </p>

      <h2>5. Değişiklikler</h2>
      <p>
        Politika güncellenebilir. Güncel sürüm bu sayfada yayımlanır; önemli değişikliklerde
        makul duyuru yapılır.
      </p>

      <h2>6. İletişim</h2>
      <p>
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>
    </LegalDoc>
  );
}
