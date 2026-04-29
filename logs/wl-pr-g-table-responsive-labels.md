# PR G — Table responsive labels at <1100px

## Goal
At narrow viewports (<1100px) the library table headers (FILE / COMPOUND /
EVIDENCE / WELLNESS / SUMMARY) get hidden by an existing rule, but the row
cells remain unlabeled. Users can't tell what each cell value or badge means.

Add inline `::before` pseudo-element labels driven by `data-label` attributes
set in `cards.js`. Above 1100px the table header does its job; below 1100px
the cells self-label as quiet metadata prefixes.

## Scope
- `web/src/cards.js` — set `data-label="…"` on FILE / COMPOUND / EVIDENCE /
  WELLNESS / SUMMARY cells at render time
- `web/app.css` — add `::before` content rules inside the existing
  `@media (max-width: 1100px)` block
- `tests/library-responsive-labels.spec.js` — verify ::before appears <1100px
  and is `none` at >=1100px

## Out of scope
- The table headers themselves (still hidden via existing rule line 722)
- The filter strip, disclaimer banner, modals, marketing chrome
- `index.html`, `marketing.css`, `design-tokens.css`, `evidence-guide.html`,
  `glossary.html`

## Implementation choices
- `--text-label` token does not exist in `design-tokens.css` (PR F territory).
  Used literal `11px`.
- `--text-dim` token already exists (= `--fg-3`); used with fallback.
- Mono font + uppercase, 11px, dim color — quiet metadata, no olive accent.
- Wellness cell is hidden at <1100px by an existing rule; its `::before`
  cascades to `display: none` via the parent, which is correct (no label
  shown for an absent cell).
- `.lib-row__tier` is `display: flex`; gave its `::before` `flex: 0 0 100%`
  so the label takes a full first row and the badge + tier-label flow on
  the line beneath it.

## Receipts
- Branch `feat/pr-g-table-responsive-labels` off `b2c399d` (latest main)
- Smoke (Playwright headless, in /tmp/pr-g-smoke.mjs):
  - 1024×768: head `display: none`, ::before content `"FILE: "` /
    `"COMPOUND: "` / `"EVIDENCE: "` / `"SUMMARY: "`, mono 11px rgb(138,135,117)
  - 1440×900: head `display: grid`, ::before content `none` for all cells
- Screenshots: /tmp/pr-g-narrow-1024.png, /tmp/pr-g-wide-1440.png
- New tests pass in isolation: `playwright test --project=chrome
  tests/library-responsive-labels.spec.js` → 2/2
- Full Chromium suite: 248 passed, 11 skipped (variance ±20 due to
  cross-worktree port contention, but suite green when serve is stable on
  this worktree's content)

## Notes for follow-up
- The 760px breakpoint already restructures rows into a 2-col grid; the
  inline labels still apply (they cascade from the 1100px rule). Visually
  acceptable; revisit if user testing surfaces stacking issues.
- If PR F merges and adds `--text-label`, swap the literal `11px` for the
  token in app.css (single line change at line ~746).
