// ui_kits/santai-web/LashFinder.jsx
// 4-step concierge quiz. Progress is the thin rosewood line growing across top.

const SantaiLashFinder = ({ onResult, onClose, onAdd }) => {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({ eye: null, look: null, freq: null, flags: {} });
  const [direction, setDirection] = React.useState(1);

  const total = 4;
  const next = (patch) => {
    setAnswers(a => ({ ...a, ...patch }));
    setDirection(1);
    setStep(s => Math.min(s + 1, total));
  };
  const back = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const recommend = () => {
    // Simple matcher
    const { eye, look } = answers;
    if (look === "drama") return SANTAI_PRODUCTS.find(p => p.id === "s08");
    if (look === "soft") return SANTAI_PRODUCTS.find(p => p.id === "s07");
    if (look === "office") return SANTAI_PRODUCTS.find(p => p.id === "s04");
    if (eye === "monolid") return SANTAI_PRODUCTS.find(p => p.id === "s02");
    return SANTAI_PRODUCTS.find(p => p.id === "s04");
  };

  const progress = step === total ? 100 : (step / total) * 100;

  return (
    <div className="finder">
      <div className="finder__bar"><div className="finder__bar-fill" style={{ width: `${progress}%` }}/></div>
      <button className="finder__close" onClick={onClose} aria-label="Close">✕</button>

      <div className={`finder__stage finder__stage--dir-${direction}`} key={step}>
        {step === 0 && <FinderStep1 onPick={(eye) => next({ eye })}/>}
        {step === 1 && <FinderStep2 onPick={(look) => next({ look })}/>}
        {step === 2 && <FinderStep3 onPick={(freq) => next({ freq })}/>}
        {step === 3 && <FinderStep4 flags={answers.flags} onChange={(flags) => setAnswers(a => ({...a, flags}))} onDone={() => next({})}/>}
        {step === 4 && <FinderResult product={recommend()} flags={answers.flags} onAdd={onAdd} onClose={onClose}/>}
      </div>

      {step > 0 && step < total && (
        <button className="finder__back btn-ghost" onClick={back}>← Back</button>
      )}
    </div>
  );
};

const FinderStep1 = ({ onPick }) => (
  <div className="finder-step container">
    <div className="eyebrow">Step one</div>
    <h2 className="display-l finder-step__h">What's your eye <span className="display-italic">shape?</span></h2>
    <p className="finder-step__sub">Tap the closest match. <a href="#" className="finder__not-sure">Not sure? Try our 30-second mirror test.</a></p>
    <div className="finder-shapes">
      {SANTAI_EYE_SHAPES.map(s => (
        <button key={s.id} className="finder-shape" onClick={() => onPick(s.id)}>
          <img src={s.icon} alt=""/>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const FinderStep2 = ({ onPick }) => (
  <div className="finder-step container">
    <div className="eyebrow">Step two</div>
    <h2 className="display-l finder-step__h">What's the <span className="display-italic">look?</span></h2>
    <div className="finder-looks">
      {SANTAI_LOOKS.map((l, i) => (
        <button key={l.id} className="finder-look" onClick={() => onPick(l.id)}>
          <div className="finder-look__image" style={{ background: ["#E8E0D3","#D9CDB9","#C9BDA9","#3D332D"][i] }}>
            <SantaiLashGlyph width={50 + i * 8} height={2 + i} color={i === 3 ? "#F5EFE6" : "#1F1A17"}/>
          </div>
          <div className="finder-look__copy">
            <h3 className="finder-look__h">{l.label}</h3>
            <p className="finder-look__d">{l.desc}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const FinderStep3 = ({ onPick }) => {
  const opts = [
    { id: "daily", label: "Every day", d: "Pick durability." },
    { id: "weekly", label: "A few times a week", d: "Balanced for comfort." },
    { id: "occasions", label: "Occasions only", d: "We'll match drama." },
  ];
  return (
    <div className="finder-step container">
      <div className="eyebrow">Step three</div>
      <h2 className="display-l finder-step__h">How often will you <span className="display-italic">wear them?</span></h2>
      <div className="finder-freq">
        {opts.map(o => (
          <button key={o.id} className="finder-freq__opt" onClick={() => onPick(o.id)}>
            <span className="finder-freq__l">{o.label}</span>
            <span className="finder-freq__d">{o.d}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const FinderStep4 = ({ flags, onChange, onDone }) => {
  const toggles = [
    { id: "sensitive", label: "Sensitive eyes" },
    { id: "glasses", label: "I wear glasses" },
    { id: "first", label: "I'm a first-timer" },
  ];
  return (
    <div className="finder-step container">
      <div className="eyebrow">Step four</div>
      <h2 className="display-l finder-step__h">Anything we should <span className="display-italic">know?</span></h2>
      <p className="finder-step__sub">Tick what applies. We'll fine-tune the recommendation.</p>
      <div className="finder-flags">
        {toggles.map(t => (
          <button
            key={t.id}
            className={`finder-flag ${flags[t.id] ? "is-on" : ""}`}
            onClick={() => onChange({ ...flags, [t.id]: !flags[t.id] })}
            aria-pressed={!!flags[t.id]}
          >
            <span className="finder-flag__check">{flags[t.id] ? "✓" : ""}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <button className="btn btn-accent finder-flag__cta" onClick={onDone}>See my match</button>
    </div>
  );
};

const FinderResult = ({ product, flags, onAdd, onClose }) => {
  if (!product) return null;
  const reasons = [
    "Soft, weightless band — invisible at the lash line.",
    "Curve matched to your eye shape's natural arc.",
    flags.first ? "Our gentlest curve, made for first-timers." : "Reusable up to 30× with care.",
  ];
  return (
    <div className="finder-result container">
      <div className="finder-result__hero" style={{ background: product.bg }}>
        <SantaiLashGlyph width={70} height={4} color={product.bg === "#3D332D" ? "#F5EFE6" : "#1F1A17"}/>
        <div className="finder-result__hero-tag">Your match</div>
      </div>
      <div className="finder-result__copy">
        <div className="eyebrow">Your match</div>
        <h2 className="display-l">{product.name} — <span className="display-italic">{product.variant.split(" · ")[0]}</span></h2>
        <p className="finder-result__price tnum">{product.price}</p>
        <ul className="finder-result__reasons">
          {reasons.map((r, i) => <li key={i}><em>{r}</em></li>)}
        </ul>
        <div className="finder-result__ctas">
          <button className="btn btn-accent" onClick={() => { onAdd(product); onClose(); }}>Add to bag — {product.price}</button>
          <button className="btn btn-secondary">See it on me</button>
        </div>
        <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>Email me my match</a>
      </div>
    </div>
  );
};

Object.assign(window, { SantaiLashFinder });
