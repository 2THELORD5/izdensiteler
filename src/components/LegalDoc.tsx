import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalDoc({ title, children }: Props) {
  return (
    <div className="legal-page">
      <header className="legal-bar">
        <Link href="/" className="legal-brand" aria-label="İzden Siteler ana sayfa">
          <Logo variant="light" className="legal-logo" />
        </Link>
        <nav className="legal-nav" aria-label="Yasal metinler">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/#teklif" className="btn-primary compact">
          Teklif al
        </Link>
      </header>

      <main className="legal-main">
        <p className="eyebrow">Yasal</p>
        <h1>{title}</h1>
        <p className="legal-meta">
          {LEGAL.brand} · Son güncelleme: {LEGAL.updatedAt}
        </p>
        <div className="legal-body">{children}</div>
      </main>

      <footer className="legal-foot">
        <p>
          Sorularınız için{" "}
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>
        <Link href="/">Portala dön</Link>
      </footer>
    </div>
  );
}
