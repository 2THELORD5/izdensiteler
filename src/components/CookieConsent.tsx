"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "izden-cookie-consent-v1";

type Choice = "accepted" | "essential";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: Choice) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, at: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-bar" role="dialog" aria-labelledby="cookie-title" aria-live="polite">
      <div className="cookie-bar__inner">
        <div className="cookie-bar__copy">
          <p id="cookie-title" className="cookie-bar__title">
            Çerezler
          </p>
          <p>
            Site deneyimini iyileştirmek ve tercihlerinizi hatırlamak için zorunlu çerezler
            ile isteğe bağlı analitik çerezler kullanabiliriz. Detaylar için{" "}
            <Link href="/yasal/cerez-politikasi">Çerez Politikası</Link> ve{" "}
            <Link href="/yasal/aydinlatma">Aydınlatma Metni</Link>’ne bakın.
          </p>
        </div>
        <div className="cookie-bar__actions">
          <button type="button" className="btn-ghost compact" onClick={() => choose("essential")}>
            Yalnızca zorunlu
          </button>
          <button type="button" className="btn-primary compact" onClick={() => choose("accepted")}>
            Kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
