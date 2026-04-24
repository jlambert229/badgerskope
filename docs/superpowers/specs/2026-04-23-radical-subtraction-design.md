# Design spec: Radical Subtraction (Phase 2 of Calm Library redesign)

**Date:** 2026-04-23
**Branch:** `redesign-radical-subtraction`
**Phase:** 2 of 6
**Depends on:** Phase 1 (`redesign-calm-library` — shared tokens, hover calm, chip unification). PR #7.

## Problem

The detail modal stacks up to 14 sections at uniform visual weight: hero bar, categories, "known for", plain-English summary, evidence-in-context chart, important note, research findings, typical use, cycling (collapsed), doses (collapsed), applications, synergies, sources with quality bar, disclaimer. Every section has an `<h3>` of the same size; content competes for attention; first-time readers hit a wall of research-paper density.

Browse cards carry redundant controls — a checkbox and a "+ Compare" button that do the same thing. The browse toolbar shows seven filter controls (Search + Category + Type + Known For + Evidence + Sort + Group By) plus a goal-pill row, which is too many entry points to the same set of entries.

The Phase 1 pass made the palette coherent; Phase 2 removes the surface-area noise so the coherent palette can do its job.

## Goal

One answer first, depth on demand. The detail view should communicate what the compound is, how strong the evidence is, and one plain-English summary before the user scrolls. Everything else collapses behind a single progressive-disclosure surface. Browse cards show one primary action. The browse toolbar defaults to search + evidence + a single Refine drawer.

## Non-goals

- No IA changes to top-level tabs (Browse / Compare / Stats stay put — that's Phase 3)
- No command palette (Phase 6)
- No URL sharing of filtered views (Phase 6)
- No marketing-page simplification (Phase 5)
- No changes to `peptide-info-database.json` schema
- No new JS modules (work within `web/app.js` and `web/app.css` + `web/features.css`)

## Scope

Files touched:

- `web/app.js` — rewrite `renderDetailHtml()` (lines ~685-902); remove "+ Compare" button from card factory (`renderCard`); adjust browse-toolbar render if it lives in JS
- `web/app.css` — new styles for simplified detail layout, facts strip, action bar, Refine drawer
- `web/features.css` — adjustments for details accordion pattern, goal-pill secondary row
- `web/index.html` — restructure the browse toolbar DOM: move most filter controls inside a collapsible `<details class="refine-drawer">`; promote Search and Evidence as always-visible
- `web/src/detail.js` and `web/src/cards.js` — update the module-version renderers for parity (currently unused by the shipped bundle but maintained alongside)

No database, config, or infrastructure changes.

## Design

### Detail view — new structure

One view, three zones, then progressive depth.

```
┌─ Disclaimer strip ──────────────────────────────────┐
│  Research summary, not medical advice.             │
├─ Hero ───────────────────────────────────────────── ┤
│  Title                              [Evidence tier] │
│  One-sentence plain-English summary                 │
├─ Facts strip ─────────────────────────────────────── ┤
│  Type · Category · FDA status · WADA · N sources    │
├─ Body ───────────────────────────────────────────── ┤
│  2-3 paragraph research summary                     │
│  What researchers found (3-5 bullets, max)          │
├─ Research details (collapsed accordion) ──────────── ┤
│  ▸ Dosing & timing                                  │
│  ▸ Cycling pattern                                  │
│  ▸ Doses in published research                      │
│  ▸ Often discussed alongside                        │
│  ▸ Research themes                                  │
│  ▸ Sources (N)                                      │
├─ Footer action bar (sticky) ──────────────────────── ┤
│  [★ Bookmark]  [Share]  [Print]  [Report issue]    │
└─────────────────────────────────────────────────────┘
```

**Zone details:**

1. **Disclaimer strip** — `.detail__disclaimer-strip`, muted background, one line of 13-14px text at the very top of the modal body. Replaces all the per-section "talk to your doctor" microcopy and the heavy bottom disclaimer. Appears once.

2. **Hero** — `.detail__hero`, the big visual moment. Large `H2` (use `--text-3xl`) for the title. Evidence tier badge at the right, large (`--text-sm` label, `--space-4` padding, tier color background with dark text). One-sentence summary directly below, `--text-lg` weight 400, muted. That's it — no bookmark button, no compound-type chip, no catalog-SKU subline.

3. **Facts strip** — `.detail__facts`, a single horizontal row of inline key-value pairs separated by `·` middots. Examples: `Incretin peptide · Appetite · FDA approved · 2 sources`. Uses `--text-sm`, `--text-muted`. Collapses to a wrapping list on narrow screens. Doping flag appears here if `entry.dopingStatus?.prohibited`. The `distinctiveQuality.headline` does NOT appear in the strip — it always renders as the body lead paragraph subhead (see zone 4). The strip stays short and fact-dense.

4. **Body** — `.detail__body`. Merges the current "What it's known for", "In plain English", "What the research shows", "Important note" and "Potential uses people explore" sections into one continuous reading experience, in this order:
   - Subhead (optional): `distinctiveQuality.headline` rendered as a muted italic paragraph above the lead (`.detail__body-subhead`), only when it exists. No `<h3>` above it.
   - Lead paragraph: research summary (`entry.researchSummary`)
   - Inline warning callout (`.detail__callout--warn`), only if `entry.notes` exists. No heading; just the note text with a left-accent border.
   - "What researchers found" `<h3>` (small, `--text-base`, `--text-muted`, `font-weight: 600`): bulleted `reportedBenefits` capped at 5 items. If more than 5 exist, append a small `.detail__body-more` line: `+ N more in research details below`.

5. **Research details accordion** — `.detail__depth`. A single `<section>` with the heading "Research details" (one `<h3>`), containing five to six `<details>` elements nested inside. Summary labels: "Dosing & timing", "Cycling pattern", "Doses in published research" (conditional), "Often discussed alongside" (conditional), "Research themes" (conditional), "Sources (N)". Users open the sections that matter to them. The sources subsection keeps its quality-breakdown text but loses the percentage bar (promoted earlier to the facts strip as `N sources`).

6. **Footer action bar** — `.detail__actions`, position sticky at the bottom of the modal panel. Four icon buttons with labels: Bookmark, Share, Print, Report issue. No inline "Bookmark" button in the hero anymore. Always visible while scrolling the modal body.

**Cut entirely from the detail view:**
- "Evidence in context" comparison chart — move to a text link at the end of the facts strip: `See how this compares →` which opens the Stats tab with the entry's primary category pre-filtered
- The colored left-border on the hero bar (replaced by the evidence badge itself)
- The compound-type chip in the hero (now part of facts strip)
- Per-section `.detail__help` explainer paragraphs
- Bottom disclaimer block
- `.detail__cats` strip of category badges

### Card grid — remove redundant compare button

- Delete the `.card__compare-btn` element entirely from `renderCard()`.
- Keep the `.card__select` checkbox (top-left). Selecting it still adds the entry to the compare set.
- Delete the associated CSS rule block `.card__compare-btn { ... }` in `web/app.css`.
- Also remove the `transform: scale(0.98)` inline JS animation in the card click handler (`cards.js` line 107 equivalent in `web/app.js`'s `renderCard`) — Phase 1 removed CSS hover scales but missed this JS-driven one.

### Browse toolbar — collapse into primary + Refine drawer

- **Always visible:** Search input, Evidence-tier filter chip-row, result count, Reset (when active).
- **Behind a Refine button (`<details class="refine-drawer">` or equivalent):** Category, Type, Known For, Sort, Group By.
- **Goal pills:** Move to a secondary row *below* the card grid's first row, introduced with a small heading `What are you looking for?`. On first visit (no filters active), the goal pills render above the grid. Once any filter is engaged, the goal row collapses to save space. This keeps the goal entry point for Alex-persona users without making it compete with search for primary attention.

### Interaction & keyboard

- All existing keyboard shortcuts preserved (/, ?, h, t, b, f, Esc, ←, →).
- The details accordion items are native `<details>` — keyboard-accessible by default.
- Modal body adds `scroll-behavior: smooth`.
- Facts strip's `See how this compares →` link uses the existing hash-params pattern: `#tab=stats&category=<categoryKey>`. Verify in `readHashParams`/`writeHashParams` that these keys are honored; if not, extend the reader to route `tab=stats` to the Stats tab and apply `category` as an active filter. Keep the handler under 30 lines.

### Visual language

- Evidence badge in hero: larger and more prominent than today's pill — treat as the primary identity element
- Sticky action bar: `background: color-mix(in srgb, var(--surface) 90%, transparent)` with `backdrop-filter: blur(8px)` when supported
- Disclaimer strip: `background: var(--accent-soft)`, no border, 0.875rem text, muted color
- Facts strip middots: 1em line-height matches surrounding text, no special treatment

### Mobile

- Modal becomes fullscreen at `max-width: 720px` (existing behavior preserved).
- Hero title scales down to `--text-2xl` at `< 600px`.
- Facts strip wraps to a 2-column grid at `< 480px`.
- Footer action bar collapses icon-only (no labels) at `< 480px`.

## Testing

**Automated:**

- Existing Playwright suite must continue to pass at Phase 1 baseline (217 Chromium passes).
- Detail-specific tests that reference removed DOM (e.g. `.detail__cats`, `.card__compare-btn`, `.detail__hero-bar`, `.detail__evidence-block`, `.ev-compare` inside detail) need updates. Update the selectors to target new structure or remove assertions that referenced cut features.

**Manual visual pass (record in work log):**

1. Open `/web/#entry=1G-SGT%2010mg` — the redesigned hero is visible above the fold on a 1366×768 viewport
2. Scroll: body, then Research details accordion, then sticky action bar
3. Open Research details → all subsections expand individually
4. Bookmark + share + print buttons in sticky bar work
5. Return to browse; a card shows only one primary action (checkbox); clicking card body opens detail
6. Toolbar: Search and Evidence visible; clicking "Refine" expands remaining filters
7. First-visit (cleared localStorage + no filters): goal pills visible above grid
8. After engaging any filter: goal pill row collapses
9. Mobile-portrait simulation (390×844): facts strip wraps, action bar icon-only
10. Dark theme → light theme (toggle): no contrast regressions

## Acceptance criteria

1. `renderDetailHtml()` produces at most 6 top-level `.detail__*` blocks (disclaimer strip, hero, facts strip, body, depth, actions). No more than one `<h3>` above the depth accordion.
2. No sub-heading inside the body uses font-weight/size matching the hero or facts-strip headings.
3. Card grid has zero `.card__compare-btn` elements; selection is checkbox-only.
4. No `transform: scale(...)` in card click JS handler.
5. Browse toolbar: Search and Evidence filter visible by default; Category/Type/Known For/Sort/Group By are inside a single `.refine-drawer` toggled by one button.
6. Goal pills exist, are visible on first-visit with no filters, and hidden once any filter is active.
7. Sticky footer action bar shows Bookmark/Share/Print/Report and scrolls with the modal.
8. All existing keyboard shortcuts still work.
9. Playwright Chromium pass count matches Phase 1 baseline.
10. Manual visual pass (10 items above) documented in work log.

## Rollout

Single PR on branch `redesign-radical-subtraction` → `main`, after Phase 1 (PR #7) is merged. Squash merge acceptable.

If Phase 1 is still open in review when this branch is ready, rebase onto the latest Phase 1 head before opening the PR.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Users miss the cut Evidence-in-context chart | Preserved as "See how this compares →" link; chart lives in the Stats tab unchanged |
| Power users (Taylor) lose fast access to dosing / synergies behind the accordion | One click to expand; "Research details" section can be given a `open` attribute by default on a keyboard shortcut (d) if requested post-launch — defer to Phase 3 |
| Goal-pill logic creates a flicker when filters change | Hide via `display: none` toggled in state code, not remount; no render churn |
| Sticky action bar overlaps last content block | Add `padding-bottom: var(--space-12)` to `.modal__panel` body |
| Tests reference removed DOM | Update selectors in the same PR; do not silence tests |
| Print stylesheet renders the sticky bar | `@media print { .detail__actions { position: static; } }` |

## Out of scope — reserved for later phases

- Phase 3: library shell IA (merge Compare/Stats under a single command surface)
- Phase 4: compare-as-drawer (triggered from multi-select in Browse)
- Phase 5: marketing page simplification
- Phase 6: command palette (Cmd+K) exposing notes/bookmarks/share/recents
