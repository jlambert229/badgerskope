# Design System Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify CSS token systems across marketing, library, glossary, and evidence-guide surfaces; remove decorative noise; make BadgerSkope feel like one coherent product.

**Architecture:** Create a single shared `design-tokens.css` at repo root. All surfaces link it. Each surface's own CSS keeps only component/layout rules, not token definitions. Evidence-tier colors become CSS custom properties consumed by JS at runtime.

**Tech Stack:** Vanilla HTML/CSS/JS (no build). Playwright for regression. IBM Plex typography.

**Spec:** `docs/superpowers/specs/2026-04-23-design-system-pass-design.md`
**Work log:** `logs/wl-redesign-calm-library.md`
**Branch:** `redesign-calm-library`

---

## File Structure

**Create:**
- `design-tokens.css` (repo root) — canonical color, typography, spacing, radius, shadow, motion tokens + light-theme override

**Modify:**
- `index.html` — link shared tokens, remove `.hero-bg` decorative markup in hero + final CTA
- `marketing.css` — strip local `:root` tokens, remove `.orb*` / `.helix` / `.grad-text` rules, replace `--accent-bright` with `--accent`
- `web/index.html` — link shared tokens
- `web/app.css` — strip local `:root` tokens
- `web/app.js` — refactor `EVIDENCE_TIERS` to read colors from CSS custom properties at runtime
- `web/features.css` — audit ad-hoc colors / hover animations, unify chip backgrounds
- `glossary.html` — link shared tokens, trim inline `<style>` duplication
- `evidence-guide.html` — link shared tokens, trim inline `<style>` duplication
- `docs/superpowers/specs/2026-04-23-design-system-pass-design.md` — fix spec path typo (`web/src/app.js` → `web/app.js`)

**No new tests added.** Existing Playwright suite under `tests/` is the regression guard.

---

## Task 1: Baseline — capture current Playwright result

**Purpose:** Snapshot the test suite before any changes so regressions are obvious later.

**Files:**
- Modify: `logs/wl-redesign-calm-library.md`

- [ ] **Step 1: Verify branch and clean tree**

```bash
cd /home/owner/Repos/badgerskope
git rev-parse --abbrev-ref HEAD
git status
```

Expected: branch is `redesign-calm-library`, working tree clean.

- [ ] **Step 2: Start local server and run full Playwright suite**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright install chromium webkit  # ensure browsers present
npx playwright test 2>&1 | tee /tmp/playwright-baseline.txt
kill $SERVER_PID
```

Expected: tests either all pass or have a stable failure pattern. Record the pass/fail counts.

- [ ] **Step 3: Append baseline result to work log**

Add a `## Baseline (Task 1)` section to `logs/wl-redesign-calm-library.md` containing the summary line from `/tmp/playwright-baseline.txt` (e.g. `42 passed (3.1m)`). If any tests fail at baseline, list which ones — those are pre-existing failures, not regressions.

- [ ] **Step 4: Commit**

```bash
git add logs/wl-redesign-calm-library.md
git commit -m "chore: record playwright baseline for design system pass"
```

---

## Task 2: Fix spec path typo

**Purpose:** Spec references `web/src/app.js` but the actual file is `web/app.js`. Fix before engineers rely on it.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-23-design-system-pass-design.md`

- [ ] **Step 1: Fix the two mentions**

In `docs/superpowers/specs/2026-04-23-design-system-pass-design.md`, replace every occurrence of `web/src/app.js` with `web/app.js`. Also replace `web/src/constants.js` with `web/app.js` (the `EVIDENCE_TIERS` definition lives in `web/app.js` lines 26-33, not a separate constants file).

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-23-design-system-pass-design.md
git commit -m "docs: fix spec path references (web/src/app.js -> web/app.js)"
```

---

## Task 3: Create `design-tokens.css`

**Purpose:** Single source of truth for every design token. No surface re-declares these.

**Files:**
- Create: `design-tokens.css`

- [ ] **Step 1: Write the file**

Create `design-tokens.css` at the repo root with the exact content below:

```css
/* ============================================================
   BADGERSKOPE — Design tokens (shared across all surfaces)
   Dark theme default; light theme via [data-theme="light"] or
   prefers-color-scheme: light (unless [data-theme="dark"] set).
   ============================================================ */

:root {
  /* ---- Surface ---- */
  --bg:             #0b0e13;
  --bg-elevated:    #111720;
  --surface:        #161d28;
  --surface-raised: #1c2633;
  --border:         #253040;
  --border-strong:  #334257;

  /* ---- Text ---- */
  --text:       #dce3eb;
  --text-muted: #8a9bb0;
  --text-dim:   #5f6f85;

  /* ---- Accent ---- */
  --accent:      #4a8ec2;
  --accent-soft: rgba(74, 142, 194, 0.14);

  /* ---- Evidence tiers (semantic, consumed by JS) ---- */
  --ev-approved: #22c55e;
  --ev-strong:   #14b8a6;
  --ev-early:    #f59e0b;
  --ev-animal:   #f97316;
  --ev-practice: #9ca3af;
  --ev-unknown:  #6b7280;

  /* ---- Status (non-evidence) ---- */
  --success: #4abfa0;
  --warning: #d4952a;
  --danger:  #c0392b;

  /* ---- Typography ---- */
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
  --text-5xl:  3.5rem;

  --leading-tight:   1.15;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;

  /* ---- Spacing (4px base) ---- */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-8:  48px;
  --space-10: 64px;
  --space-12: 96px;

  /* ---- Radius ---- */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 20px;

  /* ---- Shadow ---- */
  --shadow-sm: 0 1px 2px  rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.4);

  /* ---- Motion ---- */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}

/* ---- Light theme: explicit opt-in OR system preference when not explicitly dark ---- */
[data-theme="light"],
:root:not([data-theme="dark"]) {
  /* No-op; overridden below when appropriate */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --bg:             #f4f6f9;
    --bg-elevated:    #ffffff;
    --surface:        #ffffff;
    --surface-raised: #ffffff;
    --border:         #d7dde6;
    --border-strong:  #b8c2d0;
    --text:           #1a2230;
    --text-muted:     #56657a;
    --text-dim:       #8594a8;
    --accent-soft:    rgba(74, 142, 194, 0.12);
    --shadow-sm: 0 1px 2px  rgba(15, 30, 55, 0.06);
    --shadow-md: 0 4px 12px rgba(15, 30, 55, 0.10);
    --shadow-lg: 0 12px 40px rgba(15, 30, 55, 0.18);
  }
}

[data-theme="light"] {
  --bg:             #f4f6f9;
  --bg-elevated:    #ffffff;
  --surface:        #ffffff;
  --surface-raised: #ffffff;
  --border:         #d7dde6;
  --border-strong:  #b8c2d0;
  --text:           #1a2230;
  --text-muted:     #56657a;
  --text-dim:       #8594a8;
  --accent-soft:    rgba(74, 142, 194, 0.12);
  --shadow-sm: 0 1px 2px  rgba(15, 30, 55, 0.06);
  --shadow-md: 0 4px 12px rgba(15, 30, 55, 0.10);
  --shadow-lg: 0 12px 40px rgba(15, 30, 55, 0.18);
}
```

- [ ] **Step 2: Commit**

```bash
git add design-tokens.css
git commit -m "feat: add shared design-tokens.css with canonical tokens"
```

---

## Task 4: Migrate `marketing.css` + `index.html` to shared tokens

**Purpose:** Remove the duplicate `:root` block from marketing; wire the new stylesheet; collapse `--accent-bright` references to `--accent`.

**Files:**
- Modify: `index.html` (add link to `design-tokens.css` before `marketing.css`)
- Modify: `marketing.css` (delete local `:root` block, replace `--accent-bright` with `--accent`, drop unused tokens)

- [ ] **Step 1: Add `design-tokens.css` to `index.html`**

In `index.html`, line 13 currently reads:

```html
  <link rel="stylesheet" href="./marketing.css">
```

Replace with:

```html
  <link rel="stylesheet" href="./design-tokens.css">
  <link rel="stylesheet" href="./marketing.css">
```

- [ ] **Step 2: Strip local `:root` block from `marketing.css`**

Open `marketing.css`. Delete the entire `:root { ... }` block (approximately lines 10-37, covering `/* ---------- Custom Properties ---------- */` through the closing `}`).

Do NOT delete the `Reset & Base` and everything that follows — only the `:root` declarations and their leading comment.

- [ ] **Step 3: Replace `--accent-bright` with `--accent`**

Find every `var(--accent-bright)` in `marketing.css`. Replace each with `var(--accent)`. Use:

```bash
grep -n "accent-bright" marketing.css
```

Expected: zero matches afterward.

- [ ] **Step 4: Audit radius usage**

The old marketing tokens had `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`, `--radius-xl: 20px` (four sizes). The shared file has only `-sm`, `-md`, `-lg`. Find any `var(--radius-xl)` references in `marketing.css` and replace with `var(--radius-lg)`.

```bash
grep -n "radius-xl" marketing.css
```

Expected: zero matches afterward.

- [ ] **Step 5: Load check**

Serve and load:

```bash
npm run web &
SERVER_PID=$!
sleep 2
curl -s http://localhost:5173/design-tokens.css | head -5
curl -s http://localhost:5173/ | grep -c "design-tokens.css"
kill $SERVER_PID
```

Expected: tokens CSS loads; `index.html` references it.

- [ ] **Step 6: Run Playwright marketing specs**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test tests/app-loads.spec.js tests/accessibility.spec.js 2>&1 | tail -20
kill $SERVER_PID
```

Expected: same result as baseline.

- [ ] **Step 7: Commit**

```bash
git add index.html marketing.css
git commit -m "refactor: wire marketing to shared design-tokens.css"
```

---

## Task 5: Remove decorative noise from marketing

**Purpose:** Kill orbs, helix, and gradient-as-decoration so the marketing page reads calmer.

**Files:**
- Modify: `index.html` (remove `.hero-bg` blocks and their children)
- Modify: `marketing.css` (delete `.orb*`, `.helix`, `@keyframes orbFloat`, gradient on `.grad-text`)

- [ ] **Step 1: Remove decorative DOM from `index.html`**

Find lines 41-46 in `index.html`:

```html
      <div class="hero-bg" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="helix"></div>
      </div>
```

Delete the entire block.

Find lines 237-241 (the final CTA section):

```html
      <div class="hero-bg" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
```

Delete that block too.

- [ ] **Step 2: Remove decorative CSS from `marketing.css`**

Delete these rule blocks from `marketing.css`:

1. `/* Ambient orbs */` header comment and everything under it through the end of `.orb-3 { ... }` (approximately lines 389-417 — covers `.orb`, `.orb-1`, `.orb-2`, `.orb-3`).
2. `@keyframes orbFloat { ... }` block (approximately lines 419+). Delete the entire keyframes definition.
3. The `.helix` rule block (search for `.helix {` and delete the full rule).
4. The `.hero-bg` rule block (search for `.hero-bg {` and delete the full rule).

- [ ] **Step 3: Simplify `.grad-text` in `marketing.css`**

Find the `.grad-text` rule (around line 448). It currently uses `background: linear-gradient(...)` + `background-clip: text`. Replace the entire rule body with:

```css
.grad-text {
  color: var(--accent);
}
```

- [ ] **Step 4: Verify no orphaned references**

```bash
grep -n "orb\|helix\|hero-bg" index.html
grep -n "orbFloat\|\.orb\b\|\.helix\b\|\.hero-bg\b" marketing.css
```

Expected: zero matches in both files (the comment reference to "DNA helix" in the palette comment is fine; it is not a selector).

- [ ] **Step 5: Visual spot check**

```bash
npm run web &
SERVER_PID=$!
sleep 2
# Open http://localhost:5173/ in a browser. Verify:
# - No animated orbs behind the hero
# - No rotating helix
# - Hero still has the headline, "Explore the Library" CTA, proof row
# - "answers" in FAQ header and "read something real" in CTA are solid accent color, not gradient
kill $SERVER_PID
```

Record observations in the work log (`logs/wl-redesign-calm-library.md`) under a new `## Task 5 visual pass` section.

- [ ] **Step 6: Run full Playwright suite**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test 2>&1 | tail -20
kill $SERVER_PID
```

Expected: same pass/fail pattern as baseline. If a test that previously passed now fails because it asserted on `.orb` or `.helix` DOM existence, update the test to remove that assertion — those elements are intentionally gone. Otherwise, any new failure is a regression to investigate before committing.

- [ ] **Step 7: Commit**

```bash
git add index.html marketing.css logs/wl-redesign-calm-library.md
git commit -m "refactor: remove decorative noise from marketing (orbs, helix, grad-text)"
```

---

## Task 6: Migrate `web/app.css` + `web/index.html` to shared tokens

**Purpose:** Library inherits tokens from the shared file; local `:root` block deleted.

**Files:**
- Modify: `web/index.html` (add link to `/design-tokens.css` before `app.css`)
- Modify: `web/app.css` (delete local `:root` block, remove `[data-theme="light"]` overrides that are now in the shared file)

- [ ] **Step 1: Add `design-tokens.css` to `web/index.html`**

In `web/index.html`, line 28 currently reads:

```html
    <link rel="stylesheet" href="./app.css" />
```

Replace with:

```html
    <link rel="stylesheet" href="/design-tokens.css" />
    <link rel="stylesheet" href="./app.css" />
```

Note the leading `/` — the tokens file is served from repo root by the `serve` dev server; library pages live under `/web/` and need the absolute path.

- [ ] **Step 2: Delete local `:root` block from `web/app.css`**

Open `web/app.css`. The `:root` block begins near line 11. Delete the entire block from the opening `:root {` to its closing `}` (inclusive, along with its leading section comment).

- [ ] **Step 3: Delete `[data-theme="light"]` block from `web/app.css` (now in shared file)**

Search for `[data-theme="light"]` in `web/app.css`:

```bash
grep -n "data-theme=\"light\"" web/app.css
```

For each match, if the rule only overrides color tokens (`--bg`, `--text`, etc.), delete the entire rule. If it overrides non-token properties (e.g. specific component styles), keep those but delete the token-override lines only.

- [ ] **Step 4: Audit dropped tokens**

The old library `:root` included tokens that the shared file renames or drops:

- `--radius` (no size suffix) → replace `var(--radius)` with `var(--radius-md)` throughout `web/app.css`
- `--accent-bright` → replace with `var(--accent)`
- `--cyan` (kept locally if used; check) → if referenced, keep a local alias `--cyan: #5cc8e4;` at top of `web/app.css` with a comment `/* local alias — not a shared token */`
- `--green` / `--orange` → if referenced, similarly keep as local aliases or retire

```bash
grep -n "var(--radius)\|var(--accent-bright)\|var(--cyan)\|var(--green)\|var(--orange)" web/app.css | head -30
```

For each match, apply the rule above.

- [ ] **Step 5: Load check**

```bash
npm run web &
SERVER_PID=$!
sleep 2
curl -s http://localhost:5173/web/ | grep -c "design-tokens.css"
kill $SERVER_PID
```

Expected: at least 1.

- [ ] **Step 6: Run library Playwright specs**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test tests/app-loads.spec.js tests/navigation-state.spec.js tests/compare-feature.spec.js 2>&1 | tail -20
kill $SERVER_PID
```

Expected: same result as baseline.

- [ ] **Step 7: Commit**

```bash
git add web/index.html web/app.css
git commit -m "refactor: wire library app.css to shared design-tokens.css"
```

---

## Task 7: Unify chip backgrounds and remove hover animations in `web/features.css`

**Purpose:** Collapse ad-hoc rgba chip tints to a single `color-mix` pattern; remove hover scale/translate transitions that add visual busyness.

**Files:**
- Modify: `web/features.css`

- [ ] **Step 1: Inventory ad-hoc hex and rgba values**

```bash
grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(" web/features.css | head -50
```

For each hit, decide:
- If it can be expressed as `var(--ev-*)`, `var(--accent-soft)`, or another token, replace it.
- If it's a color-mix pattern specific to a component and already uses tokens, leave it.
- If it's a genuinely unique color (logo, illustration), leave with a `/* exception: <reason> */` comment.

- [ ] **Step 2: Unify evidence-tier chip backgrounds**

Any chip style with an rgba color matching a tier's hex (e.g. `rgba(34, 197, 94, 0.15)` for approved-green) should use:

```css
background-color: color-mix(in srgb, var(--ev-approved) 14%, transparent);
```

Apply the same `color-mix` pattern for every tier chip in `web/features.css`.

- [ ] **Step 3: Remove hover scale/translate on cards**

Search for hover transforms on card-like selectors:

```bash
grep -nE "transform:\s*(scale|translate)" web/features.css web/app.css
```

For each hit inside a `:hover` rule on a `.card`, `.entry-card`, `.stat-card`, or similar, delete the `transform` line. Keep color/border/shadow transitions.

- [ ] **Step 4: Visual spot check**

```bash
npm run web &
SERVER_PID=$!
sleep 2
# Open http://localhost:5173/web/ in a browser. Verify:
# - Cards do not scale or lift on hover; border/shadow may still shift
# - Evidence chips on cards have consistent tint strength across tiers
# - Stats tab still renders
kill $SERVER_PID
```

Record observations in the work log.

- [ ] **Step 5: Run full Playwright suite**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test 2>&1 | tail -20
kill $SERVER_PID
```

Expected: baseline pass/fail pattern holds.

- [ ] **Step 6: Commit**

```bash
git add web/features.css web/app.css logs/wl-redesign-calm-library.md
git commit -m "refactor: unify chip tints, drop hover scale animations in library"
```

---

## Task 8: Refactor `EVIDENCE_TIERS` in `web/app.js` to read colors from CSS

**Purpose:** Make CSS the single source of truth for tier colors. `EVIDENCE_TIERS[].color` becomes a getter that reads the CSS custom property at runtime.

**Files:**
- Modify: `web/app.js` (lines 26-33, plus helper addition)

- [ ] **Step 1: Add CSS var helper and refactor `EVIDENCE_TIERS`**

In `web/app.js`, locate the `EVIDENCE_TIERS` definition (lines 26-33). Replace the definition and the preceding constants block with:

```js
function cssVar(name) {
  if (typeof window === "undefined" || !window.getComputedStyle) return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const EVIDENCE_TIERS = [
  { key: "regulatory_label",    tier: "approved",    cssVar: "--ev-approved", label: "FDA approved",        rank: 0 },
  { key: "pivotal_trials",      tier: "pivotal",     cssVar: "--ev-strong",   label: "Strong human trials", rank: 1 },
  { key: "phase1_human",        tier: "phase1",      cssVar: "--ev-early",    label: "Early human studies", rank: 2 },
  { key: "preclinical_animal",  tier: "preclinical", cssVar: "--ev-animal",   label: "Animal studies only", rank: 3 },
  { key: "compounded_practice", tier: "practice",    cssVar: "--ev-practice", label: "Clinic practice",     rank: 4 },
  { key: "unknown_identity",    tier: "unknown",     cssVar: "--ev-unknown",  label: "Unknown",             rank: 5 },
].map((t) => Object.defineProperty(t, "color", {
  get() { return cssVar(this.cssVar); },
  enumerable: true,
}));
```

The `color` getter means every existing `tier.color` call site (lines 474, 528, 734, 741 and others) continues to work unchanged.

- [ ] **Step 2: Load check**

```bash
npm run web &
SERVER_PID=$!
sleep 2
# Open http://localhost:5173/web/ in a browser. In DevTools console:
#   EVIDENCE_TIERS[0].color
# Expected: a non-empty string matching the approved tier color, e.g. "#22c55e"
kill $SERVER_PID
```

Record the actual console output in the work log.

- [ ] **Step 3: Run full Playwright suite**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test 2>&1 | tail -20
kill $SERVER_PID
```

Expected: baseline pass/fail pattern holds. Evidence chips render with correct colors on cards and detail.

- [ ] **Step 4: Commit**

```bash
git add web/app.js logs/wl-redesign-calm-library.md
git commit -m "refactor: EVIDENCE_TIERS reads colors from CSS custom properties"
```

---

## Task 9: Wire `glossary.html` and `evidence-guide.html` to shared tokens

**Purpose:** These pages currently have inline `<style>` blocks with their own token copies. Link the shared file and strip duplicates.

**Files:**
- Modify: `glossary.html`
- Modify: `evidence-guide.html`

- [ ] **Step 1: Add shared stylesheet link to `glossary.html`**

Find line 13 `<style>` in `glossary.html`. Immediately above the `<style>` tag, insert:

```html
<link rel="stylesheet" href="/design-tokens.css" />
```

- [ ] **Step 2: Strip duplicate token definitions from `glossary.html` inline styles**

In the `<style>` block of `glossary.html`, locate the `:root { ... }` declaration. Delete any custom property declarations that match names already defined in `design-tokens.css` (colors, typography scale, spacing, radius, shadow, motion). Keep any page-specific properties that are unique to glossary and not in the shared file.

- [ ] **Step 3: Apply the same to `evidence-guide.html`**

Repeat steps 1-2 for `evidence-guide.html`.

- [ ] **Step 4: Visual spot check**

```bash
npm run web &
SERVER_PID=$!
sleep 2
# Open in browser, verify unchanged appearance:
#   http://localhost:5173/glossary.html
#   http://localhost:5173/evidence-guide.html
kill $SERVER_PID
```

Record observations in the work log.

- [ ] **Step 5: Run full Playwright suite**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test 2>&1 | tail -20
kill $SERVER_PID
```

Expected: baseline pass/fail pattern holds.

- [ ] **Step 6: Commit**

```bash
git add glossary.html evidence-guide.html logs/wl-redesign-calm-library.md
git commit -m "refactor: wire glossary and evidence-guide to shared design-tokens.css"
```

---

## Task 10: Final regression + cross-surface visual pass

**Purpose:** Confirm the product feels coherent across all surfaces and the test suite still passes.

**Files:**
- Modify: `logs/wl-redesign-calm-library.md`

- [ ] **Step 1: Full Playwright run**

```bash
npm run web &
SERVER_PID=$!
sleep 2
npx playwright test 2>&1 | tee /tmp/playwright-final.txt
kill $SERVER_PID
tail -5 /tmp/playwright-final.txt
```

Expected: same pass count as baseline (from Task 1). Any regression is a stop-ship.

- [ ] **Step 2: Cross-surface manual pass (checklist)**

Open each surface in a browser and verify. Record yes/no for each in the work log.

Dark OS:
1. `http://localhost:5173/` — no orbs, no helix, hero calmer, "answers" and "read something real" are solid accent color
2. `http://localhost:5173/web/` — cards do not scale on hover; chip tints consistent across tiers
3. Click a card → detail modal opens; evidence tier color matches card chip
4. Compare tab works; Stats tab works
5. `http://localhost:5173/glossary.html` — renders, fonts/colors continuous with library
6. `http://localhost:5173/evidence-guide.html` — same
7. Navigate from marketing to library and back — typography and palette feel continuous

Light OS (temporarily toggle system pref, or set `[data-theme="light"]` on library):
1. Marketing — readable, no dark remnants
2. Library — existing behavior preserved (theme toggle still works)

- [ ] **Step 3: Unused-token audit**

Extract token names from `design-tokens.css` and count usages:

```bash
# Extract defined token names
grep -oE "^\s*--[a-z0-9-]+" design-tokens.css | tr -d ' ' | sort -u > /tmp/tokens-defined.txt
wc -l /tmp/tokens-defined.txt

# For each token, count references across CSS/HTML/JS
while read -r name; do
  count=$(grep -rh "var($name)" --include="*.css" --include="*.html" --include="*.js" . 2>/dev/null | wc -l)
  printf "%s\t%d\n" "$name" "$count"
done < /tmp/tokens-defined.txt | sort -k2 -n
```

Any token with 0 uses: either adopt it in this phase or delete it from `design-tokens.css`. Paste the audit output into the work log.

- [ ] **Step 4: Append final summary to work log**

In `logs/wl-redesign-calm-library.md`, add:

```markdown
## Phase 1 complete — 2026-04-23

- Shared `design-tokens.css` in place
- Marketing, library, glossary, evidence-guide all consume it
- Decorative noise removed from marketing
- Evidence-tier colors sourced from CSS
- Playwright: <N passed / N failed> (same as baseline)
- Cross-surface visual pass: all checks yes

Next: phase 2 — library shell redesign (command bar, consolidated IA).
```

- [ ] **Step 5: Commit and push**

```bash
git add logs/wl-redesign-calm-library.md
git commit -m "chore: phase 1 complete — shared tokens across all surfaces"
git push -u origin redesign-calm-library
```

- [ ] **Step 6: Open PR (ask user first)**

Do not open the PR without user confirmation. Report status and ask whether to open a PR to `main` via `gh pr create`.

---

## Self-Review Notes

- Spec coverage: every acceptance criterion in the spec maps to at least one task (shared tokens → Task 3; marketing migration → Task 4; decorative removal → Task 5; library migration → Task 6; chip unification + hover removal → Task 7; JS refactor → Task 8; glossary/evidence-guide → Task 9; regression → Task 10).
- No placeholders: each step has concrete code, file paths, or commands.
- Path correction: spec mentions `web/src/app.js` — Task 2 fixes that. The actual file is `web/app.js` and is used everywhere in this plan.
- Commit cadence: ten atomic commits, each independently revertible.
- TDD caveat: this is a CSS/design refactor with no new behavior to test. TDD shape is replaced with "change → run existing suite → manual visual pass → commit" per task. The Playwright baseline captured in Task 1 is the regression oracle.
