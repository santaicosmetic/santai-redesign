// ui_kits/santai-web/Header.jsx
const SantaiUtilityBar = () => {
  const messages = [
    "Free shipping over RM150",
    "Free 5-min Lash Match — find yours",
    "Try first, love forever — 14-day return",
  ];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="utility-bar">
      <div className="utility-bar__inner">
        <span key={i} className="utility-bar__msg">{messages[i]}</span>
      </div>
    </div>
  );
};

const SantaiHeader = ({ onNav, onCart, cartCount = 0, current }) => {
  const [shopOpen, setShopOpen] = React.useState(false);
  return (
    <header className="site-header">
      <SantaiUtilityBar />
      <div className="site-header__main">
        <div className="site-header__left">
          <button className="site-header__icon" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          </button>
        </div>
        <a className="site-header__logo" href="#" aria-label="santai — home" onClick={(e) => { e.preventDefault(); onNav("home"); }}>
          <span className="wordmark">SANTAI</span>
        </a>
        <div className="site-header__right">
          <button className="site-header__icon" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="9" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
          </button>
          <button className="site-header__icon" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 20s-7-4.5-9-9.5C1.5 6 5 3 8 4.5c1.6.8 3 2.5 4 4 1-1.5 2.4-3.2 4-4 3-1.5 6.5 1.5 5 6-2 5-9 9.5-9 9.5z"/></svg>
          </button>
          <button className="site-header__icon site-header__cart" aria-label="Cart" onClick={onCart}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
            {cartCount > 0 && <span className="site-header__cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
      <nav className="site-nav">
        <ul>
          <li className="site-nav__shop"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}>
            <a href="#" className={current === "shop" ? "is-current" : ""}
               onClick={(e) => { e.preventDefault(); setShopOpen(v => !v); }}>
              Shop <span className="site-nav__caret" aria-hidden="true">▾</span>
            </a>
            <div className={"site-nav__dropdown" + (shopOpen ? " is-open" : "")}>
              <a href="#" onClick={(e) => { e.preventDefault(); setShopOpen(false); onNav("by-eye"); }}>Shop by eye shape</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setShopOpen(false); onNav("by-occasion"); }}>Shop by occasion</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setShopOpen(false); onNav("all"); }}>Shop all products</a>
            </div>
          </li>
          <li><a href="#" className={current === "how" ? "is-current" : ""} onClick={(e) => { e.preventDefault(); onNav("how"); }}>How to Apply</a></li>
          <li><a href="#" className={current === "faq" ? "is-current" : ""} onClick={(e) => { e.preventDefault(); onNav("faq"); }}>FAQ</a></li>
          <li><a href="#" className={current === "contact" ? "is-current" : ""} onClick={(e) => { e.preventDefault(); onNav("contact"); }}>Contact Us</a></li>
        </ul>
      </nav>
    </header>
  );
};

Object.assign(window, { SantaiHeader, SantaiUtilityBar });
