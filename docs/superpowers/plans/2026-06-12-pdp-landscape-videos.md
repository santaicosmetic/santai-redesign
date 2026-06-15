# Two landscape PDP videos (Tutorial + per-product Real footage) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the portrait demo video on the product page with two landscape (16:9) sections — a shared Tutorial video and a per-product Real-footage video driven by a `santai.real_video` product metafield.

**Architecture:** Two new focused Liquid sections share one `.pdp-wide*` CSS block. Tutorial video comes from section settings (shared); Real-footage comes from `product.metafields.santai.real_video` (per product, hides when empty). Wire both into `templates/product.json`, remove the old `pdp-action`, and add the metafield definition to the idempotent metafields script.

**Tech Stack:** Shopify Liquid sections + section schema JSON, `templates/product.json`, CSS (`assets/santai.css`), Python GraphQL script (`scripts/shopify-metafields.py`), Shopify CLI for deploy. No JS. No unit-test harness — verification is JSON/schema validation + grep + post-deploy theme-editor check.

Spec: `docs/superpowers/specs/2026-06-12-pdp-landscape-videos-design.md`

---

### Task 1: Shared landscape video CSS

**Files:**
- Modify: `shopify-theme/assets/santai.css` (after the `.pdp-action__caption` rule, ~line 976)

- [ ] **Step 1: Add the `.pdp-wide*` block**

Insert after the existing `.pdp-action__caption { … }` rule (the old pdp-action CSS can stay; it is harmless once the section is unused, and is removed in Task 6's cleanup note — leave it for now):

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

- [ ] **Step 2: Verify present**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
grep -c "pdp-wide__video" shopify-theme/assets/santai.css   # expect 2
```
Expected: `2`.

- [ ] **Step 3: Commit**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/assets/santai.css
git commit -m "style(pdp): add shared landscape (16:9) video block"
```

---

### Task 2: Tutorial section

**Files:**
- Create: `shopify-theme/sections/pdp-tutorial.liquid`

- [ ] **Step 1: Create the file**

```liquid
<section class="pdp-wide pdp-tutorial container">
  <div class="section__head section__head--center">
    <div class="section__head-text">
      <div class="eyebrow">{{ section.settings.eyebrow }}</div>
      <h2 class="display-l">{{ section.settings.heading_pre }}<span class="display-italic">{{ section.settings.heading_italic }}</span></h2>
    </div>
  </div>

  {%- liquid
    assign vid = section.settings.video
    assign poster = section.settings.poster
  -%}

  <div class="pdp-wide__video">
    {%- if vid != blank -%}
      <video
        src="{{ vid.sources[1].url | default: vid.sources[0].url }}"
        {% if poster != blank %}poster="{{ poster | image_url: width: 1600 }}"{% endif %}
        playsinline
        controls
        preload="metadata"
      ></video>
    {%- elsif poster != blank -%}
      <img src="{{ poster | image_url: width: 1600 }}" alt="" loading="lazy">
    {%- else -%}
      <div class="pdp-wide__placeholder" aria-hidden="true">Add a tutorial video in the theme editor</div>
    {%- endif -%}
  </div>

  {%- if section.settings.caption != blank -%}
    <p class="pdp-wide__caption">{{ section.settings.caption }}</p>
  {%- endif -%}
</section>

{% schema %}
{
  "name": "PDP — Tutorial",
  "settings": [
    { "type": "text",         "id": "eyebrow",        "label": "Eyebrow",        "default": "How to apply" },
    { "type": "text",         "id": "heading_pre",    "label": "Heading start",  "default": "Easier than " },
    { "type": "text",         "id": "heading_italic", "label": "Heading italic", "default": "mascara." },
    { "type": "video",        "id": "video",          "label": "Tutorial video (mp4)" },
    { "type": "image_picker", "id": "poster",         "label": "Poster image" },
    { "type": "text",         "id": "caption",        "label": "Caption below",  "default": "Three seconds. No glue, no mirror gymnastics." }
  ],
  "presets": [{ "name": "PDP — Tutorial" }]
}
{% endschema %}
```

- [ ] **Step 2: Validate the schema JSON**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
awk '/{% schema %}/{f=1;next} /{% endschema %}/{f=0} f' shopify-theme/sections/pdp-tutorial.liquid | python3 -m json.tool > /dev/null && echo "SCHEMA JSON OK"
```
Expected: `SCHEMA JSON OK`.

- [ ] **Step 3: Commit**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/sections/pdp-tutorial.liquid
git commit -m "feat(pdp): add landscape Tutorial video section"
```

---

### Task 3: Real-footage section (per-product metafield)

**Files:**
- Create: `shopify-theme/sections/pdp-real-footage.liquid`

- [ ] **Step 1: Create the file**

```liquid
{%- liquid
  assign rv = product.metafields.santai.real_video
-%}
{%- if rv != blank or request.design_mode -%}
<section class="pdp-wide pdp-real-footage container">
  <div class="section__head section__head--center">
    <div class="section__head-text">
      <div class="eyebrow">{{ section.settings.eyebrow }}</div>
      <h2 class="display-l">{{ section.settings.heading_pre }}<span class="display-italic">{{ section.settings.heading_italic }}</span></h2>
    </div>
  </div>

  <div class="pdp-wide__video">
    {%- if rv != blank -%}
      <video
        src="{{ rv }}"
        playsinline
        controls
        preload="metadata"
      ></video>
    {%- else -%}
      <div class="pdp-wide__placeholder" aria-hidden="true">Add this product's real-footage URL under Products → this product → Metafields → "Real footage video" (santai.real_video).</div>
    {%- endif -%}
  </div>

  {%- if section.settings.caption != blank -%}
    <p class="pdp-wide__caption">{{ section.settings.caption }}</p>
  {%- endif -%}
</section>
{%- endif -%}

{% schema %}
{
  "name": "PDP — Real footage",
  "settings": [
    { "type": "paragraph", "content": "The video is set per product under Products → [product] → Metafields → \"Real footage video\" (santai.real_video). This section hides automatically on the live site when that field is empty." },
    { "type": "text", "id": "eyebrow",        "label": "Eyebrow",        "default": "Real footage" },
    { "type": "text", "id": "heading_pre",    "label": "Heading start",  "default": "See it on a real " },
    { "type": "text", "id": "heading_italic", "label": "Heading italic", "default": "eye." },
    { "type": "text", "id": "caption",        "label": "Caption below",  "default": "Filmed on real customers. Nothing retouched." }
  ],
  "presets": [{ "name": "PDP — Real footage" }]
}
{% endschema %}
```

- [ ] **Step 2: Validate the schema JSON**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
awk '/{% schema %}/{f=1;next} /{% endschema %}/{f=0} f' shopify-theme/sections/pdp-real-footage.liquid | python3 -m json.tool > /dev/null && echo "SCHEMA JSON OK"
```
Expected: `SCHEMA JSON OK`.

- [ ] **Step 3: Commit**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/sections/pdp-real-footage.liquid
git commit -m "feat(pdp): add per-product Real footage video section (metafield-driven)"
```

---

### Task 4: Wire into product.json + remove old action

**Files:**
- Modify: `shopify-theme/templates/product.json`

- [ ] **Step 1: Replace the `action` section object**

Replace this block:

```json
    "action": {
      "type": "pdp-action",
      "settings": {
        "eyebrow": "See it in action",
        "heading_pre": "Watch how it ",
        "heading_italic": "works.",
        "caption": "60-second demo · how it goes on"
      }
    },
```

with:

```json
    "tutorial": {
      "type": "pdp-tutorial",
      "settings": {
        "eyebrow": "How to apply",
        "heading_pre": "Easier than ",
        "heading_italic": "mascara.",
        "caption": "Three seconds. No glue, no mirror gymnastics."
      }
    },
    "real_footage": {
      "type": "pdp-real-footage",
      "settings": {
        "eyebrow": "Real footage",
        "heading_pre": "See it on a real ",
        "heading_italic": "eye.",
        "caption": "Filmed on real customers. Nothing retouched."
      }
    },
```

- [ ] **Step 2: Update the `order` array**

Replace:
```json
  "order": ["main", "comparison", "action", "howto", "suit", "ugc", "reviews", "editorial"]
```
with:
```json
  "order": ["main", "comparison", "tutorial", "howto", "suit", "real_footage", "ugc", "reviews", "editorial"]
```

- [ ] **Step 3: Validate JSON + confirm action gone**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
python3 -m json.tool shopify-theme/templates/product.json > /dev/null && echo "PRODUCT JSON OK"
grep -c "pdp-action\|\"action\"" shopify-theme/templates/product.json   # expect 0
grep -c "pdp-tutorial\|pdp-real-footage" shopify-theme/templates/product.json   # expect 2
```
Expected: `PRODUCT JSON OK`, then `0`, then `2`.

- [ ] **Step 4: Commit**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add shopify-theme/templates/product.json
git commit -m "feat(pdp): swap portrait demo for Tutorial + Real footage in product template"
```

---

### Task 5: Delete the unused pdp-action section + its CSS

**Files:**
- Delete: `shopify-theme/sections/pdp-action.liquid`
- Modify: `shopify-theme/assets/santai.css` (remove `.pdp-action*` rules, ~lines 946–976)

- [ ] **Step 1: Confirm pdp-action is unreferenced anywhere else**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
grep -rln "pdp-action" shopify-theme/templates shopify-theme/sections
```
Expected: only `shopify-theme/sections/pdp-action.liquid` itself (no template references). If any template other than the file itself appears, STOP — do not delete; investigate.

- [ ] **Step 2: Delete the section file**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git rm shopify-theme/sections/pdp-action.liquid
```

- [ ] **Step 3: Remove the `.pdp-action*` CSS rules**

Delete the block from `.pdp-action { padding-block: var(--space-7); }` through the `.pdp-action__caption { … }` rule (the contiguous `.pdp-action*` rules, ~lines 946–976). Leave the `.pdp-howto*` rule that follows it intact.

- [ ] **Step 4: Verify removal**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
grep -c "pdp-action" shopify-theme/assets/santai.css   # expect 0
grep -c "pdp-wide__video\|pdp-howto__grid" shopify-theme/assets/santai.css   # expect >=2 (wide block + howto intact)
```
Expected: `0`, then a number ≥ 2.

- [ ] **Step 5: Commit**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add -A shopify-theme/sections/pdp-action.liquid shopify-theme/assets/santai.css
git commit -m "chore(pdp): remove unused portrait demo section + CSS"
```

---

### Task 6: Add the `real_video` metafield definition + create it on the store

**Files:**
- Modify: `scripts/shopify-metafields.py` (the `DEFINITIONS` list)

- [ ] **Step 1: Add the definition entry**

In the `DEFINITIONS` list, after the `tagline` entry (in the "All products" group), add:

```python
    {'key': 'real_video', 'name': 'Real footage video (mp4 URL)', 'type': 'url',
     'desc': "Per-product real wear-test video. Upload the mp4 under Settings -> Files, paste its URL here. Shown in the 'See it on a real eye' PDP section; the section hides when empty."},
```

- [ ] **Step 2: Verify Python still parses**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
python3 -c "import ast; ast.parse(open('scripts/shopify-metafields.py').read()); print('PY OK')"
```
Expected: `PY OK`.

- [ ] **Step 3: Create the definition on the store (idempotent)**

> NOTE: This script also re-applies metafield *values* to products further down. Read the script's value-population section first; if it would overwrite existing product data, run ONLY the definition-creation step. If the script is split so definitions run first and value population is guarded, run it whole. If unsure, STOP and ask — do not blindly mutate product data.

Run (only after the safety check above):
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
set -a; source .env; set +a
python3 scripts/shopify-metafields.py 2>&1 | grep -i "real_video"
```
Expected: a line showing `real_video` created (or "exists already" on re-run).

- [ ] **Step 4: Commit**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add scripts/shopify-metafields.py
git commit -m "feat(data): define santai.real_video product metafield"
```

---

### Task 7: Deploy to draft theme + update PROGRESS.md + push

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Push the changed theme files to the draft theme (only the touched files)**

Run:
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
set -a; source .env; set +a
shopify theme push --path ./shopify-theme --store "$SHOPIFY_FLAG_STORE" --theme 156386722014 \
  --only sections/pdp-tutorial.liquid \
  --only sections/pdp-real-footage.liquid \
  --only templates/product.json \
  --only assets/santai.css \
  --nodelete
```
Then separately remove the deleted section from the remote theme:
```bash
shopify theme push --path ./shopify-theme --store "$SHOPIFY_FLAG_STORE" --theme 156386722014 \
  --only sections/pdp-action.liquid
```
> `--nodelete` on the first push protects all other remote files. The old `pdp-action.liquid` no longer exists locally; the second push (without `--nodelete`, scoped to just that file) removes it from the remote theme. Expected: both "pushed successfully".

- [ ] **Step 2: Add a done note to PROGRESS.md**

Under the brand-chrome / sections area, add:
```markdown
- [x] **PDP landscape videos — Tutorial + per-product Real footage (Shopify theme)** — Done 2026-06-12. Replaced the portrait `pdp-action` demo with two 16:9 sections: `pdp-tutorial` (shared video, section setting) and `pdp-real-footage` (per-product video from `santai.real_video` URL metafield, hides when empty). Copy: "Easier than mascara." / "See it on a real eye." Deployed to draft theme #156386722014. ⚠️ Merchant still uploads videos: tutorial in theme editor; real footage per product under Metafields. Spec/plan: `docs/superpowers/{specs,plans}/2026-06-12-pdp-landscape-videos*`.
```

- [ ] **Step 3: Commit and push**
```bash
cd /Users/mapetiteyee/Projects/santai-redesign
git add PROGRESS.md
git commit -m "docs: note PDP landscape videos done + deployed (videos pending upload)"
git push
```
Expected: push succeeds to `origin/main`.

---

## Post-deploy verification (theme editor — merchant login)

1. Theme editor for a product → confirm "PDP — Tutorial" and "PDP — Real footage" appear in order `… comparison, tutorial, howto, suit, real_footage, ugc …`; the old portrait demo is gone.
2. Tutorial: upload a video → renders 16:9; empty → placeholder text.
3. Real footage: no metafield → section hidden on preview, hint shown in editor; set `santai.real_video` on one product → that PDP shows its video; others stay hidden.
4. Mobile 360px: both full-width, no horizontal scroll.

---

## Self-review notes

- **Spec coverage:** CSS (Task 1) ✓; Tutorial section + shared video setting (Task 2) ✓; Real-footage section + metafield + hide-when-empty + design_mode hint (Task 3) ✓; product.json reorder + remove action (Task 4) ✓; delete pdp-action file + CSS (Task 5) ✓; metafield definition + run script (Task 6) ✓; deploy + PROGRESS + push (Task 7) ✓.
- **No test harness:** Liquid theme — verification is JSON/schema validation + grep + post-deploy editor check, matching the repo.
- **Naming consistency:** classes `.pdp-wide`, `.pdp-wide__video`, `.pdp-wide__placeholder`, `.pdp-wide__caption`; metafield `santai.real_video`; section types `pdp-tutorial` / `pdp-real-footage`; json keys `tutorial` / `real_footage` — used identically across Tasks 1–7.
- **Risk flagged:** Task 6 Step 3 guards against the metafields script overwriting product values; Task 7 deploy is scoped with `--only` + `--nodelete` to protect other remote files.
