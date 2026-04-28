/**
 * Selection toolbar and selected-entry helpers.
 */

import { state, getEntryById } from './state.js';
import { els } from './dom.js';
import { getDisplayName } from './utils.js';

export function updateSelectionToolbar() {
  const n = state.selectedIds.size;
  const bar = document.getElementById("selection-bar");
  if (bar) bar.hidden = n === 0;
  if (els.selectionCount) {
    els.selectionCount.textContent = n === 1 ? "1 SELECTED" : `${n} SELECTED`;
  }
  if (els.clearSelection) els.clearSelection.disabled = n === 0;
  // Require ≥ 2 selections — single-entry "view" is what clicking a row does.
  // Prev/Next arrows are also disabled at length 1, so this matches the multi-detail flow.
  if (els.viewSelected) els.viewSelected.disabled = n < 2;
  if (els.compareSelected) els.compareSelected.disabled = n < 2;
  const compareBadge = els.tabCompare;
  if (compareBadge && n >= 2) {
    compareBadge.textContent = `COMPARE (${n})`;
  } else if (compareBadge) {
    compareBadge.textContent = "COMPARE";
  }
}

export function selectedEntriesSorted() {
  return [...state.selectedIds]
    .map((id) => getEntryById(id))
    .filter(Boolean)
    .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
}
