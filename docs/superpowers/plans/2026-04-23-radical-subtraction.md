# Radical Subtraction Implementation Plan (Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the detail modal from 14 stacked sections to 6 zones, remove the duplicate "+ Compare" card control, and simplify the browse toolbar so first-visit sees only search + evidence + a Refine drawer + goal pills.

**Architecture:** Rewrite `renderDetailHtml()` in `web/app.js` around a 6-zone layout (disclaimer strip, hero, facts strip, body, depth accordion, sticky footer). Remove `.card__compare-btn` from `renderCard()`. Promote the Evidence filter out of the Refine drawer in `web/index.html`. Gate the dynamic goal bar in `web/features.js` to hide itself once any filter is active.

**Tech Stack:** Vanilla HTML/CSS/JS (no build). Playwright for regression. Phase 1 shared tokens already in place.

**Spec:** `docs/superpowers/specs/2026-04-23-radical-subtraction-design.md`
**Work log:** `logs/wl-redesign-radical-subtraction.md`
**Branch:** `redesign-radical-subtraction` (off `redesign-calm-library`)

---

## File Structure

**Modify:**
- `web/app.js` — rewrite `renderDetailHtml()` (lines 685-902); strip `.card__compare-btn` out of `renderCard()` (starting line 458); remove the inline `transform: scale(0.98)` click animation in the card factory; extend `applyHashOnLoad()` / `readHashParams()` to route `tab=stats&category=<key>` into the Stats tab with a pre-applied category filter
- `web/app.css` — new styles for `.detail__disclaimer-strip`, `.detail__hero`, `.detail__facts`, `.detail__body`, `.detail__body-subhead`, `.detail__body-more`, `.detail__callout--warn`, `.detail__depth`, `.detail__actions` (sticky); delete `.card__compare-btn { ... }`; add `padding-bottom` to `.modal__panel` body; print styles
- `web/features.css` — adjust `.goal-bar` to be hideable; drop hover scales left behind on buttons if any were missed
- `web/features.js` — update `addGoalFilters()` to hide the goal bar once any `<select>` filter gets a non-empty value (and re-show it on reset)
- `web/index.html` — promote `#evidence-filter` into the always-visible top toolbar zone; leave Category, Compound, Known-for, Sort, Group By inside `#advanced-filters`; rename the "Filters" button label to "Refine" for clarity
- `tests/` — update selectors in any spec that references removed DOM (`.card__compare-btn`, `.detail__cats`, `.detail__hero-bar`, `.detail__evidence-block`, `.ev-compare` inside detail, the heavy per-section `.detail__help` helpers, the bottom `.detail__disclaimer`)

**Do not create new files.** Stay within the existing flat module structure.

**No database changes.** `peptide-info-database.json` schema is unchanged.

---

## Task 1: Baseline capture

**Purpose:** Record Playwright pass count before any changes so regressions are obvious later.

**Files:**
- Modify: `logs/wl-redesign-radical-subtraction.md`

- [ ] **Step 1: Verify branch, clean any leftover serve processes, run full Chromium suite**

```bash
cd /home/owner/Repos/badgerskope
git rev-parse --abbrev-ref HEAD
# Expected: redesign-radical-subtraction

pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 2
npx playwright test --project=chrome 2>&1 | tee /tmp/phase2-baseline.txt
```

Capture the summary line (e.g. `217 passed (3m 21s)`). If the count is lower than 217, those are the pre-existing flaky tests (compare-feature timeouts etc.) that Phase 1 already accepted as environmental.

- [ ] **Step 2: Append baseline to the work log**

Add to `logs/wl-redesign-radical-subtraction.md`:

```markdown

## Baseline (Task 1)

**Date:** 2026-04-23
**Command:** `npx playwright test --project=chrome`
**Result:** <paste summary line from /tmp/phase2-baseline.txt>

Pre-existing flaky tests noted in Phase 1 work log (compare-feature timeouts, iOS-viewport assertions) are not regressions.
```

- [ ] **Step 3: Commit**

```bash
git add logs/wl-redesign-radical-subtraction.md
git commit -m "chore: record playwright baseline for phase 2"
```

---

## Task 2: Rewrite `renderDetailHtml()` — six-zone layout

**Purpose:** Replace the 14-section stack with disclaimer strip + hero + facts strip + body + depth accordion + sticky footer. This is the biggest atomic change in the plan.

**Files:**
- Modify: `web/app.js` (replace function at lines 685-902)

- [ ] **Step 1: Replace `renderDetailHtml` body**

Open `web/app.js`. Find `function renderDetailHtml(entry) {` at line 685. Replace the entire function (through the closing `}` before `function syncDetailNav()`) with:

```js
function renderDetailHtml(entry) {
  const catIndex = db.meta.wellnessCategoryIndex || {};
  const kfIdx = db.meta.knownForThemeIndex || {};
  const title = entry.catalog?.title || "Entry";
  const id = getEntryId(entry);
  const isBookmarked = bookmarks.has(id);
  const tier = highestTier(entry);
  const dq = entry.distinctiveQuality;

  // ----- facts strip pieces -----
  const factsParts = [];
  if (entry.compoundType) {
    factsParts.push(
      `<span class="detail__fact" title="${escapeHtml(compoundTypeExplainer(entry.compoundType))}">${escapeHtml(formatCompoundType(entry.compoundType))}</span>`
    );
  }
  const primaryCat = (entry.wellnessCategories || [])[0];
  if (primaryCat) {
    const w = wellnessLabel(catIndex, primaryCat);
    factsParts.push(`<span class="detail__fact" title="${escapeHtml(w.full)}">${escapeHtml(w.short)}</span>`);
  }
  const fdaStatus =
    tier.tier === "approved" ? "FDA approved" :
    tier.tier === "pivotal" ? "In clinical trials" :
    tier.tier === "phase1" ? "Early research" :
    tier.tier === "preclinical" ? "Animal studies" :
    tier.tier === "practice" ? "Clinic use" : "Status unknown";
  factsParts.push(`<span class="detail__fact">${escapeHtml(fdaStatus)}</span>`);
  if (entry.dopingStatus?.prohibited) {
    factsParts.push(`<span class="detail__fact detail__fact--warn">WADA-prohibited</span>`);
  }
  const srcCount = (entry.sources || []).length;
  factsParts.push(`<span class="detail__fact">${srcCount} source${srcCount !== 1 ? "s" : ""}</span>`);
  if (primaryCat) {
    factsParts.push(
      `<a class="detail__compare-link" href="#tab=stats&category=${encodeURIComponent(primaryCat)}">See how this compares →</a>`
    );
  }

  // ----- body pieces -----
  const benefitsList = entry.reportedBenefits || [];
  const visibleBenefits = benefitsList.slice(0, 5);
  const moreBenefits = benefitsList.length - visibleBenefits.length;
  const benefitsHtml = visibleBenefits.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

  // ----- depth accordion pieces -----
  const synergy = renderSynergyPills(entry.synergisticWith);
  const doseRows = (entry.doseGuidelines || [])
    .map((d) => {
      const ev = formatEvidenceBasis(d.evidenceBasis);
      return `<tr>
        <td>${escapeHtml(d.indicationOrContext || "")}</td>
        <td><span class="evidence-pill" style="background:${ev.color}" title="${escapeHtml(ev.tip)}">${escapeHtml(ev.label)}</span></td>
        <td>${escapeHtml(d.minimumEffectiveDoseNotes || "")}</td>
      </tr>`;
    })
    .join("");
  const dqThemes = (dq?.themes || [])
    .map((k) => {
      const tip = kfIdx[k] || "";
      const friendlyTheme = GROUP_THEME_LABELS[k] || k.replace(/_/g, " ");
      return `<span class="detail__badge" title="${escapeHtml(tip)}">${escapeHtml(friendlyTheme)}</span>`;
    })
    .join("");
  const sources = (entry.sources || [])
    .map(
      (s) =>
        `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label || s.url)}</a></li>`
    )
    .join("");

  const apps = (entry.potentialApplications || [])
    .map(
      (a) =>
        `<li><strong>${escapeHtml(a.personCenteredBenefit || "")}</strong>
         <div class="detail__muted">${escapeHtml(a.evidenceNote || "")}</div></li>`
    )
    .join("");

  // ----- render -----
  return `
    <p class="detail__disclaimer-strip">Research summary, not medical advice. Talk to a licensed professional before making health decisions.</p>

    <header class="detail__hero">
      <div class="detail__hero-head">
        <h2 class="detail__title" id="detail-title">${escapeHtml(title)}</h2>
        <span class="detail__evidence-badge" style="background:${tier.color}" title="${escapeHtml(evidenceTierExplainer(tier.tier))}">${escapeHtml(tier.label)}</span>
      </div>
      <p class="detail__hero-summary">${escapeHtml(entry.researchSummary || "")}</p>
    </header>

    <div class="detail__facts">${factsParts.join('<span class="detail__fact-sep" aria-hidden="true">·</span>')}</div>

    <section class="detail__body">
      ${dq?.headline ? `<p class="detail__body-subhead">${escapeHtml(dq.headline)}</p>` : ""}
      ${entry.notes ? `<aside class="detail__callout detail__callout--warn">${escapeHtml(entry.notes)}</aside>` : ""}
      ${benefitsHtml ? `
        <h3 class="detail__body-heading">What researchers found</h3>
        <ul class="detail__benefits">${benefitsHtml}</ul>
        ${moreBenefits > 0 ? `<p class="detail__body-more">+ ${moreBenefits} more in research details below</p>` : ""}
      ` : ""}
    </section>

    <section class="detail__depth">
      <h3 class="detail__depth-title">Research details</h3>

      <details class="detail__depth-item">
        <summary>Dosing &amp; timing</summary>
        <p class="detail__prose">${escapeHtml(entry.dosingTimingNotes || "No established dosing information available.")}</p>
      </details>

      <details class="detail__depth-item">
        <summary>Cycling pattern</summary>
        <p class="detail__prose">${escapeHtml(entry.cyclingNotes || "No established cycling pattern.")}</p>
      </details>

      ${doseRows ? `
      <details class="detail__depth-item">
        <summary>Doses in published research</summary>
        <div class="table-wrap">
          <table class="doses">
            <thead><tr><th>Used for</th><th>Evidence</th><th>What research found</th></tr></thead>
            <tbody>${doseRows}</tbody>
          </table>
        </div>
      </details>` : ""}

      ${synergy ? `
      <details class="detail__depth-item">
        <summary>Often discussed alongside</summary>
        <ul class="synergy-list">${synergy}</ul>
      </details>` : ""}

      ${apps ? `
      <details class="detail__depth-item">
        <summary>Potential uses people explore</summary>
        <ul class="detail__apps">${apps}</ul>
      </details>` : ""}

      ${dqThemes ? `
      <details class="detail__depth-item">
        <summary>Research themes</summary>
        <div class="detail__row">${dqThemes}</div>
        ${dq?.basisNote ? `<p class="detail__muted">${escapeHtml(dq.basisNote)}</p>` : ""}
      </details>` : ""}

      <details class="detail__depth-item">
        <summary>Sources (${srcCount})</summary>
        ${srcCount > 0
          ? `<ul class="detail__sources">${sources}</ul>`
          : `<p class="detail__muted">No linked sources for this entry.</p>`}
      </details>
    </section>

    <footer class="detail__actions" role="group" aria-label="Detail actions">
      <button type="button" class="detail__action detail__action--bookmark" data-entry-id="${escapeHtml(id)}" aria-label="Toggle bookmark">
        <span aria-hidden="true">${isBookmarked ? "★" : "☆"}</span>
        <span class="detail__action-label">Bookmark</span>
      </button>
      <button type="button" class="detail__action detail__action--share" data-action="share" aria-label="Share link">
        <span aria-hidden="true">↗</span>
        <span class="detail__action-label">Share</span>
      </button>
      <button type="button" class="detail__action detail__action--print" data-action="print" aria-label="Print">
        <span aria-hidden="true">⎙</span>
        <span class="detail__action-label">Print</span>
      </button>
      <a class="detail__action detail__action--report" href="https://github.com/jlambert229/badgerskope/issues/new?title=${encodeURIComponent('Issue with ' + title)}" target="_blank" rel="noopener noreferrer" aria-label="Report an issue">
        <span aria-hidden="true">!</span>
        <span class="detail__action-label">Report</span>
      </a>
    </footer>
  `;
}
```

- [ ] **Step 2: Wire Share and Print buttons in `bindDetailEvents` (or wherever detail interactions are bound)**

Locate the click handlers for the existing `.detail__bookmark-btn`. They live inside `showDetailAt` / a post-render binding block. The new class name is `.detail__action--bookmark`. Update the existing handler to target the new class AND add handlers for `.detail__action--share` and `.detail__action--print`.

If the existing binding function attaches via `els.detailBody.querySelector(".detail__bookmark-btn")`, change that selector to `.detail__action--bookmark`.

Add alongside:

```js
// Inside the block that runs after detail HTML is injected (search for ".detail__bookmark-btn"):
const shareBtn = els.detailBody.querySelector(".detail__action--share");
if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    const url = location.origin + location.pathname + location.hash;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        shareBtn.classList.add("detail__action--done");
        setTimeout(() => shareBtn.classList.remove("detail__action--done"), 1500);
      });
    } else {
      window.prompt("Copy this link:", url);
    }
  });
}

const printBtn = els.detailBody.querySelector(".detail__action--print");
if (printBtn) {
  printBtn.addEventListener("click", () => window.print());
}
```

- [ ] **Step 3: Verify the function compiles and still runs**

```bash
cd /home/owner/Repos/badgerskope
node --check web/app.js
# Expected: no output (silent success). If it prints a parse error, fix before continuing.
```

- [ ] **Step 4: Smoke test rendering**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
curl -s http://localhost:5173/web/app.js | grep -c "detail__hero"      # expect ≥ 2
curl -s http://localhost:5173/web/app.js | grep -c "detail__actions"   # expect ≥ 1
curl -s http://localhost:5173/web/app.js | grep -c "detail__compare-link"  # expect ≥ 1
kill $SERVER_PID
```

All three counts must be ≥ 1. If any are zero, the replacement didn't land.

- [ ] **Step 5: Commit**

```bash
git add web/app.js
git commit -m "refactor(detail): rewrite renderDetailHtml around six-zone layout"
```

---

## Task 3: New detail CSS

**Purpose:** Style the new detail zones. Replace / add rules in `web/app.css` without breaking Phase-1 tokens.

**Files:**
- Modify: `web/app.css` (add new rules; remove or neuter the old `.detail__hero-bar`, `.detail__cats`, `.detail__section--highlight`, `.ev-compare*` inside detail, `.source-quality*`, `.detail__disclaimer` heavy block, and per-section `.detail__help` styles if they only serve the old layout)

- [ ] **Step 1: Append new detail styles**

Add the following block at the end of `web/app.css` (just before the final `[data-theme="light"]` component overrides, or at EOF):

```css
/* ============================================================
   DETAIL — radical subtraction (Phase 2)
   ============================================================ */

.detail__disclaimer-strip {
  background: var(--accent-soft);
  color: var(--text-muted);
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  margin: 0 0 var(--space-5);
  text-align: center;
}

.detail__hero {
  margin: 0 0 var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.detail__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.detail__title {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
  margin: 0;
  flex: 1 1 auto;
}

.detail__evidence-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  color: #0b0e13;
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.detail__hero-summary {
  margin: var(--space-3) 0 0;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text);
}

.detail__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--space-6);
}

.detail__fact { white-space: nowrap; }
.detail__fact--warn { color: var(--warning); font-weight: 600; }
.detail__fact-sep { color: var(--text-dim); }

.detail__compare-link {
  color: var(--accent);
  text-decoration: none;
  white-space: nowrap;
}
.detail__compare-link:hover { text-decoration: underline; }

.detail__body {
  margin: 0 0 var(--space-6);
}

.detail__body-subhead {
  font-style: italic;
  color: var(--text-muted);
  margin: 0 0 var(--space-3);
  font-size: var(--text-base);
}

.detail__callout {
  border-left: 3px solid var(--warning);
  background: color-mix(in srgb, var(--warning) 8%, transparent);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  margin: var(--space-3) 0;
  font-size: var(--text-base);
}

.detail__body-heading {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: var(--space-5) 0 var(--space-2);
}

.detail__body-more {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: var(--space-2) 0 0;
  font-style: italic;
}

.detail__depth {
  margin: 0 0 var(--space-6);
  border-top: 1px solid var(--border);
  padding-top: var(--space-5);
}

.detail__depth-title {
  font-size: var(--text-xl);
  margin: 0 0 var(--space-3);
  color: var(--text);
}

.detail__depth-item {
  border-bottom: 1px solid var(--border);
  padding: var(--space-3) 0;
}

.detail__depth-item > summary {
  cursor: pointer;
  font-weight: 600;
  padding: var(--space-1) 0;
  color: var(--text);
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.detail__depth-item > summary::before {
  content: "▸";
  color: var(--text-muted);
  transition: transform var(--transition-fast);
  display: inline-block;
  width: 1em;
}

.detail__depth-item[open] > summary::before { transform: rotate(90deg); }

.detail__depth-item > summary::-webkit-details-marker { display: none; }

.detail__actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  margin-top: var(--space-6);
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid var(--border);
  z-index: 5;
}

.detail__action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: var(--text-sm);
  cursor: pointer;
  text-decoration: none;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.detail__action:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--bg-elevated));
}

.detail__action--done {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 12%, var(--bg-elevated));
}

/* Ensure modal panel doesn't let content hide behind sticky bar */
.modal__panel { padding-bottom: var(--space-8); }

/* Mobile adjustments */
@media (max-width: 600px) {
  .detail__title { font-size: var(--text-2xl); }
  .detail__hero-summary { font-size: var(--text-base); }
}

@media (max-width: 480px) {
  .detail__facts { gap: var(--space-1); }
  .detail__action-label { display: none; }
  .detail__action { padding: var(--space-2); }
}

/* Print: sticky action bar becomes static, hide it */
@media print {
  .detail__actions { display: none; }
  .detail__depth-item:not([open]) > *:not(summary) { display: block; }
}
```

- [ ] **Step 2: Remove / neuter rules that styled the cut DOM**

The following class names are no longer produced by `renderDetailHtml`. Search and comment out (or delete) each rule block in `web/app.css`:

```bash
grep -nE "^\.detail__hero-bar|^\.detail__cats|^\.detail__section--highlight|^\.ev-compare|^\.source-quality|^\.detail__disclaimer\s*\{|^\.detail__help\b|^\.detail__evidence-block|^\.detail__hero-actions|^\.detail__hero-right|^\.detail__hero-top|^\.detail__compound-type" web/app.css
```

For each match, delete the rule block (opening brace to closing brace, and any immediately preceding comment header that only pertains to that rule).

Exception: `.detail__evidence-badge` is KEPT (the new hero uses it — but the selector is redefined with new values in the block you added in Step 1). Find the OLD `.detail__evidence-badge { ... }` rule and delete it so the new one wins uncontested.

After: `grep -c "detail__hero-bar\|detail__cats\|source-quality\|ev-compare__\|detail__help\b" web/app.css` must return 0.

- [ ] **Step 3: Smoke the CSS loads**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
curl -s http://localhost:5173/web/app.css | grep -c "detail__disclaimer-strip"   # ≥ 1
curl -s http://localhost:5173/web/app.css | grep -c "detail__depth-item"         # ≥ 1
curl -s http://localhost:5173/web/app.css | grep -c "detail__actions"            # ≥ 1
kill $SERVER_PID
```

- [ ] **Step 4: Commit**

```bash
git add web/app.css
git commit -m "refactor(detail): new CSS for six-zone layout; remove cut-section rules"
```

---

## Task 4: Route `#tab=stats&category=<key>` to the Stats tab with filter

**Purpose:** The new facts strip has a `See how this compares →` link pointing at `#tab=stats&category=<primaryCat>`. The existing `applyHashOnLoad` already handles `tab=stats` (line 1372) and `category` (line 1367). Verify it works; add only the missing piece — reactive navigation when the link is clicked while the app is already loaded.

**Files:**
- Modify: `web/app.js` (add hashchange listener if absent; otherwise extend)

- [ ] **Step 1: Add a hashchange listener if none exists**

Find the bottom of `web/app.js` near where `applyHashOnLoad` is called once at startup. Search:

```bash
grep -n "hashchange\|applyHashOnLoad\|window.addEventListener" web/app.js | head -10
```

If no `hashchange` listener is registered, add the following near the init / DOMContentLoaded block:

```js
window.addEventListener("hashchange", () => {
  // Ignore hash changes triggered by our own entry routing (detail modal open/close)
  const params = readHashParams();
  if (params.tab && (params.tab === "stats" || params.tab === "compare" || params.tab === "browse")) {
    switchTab(params.tab);
  }
  if (params.category && els.category && els.category.value !== params.category) {
    els.category.value = params.category;
    els.category.dispatchEvent(new Event("change"));
  }
  if (!params.entry && els.dialog?.open) {
    // User navigated away from a deep-linked entry
    els.dialog.close();
  }
});
```

If a listener already exists, integrate the tab+category branch there (do not duplicate).

- [ ] **Step 2: Manual smoke**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
# Deep-link directly:
curl -sI "http://localhost:5173/web/#tab=stats&category=appetite_satiety" | head -1
# Expect HTTP/1.1 200 OK — static page load, hash handled client-side
kill $SERVER_PID
```

Manual browser test (record in work log Task 4 section): open `/web/#entry=1G-SGT%2010mg`, click the `See how this compares →` link in the facts strip, verify the Stats tab activates with the `appetite_satiety` category preselected in the Category filter.

- [ ] **Step 3: Commit**

```bash
git add web/app.js
git commit -m "feat(detail): route See how this compares link to stats with category filter"
```

---

## Task 5: Remove the "+ Compare" card button

**Purpose:** Every card has a checkbox and a duplicate "+ Compare" button. Keep the checkbox; delete the button.

**Files:**
- Modify: `web/app.js` (`renderCard`, starting line 458)
- Modify: `web/app.css` (remove `.card__compare-btn` rule block)

- [ ] **Step 1: Strip compare-button creation from `renderCard`**

Open `web/app.js`. In `renderCard` find the block that creates the `.card__compare-btn` (search for `card__compare-btn`). Delete:

- The `const compareBtn = document.createElement("button");` block and all its setup (class, textContent, aria, event listener)
- The line `article.appendChild(compareBtn);`

Also find any later code in `renderCard` or in a selection-state updater that references `compareBtn` or calls `.textContent = "- Remove"` / `"+ Compare"`. Delete those references.

Verify after edit:

```bash
grep -nc "card__compare-btn\|compareBtn" web/app.js
# Expect 0
```

- [ ] **Step 2: Remove the `.card__compare-btn` CSS rule**

```bash
grep -n "^\.card__compare-btn" web/app.css
```

For each match, delete the entire rule block.

```bash
grep -nc "card__compare-btn" web/app.css
# Expect 0
```

- [ ] **Step 3: Smoke test**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
# The rendered cards should now have checkbox + bookmark + body, but no compare button
# (visible check: load /web/ in browser, inspect a card)
curl -s http://localhost:5173/web/app.js | grep -c "card__compare-btn"   # expect 0
kill $SERVER_PID
```

- [ ] **Step 4: Commit**

```bash
git add web/app.js web/app.css
git commit -m "refactor(cards): remove redundant + Compare button; checkbox only"
```

---

## Task 6: Remove the inline `transform: scale(0.98)` on card click

**Purpose:** Phase 1 removed hover scales in CSS but missed this JS-driven click animation that remains in the card factory.

**Files:**
- Modify: `web/app.js` (inside `renderCard`)

- [ ] **Step 1: Find and remove the animation**

Search for `transform` inside `renderCard`:

```bash
awk '/function renderCard\(/,/^}/' web/app.js | grep -n "transform"
```

You'll find something like:

```js
main.addEventListener("click", () => {
  article.style.transform = "scale(0.98)";
  setTimeout(() => {
    article.style.transform = "";
    if (_openDetail) _openDetail(entry);
  }, 50);
});
```

Replace with:

```js
main.addEventListener("click", () => {
  openDetail(entry);
});
```

(Use the function reference that's already in scope — `openDetail` in the monolithic `web/app.js`; if the code uses a late-bound `_openDetail`, keep that reference.)

Verify no `transform` remains inside the renderCard function:

```bash
awk '/function renderCard\(/,/^}/' web/app.js | grep -c "transform"
# Expect 0
```

- [ ] **Step 2: Commit**

```bash
git add web/app.js
git commit -m "refactor(cards): remove click scale animation"
```

---

## Task 7: Promote Evidence filter out of the Refine drawer

**Purpose:** The spec requires the evidence filter to be always visible. Currently it lives inside `#advanced-filters` which is hidden by default.

**Files:**
- Modify: `web/index.html` (move `#evidence-filter` above `<section class="controls controls--advanced">`; keep Category/Compound/Known-for/Sort/Group-By inside)
- Modify: `web/app.css` (style the new always-visible evidence filter row)

- [ ] **Step 1: Restructure the toolbar DOM**

In `web/index.html` find the block that begins at line 86 (`<div class="browse-toolbar">`). Replace the region from `<div class="browse-toolbar">` through the closing `</section>` of `#advanced-filters` with:

```html
        <div class="browse-toolbar">
          <label class="browse-toolbar__evidence">
            <span class="browse-toolbar__evidence-label">Evidence</span>
            <select id="evidence-filter" class="field__input field__select"></select>
          </label>
          <button
            type="button"
            class="filters-toggle"
            id="filters-toggle"
            aria-expanded="false"
            aria-controls="advanced-filters"
          >
            Refine
            <span class="filters-toggle__icon" aria-hidden="true">+</span>
          </button>
          <span class="browse-toolbar__count" id="result-count"></span>
        </div>

        <section class="controls controls--advanced" id="advanced-filters" hidden>
          <label class="field">
            <span class="field__label">Wellness area</span>
            <select id="category" class="field__input field__select"></select>
          </label>
          <label class="field">
            <span class="field__label">Substance type</span>
            <select id="compound" class="field__input field__select"></select>
          </label>
          <label class="field">
            <span class="field__label">What it's researched for</span>
            <select id="known-for" class="field__input field__select"></select>
          </label>
          <label class="field">
            <span class="field__label">Sort</span>
            <select id="sort" class="field__input field__select">
              <option value="title">Name A&ndash;Z</option>
              <option value="title-desc">Name Z&ndash;A</option>
              <option value="evidence">Strongest evidence first</option>
              <option value="type">By substance type</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">Group by</span>
            <select id="group-by" class="field__input field__select">
              <option value="">No grouping</option>
              <option value="theme">What it's known for</option>
              <option value="compound">Substance type</option>
              <option value="evidence">How strong the science is</option>
              <option value="category">Wellness area</option>
            </select>
          </label>
        </section>
```

The net structural change: `#evidence-filter` moves OUT of `#advanced-filters` into the always-visible `.browse-toolbar`. The "Filters" label on the toggle becomes "Refine". Every other ID stays identical so existing JS wiring keeps working.

- [ ] **Step 2: Add CSS for the new evidence filter row**

Append to `web/app.css`:

```css
/* ---- Browse toolbar: always-visible evidence filter ---- */
.browse-toolbar__evidence {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-right: var(--space-3);
}

.browse-toolbar__evidence-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
}

.browse-toolbar__evidence select {
  min-width: 10em;
}
```

- [ ] **Step 3: Smoke the page still loads with selects populated**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
curl -s http://localhost:5173/web/ | grep -c 'id="evidence-filter"'   # expect 1
curl -s http://localhost:5173/web/ | grep -c 'id="advanced-filters"'  # expect 1
curl -s http://localhost:5173/web/ | grep -c 'id="category"'          # expect 1
kill $SERVER_PID
```

- [ ] **Step 4: Commit**

```bash
git add web/index.html web/app.css
git commit -m "refactor(toolbar): promote evidence filter above the Refine drawer"
```

---

## Task 8: Goal bar — first-visit-only behavior

**Purpose:** The goal-pill row should be visible on first visit (when no filters are active) and collapse once any filter is engaged.

**Files:**
- Modify: `web/features.js` (`addGoalFilters()`, ~line 1020)
- Modify: `web/features.css` (add `.goal-bar--hidden` utility)

- [ ] **Step 1: Extend `addGoalFilters` with show/hide logic**

Open `web/features.js`. Find `function addGoalFilters()` near line 1020. After the existing `bar.querySelectorAll(".goal-btn").forEach(...)` click-binding block and the existing reset-click binding, append:

```js
    // Hide the bar once any filter select has a non-empty value.
    const filterSelects = [
      document.getElementById("category"),
      document.getElementById("compound"),
      document.getElementById("known-for"),
      document.getElementById("evidence-filter"),
    ].filter(Boolean);
    const syncGoalVisibility = () => {
      const anyActive = filterSelects.some((sel) => sel.value !== "" && sel.value != null);
      bar.classList.toggle("goal-bar--hidden", anyActive);
    };
    filterSelects.forEach((sel) => sel.addEventListener("change", syncGoalVisibility));
    const searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.addEventListener("input", syncGoalVisibility);
    }
    syncGoalVisibility();
```

Do not remove the existing reset-click logic — it still needs to clear active pills, and the sync call (already triggered by filter resets via the change event they dispatch) will re-show the bar.

- [ ] **Step 2: Add the hide-utility CSS**

Append to `web/features.css`:

```css
.goal-bar--hidden {
  display: none;
}
```

- [ ] **Step 3: Smoke**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
curl -s http://localhost:5173/web/features.js | grep -c "syncGoalVisibility"   # expect ≥ 1
kill $SERVER_PID
```

- [ ] **Step 4: Commit**

```bash
git add web/features.js web/features.css
git commit -m "feat(toolbar): goal bar hides once any filter is active"
```

---

## Task 9: Update Playwright selectors for cut DOM

**Purpose:** Existing specs may assert on elements this phase removed (`.card__compare-btn`, `.detail__hero-bar`, `.detail__cats`, `.ev-compare` inside detail, bottom disclaimer block text). Update them rather than silencing.

**Files:**
- Modify: any file under `tests/*.spec.js` that references removed DOM

- [ ] **Step 1: Inventory affected specs**

```bash
cd /home/owner/Repos/badgerskope
grep -rnE "card__compare-btn|detail__hero-bar|detail__cats|detail__section--highlight|ev-compare|source-quality|detail__help\b|detail__disclaimer\b|detail__evidence-block|detail__compound-type" tests/ 2>/dev/null
```

For each hit, inspect the test and decide:

- **If it asserts presence of a now-removed feature** (e.g. `.card__compare-btn`): delete that assertion. The checkbox still does the selection job, so any subsequent behavior check should target the checkbox.
- **If it asserts a class name that just got renamed** (e.g. `.detail__hero-bar` → `.detail__hero`): update the selector.
- **If it asserts text content that this phase trimmed** (e.g. the bottom `<strong>Reminder:</strong>` disclaimer): update to match the new `.detail__disclaimer-strip` text.

Don't skip any test. If a test becomes trivially passing after the update, delete the test or merge its remaining assertion into a neighbor.

- [ ] **Step 2: Run the affected spec subset to verify**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npx playwright test --project=chrome \
  tests/compare-feature.spec.js \
  tests/navigation-state.spec.js \
  tests/accessibility.spec.js \
  tests/app-loads.spec.js \
  2>&1 | tail -15
```

Any new failure beyond the Phase-1 flaky baseline is a regression; fix before moving on.

- [ ] **Step 3: Commit**

```bash
git add tests/
git commit -m "test: update selectors for Phase 2 detail and card changes"
```

If no test changes were required, skip the commit and note so in the work log.

---

## Task 10: Final regression + visual pass + push

**Purpose:** Confirm the product is coherent and the test suite holds. Capture the manual visual checks promised by the spec.

**Files:**
- Modify: `logs/wl-redesign-radical-subtraction.md`

- [ ] **Step 1: Full Chromium Playwright run**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 2
npx playwright test --project=chrome 2>&1 | tee /tmp/phase2-final.txt
tail -5 /tmp/phase2-final.txt
```

Compare to the baseline captured in Task 1. The pass count must be identical. New failures = regression; stop and investigate.

- [ ] **Step 2: Cross-surface HTTP smoke**

```bash
pkill -9 -f "serve . -l 5173" 2>/dev/null ; sleep 1
npm run web > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2
for path in / /web/ "/web/#entry=1G-SGT%2010mg" "/web/#tab=stats&category=appetite_satiety" /glossary.html /evidence-guide.html ; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173${path}")
  echo "${path} -> HTTP ${code}"
done
kill $SERVER_PID
```

All must report 200.

- [ ] **Step 3: Manual visual pass — record results in work log**

Open the live server in a browser (headed, or record observations from curl+DOM spot checks if no browser is available). For each of these, record yes/no:

1. `/web/#entry=1G-SGT%2010mg` — disclaimer strip, hero (title + evidence badge + 1-sentence summary), facts strip below, then body, then Research details accordion, then sticky action bar. Visible above fold on 1366×768: disclaimer + hero + summary + at least part of facts strip.
2. Click a Research details `<details>` — it opens independently.
3. Bookmark button toggles star; Share copies link (or prompts); Print invokes print dialog; Report opens GitHub issue URL.
4. Close the modal; browse grid. Cards show one primary action (checkbox). No "+ Compare" button.
5. Browse toolbar: Search, Evidence dropdown, Refine button, result count visible. Click Refine → Category/Substance/Known-for/Sort/Group-by appear.
6. First visit (clear localStorage + open `/web/`): goal pills visible above grid. Click "Weight loss": pills hide; Known-for filter value is "metabolic_incretins".
7. Click Clear → filters reset → goal pills reappear.
8. Mobile (390×844 simulated): modal scales; facts strip wraps; action bar icon-only.
9. Light theme (or `prefers-color-scheme: light`): disclaimer strip, hero, facts strip, depth, action bar all readable.
10. From `/web/#entry=<any>` facts strip click `See how this compares →` → lands on Stats tab with the entry's primary category preselected.

Append to `logs/wl-redesign-radical-subtraction.md` under a new `## Phase 2 manual visual pass` heading.

- [ ] **Step 4: Append Phase 2 summary**

```markdown

## Phase 2 complete — 2026-04-23

- Detail modal rewritten around six zones (disclaimer strip, hero, facts strip, body, Research details accordion, sticky action bar).
- "+ Compare" card button removed; checkbox is the only per-card selection control.
- Click-scale animation on cards removed.
- Evidence filter promoted out of the Refine drawer; always visible.
- Goal bar hides once any filter is active; first-visit users still see the pills.
- Playwright Chromium: <N passed> (matches Phase 1 baseline).
- Manual visual pass: <10/10 yes | note issues>.

Next: Phase 3 — library shell IA (merge Compare/Stats into a single command surface).
```

- [ ] **Step 5: Commit + push**

```bash
git add logs/wl-redesign-radical-subtraction.md
git commit -m "chore: phase 2 complete — radical subtraction across detail, cards, toolbar"
git push -u origin redesign-radical-subtraction
```

- [ ] **Step 6: DO NOT open a PR**

The controller will ask the user for confirmation before opening the PR. Stop after the push.

---

## Self-Review Notes

- **Spec coverage:** Every acceptance criterion in the spec is covered:
  - AC 1 (≤ 6 top-level blocks, one `<h3>` above depth) → Task 2
  - AC 2 (no sub-heading matches hero/facts weight) → Task 3 styles
  - AC 3 (no `.card__compare-btn`) → Task 5
  - AC 4 (no `transform: scale` in card JS) → Task 6
  - AC 5 (Search + Evidence always visible; rest in Refine drawer) → Task 7
  - AC 6 (goal pills visible on first visit, hidden after filter active) → Task 8
  - AC 7 (sticky footer with 4 actions) → Task 2 + Task 3
  - AC 8 (keyboard shortcuts intact) → no work needed; Task 9 verifies
  - AC 9 (Playwright matches Phase 1 baseline) → Task 1 + Task 10
  - AC 10 (manual pass documented) → Task 10
- **Placeholder scan:** every step has concrete code or a grep/find command. No "TODO", no "similar to Task N".
- **Type consistency:** `renderDetailHtml` returns HTML; class names in the JS template exactly match the CSS rules added in Task 3 (`.detail__hero`, `.detail__facts`, `.detail__body`, `.detail__depth`, `.detail__actions`, `.detail__disclaimer-strip`, `.detail__callout`). The hash-router uses the existing `readHashParams` / `writeHashParams` functions.
- **Commit cadence:** 10 atomic commits, each independently revertible.
- **TDD caveat:** as with Phase 1, this is UI/structural work with no new behavior to unit-test. The TDD shape is replaced with "change → existing suite → manual visual pass → commit", and Playwright selector updates in Task 9 are the only test-side changes.
