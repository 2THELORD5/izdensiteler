import Link from "next/link";
import { Logo } from "./Logo";
import { LEGAL_LINKS } from "@/lib/legal";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Logo variant="white" className="footer-logo" />
        <p>İzden Creative · örnek site portalı</p>
      </div>
      <div className="footer-meta">
        <a href="https://izdencreative.com" target="_blank" rel="noreferrer">
          izdencreative.com
        </a>
        <a href="mailto:info@izdencreative.com">info@izdencreative.com</a>
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
