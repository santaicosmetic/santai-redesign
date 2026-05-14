# Santai web — UI kit

A high-fidelity recreation of **santai-cosmetics.com**: a working click-thru of the homepage, the Lash Finder quiz, a product detail page, and the How-to-Apply masterclass page, plus the persistent header / footer / cart drawer.

## Run it

Open `index.html` in the preview pane. No build step.

## File map

| File | Purpose |
| --- | --- |
| `index.html` | Mounts the React app and routes between screens |
| `site.css` | All component styles (imports root `colors_and_type.css`) |
| `data.jsx` | Static content — products, eye shapes, occasions, looks |
| `Header.jsx` | Utility bar (rotating msgs), main header, sticky nav |
| `Footer.jsx` | Newsletter capture + 4-col + payment row |
| `ProductCard.jsx` | 4:5 editorial product card with hover cue + shade dots |
| `Homepage.jsx` | Hero, two-pillar block, bestsellers, story, eye-shape row, occasion row, reviews, promise band |
| `LashFinder.jsx` | The 4-step concierge quiz + result screen |
| `PDP.jsx` | Long-scroll editorial PDP (hero, trust strip, how-to, suit-grid, editorial, accordion, related) |
| `HowToApply.jsx` | Hero video + 3-step bands + mistakes/fixes + checklist + UGC |
| `CartDrawer.jsx` | Slide-in cart + free-shipping nudge + add-to-bag toast |

## What's interactive

- Click `Find my lash` (hero or pillar) → Lash Finder opens. Pick eye shape → look → frequency → flags → see the recommendation. Add to bag from the result screen.
- Click any product card → PDP opens. `Add to bag` slides the cart drawer in with the toast *"Added. One step closer to effortless."*
- Click `See how easy` (hero or pillar) or `How It Works` in the nav → How-to-Apply page.
- Header cart icon opens the drawer at any time. Free-shipping nudge updates with subtotal.

## What's *not* interactive (purposely)

- Real product photography is not available, so each product is rendered with a `<SantaiLashGlyph>` — a minimal placeholder lash on the brand-tinted card background. Swap with real macro shots before handoff.
- Account / wishlist / search icons are decorative.
- Checkout button is decorative — the kit ends at the cart drawer.
- The PDP's "See it on me" button is decorative (real implementation would be AR or video).

## Source of truth

This kit follows `colors_and_type.css` and the component preview cards in `preview/` exactly. If you change a token, change it in `colors_and_type.css` and it propagates here.
