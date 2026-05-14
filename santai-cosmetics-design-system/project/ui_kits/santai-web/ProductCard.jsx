// ui_kits/santai-web/ProductCard.jsx
// Editorial-luxury product card. Image 4:5, sharp corners, hover scale.

const SantaiLashGlyph = ({ width = 60, height = 3, color = "#1F1A17" }) => (
  <div className="lash-glyph" style={{
    width: width + "%",
    height: height + "px",
    background: color,
    boxShadow: `0 -8px 14px -6px ${color}55, 0 -3px 8px -4px ${color}88`,
    borderRadius: 999,
  }}/>
);

const SantaiProductCard = ({ p, onOpen, badge = true }) => {
  return (
    <a className="product-card" href="#" onClick={(e) => { e.preventDefault(); onOpen && onOpen(p); }}>
      <div className="product-card__image" style={{ background: p.bg }}>
        {badge && p.tag && <span className="product-card__badge" style={{ color: p.bg === "#3D332D" ? "#F5EFE6" : "#1F1A17" }}>{p.tag}</span>}
        {p.image ? (
          <img src={p.image} alt={p.name} className="product-card__photo"/>
        ) : (
          <div className="product-card__image-inner">
            <SantaiLashGlyph width={p.lashWidth} height={p.lashHeight} color={p.bg === "#3D332D" ? "#F5EFE6" : "#1F1A17"}/>
          </div>
        )}
        <span className="product-card__hover-cue">→</span>
      </div>
      <div className="product-card__title">{p.name}</div>
      <div className="product-card__variant">{p.variant}</div>
      <div className="product-card__price tnum">{p.price}</div>
      {p.swatches?.length > 0 && (
        <div className="product-card__shades">
          {p.swatches.map((c, i) => (
            <span key={i} className="product-card__shade" style={{ background: c }}/>
          ))}
        </div>
      )}
    </a>
  );
};

Object.assign(window, { SantaiProductCard, SantaiLashGlyph });
