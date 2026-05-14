---
name: santai-design
description: Use this skill to generate well-branded interfaces and assets for Santai Cosmetics — a Malaysian magnetic-eyelash brand selling editorial-luxury, effortless beauty — for production code, prototypes, mocks, and slides. Contains essential design guidelines, colors, type, fonts, assets, and a UI kit of the santai-cosmetics.com web product.
user-invocable: true
---

Read the `README.md` file in the root of this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `preview/`, `ui_kits/santai-web/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out of this skill and produce static HTML files for the user to view. Reference `colors_and_type.css` directly so tokens stay in sync. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few questions about scope and audience, and then act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

Two non-negotiables for every Santai page or asset:

1. **"The right lash for YOUR eye."** — solve choice paralysis. Surface eye-shape filtering, the Lash Finder quiz, or eye-shape verdicts wherever a product appears.
2. **"Easier than mascara."** — solve trust. Surface the 30-second how-to, the trust strip, or the *Apply in 30 seconds* line above any add-to-bag.

Style discipline:

- Background defaults to `--santai-cream`. **Pure white is forbidden.**
- Text defaults to `--santai-ink`. **Pure black is forbidden.**
- `--santai-rosewood` is the one signature accent — primary CTAs and the wordmark dot only. Never wallpaper.
- Display headings use Tenor Sans, sentence case, with at most one Cormorant italic word per page as a flourish.
- Eyebrows are all-caps, tracked +0.18em, used sparingly above headlines.
- Sharp corners on product cards and images; 4px on buttons and inputs; 999px reserved for filter chips only.

Forbidden tropes: bluish-purple gradients, neon CTAs, pure white backgrounds, before/after split screens, all-caps display headings, Inter/Roboto/Helvetica, emoji as visual decoration, parallax, marquees outside the utility bar.
