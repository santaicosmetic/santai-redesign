# Reviews — Architecture & Runbook

How the Santai customer-review system is wired end-to-end. Read this before changing
review storage, the renderer, the populate scripts, or before plugging reviews into
a Shopify Flow.

Last updated: 2026-05-23 (Session 12 — initial reviews port).

---

## TL;DR

- Reviews are stored as **metaobjects** of type `review` on Shopify.
- Each review is **linked twice**: once to its product (via a product metafield list), once optionally to the homepage band (via a shop metafield list).
- **No third-party app** (no Judge.me, no Loox, no Yotpo). Everything is native Shopify metaobjects + metafields.
- The renderer (`sections/pdp-reviews.liquid`) reads `product.metafields.santai.reviews.value` — a list of review metaobject references. Histogram + average + filter chips all derived client-side from the rendered HTML.
- The homepage band (`sections/home-reviews.liquid`) reads `shop.metafields.santai.featured_reviews.value` — a curated list.

---

## Data model

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CSV  (data/mock-reviews.csv — local source of truth for mock data)    │
│  10 columns: rating, title, body, author, tag, verified, date,         │
│              product_handle, featured, photos                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │  scripts/shopify-populate-reviews.py
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Shopify metaobject `review`  (one entry per row, 367 today)           │
│  Fields:                                                                │
│    rating    number_integer (1-5)                                       │
│    title     single_line_text_field (optional)                          │
│    body      multi_line_text_field                                      │
│    author    single_line_text_field                                     │
│    tag       single_line_text_field  ("Monolid · Office")               │
│    verified  boolean                                                    │
│    date      single_line_text_field  ("3 days ago" — display string)    │
│    product   product_reference                                          │
│    featured  boolean  (metadata only — see "Why two lists" below)      │
│    photos    list.file_reference                                        │
└─────────────────────────────────────────────────────────────────────────┘
        │                                                  │
        │  added to per-product list                       │  added to shop list
        ▼                                                  ▼
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│  product.metafields.santai.reviews  │    │  shop.metafields.santai.            │
│  list.metaobject_reference          │    │     featured_reviews                │
│                                      │    │  list.metaobject_reference          │
│  PDP reviews — every product has    │    │                                      │
│  its own list of review refs        │    │  Homepage band — single global list │
│  (filtered + paginated client-side) │    │  (curated, currently 9 entries)     │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
                │                                            │
                ▼                                            ▼
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│  sections/pdp-reviews.liquid        │    │  sections/home-reviews.liquid        │
│  Renders per-product reviews +      │    │  Renders 3 of the featured pool      │
│  histogram + average + filter chips │    │  in the "12,400 lash converts" band  │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
```

---

## Why two lists (the "why duplicate?" question)

The metaobject already has a `product` reference field. In principle, the PDP
could iterate `shop.metaobjects.review.values | where: 'product', product` and
filter at render time — no per-product metafield list needed.

We don't, for three reasons:

1. **Liquid `where` on metaobject reference fields is unreliable** across
   Shopify API versions. Comparing a `Product` object to a metaobject's
   `product` field has edge cases.
2. **Render performance**: `shop.metaobjects.review.values` returns the entire
   set (367 today). Iterating 367 entries on every PDP just to filter to 60
   wastes time. The per-product list gives us 60 entries directly.
3. **Pagination limits**: as the review pool grows, `shop.metaobjects.TYPE.values`
   has internal caps. Per-product lists scale naturally — each product just
   gets its own list.

The `featured` boolean on the metaobject is **metadata only** — the homepage
reads from the shop's `featured_reviews` list, not from `where: 'featured', true`.
The boolean exists so editors can mark candidates without forcing them onto the
band, and so a re-sync script can rebuild the list from boolean state.

---

## File map

| Path | Role |
|---|---|
| `data/mock-reviews.csv` | The mock dataset (367 rows). Local source of truth for the initial population. |
| `scripts/generate-mock-reviews.py` | Regenerates the CSV from voice pools. Seeded — reproducible output. |
| `scripts/shopify-review-metaobject.py` | One-time: creates the `review` metaobject definition + the two metafield definitions. Idempotent. |
| `scripts/shopify-populate-reviews.py` | Reads the CSV, creates 367 metaobjects on Shopify, wires per-product + featured lists. **NOT idempotent** — re-running creates duplicates. |
| `shopify-theme/sections/pdp-reviews.liquid` | Per-product review renderer. Computes histogram + average from the linked list. Emits `data-eye` / `data-has-photos` attributes for filter JS. |
| `shopify-theme/sections/home-reviews.liquid` | Homepage band. Reads from `shop.metafields.santai.featured_reviews.value`. Falls back to manual section blocks if list is empty. |
| `shopify-theme/assets/theme.js` `initReviewFilters()` | Client-side filter chips + load-more pagination on PDP. Operates over rendered HTML. |
| `shopify-theme/assets/santai.css` `pdp-reviews__*` rules | Visual styling for histogram, filter chips, review cards. |

---

## Common operations

### Add one review by hand (no CSV)

Shopify admin → Content → Metaobjects → Review → Add entry:

- Fill all required fields (rating, body, author, tag, date, product)
- Select the linked product from the product picker
- Save

Then add it to the product's reviews list:

- Open the product → Metafields → "Reviews" (santai.reviews) → Add references → pick the new review

Then refresh the PDP — the new review appears, histogram + average recalculate automatically.

If you want it on the homepage band too, also add it to:
- Shopify admin → Settings → Custom data → Shop → Metafields → "Featured reviews (homepage)" → add the same reference

### Bulk import a new CSV

```powershell
# 1. Replace data/mock-reviews.csv with new content (same columns).
# 2. Make sure the metaobject + metafield definitions already exist (one-time):
set -a; source .env; set +a
python scripts/shopify-review-metaobject.py   # idempotent, prints "exists" if already done

# 3. Populate. WARNING: this CREATES new metaobjects — does not de-dupe.
#    If you want a clean reload, delete existing reviews first (see "Wipe").
python scripts/shopify-populate-reviews.py
```

The populate script:
- Reads CSV
- Creates one metaobject per row
- Builds a per-product list (`santai.reviews`) per product handle
- Builds the shop's `featured_reviews` list from rows where `featured == true`

### Promote a review to the homepage featured band

Two options, depending on whether you want to flag it in the data layer too.

**Option A — quick, theme-only**:
Shopify admin → Settings → Custom data → Shop → Metafields → "Featured reviews (homepage)" → Edit → Add reference → pick the review → Save. Done.

**Option B — flag in data layer, then re-sync**:
1. Open the review metaobject, toggle `featured: true`, save.
2. Run a re-sync script that rebuilds the shop list from `featured: true` rows. (Not built yet — see "Follow-ups" below.)

Option A is what Riri should do until the re-sync script exists.

### Demote a review from the homepage

Reverse of above — open the shop's `featured_reviews` metafield, remove the reference, save.

### Edit / correct a single review

Open the review metaobject in Shopify admin and edit any field. Changes appear on next PDP load (no theme push needed — metaobject content is data, not theme code).

### Wipe all reviews and start over

There's no bulk-delete script yet. Manual path:

1. Shopify admin → Content → Metaobjects → Review
2. Select all → Delete
3. Empty the product reviews lists (each product → metafields → Reviews → clear)
4. Empty `shop.metafields.santai.featured_reviews` (Settings → Custom data → Shop → clear the list)
5. Re-run `scripts/shopify-populate-reviews.py` with the new CSV.

If you'd rather not click through the admin, ask Claude to write a bulk-delete script using `metaobjectDelete` mutations.

---

## PDP filter chips — how they work

The chips are pure client-side filtering over rendered HTML. No server round-trip.

```liquid
<!-- pdp-reviews.liquid renders every review with data attributes -->
<article class="pdp-review" data-review-item
         data-eye="monolid"            <!-- parsed from tag's first word -->
         data-has-photos="false">      <!-- true if photos field non-empty -->
   ...
</article>
```

```js
// theme.js initReviewFilters()
function matches(item) {
  if (activeFilter === 'all')     return true;
  if (activeFilter === 'photos')  return item.dataset.hasPhotos === 'true';
  return item.dataset.eye === activeFilter;
}
```

Eye-shape values come from parsing each review's `tag` string. `"Monolid · Office"` → `data-eye="monolid"`. `"Inner double lid · Wedding"` → `data-eye="inner-double-lid"`.

To add a new filter (e.g. "With video"):

1. Add a chip in `sections/pdp-reviews.liquid`:
   ```html
   <button class="pdp-reviews__filter" data-review-filter="video">With video</button>
   ```
2. Add a data attribute when rendering each review:
   ```liquid
   data-has-video="{% if r.video.value %}true{% else %}false{% endif %}"
   ```
3. Handle it in `matches()`:
   ```js
   if (activeFilter === 'video') return item.dataset.hasVideo === 'true';
   ```

Adding a new metaobject field (e.g. `video`) requires editing `scripts/shopify-review-metaobject.py` and re-running it — but it'll fail because the definition already exists. You'd need to either delete + recreate the definition, or add the field via Shopify admin (Settings → Custom data → Metaobjects → Review → Add field).

---

## Empty state behavior

| State | What renders |
|---|---|
| Product has zero linked reviews | "—" score · "Be the first to review this product" · "Write a review" CTA · falls back to any manual sample review blocks in the theme editor |
| Shop's featured_reviews list is empty AND no manual blocks | Homepage reviews section hides cleanly (no awkward "0 lash converts") |
| Shop's featured_reviews list is empty BUT manual blocks exist | Renders the manual blocks as fallback |
| Filter chip click yields zero matches | "No reviews match this filter yet." message |

---

## Shopify Flow integration patterns

Reviews are first-class Shopify data, so any Flow trigger that touches metaobjects or metafields can hook in.

### Pattern 1 — auto-request review N days after order delivery

```
Trigger:    Order fulfilled
Wait:       7 days
Condition:  Order has at least one lash product
Action:     Send email via Shopify Email (template = "review-request")
            with a magic link to /pages/write-review?order={{ order.id }}
```

The `/pages/write-review` page would be a custom form that, on submit, creates a `review` metaobject and adds it to the right product's reviews list. (Form handling is not built yet — would need a Shopify App Proxy or a low-code form tool like Powr.)

### Pattern 2 — auto-feature 5-star reviews from verified buyers

```
Trigger:    Metaobject created (type: review)
Condition:  rating == 5 AND verified == true
Action:     Add metaobject reference to shop.metafields.santai.featured_reviews
            (limit list to 9; remove oldest if at cap)
```

Currently has to be done manually — Shopify Flow doesn't have a "modify shop metafield list" action out of the box. Workaround: build a small admin extension that exposes a "Promote to featured" button on the metaobject detail page, calling a custom API endpoint.

### Pattern 3 — Slack ping on negative review

```
Trigger:    Metaobject created (type: review)
Condition:  rating <= 3
Action:     Send Slack message to #customer-care with review text + product link
```

This one is straightforward to build today since Slack is a native Flow connector.

### Pattern 4 — auto-tag products that have ≥10 reviews as "Bestseller"

```
Trigger:    Metaobject created (type: review)
Get:        Count of reviews for review.product
Condition:  Count >= 10 AND product doesn't already have "Bestseller" tag
Action:     Add tag "Bestseller" to product
```

---

## Gotchas + known limits

- **Metaobjects MUST be published (status=ACTIVE) to appear in Liquid.** Default for `publishable`-capable metaobjects is DRAFT. The populate script now sets `capabilities.publishable.status = ACTIVE` on create, but if you create reviews via the admin UI you have to manually publish each one (Save → Publish button). To bulk-flip existing DRAFT reviews to ACTIVE, run the equivalent of `metaobjectUpdate` with `capabilities: { publishable: { status: ACTIVE } }` on each ID — there's a one-liner in `scripts/shopify-populate-reviews.py`'s history.
- **Metafield definitions need `access.storefront = PUBLIC_READ`.** Without it, Liquid sees the metafield as empty (size=0) even though admin API returns the references. The script `scripts/shopify-review-metaobject.py` sets this on create. If you ever see `featured_size=0` in Liquid but admin shows references populated, this is almost always the cause — re-run the script or update via `metafieldDefinitionUpdate`.
- **Populate script is not idempotent.** Re-running creates duplicates. If you need to reload, wipe first.
- **No de-dupe key on review content.** If the same review text exists twice, they're two separate entries. Add a unique CSV column (e.g. `external_id`) if you need to de-dupe on re-import.
- **`shop.metaobjects.review.values` is not used by the renderer.** We use per-product metafield lists instead — see "Why two lists" above. If you switch to direct access, watch for the 50/2000 entry limits depending on API version.
- **Storefront caps `list.metaobject_reference` at 50 entries per list.** Worked around by splitting into two metafields: `santai.reviews` (first 50) + `santai.reviews_overflow` (51-100). PDP renderer iterates both. `scripts/shopify-populate-reviews.py` auto-chunks on create. If a single product ever exceeds 100 reviews, the populate script prints a WARN and you'll need a third metafield `santai.reviews_overflow_2` + a third loop in the renderer. Today's max is Inbox at 75.
- **Featured boolean ≠ on homepage.** Editing the metaobject's `featured: true` does nothing on its own. The homepage reads from the shop list. See "Promote a review" above.
- **GraphQL rate limit.** Each `metaobjectCreate` costs ~10 points. Bucket is 1000 max, restored 50/sec → ~5 creates/sec safe. Populate script chunks in batches of 50 with a 2s sleep between to stay well under.
- **Photos field expects file references**, not external URLs. To attach photos you'd upload to Shopify Files first, then store the file GIDs in the photos list. CSV's `photos` column is unused today (mock data has no images).
- **Date is a string, not a date type.** We use `"3 days ago"` for display realism. If you need real-date sorting/filtering later, add a separate `created_at` field of type `date_time` and keep `date` as a display label.
- **Tag field is the eye-shape source for filters.** If you change the tag format (e.g. drop "Monolid · Office" in favour of separate fields), update both the populate script AND the data-eye Liquid derivation in `pdp-reviews.liquid`.

---

## Follow-ups (not built yet)

- [ ] `scripts/shopify-resync-featured.py` — rebuild shop's `featured_reviews` list from review metaobjects where `featured == true`. One-button refresh after editorial changes.
- [ ] `scripts/shopify-wipe-reviews.py` — bulk delete all review metaobjects + clear per-product + shop lists. Safety prompt + `--confirm` flag required.
- [ ] `/pages/write-review` form page — customer-facing form that creates a review metaobject on submit. Needs Shopify App Proxy or a third-party form tool.
- [ ] Photo upload flow — when real customer photos arrive, decide whether to add a `photos` column in the CSV importer or build an admin UI for editorial photo curation.
- [ ] Auto-feature top-rated reviews via a scheduled job (Shopify Functions or external cron).
- [ ] Average + count caching — currently recomputed per PDP page load via Liquid iteration. Fine at 367 reviews; revisit at 5k+.

---

## Related docs

| Doc | What it covers |
|---|---|
| `PROGRESS.md` | Current project state + open TODOs + Session 11/12 work log |
| `CLAUDE.md` | Project brief (Mandarin) — visual system, brand rules, design constraints |
| `HANDOFF.md` | Original Jeffery → Riri setup notes |
| `html-build/README.md` | Prototype reference + Liquid port spec |
