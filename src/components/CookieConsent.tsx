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
            Analitik çerezler (isteğe bağlı).{" "}
            <Link href="/yasal/cerez-politikasi">Politika</Link>
          </p>
        </div>
        <div className="cookie-bar__actions">
          <button type="button" className="btn-ghost compact" onClick={() => choose("essential")}>
            Zorunlu
          </button>
          <button type="button" className="btn-primary compact" onClick={() => choose("accepted")}>
            Kabul
          </button>
        </div>
      </div>
    </div>
  );
}
