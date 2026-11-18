"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import GlyphPortal from "@/components/ui/glyph-portal";
import { WebShotButton } from "@/components/ui/web-shot-button";
import { FILM_SITES, MOTION_SITES, siteEmbedSrc, type Site } from "@/lib/sites";
import { Logo } from "@/components/Logo";
import { SurveyForm } from "@/components/SurveyForm";
import { AiAssistant } from "@/components/AiAssistant";

const GLYPH_FACE = '"Arial Black", Arial, sans-serif';

function PortalSiteGrid({ sites }: { sites: Site[] }) {
  return (
    <div className="portal-grid">
      {sites.map((site) => (
        <article key={site.slug} className="portal-card">
          <div className="portal-card-media">
            <Image
              src={site.preview}
              alt={site.name}
              fill
              unoptimized
              sizes="(max-width: 900px) 100vw, 33vw"
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="portal-card-body">
            <p>{site.category}</p>
            <h3>{site.name}</h3>
            <p className="muted">{site.tagline}</p>
            <div className="portal-card-actions">
              <WebShotButton
                color="#ffffff"
                size="md"
                onClick={() => {
                  window.location.assign(`/incele/${site.slug}`);
                }}
              >
                İncele
                <ArrowRight />
              </WebShotButton>
              <a
                href={siteEmbedSrc(site)}
                target="_blank"
                rel="noreferrer"
                className="portal-link"
              >
                Tam ekran
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function scrollToHashTarget() {
  let id = location.hash.replace(/^#/, "");
  if (!id) return;
  if (id === "anket") id = "teklif";
  const el = document.getElementById(id);
  if (!el) return;
  // Glyph portal creates a long sticky scroll — jump past it to the section.
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  });
}

const PORTAL_NAV = [
  { href: "#siteler", label: "Scroll film" },
  { href: "#animasyon", label: "Şık motion" },
  { href: "#nasil", label: "Süreç" },
  { href: "#teklif", label: "Teklif al" },
] as const;

export function PortalHome() {
  const [scrollLength, setScrollLength] = useState(2.6);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    // Kill orphaned preview chrome from prior incele visits
    document.getElementById("izden-preview-chrome")?.remove();
    document.querySelectorAll(".preview-bar").forEach((el) => el.remove());
    document.documentElement.classList.remove("is-preview", "preview-immersive");
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const syncScroll = () => {
      const w = window.innerWidth;
      setScrollLength(w < 560 ? 1.85 : w < 900 ? 2.2 : 2.6);
    };
    syncScroll();
    window.addEventListener("resize", syncScroll);
    return () => window.removeEventListener("resize", syncScroll);
  }, []);

  useEffect(() => {
    const fromExit = sessionStorage.getItem("izden-scroll-to");
    if (fromExit) {
      sessionStorage.removeItem("izden-scroll-to");
      if (!location.hash) history.replaceState(null, "", `#${fromExit}`);
    }
    scrollToHashTarget();
    const onHash = () => scrollToHashTarget();
    window.addEventListener("hashchange", onHash);
    const t = window.setTimeout(scrollToHashTarget, 120);
    const t2 = window.setTimeout(scrollToHashTarget, 480);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div className="portal-light">
      <GlyphPortal
        word="İZDEN"
        focusChar="D"
        fontFamily={GLYPH_FACE}
        fontWeight={900}
        scrollLength={scrollLength}
        interactive={false}
        annotations={false}
        enterLabel="Örneklere geç"
        style={{
          "--gp-paper": "#ffffff",
          "--gp-ink": "#111111",
          "--gp-field": "#111111",
          "--gp-foreground": "#141414",
        }}
        background={
          <div
            aria-hidden
            className="gp-field-photo"
            style={{
              position: "absolute",
              inset: 0,
              transform: "scale(var(--gp-field-scale, 1))",
              transformOrigin: "center center",
            }}
          />
        }
        front={
          <>
            <div className="gp-top">
              <Logo variant="light" className="gp-brand-logo" priority />
              <span className="gp-cat">İzden Creative</span>
            </div>
            <p className="gp-eye gp-fade">Örnek site portföyü</p>
            <p className="gp-support gp-fade">
              Canlı demoları inceleyin, beğendiğinizi işaretleyin, teklif alın.
            </p>
            <span className="gp-scroll gp-fade">Aşağı kaydırın</span>
          </>
        }
      >
        <div className="portal-after">
          <header className="portal-bar">
            <Link href="/" className="portal-brand" aria-label="İzden Siteler">
              <Logo variant="light" className="portal-brand-img" />
            </Link>
            <nav className="portal-nav-desktop" aria-label="Ana">
              {PORTAL_NAV.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              className="portal-nav-toggle"
              aria-expanded={navOpen}
              aria-controls="portal-nav-drawer"
              aria-label={navOpen ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </header>
          <div
            id="portal-nav-drawer"
            className={`portal-nav-drawer${navOpen ? " is-open" : ""}`}
            hidden={!navOpen}
          >
            <nav aria-label="Mobil">
              {PORTAL_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <section id="siteler" className="portal-sites">
            <div className="portal-sites-head">
              <p className="eyebrow">Scroll · Film</p>
              <h2>Scrub ve cinematic anlatı.</h2>
              <p>
                Uzun pin / frame scrub / chapter film. Scroll kaynağı; alt bölümler
                animasyonla tamamlanır.
              </p>
            </div>
            <PortalSiteGrid sites={FILM_SITES} />
          </section>

          <section id="animasyon" className="portal-sites portal-sites--motion">
            <div className="portal-sites-head">
              <p className="eyebrow">Şık · Animasyonlu</p>
              <h2>Scrollsuz veya çok kısa. Bölüm motion.</h2>
              <p>
                Hero kompozisyonu + görsel geçişler, reveal’lar ve panel fade.
                Film scrub yok — marka sahnesi ve tipografi önde.
              </p>
            </div>
            <PortalSiteGrid sites={MOTION_SITES} />
          </section>

          <section id="nasil" className="portal-how">
            <p className="eyebrow">Süreç</p>
            <h2>Nasıl ilerler?</h2>
            <ol>
              <li>
                <strong>01</strong>
                <div>
                  <h3>Demoları inceleyin</h3>
                  <p>Beğendiğiniz yönü işaretleyin.</p>
                </div>
              </li>
              <li>
                <strong>02</strong>
                <div>
                  <h3>Karşılaştırın</h3>
                  <p>Üst bardan çıkıp başka örneğe geçin.</p>
                </div>
              </li>
              <li>
                <strong>03</strong>
                <div>
                  <h3>Teklif alın</h3>
                  <p>Formla hedef, stil ve bütçeyi netleştirin.</p>
                </div>
              </li>
            </ol>
            <div className="portal-cta-row">
              <WebShotButton
                color="#111111"
                size="lg"
                onClick={() => {
                  document.getElementById("teklif")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Teklif al
                <ArrowRight />
              </WebShotButton>
            </div>
          </section>

          <div className="portal-survey-wrap">
            <SurveyForm />
          </div>

          <footer className="portal-foot">
            <Logo variant="light" className="foot-logo" />
            <div className="portal-foot__links">
              <a href="https://www.izdencreative.com" target="_blank" rel="noreferrer">
                izdencreative.com
              </a>
              <a href="mailto:info@izdencreative.com">info@izdencreative.com</a>
              <Link href="/yasal/aydinlatma">Aydınlatma</Link>
              <Link href="/yasal/gizlilik">Gizlilik</Link>
              <Link href="/yasal/cerez-politikasi">Çerezler</Link>
              <Link href="/yasal/kullanim-kosullari">Koşullar</Link>
            </div>
          </footer>
        </div>
      </GlyphPortal>

      <AiAssistant />
    </div>
  );
}
