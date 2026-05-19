# Santai Redesign — Progress & TODOs

Quick-resume doc for picking up the project across machines and sessions. Pair this with `CLAUDE.md` (project brief, in Mandarin) and `html-build/README.md` (technical reference).

---

## Project in one paragraph

Static HTML/CSS/JS prototype of `santai-cosmetics.com` — a Malaysian magnetic-eyelash brand. Visual system: white background, warm-nude accent (Direction C), Newsreader + Manrope fonts, mobile-first 360px. Everything lives in `html-build/`. Will port to a Shopify Liquid theme later (see `html-build/README.md` for the port spec).

---

## Where we are — as of 2026-05-19

**21 pages built**:

| Group | Pages |
|---|---|
| Core | `index.html`, `cart.html`, `wishlist.html`, `search.html`, `404.html` |
| Discovery | `collection.html`, `collection-makeup.html`, `collection-eye-shape.html`, `collection-accessories.html` |
| Product | `product.html` (lash template), `product-cleanser.html`, `product-curler.html` |
| Educate | `how-to-apply.html`, `faq.html` |
| Trust | `contact.html`, `shipping.html`, `returns.html`, `care-guide.html` |
| Legal | `privacy.html`, `terms.html`, `refund-policy.html` |

**Working interactions** (all client-side, ready for Shopify port):
- Cart drawer with **gift tiers** (2 lashes → free Foam Cleanser; 3 → +Thermo Curler) + free-shipping promise band
- **Newsletter popup** — 5s delay, dismissal persists via localStorage
- **Search** — queries `LASH_STYLES` + `ACCESSORIES` by name/group/eyeType/tagline/design (currently on `search.html` only — see TODO 1 below)
- **Collection filter chips** — `?makeup=` / `?eye=` deep-linkable on `collection.html`
- **Compare Styles modal** on lash PDP
- **Wishlist** — localStorage-backed, Save buttons on all 3 PDPs
- **Lash Finder** — 4-step quiz modal (recommendation is hardcoded to "Inbox" for now)
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

- [ ] **Search → dropdown overlay.** Currently the search icon in the header links to the full `search.html` page. Convert it to a dropdown / overlay that opens in or below the header on click, with live-as-you-type results from `LASH_STYLES` + `ACCESSORIES`. The form can still submit to `search.html` for a dedicated full-results view. On mobile: full-screen overlay; on desktop: dropdown anchored to the search icon. Wire across all 21 pages.

- [x] ~~**Remove "Santai Studio" everywhere.**~~ **Done 2026-05-19.** Deleted the fake address card on `contact.html`; rewrote footer newsletter quote (`Join the Santai list`), Connect column link (`Loyalty`), newsletter-popup eyebrow (`— Join the list`) and subtitle (`...notes from the Santai team`) across all 21 pages; scrubbed page-specific copy in `contact.html`, `care-guide.html`, `faq.html`, `privacy.html`, `shipping.html`, `returns.html`, `refund-policy.html`. Only remaining "studio" mentions are the photography term in `README.md` (legit) and `@tan_studio` UGC handle on `index.html` (a real person).

- [x] ~~**Comprehensive link audit.**~~ **Done 2026-05-19.** Built a crawler that scans every `<a>` across all 21 pages. Findings:
  - 0 broken internal file references — every `.html` link points to a file that exists.
  - **Fixed**: standardised footer "Learn" column across all 21 pages (was 4 different variants); added missing `data-finder-open` to footer "Lash Match quiz"; routed footer "By eye shape" to `collection-eye-shape.html` (was sometimes pointing to `collection.html` or `#`); fixed Shop nav anchor on `index.html` + `product.html` (was `href="#"`); standardised Shop nav on `faq.html` + `how-to-apply.html` (was `index.html#bestsellers`, now `collection.html` like the rest); wired `faq.html` "shipping page" link → `shipping.html`; wired `faq.html` "Chat on WhatsApp" → `https://wa.me/60123456789`; wired homepage Essentials cards → `product-curler.html` + `product-cleanser.html` (were `href="#"`).
  - **Remaining 94 `href="#"` are deliberate placeholders** for deferred features: Instagram / TikTok / Loyalty footer links (×21 each, awaiting real URLs), "The journal" footer link + homepage journal block (×21+4, journal deferred), homepage + PDP review links (×3, reviews deferred to Judge.me at Shopify port), pagination prev/next/page-1 anchors on `collection.html` (×3, decorative).

### Smaller / known gaps (carried over)

- [ ] **About / Our Story page** — explicitly skipped per user direction; build later
- [ ] **Journal index + article template + 3 posts** — explicitly skipped per user direction; homepage has 3 journal cards with copy + images already wired
- [ ] **Sort dropdown on `collection.html`** — decorative; filter chips work but Sort doesn't
- [ ] **Real product photography for Cleanser + Thermo Curler** — currently using lifestyle photo stand-ins
- [ ] **Lash Finder recommendation logic** — quiz always returns "Inbox"; needs a `(eye × look × freq × flags) → product handle` map
- [ ] **Real reviews** — homepage shows 3 hardcoded reviews; will be replaced by Judge.me / Loox / Yotpo Liquid block at Shopify port
- [ ] **Account pages** — header account icon links nowhere; Shopify generates these on port, defer
- [ ] **Stockists / Sustainability / Press** — removed from footer or stubbed as `href="#"`. Build only if the brand actually has these (Press → when actual press exists; Stockists → when there's retail presence)

### Out of scope — Shopify handles at port time

- Real cart state (currently in-memory JS)
- Checkout flow
- Real search backend (currently client-side over static catalogue)
- Real discount code validation
- Newsletter backend (Klaviyo on port)

---

## Recent commit history (this session)

```
5615239 chore: footer sweep + header wishlist link across all 21 pages
e8b6d43 feat: add wishlist (localStorage) + Save buttons on all PDPs
6bf9484 feat: add Privacy, Terms of service, and Refund policy pages
c8167d6 feat: add Contact, Shipping, Returns, and Care guide pages
f8dc5f4 feat: build accessory PDPs + accessories collection page
297bb39 feat: wire collection filter chips and add Memo + VIP Access cards
0e41ae9 feat: wire search to actually search products
67db3a7 feat: add Shop by makeup + Shop by eye shape collection pages
9fa624a feat: redesign cart drawer with gift tiers + add newsletter popup
7c876eb fix: address code review issues in Compare Styles feature
17bee35 feat: update PDP hero images to Pitch style
```

Full history: `git log --oneline`.

---

## How to continue remotely (Claude iOS app)

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
