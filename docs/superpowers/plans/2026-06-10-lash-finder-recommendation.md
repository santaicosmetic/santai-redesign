# Lash Finder Recommendation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Lash Finder quiz recommend a real lash based on the user's answers, replacing the hardcoded "Inbox" result.

**Architecture:** Pure-JS change in `html-build/assets/theme.js`. A lookup table `LASH_FINDER_MAP[eye][look][freq] → lashId` plus three copy maps drive the result. On "See my match", JS resolves the lash, then rebuilds the result card's `.finder-result__copy` innerHTML from `LASH_STYLES` data. Because `data-add-to-cart` is already event-delegated on `document`, the injected "Add to bag" button works with no rebinding; only the injected `data-finder-close` link is re-attached. **No HTML files are edited** — the result card markup is duplicated across 9 pages, and rebuilding innerHTML at runtime avoids touching any of them.

**Tech Stack:** Vanilla ES5-style JS (IIFE module, no build step). No test runner exists (static prototype) — verification is done in the browser via the running preview server (`python3 -m http.server`, port 8123) using screenshots + console inspection.

---

## Context the implementer needs

- The finder is initialised in `initLashFinder()` at `html-build/assets/theme.js:432`.
- Quiz state shape: `state = { eye, look, freq, flags: [] }`.
  - `eye` ∈ `monolid` · `double-lid` · `inner-double-lid`
  - `look` ∈ `natural` · `office` · `soft` · `drama`
  - `freq` ∈ `daily` · `weekly` · `events`
  - `flags[]` ⊆ `sensitive` · `contacts` · `firsttime` · `lashext`
- The result step is the 5th `[data-finder-step]`. Inside it: `.finder-result` → `.finder-result__hero` (kept) + `.finder-result__copy` (rebuilt by JS).
- `LASH_STYLES` (object of 10 lashes) is defined at `theme.js:62`. Each entry has `id, name, group, drama, tagline, image, card, price`.
- `data-add-to-cart` is handled by a delegated listener at `theme.js:344-345` (`document.addEventListener('click', ... e.target.closest('[data-add-to-cart]') ...)`). It reads `data-product-id/name/variant/price/image`.
- The `close()` function is a hoisted function declaration inside `initLashFinder` — anything nested in `initLashFinder` can call it.

## File structure

- **Modify only:** `html-build/assets/theme.js`
  - Add module-level constants + pure helpers just above `initLashFinder` (near `LASH_STYLES`, after `ACCESSORIES`/`GIFT_TIERS` block, before `var cart = [];` is fine — but to keep finder code together, add them immediately before `function initLashFinder()`).
  - Inside `initLashFinder`, add a nested `renderResult(lashId)` and change the `data-finder-done` handler.
- **Modify (docs):** `PROGRESS.md` — tick the Lash Finder TODO.
- **No other files.**

---

### Task 1: Add finder lookup table, copy maps, and dev self-check

**Files:**
- Modify: `html-build/assets/theme.js` (insert a block immediately above `function initLashFinder() {` at line ~432)

- [ ] **Step 1: Insert the data + pure helpers**

Insert this block immediately before `function initLashFinder() {`:

```js
  /* -------------------- Lash Finder recommendation data ----------------- */
  var LASH_FINDER_MAP = {
    'monolid': {
      'natural': { daily:'minutes',  weekly:'inbox',      events:'kickoff'    },
      'office':  { daily:'pitch',     weekly:'pitch',      events:'boardroom'  },
      'soft':    { daily:'memo',      weekly:'memo',       events:'boardroom'  },
      'drama':   { daily:'twilight',  weekly:'nightshift', events:'nightshift' }
    },
    'double-lid': {
      'natural': { daily:'inbox',     weekly:'inbox',      events:'kickoff'    },
      'office':  { daily:'boardroom', weekly:'boardroom',  events:'memo'       },
      'soft':    { daily:'memo',      weekly:'memo',       events:'boardroom'  },
      'drama':   { daily:'twilight',  weekly:'afterhours', events:'vip'        }
    },
    'inner-double-lid': {
      'natural': { daily:'minutes',   weekly:'inbox',      events:'kickoff'    },
      'office':  { daily:'pitch',     weekly:'boardroom',  events:'boardroom'  },
      'soft':    { daily:'memo',      weekly:'memo',       events:'boardroom'  },
      'drama':   { daily:'twilight',  weekly:'twilight',   events:'vip'        }
    }
  };

  var FINDER_REASONS = {
    inbox:      "Looks like nothing, reads like everything — the most natural band we make.",
    minutes:    "A true-to-lash simulation made for monolid and inner-double-lid eyes.",
    kickoff:    "Fresh, youthful lift that opens the eye without looking 'done'.",
    boardroom:  "Classic soft volume that never reads as too much — the safe yes.",
    pitch:      "A 70° high-lift arc that refuses to droop on monolid and inner-double-lid eyes.",
    memo:       "A sweet 7-cluster burst that makes the eye look wide and bright.",
    afterhours: "A full triangle cluster built for double-lid eyes after dark.",
    twilight:   "Volumised but still natural — drama you can actually wear out.",
    nightshift: "A fox-eye upsweep that elongates monolid and double-lid eyes.",
    vip:        "Statement volume for the nights you want to be seen."
  };

  var FINDER_FREQ_COPY = {
    daily:  "Daily-comfort band — thirty-second application, light enough to forget you're wearing it.",
    weekly: "Comfortable for full days, with just enough lift to feel polished.",
    events: "Built to hold its shape all night — no drooping, no resets."
  };

  var FINDER_FLAG_COPY = {
    sensitive: "Glue-free and hypoallergenic — safe for sensitive eyes.",
    firsttime: "One of the easiest bands to place — ideal for a first time with lashes.",
    contacts:  "No glue near the waterline — comfortable over contact lenses.",
    lashext:   "A gentle, glue-free reset while you take a break from extensions."
  };
  var FINDER_FLAG_PRIORITY = ['sensitive', 'firsttime', 'contacts', 'lashext'];
  var FINDER_FLAG_DEFAULT  = "30× reusable, hypoallergenic, no glue.";

  var FINDER_EYE_POOLS = {
    'monolid':          ['inbox','minutes','kickoff','boardroom','pitch','memo','twilight','nightshift','vip'],
    'double-lid':       ['inbox','kickoff','boardroom','memo','afterhours','twilight','nightshift','vip'],
    'inner-double-lid': ['inbox','minutes','kickoff','boardroom','pitch','memo','twilight','vip']
  };

  function validateFinderMap() {
    Object.keys(LASH_FINDER_MAP).forEach(function (eye) {
      var pool = FINDER_EYE_POOLS[eye] || [];
      var looks = LASH_FINDER_MAP[eye];
      Object.keys(looks).forEach(function (look) {
        Object.keys(looks[look]).forEach(function (freq) {
          var id = looks[look][freq];
          if (!LASH_STYLES[id]) {
            console.warn('Finder map: unknown lash "' + id + '" at ' + eye + '/' + look + '/' + freq);
          } else if (pool.indexOf(id) === -1) {
            console.warn('Finder map: "' + id + '" does not fit ' + eye + ' (' + look + '/' + freq + ')');
          }
        });
      });
    });
  }

  function resolveLash(state) {
    var eye  = state.eye  || 'double-lid';
    var look = state.look || 'natural';
    var freq = state.freq || 'weekly';
    var byEye  = LASH_FINDER_MAP[eye]  || LASH_FINDER_MAP['double-lid'];
    var byLook = byEye[look] || byEye['natural'];
    var id = byLook[freq] || byLook['weekly'];
    if (!id || !LASH_STYLES[id]) { console.warn('Finder: no match for', state); id = 'inbox'; }
    return id;
  }

  function finderFlagLine(flags) {
    flags = flags || [];
    for (var i = 0; i < FINDER_FLAG_PRIORITY.length; i++) {
      if (flags.indexOf(FINDER_FLAG_PRIORITY[i]) !== -1) {
        return FINDER_FLAG_COPY[FINDER_FLAG_PRIORITY[i]];
      }
    }
    return FINDER_FLAG_DEFAULT;
  }
```

- [ ] **Step 2: Verify the file still parses (no syntax error)**

Run: `node --check html-build/assets/theme.js`
Expected: no output, exit code 0. (If `node` reports a syntax error, fix the inserted block.)

- [ ] **Step 3: Commit**

```bash
git add html-build/assets/theme.js
git commit -m "feat(finder): add lash recommendation lookup table + copy maps + self-check"
```

---

### Task 2: Wire resolution + dynamic result rendering into the finder

**Files:**
- Modify: `html-build/assets/theme.js` — inside `initLashFinder()`: add a nested `renderResult`, call `validateFinderMap()` once, and replace the `data-finder-done` handler (currently `theme.js:497-498`).

- [ ] **Step 1: Add nested `renderResult` + run the self-check**

Inside `initLashFinder`, immediately **after** the `function close() { ... }` block (so it can call `close`) and before the `document.querySelectorAll('[data-finder-open]')` wiring, insert:

```js
    function renderResult(lashId) {
      var s = LASH_STYLES[lashId];
      if (!s) return;
      var box = finder.querySelector('.finder-result__copy');
      if (!box) return;
      var reasons = [
        FINDER_REASONS[lashId] || s.tagline,
        FINDER_FREQ_COPY[state.freq] || FINDER_FREQ_COPY.weekly,
        finderFlagLine(state.flags)
      ];
      box.innerHTML = ''
        + '<div class="eyebrow">Recommended for you</div>'
        + '<h2 class="display-l"><span class="display-italic">' + s.name + '.</span></h2>'
        + '<div class="finder-result__price tnum">' + s.price + '</div>'
        + '<ul class="finder-result__reasons">'
        +   reasons.map(function (r) { return '<li>' + r + '</li>'; }).join('')
        + '</ul>'
        + '<div class="finder-result__ctas">'
        +   '<button class="btn btn-accent" data-add-to-cart'
        +     ' data-product-id="' + s.id + '"'
        +     ' data-product-name="' + s.name + '"'
        +     ' data-product-variant="' + s.group + '"'
        +     ' data-product-price="' + s.price + '"'
        +     ' data-product-image="' + (s.card || s.image || '') + '">Add to bag</button>'
        +   '<a class="btn btn-secondary" href="product.html?style=' + s.id + '">See full details</a>'
        + '</div>'
        + '<a class="btn-ghost" href="#" data-finder-close>Not for me &mdash; show all 10</a>';
      // The injected add-to-cart button is handled by the delegated document listener.
      // Only the injected close link needs its handler re-attached:
      box.querySelectorAll('[data-finder-close]').forEach(function (b) {
        b.addEventListener('click', close);
      });
    }

    validateFinderMap();
```

- [ ] **Step 2: Replace the done handler**

Find (around `theme.js:497`):

```js
    var doneBtn = finder.querySelector('[data-finder-done]');
    if (doneBtn) doneBtn.addEventListener('click', function () { show(4); });
```

Replace with:

```js
    var doneBtn = finder.querySelector('[data-finder-done]');
    if (doneBtn) doneBtn.addEventListener('click', function () {
      renderResult(resolveLash(state));
      show(4);
    });
```

- [ ] **Step 3: Verify the file still parses**

Run: `node --check html-build/assets/theme.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add html-build/assets/theme.js
git commit -m "feat(finder): resolve + render dynamic recommendation on 'See my match'"
```

---

### Task 3: Verify in the browser (the only available test surface)

**Files:** none (verification only). Uses the running preview server on port 8123 (start with `python3 -m http.server 8123 --directory html-build` if not already running).

- [ ] **Step 1: Confirm no console warnings on load**

Open `http://localhost:8123/index.html`. Read the browser console.
Expected: NO lines starting with `Finder map:` (the 36-cell table passes the eye-pool self-check).

- [ ] **Step 2: Path A — Monolid · drama · events → Nightshift**

In the finder: pick eye `monolid`, look `drama`, freq `events`, no flags, click "See my match".
Expected result card shows: title **Nightshift.**, price **RM 119**, reason 1 = the nightshift fox-eye line, reason 2 = the `events` line, reason 3 = the default no-flag line. "Add to bag" present, "See full details" → `product.html?style=nightshift`.

- [ ] **Step 3: Path B — Double lid · natural · daily, flag `firsttime` → Inbox**

Reopen finder (it resets on open). Pick eye `double-lid`, look `natural`, freq `daily`, toggle flag `firsttime`, click "See my match".
Expected: title **Inbox.**, reason 2 = the `daily` line, reason 3 = the `firsttime` line ("One of the easiest bands to place…").

- [ ] **Step 4: Path C — Inner double lid · office · weekly → Boardroom**

Reopen finder. Pick eye `inner-double-lid`, look `office`, freq `weekly`, click "See my match".
Expected: title **Boardroom.** (confirms a non-Inbox, non-default path resolves correctly).

- [ ] **Step 5: Regression — Add to bag from the result works**

On any result card, click "Add to bag".
Expected: cart drawer opens / toast fires, and the matched lash (not "Inbox") appears in the cart with its image and RM 119. Confirms the delegated listener picks up the injected button.

- [ ] **Step 6: Regression — "Not for me — show all 10" closes the finder**

Click the ghost link under the result.
Expected: finder closes (confirms the re-attached close handler works on the injected link).

> If any path returns the wrong lash, the fix is a data edit in `LASH_FINDER_MAP` (Task 1), not a logic change.

---

### Task 4: Update PROGRESS.md and commit

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Tick the Lash Finder TODO**

In `PROGRESS.md`, update the Lash Finder recommendation TODO lines (the ones noting "quiz always returns 'Inbox'") to mark the recommendation logic as done in `html-build/` (prototype), noting the mapping lives in `LASH_FINDER_MAP` in `theme.js` and the design/plan docs under `docs/superpowers/`. Leave the standalone `lash-finder.html` page and the Shopify-theme port as still-open follow-ups.

- [ ] **Step 2: Commit**

```bash
git add PROGRESS.md
git commit -m "docs: mark Lash Finder recommendation logic done in html-build prototype"
```

---

## Out of scope (YAGNI)

- Result-card hero image swap (use `s.card`) — non-blocking, can be a later polish pass.
- Standalone `lash-finder.html` page — separate task.
- Shopify-theme port of this logic — reuse the same `LASH_FINDER_MAP` + `resolveLash` when porting `initLashFinder` in the theme.
- Automated test harness — the project has no build/test step; not introducing one for this change.
