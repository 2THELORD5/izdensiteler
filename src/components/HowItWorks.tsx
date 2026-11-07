export function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Örneklere bak",
      d: "Sektörüne yakın siteleri aç, scroll’u ve dilini hisset.",
    },
    {
      n: "02",
      t: "Karşılaştır",
      d: "Üst bardan çıkıp başka bir demoya geç — karar verene kadar gez.",
    },
    {
      n: "03",
      t: "Teklif alın",
      d: "Beğendiğiniz stilleri, bütçeyi ve hedefi söyleyin; teklif buna göre şekillenir.",
    },
    {
      n: "04",
      t: "İletişime geçin",
      d: "İzden Creative ekibi dönüş yapar; size özel teklif hazırlanır.",
    },
  ];

  return (
    <section id="nasil" className="how">
      <div className="section-head">
        <p className="eyebrow">Süreç</p>
        <h2>Nasıl çalışır?</h2>
      </div>
      <ol className="how-grid">
        {steps.map((s) => (
          <li key={s.n}>
            <span>{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
