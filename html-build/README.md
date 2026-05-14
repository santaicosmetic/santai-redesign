# Santai — HTML/CSS build

Static HTML/CSS/JS implementation of santai-cosmetics.com, ready to be ported into a Shopify theme as Liquid sections and snippets. Wireframe and components follow `/santai-cosmetics-design-system/`. Type and color system **deliberately depart** from the design system's brand brief — see "Visual system" below.

## Visual system (Direction C)

- **Background:** pure white `#FFFFFF` (the brand brief forbade pure white; this is an intentional override)
- **Card / image surface:** `#F7F7F7` light gray
- **Section alt:** `#FAFAFA` off-white
- **Ink:** `#0A0A0A` near-black
- **Accent:** `#B8957B` warm nude (replaces the brand's rosewood)
- **Hairlines:** `#E0E0E0` on white, `#1A1A1A` on dark surfaces

- **Display:** Newsreader (free, Google Fonts) — editorial serif at weight 300 for hero/section heads
- **Body:** Manrope (free, Google Fonts) — modern geometric sans
- **Italic flourish:** Newsreader Italic — same family, no script font

Reference: Augustinus Bader, Vogue editorial, modern monochrome luxury.

## Design rule — mobile-first is non-negotiable

Every new component, every new section, every new edit must be designed for **360px first**, then progressively enhanced upward via `min-width` media queries. No exceptions.

- **Touch targets:** ≥ 44×44px on every interactive element. No 32px or 36px buttons.
- **Spacing:** vertical section padding starts at `--space-7` (48px) on mobile and only steps up to `--space-9` / `--space-10` at `min-width: 1024px`.
- **Grids:** 1 column on mobile by default. Two columns OK at ≥720px. Three+ columns only at ≥1024px (or for tiles small enough to fit 360px).
- **Fixed elements:** must respect `env(safe-area-inset-bottom)` for iOS home-indicator clearance.
- **Type:** clamp() for display headings so they scale; body text fixed at 16px minimum.
- **Cascade order:** write the mobile rule first as the default, then add `@media (min-width: ...)` blocks for larger screens — never the reverse.

If a section can't be made to work on a 360px-wide screen, redesign the section, don't add a horizontal scroll workaround.

## Preview locally

Just open the files in a browser — no build step:

```
file:///C:/santai-redesign/html-build/index.html
```

The Launch preview panel works too. All three pages are interlinked.

## File map

```
html-build/
├── index.html               ← Homepage
├── product.html             ← PDP (Pitch example)
├── how-to-apply.html        ← How-to-Apply page
├── README.md                ← this file
└── assets/
    ├── styles.css           ← single consolidated stylesheet
    ├── theme.js             ← vanilla JS for cart, lash finder, mobile nav, accordion
    └── eye-shapes/          ← 6 SVG icons (almond, hooded, monolid, round, upturned, downturned)
```

## What's interactive

- **Cart drawer** — click the header cart icon, or any "Add to bag" button. Free-shipping nudge updates with subtotal. Toast appears on add.
- **Lash Finder modal** — click "Find my lash" anywhere. 4-step quiz → result. Add to bag from the result.
- **Mobile nav** — under 960px the hamburger toggles a full-screen menu.
- **PDP** — variant selector updates the SKU. Three accordions (specs, shipping, care) toggle independently.

## What's *not* wired (purposely)

- **Product photography** — every product image is a CSS-only "lash glyph" placeholder. Swap with real macro shots before launch. Hero, story, and editorial PDP backgrounds are CSS gradients — drop in real images via the `.hero__photo`, `.story__image`, `.pdp-editorial__image` rules.
- **Search / Account / Wishlist** icons — decorative.
- **Checkout button** — decorative; ends at the cart drawer.
- **Lash Finder result** — currently always recommends Inbox. Real recommendation logic should live server-side or in a richer JS module.
- **Newsletter form** — form submits are prevented; no backend wired.

---

## Shopify Liquid port — recommended structure

| HTML file / block | Becomes | Notes |
| --- | --- | --- |
| `index.html` | `templates/index.liquid` (or sections-driven via `index.json`) | The homepage layout works well as 7 individual sections (hero, pillars, bestsellers, story, by-eye-shape, by-occasion, reviews, promise-band) so merchandising can reorder. |
| `product.html` | `templates/product.liquid` + `sections/product.liquid` | Variant selector wires to `{{ product.variants }}`, "Add to bag" wires to `/cart/add.js`. Eye-shape suit grid can read a product metafield (`product.metafields.santai.fits_eyes`). |
| `how-to-apply.html` | `templates/page.how-to-apply.liquid` | One-off page; safe to keep mostly static. |
| Header (top of every page) | `sections/header.liquid` | Utility bar messages → section settings (repeater). Nav → `linklists.main-menu`. |
| Footer (bottom of every page) | `sections/footer.liquid` | 4-column links → 4 menu pickers. Newsletter → existing Shopify customer email signup form. |
| Cart drawer block | `snippets/cart-drawer.liquid` | Loaded once in `theme.liquid`. Replace the in-memory cart in `theme.js` with calls to `/cart.js` and `/cart/add.js` (Shopify Ajax API). The DOM structure stays as-is. |
| Lash Finder modal block | `snippets/lash-finder.liquid` | Keep the same markup. Result step needs a small mapping module (`finderRules`) keyed on `eye + look + freq + flags` → `productHandle`. |
| `.product-card` markup | `snippets/product-card.liquid` | Pass a product as `{% render 'product-card', product: product %}`. The four product cards on the homepage become `{% for product in collections.bestsellers.products limit: 4 %}`. |
| Eye-shape SVGs | Upload to `assets/` | Reference as `{{ 'almond.svg' | asset_url }}`. |
| `assets/styles.css` | Upload as `assets/santai.css` | Link from `theme.liquid` via `{{ 'santai.css' | asset_url | stylesheet_tag }}`. CSS variables stay; Liquid doesn't need to touch them. |
| `assets/theme.js` | Split into `assets/theme.js` (cart Ajax) + `assets/santai-ui.js` (everything else) | Cart logic must be rewritten against `/cart.js`. Everything else (utility bar rotator, mobile nav, accordion, lash finder, sticky header) ports verbatim. |

### Cart Ajax migration

The cart in `theme.js` is in-memory only — all cart state is lost on reload. For Shopify:

```js
// Replace addToCart() with:
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: variantId, quantity: 1 })
})
.then(() => fetch('/cart.js'))
.then(r => r.json())
.then(cart => renderCartFromShopify(cart));
```

The render function keeps the same DOM patches we already do — just reads from Shopify's cart object (`cart.items`, `cart.total_price`) instead of a local array.

### Brand rules — what to enforce in Liquid

The build keeps **most** of the original brand brief but overrides the color rules. When merchandisers add new content via Shopify admin, the section schemas should constrain them:

- **No all-caps display headings** — use `{{ section.settings.heading | downcase | capitalize }}` if you must, or document it in section help text. *(Kept from brief.)*
- **One italic flourish per page** — wrap the italic word with `<span class="display-italic">…</span>`. Don't expose as a free-form field; offer a "headline" + "italic word" pair so merchants can't put the whole headline in italics. *(Kept from brief.)*
- **Backgrounds limited to system tokens** — color pickers should be a select of `--bg / --bg-soft / --bg-card / --fg`, not free-form. *(Updated for Direction C palette — was the 4 warm neutrals, now white / off-white / light-gray / ink.)*
- **No emoji in copy** — flag in section help text. *(Kept from brief.)*
- **Photography note** — original brief called for "warm tropical neutrals, slightly golden lighting." With the white-background palette, photography should bias toward **clean, high-key studio lighting on white backgrounds** rather than warm golden tones. Brief the photographer accordingly.

---

## Font licensing

Currently using free Google Fonts:

- Display: **Newsreader** (free, SIL OFL — open source)
- Body: **Manrope** (free, SIL OFL — open source)
- Mono: **JetBrains Mono** (free, SIL OFL — open source)

No paid licenses required. If the brand later licenses a custom serif or sans, swap two lines in `assets/styles.css`:

```css
--font-display: "[Custom Serif]", "Newsreader", Georgia, serif;
--font-body: "[Custom Sans]", "Manrope", system-ui, sans-serif;
```

Upload the woff2 files to `assets/` in Shopify and add `@font-face` declarations at the top of `styles.css`.

---

## Known gaps for handoff

1. **Real product photography** is missing — every `.product-card__image`, `.pdp-hero__main`, `.story__image`, `.hero__image` uses placeholder treatments. The brand brief calls for "tight crops of eyes; warm studio lighting (slightly golden, never blue); diverse Southeast Asian models; product on `--santai-stone` sweeps."
2. **Hero photo** at the top of `index.html` is a CSS-only abstract eye composition. Replace `.hero__image-eye` + `.hero__lash` divs with an `<img class="hero__photo" src="…">` (the CSS rule already exists).
3. **Lash Finder recommendation logic** is hard-coded to Inbox. Build a small rules map mapping each (eye type · density · moment) combination to one of the 8 styles (Afterhours, Nightshift, Pitch, Inbox, Minutes, Boardroom, Kickoff, Twilight).
4. **Real reviews data** — the homepage shows three hard-coded reviews. Wire to Judge.me, Loox, or Yotpo via their Shopify app's Liquid block.
5. **No FAQ or Contact pages yet** — nav links to them are stubbed `href="#"`. Add Liquid templates when copy lands.

---

## Agents available for next phases

Subagent definitions live in `.claude/agents/` (relative to the repo root):

- `design-brand-guardian` — verify each new section against the Santai brand brief
- `engineering-frontend-developer` — pixel-perfect HTML/CSS additions
- `engineering-cms-developer` — Shopify Liquid port (Drupal/WP-flavored, but patterns transfer)
- `engineering-code-reviewer` — pre-handoff review
- `design-inclusive-visuals-specialist` — WCAG audit (focus rings, alt text, contrast)
- `engineering-technical-writer` — final handoff documentation

Spawn via `Agent` tool with the relevant `subagent_type`.
