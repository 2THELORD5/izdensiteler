"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { SITES } from "@/lib/sites";
import {
  BUDGETS,
  GOALS,
  SECTORS,
  STYLES,
  TIMELINES,
  emptySurvey,
  type SurveyAnswers,
} from "@/lib/survey";

const STEPS = [
  { id: "isletme", label: "İşletme", hint: "Marka ve hedef" },
  { id: "stil", label: "Stil", hint: "Görünüm ve tempo" },
  { id: "ornek", label: "Örnekler", hint: "Beğenilen demolar" },
  { id: "iletisim", label: "İletişim", hint: "Teklif için" },
] as const;

export function SurveyForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyAnswers>(emptySurvey);
  const [kvkkOk, setKvkkOk] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  function canNext() {
    if (step === 0) return data.businessName.trim() && data.sector && data.goal;
    if (step === 1) return data.stylePrefs.length > 0 && data.budget && data.timeline;
    if (step === 2) return data.likedSites.length > 0;
    if (step === 3) return data.name.trim() && data.email.trim() && kvkkOk;
    return false;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canNext()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kvkkAccepted: true }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section id="teklif" className="survey">
        <div className="survey-done">
          <p className="eyebrow">Teklif talebi alındı</p>
          <h2>Teşekkürler — kayıt tamam.</h2>
          <p>
            Ekip talebinizi inceleyip en kısa sürede dönüş yapacak. İsterseniz demoları
            incelemeye devam edebilirsiniz.
          </p>
          <a href="#siteler" className="btn-primary">
            Demolara dön
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="teklif" className="survey">
      <div className="section-head">
        <p className="eyebrow">Teklif al</p>
        <h2>Dört net adımda teklif</h2>
        <p className="section-sub">
          Demolar yalnızca yön gösterir. Formda hedef, stil ve bütçeyi netleştirin —
          üretim teklifi buna göre şekillenir.
        </p>
      </div>

      <form className="survey-card" onSubmit={onSubmit}>
        <div className="survey-progress" aria-hidden>
          <div style={{ width: `${progress}%` }} />
        </div>

        <div className="survey-steps" role="tablist" aria-label="Teklif adımları">
          {STEPS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === step}
              className={i === step ? "is-active" : i < step ? "is-done" : ""}
              onClick={() => i <= step && setStep(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <em>
                {item.label}
                <small>{item.hint}</small>
              </em>
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="survey-pane">
            <label>
              İşletme / marka adı
              <input
                value={data.businessName}
                onChange={(e) => setData({ ...data, businessName: e.target.value })}
                placeholder="Örn. Forma Atölye"
                required
              />
            </label>
            <label>
              Sektör
              <select
                value={data.sector}
                onChange={(e) => setData({ ...data, sector: e.target.value })}
                required
              >
                <option value="">Seçin</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Ana hedef</legend>
              <div className="chip-grid">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={data.goal === g ? "chip is-on" : "chip"}
                    onClick={() => setData({ ...data, goal: g })}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div className="survey-pane">
            <fieldset>
              <legend>Stil yönü (birden fazla seçilebilir)</legend>
              <div className="chip-grid">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={data.stylePrefs.includes(s) ? "chip is-on" : "chip"}
                    onClick={() =>
                      setData({ ...data, stylePrefs: toggle(data.stylePrefs, s) })
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="survey-row">
              <label>
                Bütçe aralığı
                <select
                  value={data.budget}
                  onChange={(e) => setData({ ...data, budget: e.target.value })}
                >
                  <option value="">Seçin</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Zaman planı
                <select
                  value={data.timeline}
                  onChange={(e) => setData({ ...data, timeline: e.target.value })}
                >
                  <option value="">Seçin</option>
                  {TIMELINES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="survey-pane">
            <fieldset>
              <legend>Beğendiğiniz demolar</legend>
              <p className="survey-help">
                En az bir örnek seçin. Üretim sitesi birebir kopya olmaz; yön ve kalite
                seviyesi için referans alınır.
              </p>
              <div className="chip-grid">
                {SITES.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    className={data.likedSites.includes(s.slug) ? "chip is-on" : "chip"}
                    onClick={() =>
                      setData({
                        ...data,
                        likedSites: toggle(data.likedSites, s.slug),
                      })
                    }
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <label>
              Notlar
              <textarea
                rows={4}
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                placeholder="Dil, şube sayısı, mevcut site, referanslar…"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="survey-pane">
            <div className="survey-row">
              <label>
                Ad Soyad
                <input
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Telefon
                <input
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="+90 …"
                />
              </label>
            </div>
            <label>
              E-posta
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
              />
            </label>
            <label className="survey-check">
              <input
                type="checkbox"
                checked={kvkkOk}
                onChange={(e) => setKvkkOk(e.target.checked)}
                required
              />
              <span>
                <Link href="/yasal/aydinlatma" target="_blank">
                  Aydınlatma Metni
                </Link>
                ’ni okudum; kişisel verilerimin teklif sürecinde işlenmesini kabul ediyorum.
                Ayrıca{" "}
                <Link href="/yasal/gizlilik" target="_blank">
                  Gizlilik Politikası
                </Link>
                ’nı bilirim.
              </span>
            </label>
            <p className="survey-help">
              Talebiniz info@izdencreative.com adresine iletilir. Asistan sohbeti teklif
              yerine geçmez.
            </p>
          </div>
        )}

        <div className="survey-footer">
          <button
            type="button"
            className="btn-ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Geri
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canNext()}
              onClick={() => canNext() && setStep((s) => s + 1)}
            >
              Devam
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary"
              disabled={!canNext() || status === "sending"}
            >
              {status === "sending" ? "Gönderiliyor…" : "Teklif al"}
            </button>
          )}
        </div>
        {status === "error" && (
          <p className="survey-error">Gönderim başarısız. Lütfen tekrar deneyin.</p>
        )}
      </form>
    </section>
  );
}
