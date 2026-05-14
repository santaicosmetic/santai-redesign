// ui_kits/santai-web/Homepage.jsx
// Editorial homepage — hero + two-pillar block + bestsellers + editorial story
// + shop by eye shape + shop by occasion + reviews + promise band.

const SantaiHero = ({ onFind, onWatch }) => (
  <section className="hero">
    <div className="hero__image" aria-hidden="true">
      <img src="assets/photos/model-warm.jpg" alt="" className="hero__photo"/>
      <div className="hero__scrim"></div>
    </div>
    <div className="hero__copy">
      <div className="eyebrow" style={{color: "var(--bg)", opacity: .85}}>Effortless eyes</div>
      <h1 className="display-xl hero__headline">
        Lashes in a <span className="display-italic">snap.</span>
      </h1>
      <p className="hero__sub">No glue. No artistry. Magnetic, the way it should be.</p>
      <div className="hero__ctas">
        <button className="btn btn-accent" onClick={onFind}>Find my lash</button>
        <button className="btn btn-secondary btn-secondary--cream" onClick={onWatch}>See how easy</button>
      </div>
    </div>
  </section>
);

const SantaiTwoPillars = ({ onFind, onWatch }) => (
  <section className="pillars container">
    <button className="pillar" onClick={onFind}>
      <div className="eyebrow">Pillar one</div>
      <div className="pillar__h display-m">
        Don't know which lash? Take the <span className="display-italic">60-second</span> Lash Match.
      </div>
      <span className="pillar__arrow">→</span>
    </button>
    <button className="pillar pillar--alt" onClick={onWatch}>
      <div className="eyebrow">Pillar two</div>
      <div className="pillar__h display-m">
        Worried about applying? Watch the <span className="display-italic">30-second</span> how-to.
      </div>
      <span className="pillar__arrow">→</span>
    </button>
  </section>
);

const SantaiBestsellers = ({ onOpen }) => (
  <section className="section container">
    <div className="section__head">
      <div className="section__head-text">
        <div className="eyebrow">The collection</div>
        <h2 className="display-l">Quietly bestselling.</h2>
      </div>
      <a className="btn-ghost" href="#">View all 12 styles →</a>
    </div>
    <div className="bestseller-grid">
      {SANTAI_PRODUCTS.slice(0, 4).map(p => (
        <SantaiProductCard key={p.id} p={p} onOpen={onOpen}/>
      ))}
    </div>
  </section>
);

const SantaiStory = () => (
  <section className="story container">
    <div className="story__image" aria-hidden="true">
      <img src="assets/photos/model-headband.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
    </div>
    <div className="story__copy">
      <div className="eyebrow">The studio</div>
      <div className="display-m story__quote">
        "We built Santai for the woman who wants the lash, but not the <span className="display-italic">ritual</span>."
      </div>
      <div className="story__meta">— Adira Tan, founder · Kuala Lumpur</div>
      <a className="btn-ghost" href="#">Read the studio journal →</a>
    </div>
  </section>
);

const SantaiByEyeShape = ({ onPick }) => (
  <section className="by-shape container">
    <div className="section__head section__head--center">
      <div className="section__head-text">
        <div className="eyebrow">Shop by eye shape</div>
        <h2 className="display-l">Made for <span className="display-italic">your</span> eye.</h2>
      </div>
    </div>
    <div className="shape-row">
      {SANTAI_EYE_SHAPES.map(s => (
        <button key={s.id} className="shape-tile" onClick={() => onPick && onPick(s.id)}>
          <img src={s.icon} alt={s.label}/>
          <span className="shape-tile__label">{s.label}</span>
        </button>
      ))}
    </div>
  </section>
);

const SantaiByOccasion = () => {
  const occ = [
    { id: "daily", label: "Daily", bg: "#E8E0D3" },
    { id: "office", label: "Office", bg: "#D9CDB9" },
    { id: "date", label: "Date Night", bg: "#3D332D" },
    { id: "wedding", label: "Wedding", bg: "#FAF6EF" },
    { id: "festival", label: "Festival", bg: "#8A4A3D" },
  ];
  return (
    <section className="by-occasion">
      <div className="container">
        <div className="section__head">
          <div className="section__head-text">
            <div className="eyebrow">Shop by occasion</div>
            <h2 className="display-l">For every kind of evening.</h2>
          </div>
        </div>
      </div>
      <div className="occasion-row">
        {occ.map(o => (
          <a key={o.id} className="occasion-tile" href="#" style={{ background: o.bg }}>
            <span className="occasion-tile__label" style={{ color: (o.bg === "#3D332D" || o.bg === "#8A4A3D") ? "var(--bg)" : "var(--fg)" }}>{o.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

const SantaiReviewsHome = () => (
  <section className="section reviews-band container">
    <div className="section__head section__head--center">
      <div className="section__head-text">
        <div className="eyebrow">Loved by</div>
        <h2 className="display-l">12,400 lash <span className="display-italic">converts.</span></h2>
      </div>
    </div>
    <div className="reviews-grid">
      {[
        { stars: 5, name: "Aisyah R.", tag: "Monolid · Office", q: "Genuinely faster than mascara. I'm a monolid and Style 02 just sits." },
        { stars: 5, name: "Priya M.", tag: "Almond · Wedding", q: "Wore Style 06 to my akad. Photographer asked which salon. None — they're magnetic." },
        { stars: 4, name: "Lin T.", tag: "Hooded · First-timer", q: "First magnetic lash that didn't make me feel like I was suturing my eyelid." },
      ].map((r, i) => (
        <article key={i} className="review">
          <div className="stars" aria-label={`${r.stars} stars`}>
            {Array.from({length:5}).map((_,k) => (
              <svg key={k} viewBox="0 0 24 24" fill={k < r.stars ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
            ))}
          </div>
          <p className="review__quote display-italic">&ldquo;{r.q}&rdquo;</p>
          <div className="review__meta">
            <span className="review__name">{r.name}</span>
            <span className="review__tag">{r.tag}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const SantaiPromiseBand = () => (
  <section className="promise-band">
    <div className="container promise-band__inner">
      {[
        { t: "Reusable up to 30×", i: "♺" },
        { t: "No glue, ever", i: "✕" },
        { t: "Cruelty-free", i: "♡" },
        { t: "Free 14-day returns", i: "↺" },
      ].map((x, i) => (
        <div key={i} className="promise-item">
          <span className="promise-item__icon">{x.i}</span>
          <span className="promise-item__t">{x.t}</span>
        </div>
      ))}
    </div>
  </section>
);

const SantaiHomepage = ({ onFind, onWatch, onOpen }) => (
  <main className="homepage">
    <SantaiHero onFind={onFind} onWatch={onWatch}/>
    <SantaiTwoPillars onFind={onFind} onWatch={onWatch}/>
    <SantaiBestsellers onOpen={onOpen}/>
    <SantaiStory/>
    <SantaiByEyeShape/>
    <SantaiByOccasion/>
    <SantaiReviewsHome/>
    <SantaiPromiseBand/>
  </main>
);

Object.assign(window, {
  SantaiHomepage, SantaiHero, SantaiTwoPillars, SantaiBestsellers,
  SantaiStory, SantaiByEyeShape, SantaiByOccasion, SantaiReviewsHome, SantaiPromiseBand,
});
