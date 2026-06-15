# Design — Accessory PDP: fix title + single video (curler & cleanser)

Date: 2026-06-12
Status: Approved (Shopify theme only)

## Goal

The two accessory products (Thermo Curler, Lash Cleanser) currently fall back to
the lash `product.json` template, so they show:
- a broken title ("The.") from the lash first-word display rule, and
- the two-column lash `pdp-videos` section (tutorial + per-eye real footage).

Make the accessories show a **proper name** and **one portrait video** with
accessory-specific copy, without touching the lash pages.

## Finalised copy

| Product | Eyebrow | Heading (one italic word) | Caption |
|---|---|---|---|
| Thermo Curler | The thermo curler | Curlier lashes, lighter *wear.* | Twelve seconds of gentle heat sets the curl and the band sits flush. |
| Lash Cleanser | The lash cleanser | Clean lashes, longer *life.* | A 60-second daily wash that keeps magnetic lashes wearable for 30+ uses. |

(Eyebrows render uppercase via `.eyebrow` CSS.)

## Context

- Both accessories already carry a `templateSuffix` on the store
  (`executive-lift` for the curler, `pure-ritual` for the cleanser) but **no
  matching template file exists**, so Shopify falls back to `templates/product.json`.
- Title rendering, `sections/main-product.liquid` ~line 49-52:
  ```liquid
  {%- assign title_parts = product.title | split: ' ' -%}
  <span class="display-italic">{{ title_parts.first }}.</span>
  ```
  For one-word lash names this gives "Inbox."; for "The Executive Lift: 24H
  Precision Thermo-Curler" it gives "The.".
- `main-product.liquid` already computes `is_accessory` (line 4-7) from
  `product.metafields.santai.category == 'accessory'`.
- The portrait video CSS `.pdp-videos*` already exists (single-column variant is
  a centered 420px portrait); the accessory video section reuses it.

## Scope

**In scope**
- Title fix in `main-product.liquid`: accessory → name before the colon
  ("The Executive Lift." / "The Pure Ritual."); lash → unchanged first-word.
- New section `sections/pdp-accessory-video.liquid` — one portrait, centered video
  (section-setting video, theme-editor upload), accessory copy.
- Two new templates `templates/product.executive-lift.json` and
  `templates/product.pure-ritual.json` — clones of `product.json` with the
  two-column `videos` section swapped for the single `accessory_video` section
  (each with its product's copy). All other sections copied verbatim.

**Out of scope (left unchanged, by agreement)**
- The lash `product.json` template and all lash pages.
- The other lash-specific sections that also appear on accessories
  (comparison "vs strip lashes", `pdp-suit` eye shapes, `pdp-howto` 3-step lash
  application, `pdp-editorial` lash quote, the "1 pair of … magnetic lashes" line).
  Flagged to the user as a follow-up; not touched now.

## Design

### Title fix (`main-product.liquid`)

```liquid
<h1 class="display-l pdp-hero__h">
  {%- if is_accessory -%}
    {%- assign disp_name = product.title | split: ':' | first -%}
  {%- else -%}
    {%- assign disp_name = product.title | split: ' ' | first -%}
  {%- endif -%}
  <span class="display-italic">{{ disp_name }}.</span>
</h1>
```

### Accessory video section (`sections/pdp-accessory-video.liquid`)

Reuses the `.pdp-videos` classes; single centered column (no `--two`), so the
existing CSS yields a centered portrait 9:16 frame. Settings: `eyebrow`,
`heading_pre`, `heading_italic`, `video`, `poster`, `caption`. Has a preset.
Empty state: "Add a video in the theme editor".

### Accessory templates

`product.executive-lift.json` and `product.pure-ritual.json` are produced by
cloning `product.json`, then:
- delete the `videos` section object, add `accessory_video`
  (`type: pdp-accessory-video`) with that product's copy,
- in `order`, replace `"videos"` with `"accessory_video"`.

Because each accessory has its own template, its video + copy are independent and
the merchant uploads each accessory's video in the theme editor on that product.

## Behavior

| | Title | Video section |
|---|---|---|
| Lash (e.g. Pitch) | "Pitch." (unchanged) | two-column `pdp-videos` |
| Curler | "The Executive Lift." | one centered portrait video, curler copy |
| Cleanser | "The Pure Ritual." | one centered portrait video, cleanser copy |

## Files touched

- Modify: `shopify-theme/sections/main-product.liquid` (title)
- Create: `shopify-theme/sections/pdp-accessory-video.liquid`
- Create: `shopify-theme/templates/product.executive-lift.json`
- Create: `shopify-theme/templates/product.pure-ritual.json`

## Verification

- JSON validates for both new templates; section schema validates.
- After deploy to draft theme #156386722014:
  1. Curler page → title "The Executive Lift.", one centered portrait video block
     ("Curlier lashes, lighter wear."), no two-column videos.
  2. Cleanser page → "The Pure Ritual.", one centered portrait video
     ("Clean lashes, longer life.").
  3. A lash page (e.g. Pitch) → unchanged (first-word title, two-column videos).
  4. Mobile 360px: single video full-width.
- Store is password-protected; verify in the theme editor / preview.

## Notes

Merchant uploads each accessory's video in the theme editor (the product's
"PDP — Accessory video" section → Video).
