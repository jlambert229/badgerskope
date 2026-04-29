# PR B — Regroup library filter strip into filters/toggles/view rows

## Branch
`worktree-agent-a528244d3bec73856` (off `main`)

## Goal
Split the library filter strip from a flat 6-up control row + orphaned-toggle row into three semantic rows:

1. `FILTERS:` — narrow data: wellness, substance, theme, evidence
2. `TOGGLES:` — binary modifiers: experimental, bookmarked, sport-banned
3. `VIEW:` — presentation: sort + group

Each row gets a small mono uppercase label to make the categorization legible.

## Scope
- `web/index.html` — only the `<section class="filter-strip">` block (lines 106-151)
- `web/app.css` — the `.filter-strip*` selectors only
- `tests/*.spec.js` — only selectors that break

## Constraints
- Keep all control IDs (`#category`, `#compound`, `#known-for`, `#evidence-filter`, `#sort`, `#group-by`, `#filter-strip-toggles`, `#filter-strip-sport`, `#result-count`) — `web/app.js` and feature modules bind to these.
- Square edges, olive accent, no rounded corners, mono labels.
- Mobile is left as natural wrap (PR C handles mobile sheet).

## Approach
1. Restructure markup into 3 rows. Each row: `[label-cell][controls cell]`.
2. Move sport toggle from the right-orphan `.filter-strip__meta` slot into the central toggles row alongside experimental + bookmarked. This means I keep `#filter-strip-sport` element but reposition it inside the toggles row.
3. Add row-label CSS using `--font-mono` + `--fg-3` + 10px size.
4. Run Playwright Chromium projects to validate no regressions.

## Receipts

### HTML grep — three rows with labels render

```
$ curl -s http://localhost:5173/web/ | grep -n "FILTERS:\|TOGGLES:\|VIEW:"
108:            <span class="filter-strip__rowlabel" aria-hidden="true">FILTERS:</span>
129:            <span class="filter-strip__rowlabel" aria-hidden="true">TOGGLES:</span>
135:            <span class="filter-strip__rowlabel" aria-hidden="true">VIEW:</span>
```

### Visual

Screenshot saved to /tmp/pr-b-filter-strip.png at 1440x900.
Renders as:
- Row 1 [FILTERS:] — 4 dropdowns (BODY AREA, SUBSTANCE, RESEARCH, EVIDENCE)
- Row 2 [TOGGLES:] — Show experimental, Bookmarked only, Hide sport-banned (left-grouped)
- Row 3 [VIEW:] — Sort, Group

Row labels: 10px JetBrains Mono uppercase, --fg-3 muted, fixed 88px label cell with right hairline matching the lib-field grid borders.

### Playwright Chromium — all green

```
$ PLAYWRIGHT_WEBKIT=0 npx playwright test \
    --project=chrome --project=chrome-iphone --project=chrome-ipad \
    --reporter=line --workers=2
PASS (245) FAIL (0)
Time: 151539ms
```

(Playwright config temporarily switched to port 5273 during the run because three sibling worktrees on the same machine were racing for :5173. Reverted before commit. No test selectors needed updating — the suite binds to control IDs and the `.filter-strip` / `.filter-strip__row--selects` containers, both of which still exist.)

### No test selectors needed updating

Search confirms tests reference only `.filter-strip` (still present on `<section>`) and `.filter-strip__row--selects` (still present on the FILTERS row).

### Files changed
- `web/index.html` — filter strip area only (one `<section>` block)
- `web/app.css` — `.filter-strip*` selectors plus the responsive media-query for it

### Anything deferred
- PR C will replace mobile filter behavior wholesale (filter sheet). Today's mobile fallback is still natural wrap of cells.
- The `.filter-strip__meta` CSS class is now unused (markup no longer references it). Left in place to avoid dragging in unrelated cleanup; can be removed in a future tidy pass.

