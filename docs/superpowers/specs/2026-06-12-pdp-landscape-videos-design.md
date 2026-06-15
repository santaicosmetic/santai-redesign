# Design — Two landscape PDP videos: Tutorial + per-product Real footage

Date: 2026-06-12
Status: Approved approach (Shopify theme only; merchant uploads videos)

## Goal

Replace the single portrait demo video on the product page with **two landscape
(16:9) video sections**:

1. **Tutorial** — one shared "how to apply" video for every product page.
2. **Real footage** — a different real wear-test video per lash style, so the
   customer sees the actual on-eye effect of *that* product.

Copy is finalised (see below). The merchant uploads the videos herself — code
ships with empty/fallback states.

## Finalised copy

| | Eyebrow | Heading (one italic word) | Caption |
|---|---|---|---|
| Tutorial | `HOW TO APPLY` | Easier than *mascara.* | Three seconds. No glue, no mirror gymnastics. |
| Real footage | `REAL FOOTAGE` | See it on a real *eye.* | Filmed on real customers. Nothing retouched. |

All headings/captions remain editable in the theme editor (they are section
settings with these defaults).

## Context

- Current `templates/product.json` order:
  `main, comparison, action, howto, suit, ugc, reviews, editorial`.
- `action` = `sections/pdp-action.liquid` — a **portrait 9:16** demo video
  (`.pdp-action__video { aspect-ratio: 9/16; max-width: 380–440px }`), driven by
  section settings, so it shows the *same* video on every product. This section
  is being removed.
- The theme already stores videos as plain mp4 URLs (the `home-ugc-slider`
  blocks use `video_url` = `https://cdn.shopify.com/videos/...`). The
  per-product real-footage video reuses this convention via a metafield.
- Product metafields live under the `santai.*` namespace, defined idempotently by
  `scripts/shopify-metafields.py`.

## Scope

**In scope (Shopify theme only)**
- Remove the `action` (portrait demo) section from the product template and
  delete `sections/pdp-action.liquid`.
- New section `sections/pdp-tutorial.liquid` — landscape, shared video.
- New section `sections/pdp-real-footage.liquid` — landscape, per-product video
  from a metafield, hides when empty.
- New product metafield definition `santai.real_video` (type `url`).
- Shared landscape video CSS in `assets/santai.css`.
- Wire both into `templates/product.json`; update the order.
- Deploy to the draft theme; merchant uploads videos after.

**Out of scope**
- The html-build static prototype (`product.html`) — left unchanged; the
  per-product metafield concept has no equivalent in static HTML. (Decided with
  user.)
- Uploading the actual videos — the merchant does this (tutorial in the theme
  editor; real-footage per product under Products → [product] → Metafields).
- The existing `home-ugc-slider` "From the community" section — untouched.

## Design

### Section A — `sections/pdp-tutorial.liquid`

- Markup mirrors the old pdp-action head (eyebrow + `display-l` heading with one
  `display-italic` span), then a **landscape** video frame.
- Video source: `section.settings.video` (shared across all products).
- States:
  - video set → `<video controls playsinline preload="metadata" poster=…>`
  - video empty → placeholder text "Add a tutorial video in the theme editor".
- Schema settings: `eyebrow`, `heading_pre`, `heading_italic`, `video`,
  `poster` (image), `caption`, with the finalised defaults. Has a `preset`.

### Section B — `sections/pdp-real-footage.liquid`

- Same head structure (eyebrow + heading + italic).
- Video source: **`product.metafields.santai.real_video`** (a URL string).
- States:
  - metafield set → render `<video controls playsinline preload="metadata">`
    with that URL.
  - metafield empty **and** in theme editor (`request.design_mode`) → show a hint
    "Add this product's real-footage URL under its Metafields (santai.real_video)".
  - metafield empty **on the live storefront** → the whole section renders
    nothing (no empty block).
- Schema settings: `eyebrow`, `heading_pre`, `heading_italic`, `caption` (no
  video picker — video is per-product via metafield). Has a `preset`.

### Per-product video data — metafield

Add to `scripts/shopify-metafields.py` `DEFINITIONS`:

```python
{'key': 'real_video', 'name': 'Real footage video (mp4 URL)', 'type': 'url',
 'desc': "Per-product real wear-test video. Upload the mp4 under Settings → Files, paste its URL here. Shown in the 'See it on a real eye' PDP section; the section hides when empty."},
```

Run the script once (`set -a; source .env; set +a; python3 scripts/shopify-metafields.py`)
to create the definition on the store. It is idempotent (existing defs skip).
The merchant then fills the URL per product.

### Layout / CSS (`assets/santai.css`)

Add a shared landscape video block (mobile-first):

```css
.pdp-wide { padding-block: var(--space-7); }
@media (min-width: 1024px) { .pdp-wide { padding-block: var(--space-9); } }
.pdp-wide__video {
  position: relative;
  aspect-ratio: 16/9;
  background: var(--bg-card);
  overflow: hidden;
  max-width: 880px;
  margin: 0 auto;
}
.pdp-wide__video > video,
.pdp-wide__video > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pdp-wide__placeholder { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; color: var(--fg-muted); font-size: 14px; padding: var(--space-4); }
.pdp-wide__caption { text-align: center; margin-top: var(--space-4); color: var(--fg-muted); font-size: 13px; }
```

(Reuses existing design tokens; both new sections share these classes.)

### Template wiring — `templates/product.json`

- Remove the `action` section object.
- Add `tutorial` (`type: pdp-tutorial`) and `real_footage` (`type: pdp-real-footage`)
  with the finalised default settings.
- New order:
  `main, comparison, tutorial, howto, suit, real_footage, ugc, reviews, editorial`.

## Behavior

| Section | Empty state (storefront) | Empty state (theme editor) | Filled |
|---|---|---|---|
| Tutorial | placeholder text in frame | placeholder text in frame | shared video, 16:9 |
| Real footage | section hidden | hint to add metafield | per-product video, 16:9 |

## Files touched

- Delete: `shopify-theme/sections/pdp-action.liquid`
- Create: `shopify-theme/sections/pdp-tutorial.liquid`
- Create: `shopify-theme/sections/pdp-real-footage.liquid`
- Modify: `shopify-theme/templates/product.json` (remove action, add 2, reorder)
- Modify: `shopify-theme/assets/santai.css` (add `.pdp-wide*` block)
- Modify: `scripts/shopify-metafields.py` (add `real_video` definition)
- Run: `scripts/shopify-metafields.py` once (creates the store-side definition)

## Verification

- Local: Liquid section schemas validate as JSON; product.json validates as JSON;
  grep confirms `action`/`pdp-action` fully removed and the two new types present.
- After deploy to draft theme #156386722014:
  1. Theme editor → a product → confirm "PDP — Tutorial" and "PDP — Real footage"
     sections appear in the new order; old portrait demo gone.
  2. Tutorial: upload a video → renders 16:9; empty → placeholder.
  3. Real footage: with no metafield → section hidden on preview, hint in editor.
     Set `santai.real_video` on one product → that PDP shows its video 16:9; other
     products still hide.
  4. Mobile 360px: both videos full-width, no horizontal scroll.

## Notes

- Store is password-protected (pre-launch), so anonymous curl can't verify the
  rendered storefront; verification is via the theme editor (merchant login) +
  local schema/JSON checks.
- Posters: tutorial has an optional poster picker; real-footage relies on the
  video's first frame (`preload="metadata"`). A per-product poster metafield can
  be added later if needed (YAGNI for now).
