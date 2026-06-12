# Swappable "Shop by eye shape" tile images — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the merchant swap each of the three homepage "Shop by eye shape" tile images (Monolid / Double lid / Inner double lid) for her own photo from the Shopify theme editor, falling back to the current brand SVG when no image is set.

**Architecture:** Add three `image_picker` settings to the `main-home` section schema. Each tile renders the uploaded image when present (cropped to fill the 4:5 tile via a CSS modifier) and the existing SVG otherwise. No other surface changes.

**Tech Stack:** Shopify Liquid (`sections/main-home.liquid`), section schema JSON, CSS (`assets/santai.css`). No JS. No test framework — Liquid is verified by syntax/structure checks here and visual check after deploy (theme not yet published, per PROGRESS.md).

Spec: `docs/superpowers/specs/2026-06-12-eye-shape-tile-images-design.md`

---

### Task 1: Add three image_picker settings to the section schema

**Files:**
- Modify: `shopify-theme/sections/main-home.liquid` (schema block, ~line 249–254)

- [ ] **Step 1: Replace the empty settings array**

In the `{% schema %}` block, replace:

```json
  "name": "Home (main)",
  "settings": []
```

with:

```json
  "name": "Home (main)",
  "settings": [
    { "type": "header", "content": "Shop by eye shape — tile images" },
    { "type": "paragraph", "content": "Upload your own photo to replace the default illustration for each eye shape. Leave empty to keep the illustration. Photos are cropped to a 4:5 tile." },
    { "type": "image_picker", "id": "eye_image_monolid", "label": "Monolid image" },
    { "type": "image_picker", "id": "eye_image_double_lid", "label": "Double lid image" },
    { "type": "image_picker", "id": "eye_image_inner_double_lid", "label": "Inner double lid image" }
  ]
```

- [ ] **Step 2: Verify the schema is valid JSON**

Run:

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
awk '/{% schema %}/{f=1;next} /{% endschema %}/{f=0} f' shopify-theme/sections/main-home.liquid | python3 -m json.tool > /dev/null && echo "SCHEMA JSON OK"
```

Expected: `SCHEMA JSON OK` (no traceback).

- [ ] **Step 3: Commit**

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/sections/main-home.liquid
git commit -m "feat(home): add eye-shape tile image pickers to section schema"
```

---

### Task 2: Render uploaded image with SVG fallback on each of the three tiles

**Files:**
- Modify: `shopify-theme/sections/main-home.liquid` (~lines 181–200, the three eye-shape `collection-tile` blocks)

- [ ] **Step 1: Replace the Monolid tile image block**

Replace:

```liquid
      <div class="collection-tile__image">
        <img src="{{ 'monolid.svg' | asset_url }}" alt="Monolid eye shape">
      </div>
```

with:

```liquid
      <div class="collection-tile__image{% if section.settings.eye_image_monolid != blank %} collection-tile__image--photo{% endif %}">
        {%- if section.settings.eye_image_monolid != blank -%}
          {{ section.settings.eye_image_monolid | image_url: width: 800 | image_tag: alt: 'Monolid eye shape', loading: 'lazy' }}
        {%- else -%}
          <img src="{{ 'monolid.svg' | asset_url }}" alt="Monolid eye shape">
        {%- endif -%}
      </div>
```

- [ ] **Step 2: Replace the Double lid tile image block**

Replace:

```liquid
      <div class="collection-tile__image">
        <img src="{{ 'almond.svg' | asset_url }}" alt="Double lid eye shape">
      </div>
```

with:

```liquid
      <div class="collection-tile__image{% if section.settings.eye_image_double_lid != blank %} collection-tile__image--photo{% endif %}">
        {%- if section.settings.eye_image_double_lid != blank -%}
          {{ section.settings.eye_image_double_lid | image_url: width: 800 | image_tag: alt: 'Double lid eye shape', loading: 'lazy' }}
        {%- else -%}
          <img src="{{ 'almond.svg' | asset_url }}" alt="Double lid eye shape">
        {%- endif -%}
      </div>
```

- [ ] **Step 3: Replace the Inner double lid tile image block**

Replace:

```liquid
      <div class="collection-tile__image">
        <img src="{{ 'hooded.svg' | asset_url }}" alt="Inner double lid eye shape">
      </div>
```

with:

```liquid
      <div class="collection-tile__image{% if section.settings.eye_image_inner_double_lid != blank %} collection-tile__image--photo{% endif %}">
        {%- if section.settings.eye_image_inner_double_lid != blank -%}
          {{ section.settings.eye_image_inner_double_lid | image_url: width: 800 | image_tag: alt: 'Inner double lid eye shape', loading: 'lazy' }}
        {%- else -%}
          <img src="{{ 'hooded.svg' | asset_url }}" alt="Inner double lid eye shape">
        {%- endif -%}
      </div>
```

- [ ] **Step 4: Verify the three SVG fallbacks and three settings refs are present**

Run:

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
grep -c "collection-tile__image--photo" shopify-theme/sections/main-home.liquid   # expect 3
grep -c "section.settings.eye_image_" shopify-theme/sections/main-home.liquid     # expect 6 (2 per tile)
grep -E "monolid.svg|almond.svg|hooded.svg" shopify-theme/sections/main-home.liquid # still present as fallbacks
```

Expected: `3`, then `6`, then the three `.svg` fallback lines printed.

- [ ] **Step 5: Verify schema still valid (untouched, but re-check after edits)**

Run:

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
awk '/{% schema %}/{f=1;next} /{% endschema %}/{f=0} f' shopify-theme/sections/main-home.liquid | python3 -m json.tool > /dev/null && echo "SCHEMA JSON OK"
```

Expected: `SCHEMA JSON OK`.

- [ ] **Step 6: Commit**

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/sections/main-home.liquid
git commit -m "feat(home): render eye-shape tile photo with SVG fallback"
```

---

### Task 3: Add CSS so an uploaded photo fills the tile

**Files:**
- Modify: `shopify-theme/assets/santai.css` (after line ~2444, the existing `.collection-tile__image > img, > svg` rule)

- [ ] **Step 1: Add the `--photo` modifier rule**

After this existing rule:

```css
.collection-tile__image > img,
.collection-tile__image > svg { width: 65%; max-width: 180px; height: auto; }
```

add:

```css
.collection-tile__image--photo > img { width: 100%; max-width: none; height: 100%; object-fit: cover; }
```

- [ ] **Step 2: Verify the rule is present**

Run:

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
grep -n "collection-tile__image--photo > img" shopify-theme/assets/santai.css
```

Expected: one match printing the new rule.

- [ ] **Step 3: Commit**

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/assets/santai.css
git commit -m "style(home): fill eye-shape tile when a custom photo is set"
```

---

### Task 4: Update PROGRESS.md and push

**Files:**
- Modify: `PROGRESS.md` (Open TODOs / brand chrome area)

- [ ] **Step 1: Add a done note**

Under the "Sections built but not yet exercised…" / brand-chrome area, add a line:

```markdown
- [x] **Swappable "Shop by eye shape" tile images (Shopify theme)** — Done 2026-06-12. Three `image_picker` settings on `main-home.liquid`; each tile shows the merchant photo (object-fit: cover, 4:5) when set, else the brand SVG. Click-through links + Lash Finder / collection-page illustrations unchanged. Spec/plan: `docs/superpowers/{specs,plans}/2026-06-12-eye-shape-tile-images*`. ⚠️ Code-only — verify in theme editor after the draft theme is deployed/published.
```

- [ ] **Step 2: Commit and push**

```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add PROGRESS.md
git commit -m "docs: note swappable eye-shape tile images done (code-only)"
git push
```

Expected: push succeeds to `origin/main`.

---

## Post-deploy verification (deferred — theme not yet published)

Once the draft theme is deployed via Shopify CLI (`set -a; source .env; set +a; shopify theme push`), in the theme editor:

1. Home → "Shop by eye shape" → confirm three image pickers appear.
2. Upload a photo to one tile → preview fills the 4:5 tile, not stretched; other two still show SVG.
3. Clear the image → tile falls back to the SVG.
4. Confirm tile links still go to `collections/by-eye-shape#…` and the Lash Finder modal / collection page illustrations are unchanged.

---

## Self-review notes

- **Spec coverage:** schema pickers (Task 1) ✓; render + fallback + per-tile independence (Task 2) ✓; photo-fill CSS (Task 3) ✓; out-of-scope surfaces left untouched (Task 2 keeps SVG fallbacks, no other files touched) ✓; deferred verification (post-deploy section) ✓.
- **No test framework:** Liquid theme has no unit tests; verification is JSON-schema validation + grep structure checks + deferred visual check. This matches the repo (no test harness for the theme).
- **Naming consistency:** setting ids `eye_image_monolid` / `eye_image_double_lid` / `eye_image_inner_double_lid` and class `collection-tile__image--photo` used identically across Tasks 1–3.
