# WL — Tier color delineation (5-step ramp olive → rust)

Branch: `feat/tier-color-delineation`
Base: `main` @ `679d870`
Date: 2026-04-28

## Problem

The five evidence tiers (A=Gold Standard … F=SLOP) all rendered as
near-identical olive-grey because the previous "fix" tuned B/C/D/F to
desaturated greys (`#BAB395 → #827B69`). Reads as a single olive blob
from the methodology section and library badges; user cannot tell A
from F at a glance. PR's earlier "minimum-viable separation" pass
optimised purely for contrast against ink and lost all hue
delineation.

## Palette (user-confirmed, desaturated brutalist editorial)

| Tier | Hex     | Name            | Semantic               |
|------|---------|-----------------|------------------------|
| A    | #C8D17A | Olive (KEEP)    | Gold Standard          |
| B    | #A8C77A | Sage            | Promising              |
| C    | #D4A85C | Honey / Amber   | Suggestive             |
| D    | #C97A4A | Terracotta      | Weak / Dated           |
| F    | #9C3D3D | Muted rust      | SLOP                   |

Hue walk: yellow-green → green → amber → orange → red. Saturation drops
toward F so it reads as "dim warning", not traffic-light siren.

## Contrast (WCAG AA) — verified via Node script

Letter ink color logic:
- A/B/C/D — dark ink `#0B0B0A` (≥4.5:1 against bg)
- F — switched to `#F2EFE5` (light ink) because `#9C3D3D` vs `#0B0B0A`
  is only 2.95:1 (fails AA). `#9C3D3D` vs `#F2EFE5` = 5.80:1 (passes).

| Tier | bg vs `#0B0B0A` ink | bg vs `#F2EFE5` fg |
|------|---------------------|--------------------|
| A    | 12.06 : 1           | 1.42 : 1           |
| B    | 10.42 : 1           | 1.64 : 1           |
| C    |  8.96 : 1           | 1.91 : 1           |
| D    |  5.97 : 1           | 2.87 : 1           |
| F    |  2.95 : 1 (FAIL)    | 5.80 : 1           |

Decision: F chip switches to white text via
`.tier[data-grade="F"] .tier-letter { color: var(--fg); }` rule.

## Files touched

- `design-tokens.css` — set `--tier-a` … `--tier-f` to new palette;
  legacy `--ev-*` aliases re-point automatically.
- `web/app.css` — add white-ink override for F badge.
- `marketing.css` — add white-ink override for F chip; vary
  `.legend-bar span` color by parent `.legend-row` `data-grade`.
- `index.html` — add `data-grade="A"` … `data-grade="F"` to each
  `.legend-row` so the bar can pick its own color (CSS-only target).
- `tests/tier-colors.spec.js` — new spec asserting computed RGB of
  each tier badge background.

`peptide-info-database.json` is NOT touched (parallel agent dedupe).
`evidence-guide.html`, `glossary.html`, modal markup unchanged.

## Receipts

See final commit message + PR body.
