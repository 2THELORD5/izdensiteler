"use client";

import Link from "next/link";
import { Logo } from "./Logo";

export function SiteNav() {
  return (
    <header className="nav-shell">
      <Link href="/" className="nav-brand" aria-label="İzden Siteler ana sayfa">
        <Logo variant="white" className="nav-logo" priority />
      </Link>
      <nav className="nav-links">
        <a href="#siteler">Siteler</a>
        <a href="#nasil">Nasıl çalışır</a>
        <a href="#teklif" className="nav-cta">
          Teklif al
        </a>
      </nav>
    </header>
  );
}
