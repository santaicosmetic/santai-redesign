# Santai Redesign — Progress & TODOs

Quick-resume doc for picking up the project across machines and sessions. Pair this with `CLAUDE.md` (project brief, in Mandarin) and `html-build/README.md` (technical reference).

---

## Project in one paragraph

Static HTML/CSS/JS prototype of `santai-cosmetics.com` — a Malaysian magnetic-eyelash brand. Visual system: white background, warm-nude accent (Direction C), Newsreader + Manrope fonts, mobile-first 360px. Everything lives in `html-build/`. Will port to a Shopify Liquid theme later (see `html-build/README.md` for the port spec).

---

## Where we are — as of 2026-05-28 (post-Session 14 UGC port)

> 🚀 **Shopify Liquid port is COMPLETE on the draft theme.** All 10 port sessions + 1 audit-rebuild session shipped 2026-05-21 / 2026-05-22 autopilot. New theme is **unpublished** on `cjuzxh-v0.myshopify.com` (theme #156386722014) — Atelier is still live and serving customers. **Final step is yours**: open Shopify admin → Online Store → Themes → "Santai 2026 — draft" → Actions → **Publish**. One-click cutover, reversible (Atelier becomes the unpublished backup).

> 📍 **Session 11 audit-rebuild (2026-05-22)** — Riri reported that homepage + PDP were missing many sections vs. the html-build prototype, and the cart drawer didn't open. Audit confirmed 5 missing homepage sections + 7 missing PDP sections + 2 cart bugs (icon navigated instead of opening drawer; no `/cart` template). All fixed and shipped as **theme-editor configurable** sections (Option C). Cart progress bar milestones rebalanced from 66.66%/100% → 50%/100%. PDP gallery now has prev/next arrows + pagination dots.

> 📍 **Session 12 reviews port (2026-05-23)** — Defined `review` metaobject + `santai.reviews` (product) + `santai.featured_reviews` (shop) metafields. Generated 367 mock reviews from a seeded Python script with realistic Malaysian Chinese / Malay / Indian voice mix + 17% lazy short-form. Populated metaobjects via GraphQL. PDP renderer now reads from per-product list, computes histogram + average + filter chips (All / Monolid / Double lid / Inner double lid / With photos) with client-side load-more pagination. Homepage band reads from shop's `featured_reviews` list. Full architecture documented in `REVIEWS.md`.

> 📍 **Session 13 reviews polish (2026-05-24)** — Fixed histogram bar visibility (`<span>` was inline). Built `/pages/reviews` all-reviews page with same filter chips + load-more. Changed homepage social-proof number `12,400 → 1,600+` for realism. Bumped Inbox / Boardroom review counts to 75 / 68 (bestsellers). Expanded voice pools 2-3×; scrubbed "Sangat suka" overuse; added Mandarin / Chinese-English code-switch voice; added a 20%-of-positive-reviews "learning curve narrative" arc ("first try was rough, now I'm hooked"). Bumped no-recent-repeat dedup window 12 → 20. Hit the Liquid 50-per-list cap; bypassed with a `santai.reviews_overflow` second list per product so 100 reviews can render. Reviews regenerated and re-populated (422 total).

> 📍 **Session 14 UGC video port (2026-05-28)** — Found the **Spark** app on the store (handle: `storeprops-spark`) — that's where Riri uploaded her UGC. Spark stores its data in a `sparkfeedlist` metaobject with a `feed_data` JSON field. Extracted 12 UGC videos with creator captions + product tags from "UGC Creator Videos" feed. Wired them as blocks in `home-ugc-slider` for both homepage and PDP (same 11 blocks). Videos autoplay (muted), loop, no @ handles shown. Card CSS was zooming/cropping because `<video>` had no sizing — fixed with `width:100%; height:100%; object-fit:cover` on `.ugc-card__video` and `.ugc-card__poster`.

> 🧭 **Walkthrough on the draft theme preview**:
> - Home: https://cjuzxh-v0.myshopify.com?preview_theme_id=156386722014
> - PDP: /products/pitch-magnetic-eyelashes (add to bag → cart drawer opens with real Shopify cart)
> - Collections: /collections/all, /collections/by-eye-shape, /collections/by-makeup, /collections/accessories
> - Pages: /pages/about, /pages/how-to-apply, /pages/faq, /pages/shipping, /pages/returns, /pages/care-guide, /pages/contact, /pages/wishlist
> - Blog: /blogs/journal + 3 articles
> - Search overlay: tap header magnifier on any page

> 🔑 **Shopify auth setup:** `.env` file in worktree root (gitignored) contains the Custom App admin token. CLI commands work via `set -a; source .env; set +a; shopify theme <cmd>`. Token has very broad scope — narrow it in the Shopify Dev Dashboard when convenient.

> 🔗 **Draft theme preview URL:** https://cjuzxh-v0.myshopify.com?preview_theme_id=156386722014
> Theme editor: https://cjuzxh-v0.myshopify.com/admin/themes/156386722014/editor

> 📱 **Live mobile preview** (auto-deploys on every push to `main`): **https://santaicosmetic.github.io/santai-redesign/**
> - Append `index.html`, `product.html`, `about.html`, `journal.html`, etc. for specific pages
> - GitHub Pages workflow lives in `.github/workflows/pages.yml`
> - If the repo flips back to private, the github.io URL still serves (Pages-from-Actions is decoupled from repo visibility)

**26 pages built**:

| Group | Pages |
|---|---|
| Core | `index.html`, `cart.html`, `wishlist.html`, `search.html`, `404.html` |
| Discovery | `collection.html`, `collection-makeup.html`, `collection-eye-shape.html`, `collection-accessories.html` |
| Product | `product.html` (lash template), `product-cleanser.html`, `product-curler.html` |
| Educate | `how-to-apply.html`, `faq.html` |
| Trust | `contact.html`, `shipping.html`, `returns.html`, `care-guide.html` |
| Legal | `privacy.html`, `terms.html`, `refund-policy.html` |
| Brand | `about.html` |
| Journal | `journal.html` (index), `journal-magnetic-vs-strip.html`, `journal-glue-damage.html`, `journal-styling-guide.html` |

**Working interactions** (all client-side, ready for Shopify port):
- Cart drawer with **gift tiers** (2 lashes → free Foam Cleanser; 3 → +Thermo Curler) + free-shipping promise band
- **Newsletter popup** — 5s delay, dismissal persists via localStorage
- **Header search overlay** — tap the magnifier on any of the 21 page headers; live-as-you-type results from `LASH_STYLES` + `ACCESSORIES`, capped at 6 with "See all N →" → `search.html?q=…`. Mobile full-screen sheet / desktop dropdown (≥720px). Submits to `search.html` as no-JS fallback.
- **Dedicated search page** (`search.html`) — same corpus, full-results view
- **Collection filter chips** — `?makeup=` / `?eye=` deep-linkable on `collection.html`
- **Collection sort dropdown** — Featured / Bestselling / Newest / Price ↑ / Price ↓; composes with filter chips
- **Compare Styles modal** on lash PDP
- **Wishlist** — localStorage-backed, Save buttons on all 3 PDPs
- **Lash Finder** — 4-step quiz modal with **working recommendation logic** (2026-06-10): `LASH_FINDER_MAP[eye][look][freq] → lash` in `theme.js` (36-cell table + dev self-check); flags add reassurance copy. Standalone `lash-finder.html` page + Shopify-theme port of the same map still open.
- **Contact form** — toast on submit, no backend

**Visual system + taxonomy** standardised everywhere:
- Direction C palette: `#FFFFFF` bg, `#B8957B` accent, `#0A0A0A` ink, `#F7F7F7` card
- Fonts: Newsreader (display, weight 300) + Manrope (body)
- 3 makeup buckets: **Natural / Light makeup / Heavy makeup**
- 3 eye-shape buckets: **Monolid / Double lid / Inner double lid**
- 10 lashes (all RM 119, unified) + 2 accessories (Foam Cleanser RM 29, Thermo Curler RM 39)

---

## Open TODOs

### 🚧 Pending follow-ups from Session 11 audit-rebuild (2026-05-22)

These are the items flagged at the end of Session 11. All require Riri's input or content. The Liquid sections + JS + CSS are already shipped — these are the content / config tasks remaining.

**Reviews data (highest impact)**
- [x] ~~**Define `review` metaobject in Shopify admin**~~ **Done Session 12 (2026-05-23).** Defined as a single metaobject type with `product` reference field. Architecture chose per-product `santai.reviews` metafield list (instead of one big `featured_review` type) — see `REVIEWS.md` for the full data model + why-duplicate explanation.
- [x] ~~**Define `featured_review` metaobject**~~ **Done Session 12 (different shape than originally planned).** Used a shop-level metafield `santai.featured_reviews` (list of `review` references) instead of a separate metaobject type. Homepage renderer updated accordingly. 9 featured pull-quotes curated from the 367 generated reviews.
- [x] ~~**Populate at least 6 real reviews per lash + 3 featured pull-quotes**~~ **Done Session 12 with mock data (367 reviews).** Generated via `scripts/generate-mock-reviews.py` (seeded, reproducible) with realistic Malaysian voice mix (Chinese / Malay / Indian, 17% lazy short-form). Real reviews from the Atelier theme can replace these by editing the CSV + re-running populate after a wipe.
- [ ] **Replace mock reviews with real ones** — pull real customer reviews from the Atelier admin, format them into the CSV schema (`data/mock-reviews.csv`), wipe existing review metaobjects, re-run `scripts/shopify-populate-reviews.py`. Owner: Riri. See `REVIEWS.md` "Wipe all reviews and start over" for the runbook.

**UGC content uploads (Riri can do via Shopify theme editor)**
- [ ] **Upload UGC videos for the homepage UGC slider** — Customize → "Real people, real results" → blocks have video picker + poster image + creator handle (e.g. `@aisyah_kl`) + quote + optional product tag. Currently shows 4 placeholder blocks with handles + quotes but no media.
- [ ] **Upload UGC videos for the PDP "From the community" slider** — same setup, different block content per product page.
- [ ] **Upload PDP demo video for "See it in action"** — Customize → "Watch how it works" → single video upload + poster image + caption. Currently shows a placeholder.

**Accessory PDPs**
- [x] **Accessory PDP — title fix + single video (Shopify theme)** — Done + deployed 2026-06-12. Curler/Cleanser fell back to the lash `product.json` (broken "The." title + two-column lash videos). Fixed: (1) `main-product.liquid` now shows the accessory name before the colon ("The Executive Lift." / "The Pure Ritual."), lash titles unchanged; (2) new `pdp-accessory-video.liquid` (one portrait centered video, theme-editor upload); (3) dedicated templates `product.executive-lift.json` (curler) + `product.pure-ritual.json` (cleanser) — clones of `product.json` with the two-column `videos` swapped for the single `accessory_video`, copy "Curlier lashes, lighter wear." / "Clean lashes, longer life." Pushed to draft #156386722014. ⚠️ Merchant uploads each accessory's video in the theme editor. Spec: `docs/superpowers/specs/2026-06-12-accessory-pdp-design.md`. **Known follow-up (deferred, agreed):** accessory pages still show lash-only sections (comparison "vs strip lashes", `pdp-suit` eye shapes, `pdp-howto` 3-step lash application, `pdp-editorial` lash quote, the "1 pair of … magnetic lashes" line) — trim/replace when ready.

**Photography**
- [ ] **Real product photography for Cleanser + Thermo Curler** — carried over from earlier sessions. Currently using lifestyle stand-ins.
- [ ] **Reshoot Afterhours on-eye photo** — current `[1]` image looks too natural for a "Heavy makeup, drama 5" hero. Card hover undersells the product. Non-blocking.
- [ ] **Accessory titles split-first-word display** — product cards show `product.title | split: ' ' | first`, so "The Pure Ritual: Professional Magnetic Lash Cleanser" displays as "The." Not a bug for lashes (one-word titles work), but accessories need either a shorter title (e.g. "Cleanser") or a different display strategy. Decide with Riri.

**Lash Finder (carried over, blocked on Riri)**
- [x] ~~**Recommendation logic**~~ **Done 2026-06-10 (html-build prototype + Shopify theme).** `LASH_FINDER_MAP[eye][look][freq] → lash` in `theme.js` — a 36-cell table with a dev self-check that warns on any cell whose lash doesn't fit that eye shape; flags add reassurance copy only (don't change the pick). Design + plan in `docs/superpowers/specs|plans/2026-06-10-lash-finder-recommendation*`. **Ported into `shopify-theme/assets/theme.js` (commit `ec7dbae`)** — same map/logic; reads live product data from Liquid-injected `window.LASH_STYLES`, "See full details" uses the real Shopify product url, add-to-cart resolves short_id→variant via the existing cart layer. ⚠️ **Code-only — not yet deployed/published to the store** (needs Shopify CLI + token; do a live click-through after deploy).
- [ ] **Standalone `/pages/lash-finder` page** — currently only exists as a modal. Build a full-screen, deep-linkable surface. Pairs with the recommendation logic.

**Brand chrome (carried over)**
- [ ] **Open Graph / Twitter Card tags** — none on any template yet. Social previews break when shared.
- [ ] **Favicon** — waiting on brand design.
- [ ] **Stockists / Sustainability / Press pages** — stubbed `href="#"`. Build when content exists.

**Site-wide bug-fix pass (2026-06-12) — editable images + working interactions**
- [x] **Homepage images all editable** — `main-home.liquid` now has `image_picker` settings (with fallback) for: hero cover (3 slides), Shop-by-eye-shape tiles (3), Shop-by-makeup tiles (3). Merchant swaps any in the theme editor → "Home (main)".
- [x] **Lash Finder result fixed** — result now shows the product photo (left) linked to its PDP; was a placeholder line with no image/link. (`theme.js renderResult` + `.finder-result__photo` CSS.)
- [x] **Compare Styles fixed** — the modal markup was never ported to the theme, so `initCompare()` bailed at `#compareModal` and the button did nothing. Added `snippets/compare-modal.liquid`, rendered on lash PDPs (`unless is_accessory`). CSS + JS already present.
- [x] **Search & wishlist links fixed** — JS was building prototype `product.html?style=` / `product-*.html` / `search.html` / `collection.html` URLs (404 on Shopify). Now uses the injected `s.url`/`a.url` and Shopify routes (`/search`, `/collections/all`).
- [x] **Search results page added** — theme had NO search template, so submit/chips went nowhere. Added `templates/search.json` + `sections/main-search.liquid` (renders `search.results` as product-cards + empty state).
- [x] **Newsletter popup actually subscribes** — handler used `preventDefault()` and silently dropped every signup; now lets the `{% form 'customer' %}` POST (marks dismissed first). NOTE: footer newsletter form not re-checked — verify it POSTs too.
- [x] **More fixes 2026-06-12 (audit round 3):** (1) `how-to-apply` page now an editable section (uploadable hero + per-step videos, corrected 5 steps); (2) Compare Styles now plays each style's `real_video` (fixed: was grabbing the unplayable m3u8 source → now mp4); (3) real-footage videos autoplay+loop in compare and PDP "See it on a real eye"; (4) newsletter popup form now found reliably; (5) **accessory PDPs (curler/cleanser) trimmed to `[main, accessory_video]`** — removed lash-only sections (suit/comparison/howto/ugc/reviews/editorial) that showed wrong content; (6) per-wear "30 wears per pair" strip guarded `unless is_accessory`; (7) PDP review summary stars now render from the real average (was hardcoded ★★★★★). All deployed to draft #156386722014.
- [ ] **Cart discount-code field (drawer)** — still fake ("No discount code matches"); never calls Shopify. DECIDE: remove it (apply at checkout) vs wire to Shopify. Owner: Riri. (Drawer subtotal also recomputed client-side — only diverges once a real discount exists; fix together.)
- [x] **Cart gift tiers — DONE 2026-06-12.** Created 2 Shopify automatic Buy-X-Get-Y discounts ("Free Foam Cleanser with 2 lashes", "Free Thermo Curler with 3 lashes", 100% off, 1 per order). `theme.js` Shopify cart now auto-adds/removes the gift accessory (line property `_gift:true`) to match the lash count via `/cart/add.js` + `/cart/change.js`; the discount zeroes them; drawer surfaces them as gift lines + savings; progress bar reflects real state. ⚠️ Test on the real storefront (cart Ajax + discounts don't run in the theme-editor preview). Add-to-cart itself was already working (standard `{% form 'product' %}` → Ajax).
- [ ] **Cart manual discount-code field** — still fake ("No discount code matches"); separate from the gift tiers above. DECIDE: remove it (codes at checkout) vs wire to Shopify. Owner: Riri.

**Sections built but not yet exercised in theme editor by merchandiser**
- [ ] Once the live theme is published, Riri should do a pass through the theme editor to confirm she can reorder sections, edit copy, swap images. The 5 new homepage sections + 5 new PDP sections all have presets so this should be straightforward.
- [x] **Swappable "Shop by eye shape" tile images (Shopify theme)** — Done 2026-06-12. Three `image_picker` settings on `main-home.liquid`; each tile shows the merchant photo (object-fit: cover, 4:5) when set, else the brand SVG. Click-through links + Lash Finder / collection-page illustrations unchanged. Spec/plan: `docs/superpowers/{specs,plans}/2026-06-12-eye-shape-tile-images*`. **Deployed to draft theme #156386722014 2026-06-12.**
- [x] **PDP videos — Tutorial + per-product Real footage, side-by-side portrait (Shopify theme)** — Done + deployed 2026-06-12 (v2). Replaced the portrait `pdp-action` demo with ONE combined section `pdp-videos` showing two **portrait (9:16)** columns side by side (desktop ≥720px; stacked on mobile): left = Tutorial (shared video, section setting), right = Real footage (per-product). Real footage uses the new `santai.real_video` **`file_reference` (Video)** metafield — merchant picks/uploads a video file directly per product; the right column only appears for products that have one (storefront), always shows in the theme editor. Copy: "Easier than mascara." / "See it on a real eye." PDP order: `main, comparison, videos, howto, suit, ugc, reviews, editorial`. Pushed to draft theme #156386722014; old `pdp-action` / interim `pdp-tutorial` / `pdp-real-footage` sections removed remotely. Spec/plan: `docs/superpowers/{specs,plans}/2026-06-12-pdp-landscape-videos*` (spec has a v2 revision block). ⚠️ **Merchant still uploads the videos**: tutorial in the theme editor (PDP → "PDP — Videos" → Tutorial video); real footage per product under Products → [product] → Metafields → "Real footage video".

### High priority — from review on 2026-05-19

- [x] ~~**Search → dropdown overlay.**~~ **Done 2026-05-19.** New `initSearchOverlay()` module in `theme.js` injects an overlay into `<body>` and intercepts every `[data-search-trigger]` anchor across all 26 pages. Mobile: full-screen sheet with sticky input. Desktop (≥720px): centered 720px dropdown with backdrop + shadow. Live filter against same corpus as `search.html` (LASH_STYLES + ACCESSORIES); shows up to 6 compact rows with "See all N results →" link to `search.html?q=…` when more exist. Form action still submits to `search.html` as the no-JS / full-results fallback. Skips on `search.html` itself via `body[data-screen=search]`. ESC + backdrop + close button all dismiss; body scroll-locked while open.

- [x] ~~**Remove "Santai Studio" everywhere.**~~ **Done 2026-05-19.** Deleted the fake address card on `contact.html`; rewrote footer newsletter quote (`Join the Santai list`), Connect column link (`Loyalty`), newsletter-popup eyebrow (`— Join the list`) and subtitle (`...notes from the Santai team`) across all 26 pages; scrubbed page-specific copy in `contact.html`, `care-guide.html`, `faq.html`, `privacy.html`, `shipping.html`, `returns.html`, `refund-policy.html`.

- [x] ~~**Comprehensive link audit.**~~ **Done 2026-05-19, plus pre-port pass 2026-05-21.** Crawler scans every `<a>` across all 26 pages; 0 broken internal file references. Standardised footers, wired all stub anchors that had real destinations. The pre-port pass on 2026-05-21 additionally wired Instagram + TikTok footer URLs and removed the dead Account button site-wide. Remaining `href="#"` are intentional: Loyalty (no page yet), Lash Match quiz (`data-finder-open` modal trigger), Lash Finder dismiss (modal close), reviews "Read all" / "Write a review" (deferred to Reviews session), pagination on `collection.html` (decorative).

### Smaller / known gaps (carried over)

- [x] ~~**About / Our Story page**~~ **Done 2026-05-20.** Built `about.html` with founders' magnetic-lash backstory, the "santai je" naming explanation, and CTAs to Lash Match + the full collection. Uses `.page-hero` editorial-image class + existing `.page-policy` typography. Footer "Our story" link wired across all 26 pages.
- [x] ~~**Journal index + article template + 3 posts**~~ **Done 2026-05-20.** Built `journal.html` index + 3 standalone article pages (Tutorial / Lash care / The truth about) each with hero image, meta line, body, related-posts cross-links. Homepage journal cards and footer "The journal" links wired across all 26 pages. Placeholder lifestyle images used as covers — swap for real photography later.
- [x] ~~**Sort dropdown on `collection.html`**~~ **Done 2026-05-19.** Wired Featured / Bestselling / Newest / Price ↑ / Price ↓. Composes cleanly with filter chips.
- [x] ~~**Unify lash pricing at RM 119**~~ **Done 2026-05-21.** All 10 lashes priced at RM 119 (was a spread RM 79–105). Bulk find/replace across 15 files (89 substitutions). Per-wear math + journal comparison table updated. Accessories untouched. PROGRESS.md catalogue line reflects the unified price for the port engineer.
- [x] ~~**Unify shipping copy → free across Malaysia, no minimum**~~ **Done 2026-05-21.** Utility bars on 9 stale pages, FAQ shipping Q, and product PDP shipping accordion all updated. Single truth: free to anywhere in Malaysia, every order, no minimum.
- [x] ~~**"Show all 10" Lash Finder dismiss link**~~ **Done 2026-05-21.** Fixed the 4 pages still showing "show all 8" (was stale from when catalogue was 8 lashes).
- [x] ~~**Social URLs (Instagram + TikTok)**~~ **Done 2026-05-21.** Instagram → `https://www.instagram.com/santaicosmetics.my/` and TikTok → `https://www.tiktok.com/@santai.cosmetics/video/7624990695748537608` wired across all 26 footers (`target="_blank" rel="noopener"`). Note: TikTok URL is a specific video, not a profile — users can tap the username to reach the profile. Loyalty footer link stays as `#` until a loyalty page exists.
- [x] ~~**Remove dead Account button**~~ **Done 2026-05-21.** Header account icon was a `<button>` with no link or handler — removed from all 26 headers. Header right side now has only Wishlist + Cart icons. Shopify-managed account pages can be added back at port time.
- [ ] **Real product photography for Cleanser + Thermo Curler** — currently using lifestyle photo stand-ins
- [x] ~~**Lash Finder recommendation logic**~~ **Done 2026-06-10 (html-build).** 36-cell `LASH_FINDER_MAP` in `theme.js` maps (eye × look × freq) → lash; flags add reassurance copy. Verified in-browser across 3 representative paths (monolid·drama·events→Nightshift, double-lid·natural·daily+firsttime→Inbox, inner-double-lid·office·weekly→Boardroom) + add-to-cart + close-link regressions. Shopify-theme port pending.
- [ ] **Lash Finder as its own dedicated page** — currently only exists as a modal triggered by `data-finder-open` buttons across the site. Build a standalone `lash-finder.html` page that runs the same 4-step flow but full-screen, deep-linkable, shareable. Pairs with the recommendation-logic task — build both with Riri.
- [ ] **Reviews: dedicated session** — homepage shows 3 hardcoded reviews; PDP shows a hardcoded "Based on 247 reviews" + "Read all 247 reviews" / "Write a review" links. **No third-party app** (no Judge.me / Loox / Yotpo). At port time, reviews live in **Shopify product metafields**. A separate session will design the metafield schema (review body, rating 1-5, reviewer name, eye-shape tag, date) and the Liquid rendering for review cards + count + average. Until then, keep the placeholder copy on the prototype.
- [ ] **Stockists / Sustainability / Press** — stubbed as `href="#"`. Build only if/when the brand actually has these.
- [ ] **Newsletter signups (footer + popup)** — currently `event.preventDefault()` only. At Shopify port, wrap the existing form markup in `{% form 'customer' %}` and POST to Shopify's customer-create endpoint with `contact[tags]="newsletter"` and `accepts_marketing: true`. Sending handled by **Shopify Email (native)** — no third-party apps. Confirmed 2026-05-20.
- [ ] **Open Graph / Twitter Card tags** — none of the 26 pages have OG / Twitter tags yet. Social previews break when shared on WhatsApp / Instagram DMs / Twitter / LinkedIn. Add at minimum `og:title`, `og:description`, `og:image`, `og:type` per page. Liquid port can template these from `{{ page.title }}` etc.
- [ ] **Favicon** — accepted as deferred until brand design lands a favicon asset. No favicon on any page right now.

### Out of scope — Shopify handles at port time

- Real cart state (currently in-memory JS)
- Checkout flow
- Real search backend (currently client-side over static catalogue)
- Real discount code validation
- Newsletter sending (Shopify Email native — no app, no separate vendor)

---

## What shipped in Session 11 audit-rebuild (2026-05-22)

**Cart fixes**
- `sections/header.liquid` — cart icon (`href="{{ routes.cart_url }}"`) now also carries `data-cart-open` → opens drawer
- `templates/cart.json` + `sections/main-cart.liquid` — graceful fallback when a user hits `/cart` directly (e.g. from cookie restore, from Shopify checkout back-link)
- `assets/santai.css` — milestone positions changed from `66.66% / 100%` → `50% / 100%` so the bar reads as two equal halves
- `assets/theme.js` — `renderProgress()` fill math now: 0 lashes = 0%, 1 = 25%, 2 = 50%, 3+ = 100%

**Homepage — 5 new theme-editor configurable sections** (all live in `shopify-theme/sections/`)
- `home-comparison.liquid` — "Beauty shouldn't hurt" table, schema has repeatable feature rows (feature + santai_value) + 3 column labels + CTA
- `home-reviews.liquid` — "12,400 lash converts", metaobject-driven (`shop.metaobjects.featured_review.values`) with manual fallback blocks and full empty-state hide
- `home-value-props.liquid` — "Made for every day" 4-grid, blocks have icon picker (sparkle/feather/recycle/shield/clock/leaf) + title + description
- `home-ugc-slider.liquid` — "Real people, real results", blocks have video + poster image + creator handle + quote + optional product picker (clicking the card opens that PDP)
- `home-faq.liquid` — "You asked, we answered", blocks have question + rich-text answer

**PDP — 5 new sections + 2 reused** (all live in `shopify-theme/sections/`)
- `pdp-action.liquid` — "Watch how it works" single video + poster + caption
- `pdp-howto.liquid` — "Three steps. Thirty seconds." 3-step blocks (image + title + description)
- `pdp-suit.liquid` — "Will this suit me?" 3-cell verdict grid; metafield-driven from `product.metafields.santai.eye_buckets`. Marks fitting eye shapes as "Beautiful" in accent colour; for shapes that don't fit, recommends the first sibling lash that does
- `pdp-reviews.liquid` — driven by `product.metafields.santai.reviews` metaobject list; computes histogram + average automatically; falls back to manual sample blocks; empty state: "Be the first to review"
- `pdp-editorial.liquid` — full-bleed image + italic quote
- `home-comparison.liquid` (reused on PDP via `product.json`)
- `home-ugc-slider.liquid` (reused on PDP via `product.json`)

**Template wiring**
- `templates/index.json` — order: `main, comparison, reviews, value_props, ugc, faq`
- `templates/product.json` — order: `main, comparison, action, howto, suit, ugc, reviews, editorial`
- `templates/cart.json` — added

**PDP gallery**
- `sections/main-product.liquid` — added prev/next nav buttons + pagination dots
- `assets/theme.js` `initPDP()` — wired prev/next + dot clicks, keeps dot active state in sync with main image. Touch-swipe still works.
- `assets/santai.css` — added `.pdp-hero__nav` + `.pdp-hero__dots` styles. Arrows fade in on hover (desktop) / always visible on touch devices. Dots use frosted-glass background.

**Product images audit** (no Shopify-side reordering needed)
- Confirmed all 10 lash products have `images[1]` = on-the-eye close-up (photographer was consistent across shoots). Hover-swap on product cards uses this directly.

**Metafield narrowing** (pre-Session 11)
- `scripts/shopify-metafields.py` — narrowed `eye_buckets` from "most lashes fit all 3 shapes" to a curated 4-per-bucket scoping matching the prototype's expert taxonomy (Inbox/Pitch/Nightshift/Minutes for Monolid, etc.). Re-ran on production.

**Collection template suffix fix** (pre-Session 11)
- `scripts/shopify-collections.py` — added `templateSuffix` field on collection create/update mutations. Before this, `/collections/by-eye-shape` was falling through to the default flat-grid template instead of our grouped-by-bucket template.

---

## Recent commit history (most recent on top)

```
be5f203 feat: unify all lash prices at RM 119 for cleaner Shopify port
35eb356 chore: replace Klaviyo with Shopify Email (native) as the newsletter backend plan
89e8124 feat: add About page + journal index + 3 long-form articles
f17eb86 ci: trigger Pages redeploy after switching Source to GitHub Actions
1694351 feat: wire Sort dropdown on collection.html
deb34e4 ci: re-trigger Pages deploy after env rule fix
68fecee ci: auto-deploy html-build/ to GitHub Pages on push to main
43e8981 feat: add header search overlay (mobile sheet + desktop dropdown)
a38c05b chore: link audit pass — standardise footer + wire dead anchors
188b39c chore: purge "Santai Studio" / KL studio references site-wide
c94f4be docs: add PROGRESS.md as running state doc + 3 new TODOs from latest review
5615239 chore: footer sweep + header wishlist link across all 26 pages
e8b6d43 feat: add wishlist (localStorage) + Save buttons on all PDPs
6bf9484 feat: add Privacy, Terms of service, and Refund policy pages
c8167d6 feat: add Contact, Shipping, Returns, and Care guide pages
```

Full history: `git log --oneline`.

---

## Up next — recommended order

> **The Shopify port is now underway.** Session 1 (scaffolding) done. The phased port runs sessions 2-10 below; Reviews + Lash Finder are sub-tracks that slot into the port at the right phase.

### Port sessions (continuing from where session 1 left off)

**Session 2 — Header + footer + cart drawer** (~1-2h, recommended next)
- Extract from any prototype HTML page → `sections/header.liquid` + `sections/footer.liquid` + `snippets/cart-drawer.liquid` + `snippets/newsletter-popup.liquid`
- Wire utility bar to repeater settings, nav to a Shopify linklist, cart icon to `cart.item_count`
- Header dropdown + cart drawer + newsletter popup all working across all pages
- Theme is still mostly empty pages but the chrome works everywhere

**Session 3 — Product template + data port** (~3-4h)
- `templates/product.liquid` + `sections/product.liquid` from the prototype's PDP
- Confirm the 10 lashes + 2 accessories in the Shopify admin have correct prices:
  - All 10 lashes RM 119 ✓ (per user 2026-05-21)
  - Memo + VIP Access: compare_at_price RM 139 → sale price RM 119 (compare-at-strikethrough wiring needed)
  - **Foam Cleanser RM 16.60** (not RM 29 as in prototype JS — prototype is the stale one)
  - **Thermo Curler RM 29.90** (not RM 39 as in prototype JS — prototype is stale)
- Design + write metafield definitions (namespace: `santai`) for: group, eyeType, drama, length, curl, design, fits_eye_shapes
- Populate metafields on existing products via Shopify CLI or admin API
- One PDP fully working

**Session 4 — Reviews metafields (sub-track of port)** (~1h design + ~1h implementation)
- Design product-review metafield schema in Shopify (rating, body, name, eye-shape tag, date, optional photo). Decide per-product vs global, anonymous vs named, moderation flow.
- Liquid renderer for homepage 3-review module + PDP "Based on N reviews" badge + PDP review list + "Read all" / "Write a review" CTAs.
- Replace the prototype's hardcoded "Based on 247 reviews" with metafield-driven count.

**Session 5 — Collections** (~2-3h)
- All 4 collection templates: `templates/collection.liquid` (shop-all) + 3 curated (`collection.makeup.liquid`, `collection.eye-shape.liquid`, `collection.accessories.liquid`)
- Filter chips port to client-side over Liquid-rendered product loops, reading `data-makeup` + `data-eye` from product tags or metafields
- Sort dropdown switches to Shopify's `?sort_by=` URL pattern

**Session 6 — Cart Ajax rewrite** (~2-3h)
- Rewrite the in-memory `cart` array + `addToCart` / `renderCart` against `/cart.js` + `/cart/add.js` Ajax
- Gift-tier logic (2 lashes → free Cleanser, 3 → +Curler) reads live prices from Shopify products. Update the "RM 68 saved" copy in cart UI to RM 46.50 (16.60 + 29.90) — or better, calculate dynamically from real prices.
- Cart drawer + cart page both render real cart state
- Upsells row reads from a "you might also like" collection or recommendation engine

**Session 7 — Page templates** (~1-2h)
- About, FAQ, how-to-apply, contact, all 3 trust pages, all 3 legal pages → Shopify "Online Store > Pages" with each page using `templates/page.<handle>.liquid`
- Mostly mechanical: copy the page-specific section from the prototype HTML, wrap with `{% layout 'theme' %}`

**Session 8 — Blog (journal)** (~1h)
- `journal.html` → `templates/blog.journal.liquid`. The 3 articles become Shopify blog posts. Article template `templates/article.liquid` renders any blog post in the journal style.

**Session 9 — Search + Lash Finder** (~1-2h)
- Header search overlay reads from a Liquid-rendered product JSON blob (or Shopify Predictive Search API).
- Lash Finder modal stays as-is. Standalone `lash-finder.html` → `templates/page.lash-finder.liquid`. Recommendation rules from Riri's table wired into `initLashFinder()`.

**Session 10 — Testing + publish** (~2-3h)
- Theme editor walkthrough: every section editable for merchandiser via Shopify admin
- Cross-browser, mobile-first 360px check on the dev preview URL
- Set up redirects for any URL changes
- **Publish** — flip "Santai 2026" from draft to live. Atelier becomes the unpublished fallback. Reversible.

### Lash Finder sub-track (slots into Session 9, waits on Riri)

- (a) Recommendation logic — `(eye × look × frequency × flags) → product handle` lookup map. **Owner: Riri.**
- (b) Standalone `lash-finder.html` page — full-screen, shareable, deep-linkable surface that runs the same flow.

### Polish (after port lands)
- Real product photography for Cleanser + Thermo Curler
- Open Graph / Twitter card tags
- Favicon (waiting on brand design)
- Stockists / Sustainability / Press pages (when content exists)
- ~~Reviews session~~ (now integrated as Session 4 above)

---

## Original "Up next" — superseded by the port plan above

1. **Reviews session (Shopify metafields)** (~1h design + ~1h implementation)
   - Design the product-review metafield schema in Shopify: review body, rating 1-5, reviewer name, eye-shape tag, date, optional photo. Decide on per-product vs global review list, anonymous vs named, moderation flow.
   - Hand-write the Liquid renderer for the homepage 3-review module, the PDP "Based on N reviews" badge, the PDP review-card list, and the "Read all reviews" + "Write a review" CTAs.
   - Replace the prototype's hardcoded "Based on 247 reviews" copy with the real metafield-driven count at port time.

2. **Lash Finder: recommendation map + standalone page** (waiting on Riri, ~2-3h once she's in)
   - Two related tasks best done together:
     - **(a) Recommendation logic.** Current `initLashFinder()` in `theme.js` always returns "Inbox" regardless of answers. Needs a `(eye × look × frequency × flags) → product handle` lookup mapping each combo to one of the 10 lashes.
     - **(b) Standalone page.** Quiz currently only exists as a modal. Build `lash-finder.html` as a full-screen, shareable, deep-linkable surface that runs the same flow. Modal stays for in-context quick triggers.
   - Why now: it's one of the two brand promises ("the right lash for YOUR eye") and currently faked.
   - **Owner: Riri** — she knows the product taxonomy better than Jeff. Suggested approach: she drafts the rules table, then Claude wires it + builds the standalone page in one batch.

3. **Shopify Liquid port** (the actual migration)
   - All the prep above is done so this is mostly mechanical. See `html-build/README.md` "Shopify Liquid port — recommended structure" table for the page-by-page plan.
   - Port-readiness summary (from 2026-05-21 audit):
     - In-memory `cart` array → `/cart.js` + `/cart/add.js` Ajax (sketch in README)
     - `LASH_STYLES` + `ACCESSORIES` JS literals → Liquid loops over real products. Per-product fields (group, eyeType, drama, length, curl, design) → product metafields under `santai.*` namespace
     - Header search overlay corpus → either keep client-side (read from a Liquid-rendered product JSON blob) or rewrite to Shopify Predictive Search API (client-side simpler for ≤50 products)
     - Collection filter chips → render `data-makeup` + `data-eye` from product tags in Liquid; keep client-side filter JS
     - Sort dropdown → replace with Shopify collection `?sort_by=` URLs (let Shopify do the sort)
     - Wishlist localStorage → keep as-is for v1
     - Newsletter forms → wrap in `{% form 'customer' %}` per the Klaviyo-cleanup commit
     - Compare Styles modal → reads from `LASH_STYLES` JS literal; port via the same Liquid-to-JSON approach
     - Account icon → add back after port (Shopify generates the account pages)

4. **Polish, later**
   - Real product photography for Cleanser + Thermo Curler
   - Open Graph / Twitter card tags
   - Favicon (waiting on brand design)
   - About-related deferrals: Stockists / Sustainability / Press

---

## How to continue on the home machine

```powershell
cd <repo-path>
git checkout main      # or `git switch main` on newer git
git pull               # picks up everything from the mobile session
```

Open Claude Code in the repo and paste a fresh prompt like:

> Continuing Santai. Read `PROGRESS.md` (especially the "Up next" section) and confirm current state. The next thing I want to work on is the **Reviews metafield design session** (item 1 in "Up next"). Walk me through what fields each review should have on a Shopify product metafield, then sketch the Liquid renderer for the PDP review block and the homepage 3-review module.

The Claude Code session will auto-load `CLAUDE.md` (project brief, in Mandarin) and pick up the visual-system rules (Direction C, mobile-first ≥44px touch, etc.).

---

## How to continue remotely (Claude on a phone)

The Claude iOS chat app can plan and write code but can't run terminal/file tools or push commits. To pick up effectively from your phone:

1. **Open this `PROGRESS.md` on GitHub mobile** (`github.com/santaicosmetic/santai-redesign/blob/main/PROGRESS.md`) so you can scroll the current state.
2. **Open a new conversation in Claude iOS app.**
3. **Prompt with the resume template below.** Paste this PROGRESS.md into the conversation so Claude has full context.

### Resume prompt template (copy into Claude iOS)

> I'm continuing my Santai Cosmetics website redesign project. The repo is at github.com/santaicosmetic/santai-redesign on the `main` branch.
>
> Below is the current `PROGRESS.md` from the repo (paste full contents here). Read it and confirm you have the current state.
>
> The next TODO I want to work on is: **[paste one of the High Priority items above]**.
>
> Please plan the approach in 3-5 sentences, then write the actual code changes I should make (file paths, complete code blocks). I'll review and commit them from my desktop later.

### To execute changes directly from the phone

Either of these works but needs setup:

- **Claude Code in browser** (`claude.ai/code`) on the phone browser — full Claude Code with file tools, if your account supports it.
- **SSH from phone into your desktop** — install Tailscale on the desktop, an SSH client on the phone (Blink Shell / Termius), then SSH in and run `claude --continue` to resume a Claude Code session.

---

## Doc pointers

| Doc | What it covers | Audience |
|---|---|---|
| `CLAUDE.md` (root) | Project brief, design rules, visual system, agents | Auto-loaded by Claude Code every session. In Mandarin. |
| `PROGRESS.md` (this file) | Current state + open TODOs + how to continue | Anyone picking up; especially you on iOS |
| `REVIEWS.md` (root) | Reviews system architecture + runbook (metaobject schema, populate scripts, filter logic, Flow patterns) | Anyone touching the review system or wiring it into automation |
| `HANDOFF.md` (root) | Original one-time Jeffery → Riri setup | First-time clone on a new machine |
| `html-build/README.md` | Visual system reference, file map, Liquid port spec | Engineering / port to Shopify |

Update `PROGRESS.md` whenever a batch lands (commit it together with the code change). The other three docs change less often.
