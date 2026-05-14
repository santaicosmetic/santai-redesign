// ui_kits/santai-web/Footer.jsx
const SantaiFooter = () => (
  <footer className="site-footer">
    <div className="site-footer__newsletter">
      <div className="site-footer__newsletter-inner">
        <div>
          <div className="eyebrow" style={{color: "var(--bg)", opacity: .65}}>Newsletter</div>
          <div className="footer-quote">
            Join the Santai studio — get a complimentary <em>lash-fit</em> guide.
          </div>
        </div>
        <form className="footer-form" onSubmit={(e) => e.preventDefault()}>
          <input className="footer-input" placeholder="hello@santai.com" type="email"/>
          <button className="btn btn-accent" type="submit">Join</button>
        </form>
      </div>
    </div>
    <div className="site-footer__cols">
      <div>
        <div className="eyebrow" style={{color: "var(--bg)", opacity: .55}}>Help</div>
        <ul><li>Shipping</li><li>Returns</li><li>Care guide</li><li>Contact</li></ul>
      </div>
      <div>
        <div className="eyebrow" style={{color: "var(--bg)", opacity: .55}}>Learn</div>
        <ul><li>Lash Match quiz</li><li>How to apply</li><li>By eye shape</li><li>The journal</li></ul>
      </div>
      <div>
        <div className="eyebrow" style={{color: "var(--bg)", opacity: .55}}>Connect</div>
        <ul><li>Instagram</li><li>TikTok</li><li>Studio loyalty</li></ul>
      </div>
      <div>
        <div className="eyebrow" style={{color: "var(--bg)", opacity: .55}}>About</div>
        <ul><li>Our story</li><li>Sustainability</li><li>Press</li><li>Stockists</li></ul>
      </div>
    </div>
    <div className="site-footer__rule"></div>
    <div className="site-footer__bottom">
      <span className="footer-mark wordmark">SANTAI</span>
      <span className="footer-meta">© 2026 Santai Cosmetics Sdn Bhd · Kuala Lumpur</span>
      <div className="footer-pay">
        {["FPX","GrabPay","TnG","Boost","Atome","Visa","Mastercard"].map(p => (
          <span key={p} className="pay-tile">{p}</span>
        ))}
      </div>
    </div>
  </footer>
);

Object.assign(window, { SantaiFooter });
