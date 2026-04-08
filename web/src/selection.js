/**
 * Selection toolbar and selected-entry helpers.
 */

import { state, getEntryById } from './state.js';
import { els } from './dom.js';

export function updateSelectionToolbar() {
  const n = state.selectedIds.size;
  const bar = document.getElementById("selection-bar");
  if (bar) bar.hidden = n === 0;
  if (els.selectionCount) {
    els.selectionCount.textContent = n === 1 ? "1 selected" : `${n} selected`;
  }
  if (els.clearSelection) els.clearSelection.disabled = n === 0;
  if (els.viewSelected) els.viewSelected.disabled = n === 0;
  if (els.compareSelected) els.compareSelected.disabled = n < 2;
  const compareBadge = els.tabCompare;
  if (compareBadge && n >= 2) {
    compareBadge.textContent = `Compare (${n})`;
  } else if (compareBadge) {
    compareBadge.textContent = "Compare";
  }
}

export function selectedEntriesSorted() {
  return [...state.selectedIds]
    .map((id) => getEntryById(id))
    .filter(Boolean)
    .sort((a, b) => (a.catalog?.title || "").localeCompare(b.catalog?.title || ""));
}
