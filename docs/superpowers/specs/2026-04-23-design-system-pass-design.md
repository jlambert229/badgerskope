# Design spec: Design system pass (Phase 1 of Calm Library redesign)

**Date:** 2026-04-23
**Branch:** `redesign-calm-library`
**Phase:** 1 of 6
**Work log:** `logs/wl-redesign-calm-library.md`

## Problem

BadgerSkope has two CSS token systems — `marketing.css` and `web/app.css` + `web/features.css` — that drift in values and naming. Palette is mostly aligned but radii, spacing, and shadows disagree. Decorative elements (animated orbs, helix, gradient text, stacked badges on cards) compound the "cluttered" feeling. Marketing and library read as two different products when a visitor tabs between them.

The downstream phases (library shell redesign, detail redesign, compare-as-mode, marketing simplification, command palette) all depend on a shared visual vocabulary. Doing them first without the foundation would mean redoing the token work twice.

## Goal

One token system, one visual voice across all surfaces, with decorative noise removed. Existing features and data unchanged. After this phase, visitors tabbing between marketing and library should feel like it's the same product. Cards should read calmer without losing information.

## Non-goals

- IA changes (that's phase 2)
- Card layout or hierarchy changes (phase 2)
- Adding features (phase 6)
- Copy edits beyond removing decorative-only text
- Changes to `peptide-info-database.json` schema or content
- Restructuring JS modules in `web/src/features/`

## Scope

Files touched:

- **New:** `design-tokens.css` at repo root — single source of truth for all shared tokens
- `index.html` — add `<link rel="stylesheet" href="./design-tokens.css">` before `marketing.css`
- `marketing.css` — replace local `:root` tokens with imports from `design-tokens.css`; remove orbs, helix, gradient-text-as-decoration
- `web/index.html` — link to `/design-tokens.css` before `app.css`
- `web/app.css` — replace local `:root` tokens with the shared set; audit hard-coded values
- `web/features.css` — same audit and consolidation
- `glossary.html` and `evidence-guide.html` — link the shared tokens and audit any inline style overrides
- `web/src/constants.js` — update `EVIDENCE_TIERS` color values to read from CSS custom properties via `getComputedStyle(document.documentElement).getPropertyValue(...)` at runtime

## Design

### Token categories

**Color (dark theme, library-compatible light theme preserved via existing `[data-theme="light"]` override in `web/app.css`)**

Canonical names. Keep these stable; future phases can add but should not rename.

```css
:root {
  /* Surface */
  --bg: #0b0e13;
  --bg-elevated: #111720;
  --surface: #161d28;
  --surface-raised: #1c2633;
  --border: #253040;
  --border-strong: #334257;

  /* Text */
  --text: #dce3eb;
  --text-muted: #8a9bb0;
  --text-dim: #5f6f85;

  /* Accent (single value — drop --accent-bright) */
  --accent: #4a8ec2;
  --accent-soft: rgba(74, 142, 194, 0.14);

  /* Evidence tier (semantic) */
  --ev-approved: #22c55e;
  --ev-strong:   #14b8a6;
  --ev-early:    #f59e0b;
  --ev-animal:   #f97316;
  --ev-practice: #9ca3af;
  --ev-unknown:  #6b7280;

  /* Status (non-evidence) */
  --success: #4abfa0;
  --warning: #d4952a;
  --danger:  #c0392b;
}
```

Evidence tier values come from `web/src/app.js` `EVIDENCE_TIERS` — those hex values are the source of truth and move into CSS vars. After this phase `EVIDENCE_TIERS[].color` reads from CSS at runtime so there is one source.

**Typography**

Keep `IBM Plex Sans` + `IBM Plex Mono`. Define a finite scale:

```css
:root {
  --font-sans: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  2rem;
  --text-4xl:  2.75rem;
  --text-5xl:  3.5rem;   /* hero h1 only */

  --leading-tight:   1.15;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;
}
```

Drop weight 800 (marketing currently loads it; unused after this phase). Keep 400, 500, 600, 700.

**Spacing (4px base)**

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-8:  48px;
  --space-10: 64px;
  --space-12: 96px;
}
```

**Radius**

Collapse to three. Most cards/buttons use `--radius-md`.

```css
:root {
  --radius-sm: 6px;   /* chips, inline badges */
  --radius-md: 10px;  /* default — cards, inputs, buttons */
  --radius-lg: 20px;  /* hero panels, modals */
}
```

**Shadow**

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```

**Motion**

Keep existing:

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}
```

### Decorative noise removal

**Marketing (`index.html` + `marketing.css`):**

- Remove `.orb-1`, `.orb-2`, `.orb-3` from hero and final CTA (keep one very subtle static radial gradient as hero backdrop)
- Remove `.helix` element and its animation
- Remove `.grad-text` as a decorative gradient — replace with solid `var(--accent)`. The class can stay for one semantic use only (the hero "should have a research library" phrase) as a one-off exception; everywhere else, solid accent.
- Keep `.strikethrough` on "marketing team" (core to the joke)
- Noise cards (`.nc-1` / `.nc-2` / `.nc-3`) stay but lose hover animations and use `--shadow-sm`
- Drop font-weight 800 references

**Library (`web/app.css` + `web/features.css`):**

- Remove any hover scale/translate animations on cards (keep color/border transitions)
- Audit chip backgrounds — they currently use eight different rgba tints, collapse to one pattern: `color-mix(in srgb, var(--ev-*) 14%, transparent)`
- Remove gradient backgrounds from panels that have them (feature blocks, promos)

### Light theme

`web/app.css` already has a `[data-theme="light"]` override. Move the light-theme token overrides into `design-tokens.css` so marketing inherits the same mapping. Marketing currently has no theme toggle — that stays true for this phase, but `prefers-color-scheme: light` should respect the token map so users in light OS mode see a coherent marketing page.

Light-theme overrides (unchanged from current):

```css
[data-theme="light"],
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --bg: #f4f6f9;
    --bg-elevated: #ffffff;
    --surface: #ffffff;
    --surface-raised: #ffffff;
    --border: #d7dde6;
    --border-strong: #b8c2d0;
    --text: #1a2230;
    --text-muted: #56657a;
    --text-dim: #8594a8;
    --accent-soft: rgba(74, 142, 194, 0.12);
  }
}
```

Note: the `[data-theme="dark"]` guard prevents the prefers-color-scheme light override from fighting an explicit user choice in the library.

### JS integration

`web/src/app.js` `EVIDENCE_TIERS` currently hard-codes hex colors. Change the color lookup to read from CSS custom properties:

```js
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const EVIDENCE_TIERS = [
  { key: "regulatory_label", tier: "approved",  cssVar: "--ev-approved", label: "FDA approved",        rank: 0 },
  { key: "pivotal_trials",   tier: "pivotal",   cssVar: "--ev-strong",   label: "Strong human trials", rank: 1 },
  { key: "phase1_human",     tier: "phase1",    cssVar: "--ev-early",    label: "Early human studies", rank: 2 },
  { key: "preclinical_animal", tier: "preclinical", cssVar: "--ev-animal", label: "Animal studies only", rank: 3 },
  { key: "compounded_practice", tier: "practice", cssVar: "--ev-practice", label: "Clinic practice",  rank: 4 },
  { key: "unknown_identity",   tier: "unknown",   cssVar: "--ev-unknown", label: "Unknown",           rank: 5 },
];

function tierColor(tier) { return cssVar(tier.cssVar); }
```

Any existing consumer of `tier.color` either switches to `tierColor(tier)` at call site or keeps a `color` getter on the object for compatibility. Pick the getter approach to minimize churn — consumers stay unchanged.

## Testing

**Automated:**

- All existing Playwright specs in `tests/` must pass unchanged: `accessibility`, `app-loads`, `compare-feature`, `data-integrity`, `edge-cases`, `ios-*`, `navigation-state`, `offline-pwa`
- Add no new tests in this phase — behavior is unchanged

**Manual visual pass (record in work log):**

1. Marketing `index.html` in dark OS — no orbs, no helix, fonts/colors read calmer
2. Marketing in light OS — readable, same token map applied
3. Library `/web/` in dark theme — cards look calmer, chips unified
4. Library in light theme (toggle) — unchanged behavior
5. Tab from `index.html` to `/web/` — typography, palette, spacing feel continuous
6. Glossary and evidence guide — tokens match, no visual regression
7. Hover over cards — no scale/translate, only color/border transitions
8. Evidence tier badges — colors match across list and detail

**Regression guard:**

- Before starting: `npx playwright test` — capture baseline result
- After each commit in this phase: re-run Playwright; any new failure blocks

## Acceptance criteria

1. `design-tokens.css` exists at repo root with every canonical token defined
2. `marketing.css`, `web/app.css`, `web/features.css` have no duplicate `:root` token definitions — they read from the shared file
3. `glossary.html` and `evidence-guide.html` import `design-tokens.css` and render without visual regression
4. Orbs, helix, and decorative gradient animations are removed from marketing
5. `web/src/app.js` `EVIDENCE_TIERS` uses CSS custom properties for color
6. All hard-coded hex colors and ad-hoc spacing values in the three CSS files are either replaced with tokens or flagged with a `/* exception: <reason> */` comment
7. All existing Playwright tests pass
8. Manual visual pass above documented in work log

## Rollout

Single PR to `main` targeting the `redesign-calm-library` branch. Squash merge acceptable. No feature flag — visual changes are the point.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Breaking evidence tier colors because JS still reads old `color` field | Keep `color` getter on tier object for compatibility; audit call sites before removing |
| Light-theme regressions when moving `[data-theme="light"]` overrides | Manual pass on every surface in light theme before merge |
| Playwright tests depend on specific color values or decorative DOM nodes | Run full suite before first commit; adjust selectors only if a removed element is genuinely orphaned — otherwise treat as regression |
| Consumers of `--accent-bright` break when we drop it | Grep all three CSS files first; replace usages with `--accent` before removing the token |

## Out of scope (handed to later phases)

- Phase 2: consolidate Browse/Compare/Stats tabs into one surface with a command bar
- Phase 3: two-column detail view with sticky sources panel
- Phase 4: compare-as-drawer triggered from multi-select in Browse
- Phase 5: marketing simplification (cut FAQ in half, fewer sections, same voice)
- Phase 6: `Cmd+K` command palette exposing notes, bookmarks, share, recents, keyboard help; move Stats behind palette

Each later phase assumes the shared tokens from this phase exist.
