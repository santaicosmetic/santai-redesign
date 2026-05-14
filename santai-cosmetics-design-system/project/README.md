# Santai Cosmetics — Design System

> **Brand:** Santai Cosmetics — Magnetic Eyelashes, Made for Effortless Beauty
> **Origin:** Kuala Lumpur, Malaysia
> **Audience:** Modern Southeast Asian women (20–40), beauty-curious but time-poor.
> **Tagline:** *"Lashes in a Snap."* / *"Effortless Eyes, Every Day."*

This repo is the single source of truth for any UI generated for **santai-cosmetics.com**. Hand it to a builder (Claude Design, Claude Code, or a human) and every screen should feel like it came out of the same studio.

---

## Sources used to build this system

- **Brand brief / design system v1.0** — supplied as inline document by the brand team. The full text lives in `brand-brief.md` for reference.
- **No codebase, Figma file, or screenshots were supplied.** All visual decisions are derived from the brief and from the editorial-luxury reference brands the brief calls out (modern clean-beauty minimalism + warm tropical neutrals).
- **No real product photography** has been provided yet. All product visuals in this kit are placeholder studio compositions in the brand's tone — they should be swapped for real macro eye-shots and pack shots before any handoff.

---

## What's in this folder

```
README.md                    ← you are here
brand-brief.md               ← original v1.0 brand spec, verbatim
SKILL.md                     ← skill manifest for Claude / Code
colors_and_type.css          ← CSS variables: palette, type scale, spacing, radii, shadows
fonts/                       ← webfonts (Tenor Sans, Cormorant Garamond, DM Sans, JetBrains Mono)
assets/                      ← logos, eye-shape icons, product placeholders
preview/                     ← Design-System-tab cards (one HTML per token group)
ui_kits/
  santai-web/                ← santai-cosmetics.com UI kit (homepage, PDP, lash finder, how-to)
```

---

## Index

- **Foundations** — `colors_and_type.css`, `preview/colors-*.html`, `preview/type-*.html`, `preview/spacing-*.html`
- **Components** — `preview/buttons.html`, `preview/forms.html`, `preview/product-card.html`, `preview/chips.html`
- **Brand** — `assets/wordmark.svg`, `assets/eye-shapes/`, `preview/wordmark.html`
- **UI Kit** — `ui_kits/santai-web/index.html` (interactive site click-thru)

---

## Content fundamentals

Santai's voice is **editorial, confident, warm**. It sounds like a senior beauty editor speaking to a smart friend — not like a marketing channel.

- **Address the reader.** *You* and *your*, never *we* / *our customer* in body copy. The brand says *we* only when narrating the studio's own choices ("we built Santai for…").
- **Sentence case for everything.** Display headings, page titles, button labels — sentence case. **Never all-caps display.** All-caps is reserved for eyebrows (section labels, nav, button labels) tracked +0.18em.
- **Short sentences. Considered word choice.** Aim for 5–12 words per line in headlines, 12–18 in body. Cut every adjective that isn't doing work.
- **One italic flourish per page.** A single Cormorant italic word in a serif headline carries the emotion — *snap*, *snap*, *effortless*, *yours*, *snap*. Never a whole italic phrase.
- **No emoji.** Not in copy, not on cards, not in toasts. Unicode glyphs (◆ ★ ✓ →) are acceptable when typographically considered.
- **Honest, not salesy.** *"On its way back. Get notified."* — never *"Don't miss out!"*. Trust comes before conversion.
- **Numerals.** Lining figures in body sans for prices (`RM 89.00`); mono for SKUs and specs (`SKU-S04-DOE-NAT`, `14mm · 6 magnets · 30× wear`).

### Microcopy library

| Moment | Copy |
| --- | --- |
| Empty cart | *Your bag is empty. Start with our bestseller, Style 04 — Doe Eye.* |
| Add-to-bag toast | *Added. One step closer to effortless.* |
| First-timer hero | *First time with magnetic lashes? Promise — easier than mascara.* |
| Lash Finder intro | *Tell us about your eyes. We'll match you in 60 seconds.* |
| Lash Finder result | *Your match. Style 04 — Doe Eye. Soft, weightless, made for almond and hooded shapes.* |
| Free shipping nudge | *RM38 away from free shipping.* |
| Out of stock | *On its way back. Get notified.* |
| Newsletter prompt | *Join the studio. Get our lash-fit guide and 10% off your first set.* |
| Review CTA | *Loved your Santai? Tell us about it.* |

---

## Visual foundations

- **Color vibe.** Warm, refined, tropical-modern. Cream and stone neutrals dominate; aubergine-black inks ground; rosewood is the one signature accent. Cool grays and bluish whites are forbidden — they kill the warmth.
- **Background usage.** Page surface is always `--santai-cream` (`#F5EFE6`). Hero washes lift to `--santai-bone` (`#FAF6EF`). Product card surfaces sit on `--santai-stone` (`#E8E0D3`). The footer and promise band invert to `--santai-ink`. Pure white is *never* used.
- **Type.** Tenor Sans 300/400 for display, Cormorant Garamond Italic 400 for one-word flourishes, DM Sans 400/500 for body and UI (substitute for proprietary Söhne). JetBrains Mono for SKU codes only.
- **Imagery.** Editorial macro: tight crops of eyes; warm studio lighting (slightly golden, never blue); diverse Southeast Asian models; product on `--santai-stone` sweeps. No stock, no corporate smiles, no busy floral backgrounds, no manipulative before/after splits.
- **Backgrounds.** No gradients except a warm tonal hero wash (`#2A1F1A → #1F1A17`) and a soft rosewood radial highlight on lifestyle imagery. No textures, no patterns, no blur.
- **Spacing & density.** Sections breathe — 96–128px vertical padding. Headlines have 64ch max-width on body copy. Editorial luxury hates cramped layouts.
- **Layout rhythm.** Hero is a 60/40 asymmetric split with imagery bleeding to one edge. Centered layouts are reserved for section heads inside narrative blocks; never for hero.
- **Borders.** Hairlines only, 1px, `--santai-line-soft` on cream and `--santai-line` on ink. No double borders, no inset borders.
- **Corners.** Product cards and product images: **0** (sharp, editorial). Buttons + inputs: 4px. Lifestyle/blog images: 4px. Modals: 8px. Filter chips: 999px (the only pill in the system).
- **Cards.** No shadow at rest. No background fill. Product cards are essentially typographic compositions on top of a tinted image surface — the structure comes from the type, not from a card chrome.
- **Shadows.** Rare and warm-toned, never blue-gray. `--shadow-1/2/3` for product hover and modals; `--shadow-hover` adds a rosewood tint specifically on product hover.
- **Hover states.** Buttons fill ink → rosewood, 250ms. Product images scale to 1.02 (very subtle), title nudges 2px right, a small `→` cue fades in at the bottom-right in rosewood. Nav links underline in rosewood.
- **Press / focus.** Focus is a 2px solid `--santai-rosewood` outline with 2px offset on every interactive element — never removed without replacement. Press state is the same fill change as hover; no shrink.
- **Transparency / blur.** Used almost nowhere. Cart overlay dims behind the drawer at 50% ink. No frosted-glass / backdrop-filter UI.
- **Animation.** Restrained: 250–800ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Hero letters fade-up once on first load (80ms stagger). Section headlines fade-up + 12px slide on enter. Lash Finder steps cross-fade 400ms. Cart drawer slides 350ms. **No parallax. No bouncing. No marquees outside the utility bar. Honor `prefers-reduced-motion: reduce`.**
- **Decorative motifs.** A small `◆` (rosewood) replaces the dot of the *i* in the wordmark; it's the only ornament in the system. No icons-in-circles, no badges with bright fills, no left-border accent cards.

---

## Iconography

Santai uses **two narrow icon vocabularies** and nothing else.

1. **Hand-drawn eye-shape illustrations** — six SVGs in `assets/eye-shapes/` (`almond.svg`, `hooded.svg`, `monolid.svg`, `round.svg`, `upturned.svg`, `downturned.svg`). 1.4px stroke, ink color, optional small lash hashes above. They are used wherever the brand surfaces "the right lash for YOUR eye": the homepage shape row, the Lash Finder step 1, the PDP "Will this suit me?" grid, filter chips, review tags. **Never substitute — these are the brand's signature illustrations.**
2. **Minimal line UI icons** — search, account, wishlist, cart, chevrons, play, plus/minus. Inline SVGs at 1.4px stroke, `currentColor`, no fill. The kit ships them inline (see `Header.jsx`). For anything not yet drawn, use [Lucide](https://lucide.dev) at the same 1.4–1.5px stroke as a substitute and document the swap.

Other rules:

- **No icon font.** No Font Awesome, no Material icons, no emoji.
- **No filled-circle icons.** Buttons don't have icons inside circles. Trust strips show icon-glyph + small caps copy, with hairline structure.
- **Unicode glyphs are acceptable** when typographically considered: `◆` (the wordmark accent, rosewood), `→ ←` for navigation, `★` for star ratings (in rosewood), `✓` for trust ticks (jade), `−` `+` for accordions. Use sparingly.
- **Decorative SVG, never decorative emoji.** If an emoji is the first thing you reach for, you're off-brand.

> **Substitution flag for the user:** the brand brief specifies *Söhne* as the body sans. Söhne is licensed and not freely redistributable, so this kit ships **DM Sans** as the open substitute (humanist, breathes well at small sizes, similar grade). When the licensed Söhne files arrive, drop them into `fonts/` and update the `--font-body` declaration in `colors_and_type.css`.

---

(README continues at the top of file — the index above lists every other artifact.)
