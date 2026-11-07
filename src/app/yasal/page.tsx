import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/LegalDoc";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Yasal — ${LEGAL.siteName}`,
  description: "KVKK aydınlatma, gizlilik, çerez ve kullanım koşulları.",
};

export default function YasalIndexPage() {
  return (
    <LegalDoc title="Yasal metinler">
      <p>
        Aşağıdaki belgeler {LEGAL.siteName} portalının şeffaf ve mevzuata uygun işletimi
        içindir.
      </p>
      <ul>
        {LEGAL_LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </LegalDoc>
  );
}
