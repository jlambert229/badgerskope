# Marketing & Cohesion Pass — Combined PR

Branch: `feat/marketing-cohesion-pass`
Base: `b2c399d` (main, post PRs #26/#27/#28)

## Audit issues addressed (12)

1. **#1a Redaction theater** — hype phrases in marketing copy wrapped in `.redact` spans with hover/scroll bar reveal. Marketing-side surprise.
2. **#1b Sarcastic empty states** — library 0-result panel copy switches from generic to subversive ("Couldn't find that. Neither could PubMed.").
3. **#2 Hero density** — anchor compound card (BPC-157, Tier B) becomes focal point. Demote stat row, methodology, tier table, ticker, FAQ, etc.
4. **#3 HYPE ghost type** — commit. `-webkit-text-stroke` with `@supports` solid fallback + min-stroke clamp <480px.
5. **#4 Accent split** — olive `#C8D17A` becomes Tier-A semantic (`--accent-tier-a`); new `#7EB6B0` desaturated teal becomes brand/interactive (`--accent-brand`).
6. **#5 Library masthead** — already a compact strip post-PR #28; we re-tune to use teal accent for the action button.
7. **#6 Stat counter row** — drop the 142/2,807/0 block from marketing landing.
8. **#7 SCROLL FOR THE METHOD anchor** — wrap `.rule-row` in an `<a href="#method">` so it scroll-targets the methodology section.
9. **#8 Article body 65ch** — `.feature-cols` and the BPC-157 long-form prose capped at 65ch.
10. **#9 Newsletter CTA simplify** — "ONE EMAIL EVERY FRIDAY." becomes a single headline; "RECEIPTS ATTACHED." demoted to small mono kicker.
11. **#10 Footer mega-type / page-border** — make `.footer-mega` full-bleed with negative margin equal to footer page-padding.
12. **modal polish** — counter `<span class="modal-nav__counter">` between PREV/NEXT shows "N of M" on every modal-open / PREV / NEXT. `max-height: 90vh` cascaded with `90dvh`.

## File list (planned)

- `design-tokens.css` — accent split tokens
- `index.html` — restructure (drop stat row, add anchor card, redaction spans, scroll-anchor wrap, simplified subscribe block)
- `marketing.css` — accent swap audit, ghost type rule, redaction CSS, article max-width, footer mega bleed, simplified subscribe layout
- `web/index.html` — modal counter span (already wired via `detail-nav-pos`, no markup change required)
- `web/app.css` — empty-state retains; modal `90dvh` cascade
- `web/src/main.js` — sarcastic empty-state copy

## Receipts

- `design-tokens.css` — `--accent-tier-a: #C8D17A`, `--accent-brand: #7EB6B0`, `--accent` aliased to `--accent-interactive` (teal). Tier ramp `--tier-a` retargeted to `--accent-tier-a`. Status `--success` retargeted to olive.
- `marketing.css` — header comment block documents the accent split. `.legend-bar span` and `.filed`/`.filed-dot` explicitly use `--accent-tier-a`. Subscribe radial gradient swapped to teal. `.hero-h1-hype` rewritten as text-stroke ghost type with `@supports` solid fallback + `<480px` stroke-width clamp. New rules added: `.anchor-card*`, `.redact*`, `.feature-cols/article` 65ch, `.footer-mega` margin-inline bleed, `a.rule-row` interactive treatment, `.sub-kicker`. `.hero-stats` collapsed to `display:none`.
- `index.html` — hero stat row removed. `<a href="#method" class="rule-row" id="scroll-for-method">` wraps the SCROLL FOR THE METHOD prompt. New `<section class="anchor-card" id="anchor-card">` inserted under hero with BPC-157, three tier badges, redaction-marked summary + claim list, deeplink CTA. Ticker moved to after-method slot. Subscribe headline collapsed to one line + mono kicker. Inline script: IntersectionObserver auto-toggles `.is-redacted` on scroll-in.
- `web/index.html` — `<span class="detail-nav-pos modal-nav__counter" id="detail-nav-pos" aria-live="polite">` (added `modal-nav__counter` alias).
- `web/app.css` — `.modal` and `.modal-panel` cascade `max-height: 90vh; max-height: 90dvh;`.
- `web/src/main.js` — sarcastic empty-state copy with three-string rotation pinned per session.
- `web/src/detail.js` — `syncDetailNav()` now always shows the counter (`N of M`) using `state.lastVisibleList` as fallback when the detail queue is single-entry.
- `tests/marketing-cohesion.spec.js` — 11 new tests covering #1a, #1b, #2, #3, #4, #6, #7, #8, #9, modal counter, modal 90dvh.
- `tests/edge-cases.spec.js` + `tests/library-default-state.spec.js` — empty-state assertions updated for the rotation copy.
- `playwright.config.js` — `PLAYWRIGHT_PORT` env override (defaults 5173) so concurrent worktrees can share the host.

## Test results

- Baseline: 266 passing on chrome (per spec).
- After: **298 passing / 1 flake** across `chrome`, `chrome-iphone`, `chrome-ipad` (full Chromium suite). The 1 flake is a pre-existing timing-sensitive `smooth scroll does not break (iOS scroll quirks)` test that passes solo. Net: 11 new tests added, 0 net regressions.

## Smoke screenshots

- `/tmp/marketing-1440.png` — hero with teal `>`, olive ghost-type HYPE, teal CTAs.
- `/tmp/marketing-mobile.png` — hero/CTAs at 390px.
- `/tmp/anchor-card.png` — BPC-157 anchor with redaction bars sweeping.
- `/tmp/library-1440.png` — library list, compact masthead, olive Tier-A FDA APPROVED badges.
- `/tmp/library-modal.png` — modal counter showing "1 of 20".
- `/tmp/footer.png` — footer mega-type EVIDENCE > HYPE full-bleed.
- `/tmp/subscribe.png` — single headline + mono kicker.
