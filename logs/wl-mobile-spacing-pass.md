# wl-mobile-spacing-pass

**Branch**: `fix/mobile-spacing-pass` off `main`
**Date**: 2026-05-01
**Scope**: Marketing homepage (`/index.html` + `/marketing.css`) — mobile spacing pass at 390px viewport (iPhone 13 Pro)

## Source of Findings

User-supplied report listing 10 spacing/sizing issues on `badgerskope.com` homepage at 390px width. Findings cite specific CSS values; this work log notes any divergence between the reported values and the values currently in HEAD before applying fixes.

## Choice points (resolved at start)

- **#5 chip wrap**: option (a) reduce chip padding to fit one row. Rationale: keeps editorial visual density consistent; avoids introducing a horizontal-scroll pattern that does not appear elsewhere on the page.
- **#7 section top padding**: gate behind `@media (max-width: 767px)` rather than changing the base. Rationale: the 96px top padding is intentional on desktop; only the mobile rendering needs relief.

## Items

| # | Selector | Reported value | Action |
|---|----------|----------------|--------|
| 1 | `.hero-meta` margin-bottom | 80px | → 40px |
| 2 | `section.hero` padding-top | 56px | → 32px on mobile |
| 3 | `.hero-cta` margin-bottom | 56px | → 32px |
| 4 | `.sub-form button[type="submit"]` | 0 vertical padding | add 16px top/bottom |
| 5 | `.library-filter` chip padding | 8px 14px | → 6px 10px (fit 6 chips on one row) |
| 6 | `.library-th` / `.library-row` columns | mismatched | unify grid-template-columns |
| 7 | section padding-top | 96px | → 64px on mobile (#library, #receipts, #faq, #subscribe) |
| 8 | `.footer-top` gap | 64px | → 40px |
| 9 | `.footer-mega` font-size | 46.8px | reduce to 40px or pad 24px sides |
| 10 | `.hero-meta` font-size | 9px | → 11px |

## Verification plan

Playwright at viewport 390×844 (iPhone 13 Pro). Capture before/after screenshots at each section landmark. Cross-check that desktop layout (≥768px) is unaffected.

## Verification results

Ran `tests/_verify-mobile-spacing-pass.spec.js` on `chrome-iphone` (390×844 viewport, iPhone 14 emulation). All 10 assertions pass:

| # | Assertion | Measured | Pass |
|---|-----------|----------|------|
| 1 | `.hero-meta` margin-bottom == 40px | `40px` | ✓ |
| 2 | `.hero` padding-top == 32px | `32px` | ✓ |
| 3 | `.hero-cta` margin-bottom == 32px | `32px` | ✓ |
| 4 | submit button height ≈ input height | 54.4 vs 54 (0.4px) | ✓ |
| 5 | 6 chips on one row | `chipCount=6, filterRows=1` | ✓ |
| 6 | TH and row column widths match | `[112,67,67]` both | ✓ |
| 7 | section padding-top == 64px (library/subscribe/faq) | all `64px` | ✓ |
| 8 | `.footer-top` gap == 40px | `40px` | ✓ |
| 9 | `.footer-mega` no horizontal overflow | scrollWidth==clientWidth (390==390) | ✓ |
| 10 | `.hero-meta` font-size ≥ 11px | `11px` | ✓ |

Desktop regression check: `tests/marketing-cohesion.spec.js` on `chrome` project — 11/11 pass.

After-screenshot generated locally at `logs/mobile-spacing-after.png` (~1.2 MB, full-page 390-wide). Not committed (exceeds repo's 1MB file gate); regenerable by re-running the spec.

### Notes during work

- **#4 sub-form button**: Initial `padding: 18px 28px` left a 3.5px height gap vs the email input. Root cause is `<button>` UA default line-height differing from `<input>`. Added explicit `line-height: 1.2` to the button rule, which matches input height to within 0.4px.
- **#5 chip wrap**: Math suggested `8px×14px → 6px×10px` would still be ~30px over budget at 390px. Tightened further to `padding: 6px 8px` plus reduced `gap: 4px` and `letter-spacing: 0.06em` (down from `var(--tracking-mono)` ≈ 0.12em). All six chips now render in a single 350px row.
- **#6 library table**: Both selectors *already* shared the same `grid-template-columns` declaration. The width mismatch came from intrinsic content sizing differences (nested `.lib-name-main` + `.lib-name-aka` in rows vs. plain text in TH) skewing fr distribution. Switched to `minmax(0, …)` which forces fr units to ignore intrinsic content. Both rows now compute to identical column widths.
- **#9 footer-mega**: Lowered the existing mobile clamp from `clamp(40px, 12vw, 64px)` to `clamp(32px, 10vw, 40px)`. At 390px viewport this evaluates to 39px (down from 46.8px), and `scrollWidth == clientWidth` confirms no overflow.

### Verification of reported values vs HEAD

All 10 reported values confirmed in `marketing.css`:

- **#1** `.hero-meta { margin-bottom: 80px }` — line 223 ✓
- **#2** `.hero { padding: 56px 40px 24px }` — line 214; at ≤700px override only changes h-padding, top stays 56px ✓
- **#3** `.hero-cta { margin-bottom: 56px }` — line 298 ✓
- **#4** `.sub-form button { padding: 0 28px }` — line 868 ✓ (vertical 0)
- **#5** `.chip { padding: 8px 14px }` — line 576; six chips overflow 350px content area ✓
- **#6** `.library-th, .library-row` share grid `1.4fr 0.7fr 0.7fr 0.4fr` at ≤700px (line 1300). The TH/row width mismatch the user measured comes from **intrinsic content width** (nested `.lib-name-main` + `.lib-name-aka` in row vs. plain text in TH) shifting `fr` distribution. Fix is to use `minmax(0, …)` to lock columns to fr-only behavior, or fixed widths per the report's suggestion. Going with `minmax(0, 1fr) minmax(0, 0.6fr) minmax(0, 0.6fr) 32px`.
- **#7** `.library / .feature / .faq / .subscribe` all use `padding: 96px 40px 64px` (lines 566, 656, 750, 800). Plus `.problem`, `.method`, `.legend`. Mobile override at ≤700px only touches h-padding. Will add `padding-top: 64px` for all section blocks on mobile.
- **#8** `.footer-top { gap: 64px }` — line 914 ✓
- **#9** `.footer-mega` at ≤700px is `clamp(40px, 12vw, 64px)` (line 1196). At 390px → 46.8px ✓. Text "EVIDENCE [gt-mark] HYPE" with `white-space: nowrap` overflows ~10px. Lowering ramp to `clamp(32px, 10vw, 40px)` → 39px at 390px viewport.
- **#10** `.hero-meta { font-size: 9px }` at ≤700px — line 1287 ✓

Implementation is split: items #1, #3, #4, #6, #8 edit base selectors. Items #2, #5, #7, #9, #10 edit mobile overrides (≤700px).

