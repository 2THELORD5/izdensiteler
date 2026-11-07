"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Logo } from "./Logo";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-logo-wrap", { y: 40, opacity: 0, duration: 1 })
        .from(".hero-kicker", { y: 20, opacity: 0, duration: 0.6 }, "-=0.55")
        .from(".hero-title span", { y: 48, opacity: 0, duration: 0.85, stagger: 0.08 }, "-=0.35")
        .from(".hero-sub, .hero-actions", { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.45")
        .from(".hero-orbit", { scale: 0.7, opacity: 0, duration: 1.2 }, 0);

      gsap.to(".hero-orbit", {
        rotate: 360,
        duration: 80,
        repeat: -1,
        ease: "none",
      });
      gsap.to(".hero-glow", {
        scale: 1.18,
        opacity: 0.7,
        duration: 4.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root}>
      <div className="hero-glow" aria-hidden />
      <div className="hero-orbit" aria-hidden>
        <i /><i /><i /><i />
      </div>
      <div className="hero-grid" aria-hidden />
      <div className="hero-inner">
        <div className="hero-logo-wrap">
          <Logo variant="light" className="hero-logo" priority />
        </div>
        <p className="hero-kicker">izdensiteler · örnek site portalı</p>
        <h1 className="hero-title">
          <span>Markanı seçmeden önce</span>
          <span>dünyaları gez.</span>
          <span className="hero-title-accent">Sonra teklif alın.</span>
        </h1>
        <p className="hero-sub">
          Kumrucu, Junesun, Burger, İnşaat, Galeri ve orijinal SIGNAL (VR frame-scrub).
          Profesyonel demolar — animasyonlu, sinematik, karar vermeye hazır.
        </p>
        <div className="hero-actions">
          <a href="#siteler" className="btn-primary">
            Siteleri incele
          </a>
          <a href="#teklif" className="btn-ghost">
            Teklif al
          </a>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden>
        <span>Kaydır</span>
        <i />
      </div>
    </section>
  );
}
