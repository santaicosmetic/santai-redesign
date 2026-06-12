# Design — Swappable "Shop by eye shape" tile images (Shopify theme)

Date: 2026-06-12
Status: Approved approach (Option A — Shopify theme only)

## Goal

On the homepage **"Shop by eye shape — Made for *your* eye."** section, let the
merchant (Riri) replace each of the three tile images (Monolid / Double lid /
Inner double lid) with her own photo at any time, from the Shopify theme editor,
without touching code. When no custom image is uploaded, the tile keeps the
current brand SVG illustration.

## Context

- Section lives in `shopify-theme/sections/main-home.liquid` (lines ~181–200),
  rendered as three `<a class="collection-tile">` tiles.
- Each tile currently hardcodes its image: `{{ 'monolid.svg' | asset_url }}`,
  `{{ 'almond.svg' | asset_url }}`, `{{ 'hooded.svg' | asset_url }}`.
- The section's `{% schema %}` currently has `"settings": []`.
- Tile image frame CSS (`shopify-theme/assets/santai.css`, ~2434): the
  `.collection-tile__image` panel is `aspect-ratio: 4/5`, `bg-card` (#F7F7F7),
  contents centered; `.collection-tile__image > img` sits at `width: 65%`
  (small, centered illustration look).

## Scope

**In scope**
- Three theme-editor image pickers on `main-home.liquid` — one per eye-shape tile.
- Fallback to the existing SVG when a picker is empty.
- A CSS tweak so an uploaded *photo* fills the whole tile (cover), while the SVG
  fallback keeps its current centered-illustration look.

**Out of scope (explicitly unchanged)**
- The eye-shape SVG illustrations everywhere else — Lash Finder quiz modal,
  `collection-by-eye-shape` page, PDP. The user's words: "点进去的插画不变."
  CLAUDE.md's "brand-specific illustrations, don't replace" rule still holds
  for every surface except this one homepage section.
- Tile links (→ `collections/by-eye-shape#…`), labels, "Shop now →" CTA.
- The html-build static prototype. Static HTML has no admin UI, so "swap
  anytime" isn't achievable there; the prototype stays on the SVGs as a dev
  reference. (Decided with user.)
- The "Shop by makeup" tiles directly below — not requested.

## Design

### 1. Schema settings (main-home.liquid)

Replace `"settings": []` with three `image_picker` entries:

```json
"settings": [
  { "type": "header",  "content": "Shop by eye shape — tile images" },
  { "type": "paragraph", "content": "Upload your own photo to replace the default illustration for each eye shape. Leave empty to keep the illustration. Images are cropped to a 4:5 tile (object-fit: cover)." },
  { "type": "image_picker", "id": "eye_image_monolid",          "label": "Monolid image" },
  { "type": "image_picker", "id": "eye_image_double_lid",       "label": "Double lid image" },
  { "type": "image_picker", "id": "eye_image_inner_double_lid", "label": "Inner double lid image" }
]
```

### 2. Render logic (per tile)

For each of the three tiles, swap the hardcoded `<img>` for a fallback block.
Monolid shown; double-lid and inner-double-lid follow the same pattern with
their own setting id + SVG (`almond.svg`, `hooded.svg`) + label.

```liquid
<div class="collection-tile__image{% if section.settings.eye_image_monolid != blank %} collection-tile__image--photo{% endif %}">
  {%- if section.settings.eye_image_monolid != blank -%}
    {{ section.settings.eye_image_monolid | image_url: width: 800 | image_tag: alt: 'Monolid eye shape', loading: 'lazy' }}
  {%- else -%}
    <img src="{{ 'monolid.svg' | asset_url }}" alt="Monolid eye shape">
  {%- endif -%}
</div>
```

The surrounding `<a class="collection-tile" href=…>`, the `__label`, and the
`__cta` stay exactly as they are.

### 3. CSS (santai.css)

Add one rule so a custom photo fills the tile (the SVG fallback rule at line
~2444 is untouched, so illustrations still render centered at 65%):

```css
.collection-tile__image--photo > img {
  width: 100%;
  max-width: none;
  height: 100%;
  object-fit: cover;
}
```

## Behavior

| Picker state          | Tile shows                                              |
|-----------------------|--------------------------------------------------------|
| Empty (default)       | Brand SVG illustration, centered at 65% (current look) |
| Custom image uploaded | Merchant photo, cropped to fill the 4:5 tile (cover)   |

Each of the three tiles behaves independently — she can swap one, two, or all
three. Click-through, labels, and all other eye-shape illustrations on the site
are unaffected.

## Files touched

- `shopify-theme/sections/main-home.liquid` — schema settings + 3 render blocks
- `shopify-theme/assets/santai.css` — one `--photo` modifier rule

## Verification

Code-only until the theme is deployed (theme not yet published; needs Shopify
CLI + token per PROGRESS.md). After deploy, on the draft theme:
1. Theme editor → Home → "Shop by eye shape" → confirm 3 image pickers appear.
2. Upload a test photo to one tile → preview shows it filling the 4:5 tile,
   not stretched; other two still show SVG.
3. Remove the test image → tile falls back to the SVG.
4. Confirm tile link still goes to `collections/by-eye-shape#…` and the Lash
   Finder modal / collection page illustrations are unchanged.
