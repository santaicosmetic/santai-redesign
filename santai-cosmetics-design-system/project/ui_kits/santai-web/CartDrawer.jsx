// ui_kits/santai-web/CartDrawer.jsx
const SantaiCartDrawer = ({ open, items, onClose, onRemove }) => {
  const total = items.reduce((s, x) => s + parseFloat(x.price.replace(/[^0-9.]/g,"")), 0);
  const free = 150 - total;
  return (
    <>
      <div className={`cart-overlay ${open ? "is-open" : ""}`} onClick={onClose}/>
      <aside className={`cart-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="cart-drawer__head">
          <div>
            <div className="eyebrow">Your bag</div>
            <h2 className="display-m" style={{marginTop:6}}>{items.length} item{items.length === 1 ? "" : "s"}</h2>
          </div>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="display-italic" style={{fontSize:22,lineHeight:1.4}}>
              Your bag is empty.
            </p>
            <p style={{marginTop:12,color:"var(--fg-muted)"}}>Start with our bestseller, Style 04 — Doe Eye.</p>
            <button className="btn btn-accent" onClick={onClose} style={{marginTop:24}}>Shop the collection</button>
          </div>
        ) : (
          <>
            {free > 0 && (
              <div className="cart-nudge">
                <div className="cart-nudge__bar"><div className="cart-nudge__fill" style={{ width: `${Math.min(100, total / 150 * 100)}%` }}/></div>
                <p className="small" style={{marginTop:8}}>RM{free.toFixed(0)} away from free shipping.</p>
              </div>
            )}
            <ul className="cart-items">
              {items.map(it => (
                <li key={it.id} className="cart-item">
                  <div className="cart-item__image" style={{ background: it.bg }}>
                    <SantaiLashGlyph width={50} height={3} color={it.bg === "#3D332D" ? "#F5EFE6" : "#1F1A17"}/>
                  </div>
                  <div className="cart-item__info">
                    <h3>{it.name}</h3>
                    <div className="cart-item__variant">{it.variant}</div>
                    <div className="cart-item__price tnum">{it.price}</div>
                    <button className="btn-ghost cart-item__remove" onClick={() => onRemove(it.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="cart-drawer__foot">
              <div className="cart-total">
                <span className="eyebrow">Subtotal</span>
                <span className="cart-total__amount tnum">RM {total.toFixed(2)}</span>
              </div>
              <button className="btn btn-accent cart-drawer__checkout">Checkout</button>
              <p className="small" style={{textAlign:"center",marginTop:10,color:"var(--fg-muted)"}}>FPX · GrabPay · Touch 'n Go · Atome</p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
};

const SantaiToast = ({ message, onHide }) => {
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, 2400);
    return () => clearTimeout(t);
  }, [message]);
  return (
    <div className={`toast ${message ? "is-on" : ""}`}>{message}</div>
  );
};

Object.assign(window, { SantaiCartDrawer, SantaiToast });
