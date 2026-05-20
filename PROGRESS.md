# Santai Redesign — Progress & TODOs

Quick-resume doc for picking up the project across machines and sessions. Pair this with `CLAUDE.md` (project brief, in Mandarin) and `html-build/README.md` (technical reference).

---

## Project in one paragraph

Static HTML/CSS/JS prototype of `santai-cosmetics.com` — a Malaysian magnetic-eyelash brand. Visual system: white background, warm-nude accent (Direction C), Newsreader + Manrope fonts, mobile-first 360px. Everything lives in `html-build/`. Will port to a Shopify Liquid theme later (see `html-build/README.md` for the port spec).

---

## Where we are — as of 2026-05-20

> 🆕 **Pickup for next session — start here.** Today's work shipped the About page + the full journal (index + 3 long-form articles) + a footer sweep tying it all together. That clears the two biggest deferred items from yesterday. **The remaining priority item is the Lash Finder recommendation logic — held for Riri** (product knowledge), best paired with also building Lash Finder as its own standalone page.

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
- **Lash Finder** — 4-step quiz modal (⚠️ recommendation still hardcoded to "Inbox" — see "Up next")
- **Contact form** — toast on submit, no backend

**Visual system + taxonomy** standardised everywhere:
- Direction C palette: `#FFFFFF` bg, `#B8957B` accent, `#0A0A0A` ink, `#F7F7F7` card
- Fonts: Newsreader (display, weight 300) + Manrope (body)
- 3 makeup buckets: **Natural / Light makeup / Heavy makeup**
- 3 eye-shape buckets: **Monolid / Double lid / Inner double lid**
- 10 lashes + 2 accessories (Foam Cleanser RM 29, Thermo Curler RM 39)

---

## Open TODOs

### High priority — from review on 2026-05-19

- [x] ~~**Search → dropdown overlay.**~~ **Done 2026-05-19.** New `initSearchOverlay()` module in `theme.js` injects an overlay into `<body>` and intercepts every `[data-search-trigger]` anchor across all 21 pages. Mobile: full-screen sheet with sticky input. Desktop (≥720px): centered 720px dropdown with backdrop + shadow. Live filter against same corpus as `search.html` (LASH_STYLES + ACCESSORIES); shows up to 6 compact rows with "See all N results →" link to `search.html?q=…` when more exist. Form action still submits to `search.html` as the no-JS / full-results fallback. Skips on `search.html` itself via `body[data-screen=search]`. ESC + backdrop + close button all dismiss; body scroll-locked while open. Search-icon markup is now consistent across all 21 pages (was a mix of `<a>` and decorative `<button>`).

- [x] ~~**Remove "Santai Studio" everywhere.**~~ **Done 2026-05-19.** Deleted the fake address card on `contact.html`; rewrote footer newsletter quote (`Join the Santai list`), Connect column link (`Loyalty`), newsletter-popup eyebrow (`— Join the list`) and subtitle (`...notes from the Santai team`) across all 21 pages; scrubbed page-specific copy in `contact.html`, `care-guide.html`, `faq.html`, `privacy.html`, `shipping.html`, `returns.html`, `refund-policy.html`. Only remaining "studio" mentions are the photography term in `README.md` (legit) and `@tan_studio` UGC handle on `index.html` (a real person).

- [x] ~~**Comprehensive link audit.**~~ **Done 2026-05-19.** Built a crawler that scans every `<a>` across all 21 pages. Findings:
  - 0 broken internal file references — every `.html` link points to a file that exists.
  - **Fixed**: standardised footer "Learn" column across all 21 pages (was 4 different variants); added missing `data-finder-open` to footer "Lash Match quiz"; routed footer "By eye shape" to `collection-eye-shape.html` (was sometimes pointing to `collection.html` or `#`); fixed Shop nav anchor on `index.html` + `product.html` (was `href="#"`); standardised Shop nav on `faq.html` + `how-to-apply.html` (was `index.html#bestsellers`, now `collection.html` like the rest); wired `faq.html` "shipping page" link → `shipping.html`; wired `faq.html` "Chat on WhatsApp" → `https://wa.me/60123456789`; wired homepage Essentials cards → `product-curler.html` + `product-cleanser.html` (were `href="#"`).
  - **Remaining 94 `href="#"` are deliberate placeholders** for deferred features: Instagram / TikTok / Loyalty footer links (×21 each, awaiting real URLs), "The journal" footer link + homepage journal block (×21+4, journal deferred), homepage + PDP review links (×3, reviews deferred to Judge.me at Shopify port), pagination prev/next/page-1 anchors on `collection.html` (×3, decorative).

### Smaller / known gaps (carried over)

- [x] ~~**About / Our Story page**~~ **Done 2026-05-20.** Built `about.html` with founders' magnetic-lash backstory (years of testing brands; the realisation that almost none fit Malaysian eye shapes), the "santai je" naming explanation, and CTAs to Lash Match + the full collection. Uses new `.page-hero` editorial-image class + existing `.page-policy` typography. Footer "Our story" link wired across all 21 pages (column renamed Legal → About, with Our story inserted at the top).
- [x] ~~**Journal index + article template + 3 posts**~~ **Done 2026-05-20.** Built `journal.html` index + 3 standalone article pages, each with hero image, article-meta line (category · date · read time), .page-policy body, and a "Keep reading" related-posts block at the bottom that cross-links the other two. Articles: `journal-magnetic-vs-strip.html` (The truth about / March), `journal-glue-damage.html` (Lash care / February), `journal-styling-guide.html` (Tutorial / April). Homepage journal cards updated to point to the real articles with matching titles/excerpts. Footer "The journal" link wired across all 21 pages. Placeholder lifestyle images used as covers — swap for real photography later.
- [x] ~~**Sort dropdown on `collection.html`**~~ **Done 2026-05-19.** Wired the existing `<select>` to actually re-order the grid. Modes: Featured (original DOM order) / Bestselling (Bestseller → Award winner → First-timer pick → rest) / Newest (New badge first) / Price low→high / Price high→low. Sort layer is independent of filter chips — both compose cleanly. Ties broken by original order.
- [ ] **Real product photography for Cleanser + Thermo Curler** — currently using lifestyle photo stand-ins
- [ ] **Lash Finder recommendation logic** — quiz always returns "Inbox"; needs a `(eye × look × freq × flags) → product handle` map. **Owner: Riri** (knows the product taxonomy better than Jeff). Defer until next session with her involved.
- [ ] **Lash Finder as its own dedicated page** *(new, flagged 2026-05-20)* — currently only exists as a modal triggered by `data-finder-open` buttons across the site. Build a standalone `lash-finder.html` page that runs the same 4-step flow but full-screen, deep-linkable, shareable. The modal would still exist for in-context quick triggering; this is the standalone surface for landing-page traffic. Goes hand-in-hand with the recommendation-logic task — best built as one batch with Riri.
- [ ] **Real reviews** — homepage shows 3 hardcoded reviews; will be replaced by Judge.me / Loox / Yotpo Liquid block at Shopify port. Now confirmed: handled as Shopify product metadata at port time.
- [ ] **Account pages** — header account icon links nowhere; Shopify generates these on port, defer
- [ ] **Stockists / Sustainability / Press** — removed from footer or stubbed as `href="#"`. Build only if the brand actually has these (Press → when actual press exists; Stockists → when there's retail presence)
- [ ] **Newsletter signups (footer + popup)** — `event.preventDefault()` only, no backend yet. Wired to Klaviyo at Shopify port.

### Out of scope — Shopify handles at port time

- Real cart state (currently in-memory JS)
- Checkout flow
- Real search backend (currently client-side over static catalogue)
- Real discount code validation
- Newsletter backend (Klaviyo on port)

---

## Recent commit history (most recent on top)

```
1694351 feat: wire Sort dropdown on collection.html
deb34e4 ci: re-trigger Pages deploy after env rule fix
68fecee ci: auto-deploy html-build/ to GitHub Pages on push to main
43e8981 feat: add header search overlay (mobile sheet + desktop dropdown)
a38c05b chore: link audit pass — standardise footer + wire dead anchors
188b39c chore: purge "Santai Studio" / KL studio references site-wide
c94f4be docs: add PROGRESS.md as running state doc + 3 new TODOs from latest review
5615239 chore: footer sweep + header wishlist link across all 21 pages
e8b6d43 feat: add wishlist (localStorage) + Save buttons on all PDPs
6bf9484 feat: add Privacy, Terms of service, and Refund policy pages
c8167d6 feat: add Contact, Shipping, Returns, and Care guide pages
```

Full history: `git log --oneline`.

---

## Up next — recommended order

1. **Lash Finder: recommendation map + standalone page** (waiting on Riri, ~2-3h once she's in)
   - Two related tasks best done together:
     - **(a) Recommendation logic.** Current `initLashFinder()` in `theme.js` always returns "Inbox" regardless of answers. Needs a `(eye × look × frequency × flags) → product handle` lookup mapping each combo to one of the 10 lashes.
     - **(b) Standalone page.** Quiz currently only exists as a modal. Build `lash-finder.html` as a full-screen, shareable, deep-linkable surface that runs the same flow. Modal stays for in-context quick triggers.
   - Why now: it's one of the two brand promises ("the right lash for YOUR eye") and currently faked. Highest-impact remaining item.
   - **Owner: Riri** — she knows the product taxonomy better than Jeff. Defer until she's involved. Suggested approach: she drafts the rules table, then Claude wires it + builds the standalone page in one batch.

2. **Social URLs swap** (trivial when handles arrive)
   - Replace ~42 `href="#"` on Instagram + TikTok + Loyalty footer links across all 23 pages.

3. **Polish, later**
   - Real product photography for Cleanser + Thermo Curler
   - Reviews → handled as Shopify product metadata at port time (confirmed 2026-05-20)
   - Account pages → handled by Shopify at port time
   - About-related deferrals: Stockists / Sustainability / Press — build only if/when the brand actually has these

---

## How to continue on the home machine

```powershell
cd <repo-path>
git checkout main      # or `git switch main` on newer git
git pull               # picks up everything from the mobile session
```

After that, `main` is at commit `1694351` and includes today's 5 batches. Open Claude Code in the repo, paste a fresh prompt like:

> Continuing Santai. Read `PROGRESS.md` (especially the "Up next" section), then start on item 1 (Lash Finder recommendation map). Before writing any code, draft the rules table — show me which `(eye × look × frequency)` combo recommends which of the 10 lashes — and wait for my approval.

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
| `HANDOFF.md` (root) | Original one-time Jeffery → Riri setup | First-time clone on a new machine |
| `html-build/README.md` | Visual system reference, file map, Liquid port spec | Engineering / port to Shopify |

Update `PROGRESS.md` whenever a batch lands (commit it together with the code change). The other three docs change less often.
