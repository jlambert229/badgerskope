# PR D — Populated default state + active filter chips

Branch: `pr-d-default-state-chips`
Repo: `badgerskope` (worktree)

## Scope

Library page (`/web/`) interaction quality:

1. Default initial render: 25 entries sorted by evidence tier desc (A → F).
2. Live "Showing N of M" count above the table, mono + muted.
3. Active filter chips: one button-chip per non-default filter, click-to-remove.
4. Empty-state panel when filters yield 0: "No matches" + Clear-all button.

## Files changed

- `web/index.html` — added `#active-filters` chip container + `#row-count` display between filter-strip and `.lib-table`.
- `web/src/main.js` — render-loop hooks for chip rendering, default-state evidence-desc sort + 25 cap, empty-state panel, `clearAllFilters` helper.
- `web/app.css` — chip styles, count styles, empty-state styles. All square edges, mono font, olive accent.

## Out of scope

- Marketing chrome above filter strip (PR A)
- Filter strip layout (PR B)
- Topnav, search input, design tokens, evidence/glossary pages

## Receipts

- Smoke test (Playwright headless 1440x900): 20 cards rendered on first paint, "SHOWING 20 OF 53 ENTRIES" present.
- Filter dropdown change spawns a chip with text `× WELLNESS: AGING & LONGEVITY`.
- Chip click resets filter, removes chip, restores 20 default rows.
- Search "zzzzz_no_match_query" yields `.empty-state` panel with NO MATCHES heading.
- Clicking "CLEAR ALL FILTERS" restores 20 default rows + 0 chips.
