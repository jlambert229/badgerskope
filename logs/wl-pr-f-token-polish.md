# PR F — Typography token + tactile polish pass

Branch: `pr-f-token-polish` (off `main` @ `b2c399d`)

## Scope

Four cohesion / polish issues from the UX audit:

- **#4** Touch targets too small. `.lib-row__select` wrapper had no 44px hit area.
- **#5** "APPETITE & FULLNESS" wrapped mid-phrase inside the wellness chip.
- **#9** Mono label sizes inconsistent (10/11/12px for visually identical labels).
- **#10** Zero radius on interactive controls felt unfinished.

## Files touched

- `design-tokens.css` — added `--text-label: 11px`, `--radius-micro: 2px`.
- `web/app.css` — applied token (24 selectors), added 44×44 hit area, 2px radius
  on 4 interactive control families, fixed wellness chip wrap.

Test scaffolding added:
- `tests/pr-f-token-polish.spec.js` — 3 tests (hit area, single-line chip, token).
- `scripts/qa-pr-f.mjs` — local QA helper (boundingBox + screenshot at 1440 / 390).

## Receipts

### Token usage (font-size literal → `var(--text-label)`)

24 rules converted. Remaining literal `font-size: NNpx` are intentionally kept:
- `kbd` — body element, not a mono caps label
- `.lib-row__select input[type="checkbox"]:checked::after` — checkmark glyph
- `.compare-empty-hint`, `.stat-banner`, `.empty-state__hint` — sentence text

### 2px micro-radius on interactive controls

- `.tier-letter`              — `border-radius: var(--radius-micro)` added
- `.lib-field-input`          — `border-radius: var(--radius-micro)` added
- `.lib-row__select input[type="checkbox"]` — `border-radius: var(--radius-micro)` added
- `.card__category` (wellness chip) — `border-radius: var(--radius-micro)` added
- `.chip-active` (PR #28 active filter chip) — `border-radius: 0 → var(--radius-micro)`

Layout containers (cards, panels, sheets, table, modal, footer, topnav,
empty-state) keep `border-radius: 0` per brutalist brand.

### `.lib-row__select` hit area (Playwright boundingBox)

```
desktop 1440×900 : { width: 44, height: 44 }    # was 25×24
mobile  390×844  : { width: 44, height: 44 }    # was 29×28
```

### Wellness chip "APPETITE & FULLNESS"

```
desktop 1440×900 : box {width: 192.625, height: 26.5}
                   font-size: 11px (was 10px)
                   white-space: nowrap
                   min-width: 140px
                   line count: 1            # was 3
```

### Test results (Chromium, retries=1)

| Project          | Passed | Skipped |
|------------------|--------|---------|
| chrome           | 92     | 2       |
| chrome-iphone    | 90     | 4       |
| chrome-ipad      | 91     | 3       |
| **TOTAL**        | **273**| **9**   |

Baseline before PR F: 266 passed (Chromium). Delta: **+7** (3 new tests × 3
projects, 2 skipped on viewports < 1100px where the wellness chip is hidden).

WebKit projects skipped per workspace convention (ICU library mismatch on
this Linux host).

## Brand compliance

- Olive `#C8D17A` accent unchanged.
- `--font-mono` used on all converted labels.
- Marketing surfaces (`index.html`, `marketing.css`) untouched.
- No soft shadows, no gradients introduced.
