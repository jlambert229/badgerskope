/**
 * BadgerSkope — Main entry point
 * Imports all modules and wires up the application.
 */

import { DATA_URL } from "./constants.js";
import { escapeHtml, formatCompoundType, debounce, FRIENDLY_CATEGORIES } from "./utils.js";
import { state, getEntryId, getEntryById, getEntryByTitle } from "./state.js";
import { els } from "./dom.js";
import { loadBookmarks, saveBookmarks, updateBookmarksBar } from "./bookmarks.js";
import { loadTheme, toggleTheme } from "./theme.js";
import {
  matchesSearch, matchesCategory, matchesCompound,
  matchesKnownFor, matchesEvidence, sortEntries, populateFilters,
} from "./filters.js";
import { getGroupKey, getGroupLabel, getGroupOrder } from "./groups.js";
import { updateSelectionToolbar, selectedEntriesSorted } from "./selection.js";
import { renderCard, setCardCallbacks } from "./cards.js";
import {
  openDetail, closeDetail, showDetailAt,
  setDetailCallbacks,
} from "./detail.js";
import { renderComparisonTable, setCompareCallbacks } from "./compare.js";
import { renderStatsDashboard, setStatsCallbacks } from "./stats.js";
import { switchTab, setTabCallbacks } from "./tabs.js";
import {
  readHashParams, writeHashParams, updateHash,
  updateHashFromState, applyHashOnLoad, setRouterCallbacks,
} from "./router.js";
import { initKeyboard, setKeyboardCallbacks } from "./keyboard.js";

// Feature modules
import { initRecent } from "./features/recent.js";
import { initBookmarksToggle } from "./features/bookmarks-toggle.js";
import { initChips } from "./features/chips.js";
import { initShare } from "./features/share.js";
import { initSearchEnhance } from "./features/search-enhance.js";
import { initGoals } from "./features/goals.js";
import { initScroll } from "./features/scroll.js";
import { initNotes } from "./features/notes.js";
import { initDoping } from "./features/doping.js";
import { initInteractions } from "./features/interactions.js";

/* ------------------------------------------------------------------ */
/*  Grid render                                                        */
/* ------------------------------------------------------------------ */

function render() {
  const catIndex = state.db.meta.wellnessCategoryIndex || {};
  const q = els.search.value.trim().toLowerCase();
  const cat = els.category.value;
  const comp = els.compound.value;
  const known = els.knownFor.value;
  const ev = els.evidenceFilter ? els.evidenceFilter.value : "";
  const sortMode = els.sort.value;

  let list = state.db.entries.filter(
    (e) =>
      matchesSearch(e, q) &&
      matchesCategory(e, cat) &&
      matchesCompound(e, comp) &&
      matchesKnownFor(e, known) &&
      matchesEvidence(e, ev)
  );
  list = sortEntries(list, sortMode);
  state.lastVisibleList = list;

  const frag = document.createDocumentFragment();
  const selN = state.selectedIds.size;
  if (els.stats) {
    els.stats.textContent = `Showing ${list.length} of ${state.db.entries.length}${selN ? ` \u00b7 ${selN} selected` : ""}`;
  }

  const hasFilters = q || cat || comp || known || ev;
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) resetBtn.hidden = !hasFilters;

  const resultCount = document.getElementById("result-count");
  if (resultCount) {
    if (hasFilters) {
      resultCount.textContent = `${list.length} result${list.length !== 1 ? "s" : ""}`;
      resultCount.hidden = false;
    } else {
      resultCount.hidden = true;
    }
  }

  const groupBy = document.getElementById("group-by")?.value || "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No peptides match your current filters. Try broadening your search.";
    frag.appendChild(empty);
  } else if (groupBy) {
    const groups = new Map();
    for (const e of list) {
      const key = getGroupKey(e, groupBy);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    const order = getGroupOrder(groupBy);
    const sortedKeys = order
      ? [...groups.keys()].sort((a, b) => {
          const ia = order.indexOf(a);
          const ib = order.indexOf(b);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        })
      : [...groups.keys()].sort();

    let cardIdx = 0;
    for (const key of sortedKeys) {
      const items = groups.get(key);
      const header = document.createElement("div");
      header.className = "group-header";
      header.innerHTML = `<h2 class="group-header__title">${escapeHtml(getGroupLabel(key, groupBy))}</h2><span class="group-header__count">${items.length} compound${items.length !== 1 ? "s" : ""}</span>`;
      frag.appendChild(header);

      const groupGrid = document.createElement("div");
      groupGrid.className = "group-grid";
      for (const e of items) {
        groupGrid.appendChild(renderCard(e, catIndex, cardIdx++));
      }
      frag.appendChild(groupGrid);
    }
  } else {
    list.forEach((e, i) => frag.appendChild(renderCard(e, catIndex, i)));
  }
  els.grid.replaceChildren(frag);

  const catIntro = document.getElementById("category-intro");
  if (catIntro) catIntro.remove();
  if (cat && !q && !comp && !known && !ev && !groupBy) {
    const catName = FRIENDLY_CATEGORIES[cat] || cat.replace(/_/g, " ");
    const catDesc = state.db.meta.wellnessCategoryIndex?.[cat] || "";
    if (catDesc) {
      const intro = document.createElement("div");
      intro.id = "category-intro";
      intro.className = "category-intro";
      intro.innerHTML = `<h2 class="category-intro__title">${escapeHtml(catName)}</h2><p class="category-intro__desc">${escapeHtml(catDesc)}</p>`;
      els.grid.prepend(intro);
    }
  }

  updateHashFromState();
}

/* ------------------------------------------------------------------ */
/*  Wire up late-bound callbacks                                       */
/* ------------------------------------------------------------------ */

setCardCallbacks({ openDetail, updateSelectionToolbar });
setDetailCallbacks({ render, updateHash, readHashParams, writeHashParams });
setCompareCallbacks({ openDetail, updateSelectionToolbar, render });
setStatsCallbacks({ switchTab, render });
setTabCallbacks({ renderComparisonTable, renderStatsDashboard, updateHashFromState });
setRouterCallbacks({ render, switchTab, openDetail });
setKeyboardCallbacks({ closeDetail, showDetailAt, render });

/* ------------------------------------------------------------------ */
/*  Back to top                                                        */
/* ------------------------------------------------------------------ */

function initBackToTop() {
  if (!els.backToTop) return;
  const check = () => {
    els.backToTop.hidden = window.scrollY <= 400;
  };
  window.addEventListener("scroll", check, { passive: true });
  check();
  els.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ------------------------------------------------------------------ */
/*  Initialization                                                     */
/* ------------------------------------------------------------------ */

async function init() {
  loadTheme();

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    state.db = await res.json();
  } catch (err) {
    if (els.loadError) {
      els.loadError.hidden = false;
      els.loadError.textContent =
        `Could not load the peptide database. ${err.message || err}`;
    }
    if (els.grid) els.grid.removeAttribute("aria-busy");
    return;
  }

  document.title = `BadgerSkope \u2014 ${state.db.entries.length} Peptides`;
  state.doseLegend = state.db.meta?.doseGuidelinesLegend || {};
  state.bookmarks = loadBookmarks();
  if (els.disclaimer) els.disclaimer.textContent = state.db.disclaimer || "";
  if (els.footerMeta) {
    const built = state.db.meta?.builtAt || "";
    const ver = state.db.meta?.schemaVersion || "";
    els.footerMeta.textContent = [
      `${state.db.entries.length} entries`,
      ver ? `v${ver}` : "",
      built ? `Updated ${new Date(built).toLocaleDateString()}` : "",
    ]
      .filter(Boolean)
      .join(" \u00b7 ");
  }

  populateFilters();
  updateSelectionToolbar();
  updateBookmarksBar();
  applyHashOnLoad();

  // Filter events
  const debouncedRender = debounce(render, 150);
  if (els.search) els.search.addEventListener("input", debouncedRender);
  if (els.category) els.category.addEventListener("change", render);
  if (els.compound) els.compound.addEventListener("change", render);
  if (els.knownFor) els.knownFor.addEventListener("change", render);
  if (els.sort) els.sort.addEventListener("change", render);
  if (els.evidenceFilter) els.evidenceFilter.addEventListener("change", render);
  const groupByEl = document.getElementById("group-by");
  if (groupByEl) groupByEl.addEventListener("change", render);

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      els.search.value = "";
      els.category.value = "";
      els.compound.value = "";
      els.knownFor.value = "";
      if (els.evidenceFilter) els.evidenceFilter.value = "";
      els.sort.value = "title";
      render();
    });
  }

  // Selection actions
  if (els.selectVisible) {
    els.selectVisible.addEventListener("click", () => {
      for (const e of state.lastVisibleList) state.selectedIds.add(getEntryId(e));
      updateSelectionToolbar();
      render();
    });
  }

  if (els.clearSelection) {
    els.clearSelection.addEventListener("click", () => {
      state.selectedIds.clear();
      updateSelectionToolbar();
      render();
    });
  }

  if (els.viewSelected) {
    els.viewSelected.addEventListener("click", () => {
      const entries = selectedEntriesSorted();
      if (entries.length === 0) return;
      openDetail(entries[0], { multiQueue: entries });
    });
  }

  if (els.compareSelected) {
    els.compareSelected.addEventListener("click", () => {
      if (state.selectedIds.size >= 2) switchTab("compare");
    });
  }

  // Detail navigation
  if (els.detailPrev) {
    els.detailPrev.addEventListener("click", () => {
      if (state.detailIndex > 0) showDetailAt(state.detailIndex - 1);
    });
  }
  if (els.detailNext) {
    els.detailNext.addEventListener("click", () => {
      if (state.detailIndex < state.detailQueue.length - 1) showDetailAt(state.detailIndex + 1);
    });
  }
  if (els.detailClose) els.detailClose.addEventListener("click", closeDetail);
  if (els.dialog) {
    els.dialog.addEventListener("click", (e) => {
      if (e.target === els.dialog) closeDetail();
    });
  }

  // Tab navigation
  if (els.tabBrowse) els.tabBrowse.addEventListener("click", () => switchTab("browse"));
  if (els.tabCompare) els.tabCompare.addEventListener("click", () => switchTab("compare"));
  if (els.tabStats) els.tabStats.addEventListener("click", () => switchTab("stats"));

  // Theme toggle
  if (els.themeToggle) els.themeToggle.addEventListener("click", toggleTheme);

  // Back to top
  initBackToTop();

  // Keyboard shortcuts
  initKeyboard();

  // Shortcuts dialog
  const shortcutsClose = document.getElementById("shortcuts-close");
  if (shortcutsClose && els.shortcutsDialog) {
    shortcutsClose.addEventListener("click", () => els.shortcutsDialog.close());
  }
  if (els.shortcutsDialog) {
    els.shortcutsDialog.addEventListener("click", (e) => {
      if (e.target === els.shortcutsDialog) els.shortcutsDialog.close();
    });
  }

  // Hash change
  window.addEventListener("hashchange", () => {
    const params = readHashParams();
    if (params.entry) {
      const entry = getEntryByTitle(params.entry);
      if (entry) openDetail(entry);
    }
  });

  if (els.grid) els.grid.removeAttribute("aria-busy");

  // Initialize feature enhancements
  initRecent();
  initBookmarksToggle();
  initChips();
  initShare();
  initSearchEnhance();
  initGoals();
  initScroll();
  initNotes();
  initDoping();
  initInteractions();
}

init();
