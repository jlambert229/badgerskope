/**
 * URL hash routing — read/write filter state to the URL fragment.
 */

import { els } from "./dom.js";
import { state, getEntryByTitle } from "./state.js";

let _render = null;
let _switchTab = null;
let _openDetail = null;

export function setRouterCallbacks({ render, switchTab, openDetail }) {
  _render = render;
  _switchTab = switchTab;
  _openDetail = openDetail;
}

export function readHashParams() {
  const hash = location.hash.replace(/^#/, "");
  const params = {};
  for (const part of hash.split("&")) {
    const [k, ...rest] = part.split("=");
    if (k) params[k] = decodeURIComponent(rest.join("="));
  }
  return params;
}

export function writeHashParams(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(k + "=" + encodeURIComponent(v));
    }
  }
  const newHash = parts.length ? "#" + parts.join("&") : "";
  if ("#" + location.hash.replace(/^#/, "") !== newHash && location.hash !== newHash) {
    history.replaceState(null, "", newHash || location.pathname);
  }
}

export function updateHash(override) {
  if (override) {
    history.replaceState(null, "", "#" + override);
    return;
  }
  updateHashFromState();
}

export function updateHashFromState() {
  if (els.dialog && els.dialog.open) return;
  const params = {};
  if (state.activeTab !== "browse") params.tab = state.activeTab;
  const q = els.search ? els.search.value.trim() : "";
  if (q) params.search = q;
  const cat = els.category ? els.category.value : "";
  if (cat) params.category = cat;
  const comp = els.compound ? els.compound.value : "";
  if (comp) params.compound = comp;
  const kf = els.knownFor ? els.knownFor.value : "";
  if (kf) params["known-for"] = kf;
  const ev = els.evidenceFilter ? els.evidenceFilter.value : "";
  if (ev) params.evidence = ev;
  writeHashParams(params);
}

export function applyHashOnLoad() {
  const params = readHashParams();

  if (params.search && els.search) els.search.value = params.search;
  if (params.category && els.category) els.category.value = params.category;
  if (params.compound && els.compound) els.compound.value = params.compound;
  if (params["known-for"] && els.knownFor) els.knownFor.value = params["known-for"];
  if (params.evidence && els.evidenceFilter) els.evidenceFilter.value = params.evidence;

  // Open deep-linked entry before switchTab/render. Otherwise updateHashFromState()
  // runs while the dialog is still closed and drops entry= from the URL.
  if (params.entry && _openDetail) {
    const entry = getEntryByTitle(params.entry);
    if (entry) _openDetail(entry);
  }

  if ((params.tab === "compare" || params.tab === "stats") && _switchTab) {
    _switchTab(params.tab);
  }

  if (_render) _render();
}
