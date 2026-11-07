import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Aydınlatma Metni — ${LEGAL.siteName}`,
  description: "6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

export default function AydinlatmaPage() {
  return (
    <LegalDoc title="Kişisel Verilerin Korunması Aydınlatma Metni">
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu
        sıfatıyla {LEGAL.controller}, işbu site ({LEGAL.siteUrl}) üzerinden toplanan kişisel
        verilerinize ilişkin sizi bilgilendirir.
      </p>

      <h2>1. Veri sorumlusu</h2>
      <p>
        {LEGAL.controller}
        <br />
        E-posta: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        <br />
        Web: <a href={LEGAL.companyUrl}>{LEGAL.companyUrl}</a>
      </p>

      <h2>2. İşlenen kişisel veriler</h2>
      <ul>
        <li>Kimlik: ad, soyad</li>
        <li>İletişim: e-posta, telefon</li>
        <li>
          Teklif formu içeriği: işletme / marka adı, sektör, hedef, stil tercihleri, bütçe
          aralığı, zaman planı, beğenilen demolar, notlar
        </li>
        <li>
          İşlem güvenliği: IP adresi, tarayıcı / cihaz bilgisi, çerez kayıtları (ayrıntılar
          Çerez Politikası’nda)
        </li>
      </ul>

      <h2>3. İşleme amaçları</h2>
      <ul>
        <li>Teklif talebinizin alınması, değerlendirilmesi ve size dönüş yapılması</li>
        <li>İletişim taleplerinin yanıtlanması</li>
        <li>Site güvenliği, performans ve zorunlu işlevlerin sağlanması</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>4. Hukuki sebepler</h2>
      <p>
        Veriler; KVKK m.5/2 kapsamında sözleşmenin kurulması veya ifasıyla doğrudan ilgili
        olması, meşru menfaatimiz ve açık rızanız (ör. isteğe bağlı çerezler) hukuki
        sebeplerine dayanılarak işlenebilir.
      </p>

      <h2>5. Aktarım</h2>
      <p>
        Verileriniz; barındırma / e-posta iletim hizmetleri (ör. Formspree, bulut altyapı) ve
        yasal zorunluluk halinde yetkili kamu kurumlarıyla, KVKK’ya uygun şekilde
        paylaşılabilir. Yurt dışı aktarım söz konusu olursa gerekli güvenceler sağlanır.
      </p>

      <h2>6. Saklama süresi</h2>
      <p>
        Teklif ve iletişim kayıtları, talebin sonuçlanması ve olası uyuşmazlık süreleri
        gözetilerek makul süre boyunca; çerez verileri politikada belirtilen sürelerle saklanır.
        Süre bitiminde silinir, yok edilir veya anonim hale getirilir.
      </p>

      <h2>7. Haklarınız</h2>
      <p>
        KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme,
        itiraz ve zararınızın giderilmesini talep etme haklarına sahipsiniz. Başvurularınızı{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> adresine iletebilirsiniz.
      </p>
    </LegalDoc>
  );
}
