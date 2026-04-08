/**
 * Tab navigation — switch between Browse, Compare, and Stats panels.
 */

import { els } from "./dom.js";
import { state } from "./state.js";

let _renderComparisonTable = null;
let _renderStatsDashboard = null;
let _updateHashFromState = null;

export function setTabCallbacks({ renderComparisonTable, renderStatsDashboard, updateHashFromState }) {
  _renderComparisonTable = renderComparisonTable;
  _renderStatsDashboard = renderStatsDashboard;
  _updateHashFromState = updateHashFromState;
}

export function switchTab(tab) {
  state.activeTab = tab;
  const tabs = [
    { btn: els.tabBrowse, panel: els.panelBrowse, key: "browse" },
    { btn: els.tabCompare, panel: els.panelCompare, key: "compare" },
    { btn: els.tabStats, panel: els.panelStats, key: "stats" },
  ];
  for (const t of tabs) {
    if (!t.btn || !t.panel) continue;
    const active = t.key === tab;
    t.btn.classList.toggle("tab--active", active);
    t.btn.setAttribute("aria-selected", String(active));
    t.panel.classList.toggle("tab-panel--active", active);
    t.panel.hidden = !active;
  }
  if (tab === "compare" && _renderComparisonTable) _renderComparisonTable();
  if (tab === "stats" && _renderStatsDashboard) _renderStatsDashboard();
  if (_updateHashFromState) _updateHashFromState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
