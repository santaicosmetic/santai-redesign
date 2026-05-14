// ui_kits/santai-web/HowToApply.jsx
const SantaiHowToApply = () => (
  <main className="howto">
    <section className="howto-hero">
      <div className="howto-hero__video">
        <div className="howto-hero__lash"><SantaiLashGlyph width={68} height={4} color="#F5EFE6"/></div>
        <button className="howto-hero__play" aria-label="Play tutorial">▶</button>
        <span className="howto-hero__cap">EN · BM captions</span>
      </div>
      <div className="howto-hero__copy container">
        <div className="eyebrow" style={{color:"var(--bg)",opacity:.85}}>How to apply</div>
        <h1 className="display-xl howto-hero__h">Easier than <span className="display-italic">mascara.</span></h1>
        <p className="howto-hero__sub">Thirty seconds, no glue, no commitment. Press play.</p>
      </div>
    </section>

    {[
      { n: "01", t: "Place at the lash line", d: "Hold the band a hair above your natural lashes. The magnets guide themselves home — you don't have to aim.", bg: "#E8E0D3" },
      { n: "02", t: "Press from the inner corner", d: "Pinch gently inward, then outward. The strip seats itself along the lash line in one motion.", bg: "#D9CDB9" },
      { n: "03", t: "That's it", d: "No glue. No drying. No commitment. Lift off cleanly at the end of the night.", bg: "#FAF6EF" },
    ].map((s, i) => (
      <section key={s.n} className={`howto-step ${i % 2 ? "howto-step--alt" : ""}`}>
        <div className="howto-step__media" style={{ background: s.bg }}>
          <SantaiLashGlyph width={56 + i * 6} height={2 + i} color="#1F1A17"/>
          <span className="howto-step__play">▶</span>
        </div>
        <div className="howto-step__copy container">
          <div className="display-l howto-step__n">{s.n}</div>
          <h2 className="display-m howto-step__t">{s.t}</h2>
          <p className="howto-step__d">{s.d}</p>
        </div>
      </section>
    ))}

    <section className="section container">
      <div className="section__head">
        <div className="section__head-text">
          <div className="eyebrow">Common mistakes</div>
          <h2 className="display-l">Honest fixes.</h2>
        </div>
      </div>
      <div className="howto-mistakes">
        {[
          { m: "Strip lifting at the corner", f: "You placed it too low. Lift, raise 1mm, the magnets re-seat." },
          { m: "Looks too dramatic in daylight", f: "Try Style 02 or Style 03 — same band, lighter fibre." },
          { m: "Gap between band and lash line", f: "Apply your magnetic liner first, fully dry, then the lash." },
          { m: "Hard to remove", f: "Slide a fingertip along the band. They lift off in one piece." },
        ].map((x, i) => (
          <article key={i} className="howto-mistake">
            <div className="eyebrow howto-mistake__lbl">Mistake</div>
            <p className="howto-mistake__m">{x.m}</p>
            <div className="eyebrow howto-mistake__lbl howto-mistake__lbl--fix">Fix</div>
            <p className="howto-mistake__f display-italic">{x.f}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section container howto-checklist">
      <div className="section__head">
        <div className="section__head-text">
          <div className="eyebrow">First-timer checklist</div>
          <h2 className="display-l">Five minutes. <span className="display-italic">A mirror at eye level.</span></h2>
        </div>
      </div>
      <ul className="howto-list">
        {[
          "Take five minutes — the first time only. After that, thirty seconds.",
          "Mirror at eye level. Looking down hides the lash line.",
          "Apply magnetic liner first. Let it dry fully before the lash.",
          "Press from the inside corner outward, never the middle first.",
          "If it doesn't sit right, lift and replace. The magnets are forgiving.",
        ].map((it, i) => (
          <li key={i}><span className="howto-list__n mono">0{i+1}</span><span>{it}</span></li>
        ))}
      </ul>
    </section>

    <section className="section container">
      <div className="section__head section__head--center">
        <div className="section__head-text">
          <div className="eyebrow">Real first attempts</div>
          <h2 className="display-l">Customers, on camera.</h2>
        </div>
      </div>
      <div className="howto-ugc">
        {[0,1,2,3].map(i => (
          <div key={i} className="howto-ugc__cell" style={{ background: ["#E8E0D3","#D9CDB9","#FAF6EF","#3D332D"][i] }}>
            <SantaiLashGlyph width={50 + i * 4} height={2 + (i%3)} color={i === 3 ? "#F5EFE6" : "#1F1A17"}/>
            <span className="howto-ugc__play">▶</span>
          </div>
        ))}
      </div>
    </section>
  </main>
);

Object.assign(window, { SantaiHowToApply });
