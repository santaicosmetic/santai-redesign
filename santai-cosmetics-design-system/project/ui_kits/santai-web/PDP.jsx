// ui_kits/santai-web/PDP.jsx
// Product detail page — long-scroll editorial spread.

const SantaiPDP = ({ product, onAdd, onFind }) => {
  const p = product || SANTAI_PRODUCTS[1];
  const [variant, setVariant] = React.useState(0);
  const [openSpec, setOpenSpec] = React.useState(false);
  const variants = [
    { name: "Natural", code: "NAT" },
    { name: "Volumed", code: "VOL" },
    { name: "Wispy", code: "WSP" },
  ];

  return (
    <main className="pdp">
      <section className="pdp-hero container">
        <div className="pdp-hero__gallery">
          <div className="pdp-hero__main" style={{ background: p.bg }}>
            <SantaiLashGlyph width={70} height={4} color={p.bg === "#3D332D" ? "#F5EFE6" : "#1F1A17"}/>
          </div>
          <div className="pdp-hero__thumbs">
            {[p.bg, "#FAF6EF", "#3D332D", "#E5C8BC"].map((c, i) => (
              <button key={i} className="pdp-hero__thumb" style={{ background: c }}>
                <SantaiLashGlyph width={50} height={3} color={c === "#3D332D" ? "#F5EFE6" : "#1F1A17"}/>
              </button>
            ))}
          </div>
        </div>
        <div className="pdp-hero__info">
          <div className="eyebrow">{p.tag || "The collection"}</div>
          <h1 className="display-l pdp-hero__h">{p.name} — <span className="display-italic">{p.variant.split(" · ")[0]}</span></h1>
          <div className="pdp-hero__sku mono">SKU-{p.code}-{variants[variant].code}</div>
          <p className="pdp-hero__blurb">{p.blurb}</p>
          <div className="pdp-hero__chips">
            {p.eye.map(e => <span key={e} className="chip-static">Best for {e}</span>)}
          </div>
          <div className="pdp-hero__variants">
            <div className="label">Style</div>
            <div className="pdp-variant-row">
              {variants.map((v, i) => (
                <button
                  key={v.code}
                  className={`pdp-variant ${variant === i ? "is-active" : ""}`}
                  onClick={() => setVariant(i)}
                >
                  <div className="pdp-variant__swatch" style={{ background: p.bg }}>
                    <SantaiLashGlyph width={40 + i * 6} height={2 + i} color="#1F1A17"/>
                  </div>
                  <span>{v.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="pdp-hero__price tnum">{p.price}</div>
          <div className="pdp-hero__ctas">
            <button className="btn btn-accent" onClick={() => onAdd(p)}>Add to bag</button>
            <button className="btn btn-secondary" onClick={onFind}>Try with Lash Match</button>
          </div>
          <p className="small pdp-hero__note">Same-day Klang Valley dispatch · Free returns within 14 days</p>
        </div>
      </section>

      <section className="pdp-trust">
        <div className="container pdp-trust__inner">
          {[
            { t: "Apply in 30 seconds", s: "Even on your first try" },
            { t: "Reusable up to 30×", s: "Care for them, they last" },
            { t: "Hypoallergenic", s: "No glue, no irritation" },
            { t: "Free 14-day returns", s: "Try first, love forever" },
          ].map((x, i) => (
            <div key={i} className="pdp-trust__item">
              <div className="pdp-trust__t">{x.t}</div>
              <div className="pdp-trust__s">{x.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container pdp-howto">
        <div className="section__head">
          <div className="section__head-text">
            <div className="eyebrow">How to apply</div>
            <h2 className="display-l">Three steps. <span className="display-italic">Thirty seconds.</span></h2>
          </div>
        </div>
        <div className="pdp-howto__grid">
          {[
            { n: "01", t: "Place at the lash line", d: "Hold the band a hair above your natural lashes. The magnets do the work." },
            { n: "02", t: "Press from the inner corner", d: "Pinch gently inward, then outward. The strip seats itself." },
            { n: "03", t: "That's it", d: "No glue. No drying. No commitment. Lift off at the end of the night." },
          ].map((s, i) => (
            <article key={s.n} className="pdp-step">
              <div className="pdp-step__video" style={{ background: ["#E8E0D3","#D9CDB9","#FAF6EF"][i] }}>
                <SantaiLashGlyph width={50 + i * 6} height={2 + i} color="#1F1A17"/>
                <span className="pdp-step__play">▶</span>
              </div>
              <div className="display-l pdp-step__n">{s.n}</div>
              <h3 className="pdp-step__t">{s.t}</h3>
              <p className="pdp-step__d">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section pdp-suit">
        <div className="container">
          <div className="section__head">
            <div className="section__head-text">
              <div className="eyebrow">Will this suit me?</div>
              <h2 className="display-l">Six eye shapes. <span className="display-italic">Honest verdicts.</span></h2>
            </div>
          </div>
          <div className="pdp-suit__grid">
            {SANTAI_EYE_SHAPES.map(s => {
              const fits = p.eye.includes(s.id);
              return (
                <article key={s.id} className="pdp-suit__cell">
                  <div className="pdp-suit__image" style={{ background: p.bg, opacity: fits ? 1 : 0.55 }}>
                    <img src={s.icon} alt={s.label} style={{ width: 96, height: 'auto', filter: p.bg === "#3D332D" ? 'invert(1)' : 'none' }}/>
                  </div>
                  <div className="pdp-suit__verdict">
                    <span className="eyebrow" style={{ color: fits ? "var(--santai-jade)" : "var(--fg-muted)" }}>{fits ? "Beautiful" : "Try Style 02"}</span>
                    <h3>{s.label}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pdp-editorial">
        <div className="pdp-editorial__image"></div>
        <div className="pdp-editorial__quote container">
          <div className="display-m display-italic">
            "I forgot I was wearing them. That's the whole point."
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="pdp-accordion">
          <button className="pdp-accordion__head" onClick={() => setOpenSpec(s => !s)}>
            <h3>Specs &amp; ingredients</h3>
            <span>{openSpec ? "−" : "+"}</span>
          </button>
          {openSpec && (
            <div className="pdp-accordion__body">
              <dl>
                <dt>Materials</dt><dd>Synthetic mink-effect fibre, hypoallergenic.</dd>
                <dt>Lash band</dt><dd>Flexible polymer with embedded magnets.</dd>
                <dt>Magnet count</dt><dd>6 micro-magnets per strip.</dd>
                <dt>Care</dt><dd>Wipe gently with the included brush. Store flat.</dd>
                <dt>What's in the box</dt><dd>1 pair of magnetic lashes, applicator, magnetic liner (3.5ml), care card.</dd>
              </dl>
            </div>
          )}
        </div>
      </section>

      <section className="section container pdp-related">
        <div className="section__head">
          <div className="section__head-text">
            <div className="eyebrow">You may also like</div>
            <h2 className="display-l">Built around Style {p.code}.</h2>
          </div>
        </div>
        <div className="bestseller-grid">
          {SANTAI_PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map(rp => (
            <SantaiProductCard key={rp.id} p={rp}/>
          ))}
        </div>
      </section>
    </main>
  );
};

Object.assign(window, { SantaiPDP });
