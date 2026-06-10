/**
 * Tab navigation — switch between Browse and Stats panels.
 */

import { els } from "./dom.js";
import { state } from "./state.js";

let _renderStatsDashboard = null;
let _updateHashFromState = null;

export function setTabCallbacks({ renderStatsDashboard, updateHashFromState }) {
  _renderStatsDashboard = renderStatsDashboard;
  _updateHashFromState = updateHashFromState;
}

export function switchTab(tab) {
  state.activeTab = tab;
  const tabs = [
    { btn: els.tabBrowse, panel: els.panelBrowse, key: "browse" },
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
  if (tab === "stats" && _renderStatsDashboard) _renderStatsDashboard();
  if (_updateHashFromState) _updateHashFromState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
