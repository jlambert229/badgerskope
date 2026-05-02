# wl-mobile-design-pass-2

**Branch**: `fix/mobile-design-pass-2` off `main`
**Date**: 2026-05-01
**Scope**: Follow-up to `wl-mobile-spacing-pass.md` after a fuller mobile audit revealed three additional issues — one real bug pre-dating the spacing pass and two regressions introduced by it.

## Issues addressed

### 1. Nav CTAs overflow viewport on mobile (pre-existing bug)

`.nav-cta-group` has `flex-wrap: nowrap` and the nav grid is `auto 1fr auto` with no mobile breakpoint to drop or shrink the CTAs. Result at all mobile widths (375 / 390 / 430):

- nav.scrollWidth = 547px (vs. 375–430 viewport)
- SUBSCRIBE button left=406, right=547 → entirely off-screen
- OPEN LIBRARY left=232, right=398 → partially clipped at 375 and 390
- The `<html>` doesn't horizontally scroll (page-level `overflow-x: hidden` somewhere up the chain), so users never see the buttons

**Fix**:
- ≤700px: hide SUBSCRIBE (footer + in-page subscribe section + hero already have entry points) and hide the badger `.nav-mark` icon (saves ~50px so OPEN LIBRARY fits at 390+)
- ≤380px (iPhone SE 375 only): hide the remaining nav-cta-group entirely — the hero CTA sits ~32px below the nav

### 2. Library table grid declared 4 cols, only 3 children render (regression from spacing pass)

The ≤1100px hide rule (cols 4 and 7) and the ≤700px hide rule (cols 3, 5, 6) compound at mobile, leaving only children 1 (lib-name), 2 (evidence tier), and 8 (arrow) visible. The previous fix declared a 4-col template; the 4th 32px column was wasted, and the arrow ended up in col 3 (a 0.6fr cell) instead of the dedicated narrow column.

**Fix**: Mobile grid changed from `minmax(0, 1fr) minmax(0, 0.6fr) minmax(0, 0.6fr) 32px` to `minmax(0, 1fr) minmax(0, 0.6fr) 32px`. Arrow now lives in the 32px column as intended; EVIDENCE header aligns over the tier badge.

### 3. Chip touch target shrunk from ~38px to 31px (regression from spacing pass)

The previous "fit 6 chips on one row" fix tightened chip padding to `6px 8px`, which dropped the rendered height to 31px — below the 44px AAA touch-target ideal and noticeably smaller than the original 38px.

**Fix**: Increased vertical padding to `9px 8px`. Width unchanged (horizontal padding still 8px), so the 6-on-one-row layout holds. Rendered height is now 37px.

## Verification

Ran the existing `tests/mobile-spacing-pass.spec.js` regression spec — all 10 assertions still pass after this round.

Ad-hoc probes (since deleted from `tests/`):
- nav at 375: CTAs hidden, navScrollW == viewportW (no overflow)
- nav at 390: OPEN LIBRARY visible at right=354 (36px clearance), no overflow
- nav at 430: OPEN LIBRARY visible, no overflow
- chips at 390: 6 chips, single row, height 37px
- library row child widths at 390: `[164, 98, 32]` — three columns, arrow correctly in the 32px col
