/**
 * Stats dashboard rendering.
 */

import { state } from './state.js';
import { els } from './dom.js';
import { escapeHtml, formatCompoundType, FRIENDLY_CATEGORIES } from './utils.js';
import { highestTier, EVIDENCE_TIERS } from './constants.js';
import { GROUP_THEME_LABELS } from './groups.js';

/* Late-bound callbacks injected by main.js to avoid circular deps */
let _switchTab = null;
let _render = null;

export function setStatsCallbacks({ switchTab, render }) {
  _switchTab = switchTab;
  _render = render;
}

export function renderBar(label, count, max) {
  const pct = max > 0 ? ((count / max) * 100).toFixed(1) : 0;
  return `<div class="stat-bar">
    <span class="stat-bar__label">${escapeHtml(label)}</span>
    <div class="stat-bar__track">
      <div class="stat-bar__fill" style="--pct:${pct}%"></div>
    </div>
    <span class="stat-bar__count">${count}</span>
  </div>`;
}

export function renderStatsDashboard() {
  if (!els.statsDashboard) return;
  const entries = state.db.entries;
  const total = entries.length;

  /* Total count */
  const totalValEl = document.getElementById("stat-total-value");
  if (totalValEl) totalValEl.textContent = total;
  const totalSubEl = document.getElementById("stat-total-sub");
  if (totalSubEl) {
    const withSources = entries.filter(e => (e.sources || []).length > 0).length;
    totalSubEl.textContent = `${withSources} with linked sources`;
  }

  /* Compound types */
  const compoundCounts = {};
  for (const e of entries) {
    const ct = e.compoundType || "unknown";
    compoundCounts[ct] = (compoundCounts[ct] || 0) + 1;
  }
  const compSorted = Object.entries(compoundCounts).sort((a, b) => b[1] - a[1]);
  const compMax = compSorted.length ? compSorted[0][1] : 1;
  if (els.statCompounds) {
    const compBody = els.statCompounds.querySelector(".stat-card__body") || els.statCompounds;
    compBody.innerHTML =
      '<p class="stat-help">How many entries fall into each chemical class.</p>' +
      compSorted
        .map(
          ([k, c]) =>
            `<div class="stat-bar stat-bar--clickable" role="button" tabindex="0" aria-label="Filter library by ${escapeHtml(formatCompoundType(k))}" data-filter-type="compound" data-filter-value="${escapeHtml(k)}">
              <span class="stat-bar__label">${escapeHtml(formatCompoundType(k))}</span>
              <div class="stat-bar__track">
                <div class="stat-bar__fill" style="--pct:${((c / compMax) * 100).toFixed(1)}%"></div>
              </div>
              <span class="stat-bar__count">${c}</span>
              <span class="stat-bar__pct">${((c / total) * 100).toFixed(0)}%</span>
            </div>`
        )
        .join("");
  }

  /* Wellness categories */
  const catCounts = {};
  for (const e of entries) {
    for (const c of e.wellnessCategories || []) {
      catCounts[c] = (catCounts[c] || 0) + 1;
    }
  }
  const catSorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const catMax = catSorted.length ? catSorted[0][1] : 1;
  if (els.statCategories) {
    const catBody = els.statCategories.querySelector(".stat-card__body") || els.statCategories;
    catBody.innerHTML =
      '<p class="stat-help">How many entries appear in each wellness area. Entries can appear in multiple categories.</p>' +
      catSorted
        .map(
          ([k, c]) =>
            `<div class="stat-bar stat-bar--clickable" role="button" tabindex="0" aria-label="Filter library by ${escapeHtml(FRIENDLY_CATEGORIES[k] || k.replace(/_/g, " "))}" data-filter-type="category" data-filter-value="${escapeHtml(k)}">
              <span class="stat-bar__label">${escapeHtml(FRIENDLY_CATEGORIES[k] || k.replace(/_/g, " "))}</span>
              <div class="stat-bar__track">
                <div class="stat-bar__fill" style="--pct:${((c / catMax) * 100).toFixed(1)}%"></div>
              </div>
              <span class="stat-bar__count">${c}</span>
              <span class="stat-bar__pct">${((c / total) * 100).toFixed(0)}%</span>
            </div>`
        )
        .join("");
  }

  /* Evidence tiers */
  const evCounts = {};
  for (const e of entries) {
    const t = highestTier(e);
    evCounts[t.label] = (evCounts[t.label] || 0) + 1;
  }
  const evSorted = EVIDENCE_TIERS
    .filter(t => evCounts[t.label])
    .map(t => [t.label, evCounts[t.label], t.color, t.key]);
  const evMax = evSorted.length ? Math.max(...evSorted.map(x => x[1])) : 1;
  if (els.statEvidence) {
    const evBody = els.statEvidence.querySelector(".stat-card__body") || els.statEvidence;
    evBody.innerHTML =
      '<p class="stat-help">Distribution by the highest evidence tier. Sorted from strongest to weakest.</p>' +
      evSorted
        .map(
          ([label, c, color, key]) =>
            `<div class="stat-bar stat-bar--clickable" role="button" tabindex="0" aria-label="Filter library by evidence tier ${escapeHtml(label)}" data-filter-type="evidence" data-filter-value="${escapeHtml(key)}">
              <span class="stat-bar__label">
                <span class="stat-bar__dot" style="background:${color}"></span>
                ${escapeHtml(label)}
              </span>
              <div class="stat-bar__track">
                <div class="stat-bar__fill" style="--pct:${((c / evMax) * 100).toFixed(1)}%;background:${color}"></div>
              </div>
              <span class="stat-bar__count">${c}</span>
              <span class="stat-bar__pct">${((c / entries.length) * 100).toFixed(0)}%</span>
            </div>`
        )
        .join("");
  }

  /* Themes */
  const themeCounts = {};
  for (const e of entries) {
    for (const t of e.distinctiveQuality?.themes || []) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
  }
  const themeSorted = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
  const themeMax = themeSorted.length ? themeSorted[0][1] : 1;
  if (els.statThemes) {
    const themeBody = els.statThemes.querySelector(".stat-card__body") || els.statThemes;
    themeBody.innerHTML =
      '<p class="stat-help">What compounds are best known for. Click a bar to filter the browse tab.</p>' +
      themeSorted
        .map(
          ([k, c]) =>
            `<div class="stat-bar stat-bar--clickable" role="button" tabindex="0" aria-label="Filter library by theme ${escapeHtml(GROUP_THEME_LABELS[k] || k.replace(/_/g, " "))}" data-filter-type="known-for" data-filter-value="${escapeHtml(k)}">
              <span class="stat-bar__label">${escapeHtml(GROUP_THEME_LABELS[k] || k.replace(/_/g, " "))}</span>
              <div class="stat-bar__track">
                <div class="stat-bar__fill" style="--pct:${((c / themeMax) * 100).toFixed(1)}%"></div>
              </div>
              <span class="stat-bar__count">${c}</span>
              <span class="stat-bar__pct">${((c / total) * 100).toFixed(0)}%</span>
            </div>`
        )
        .join("");
  }

  /* Click-to-filter on stat bars (keyboard + pointer). Bars carry
     role="button" tabindex="0" so they're focusable; Enter or Space
     activates them just like a real button. */
  const activate = (bar) => {
    const type = bar.dataset.filterType;
    const value = bar.dataset.filterValue;
    if (type === "compound" && els.compound) els.compound.value = value;
    else if (type === "category" && els.category) els.category.value = value;
    else if (type === "evidence" && els.evidenceFilter) els.evidenceFilter.value = value;
    else if (type === "known-for" && els.knownFor) els.knownFor.value = value;
    if (_switchTab) _switchTab("browse");
    if (_render) _render();
  };
  els.statsDashboard.querySelectorAll(".stat-bar--clickable").forEach(bar => {
    bar.addEventListener("click", () => activate(bar));
    bar.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate(bar);
      }
    });
  });
}
