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
import { GROUP_THEME_LABELS, getGroupKey, getGroupLabel, getGroupOrder } from "./groups.js";
import { tierForKey } from "./constants.js";
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
import { initBookmarksToggle } from "./features/bookmarks-toggle.js";
import { initChips } from "./features/chips.js";
import { initShare } from "./features/share.js";
import { initSearchEnhance } from "./features/search-enhance.js";
import { initScroll } from "./features/scroll.js";
import { initNotes } from "./features/notes.js";
import { initDoping } from "./features/doping.js";
import { initInteractions } from "./features/interactions.js";
import { initGlossaryTooltips } from "./features/glossary-tooltips.js";
import { initSportFilter } from "./features/sport-filter.js";
import { initExperimentalToggle } from "./features/experimental-toggle.js";
import { initMobileFilterSheet } from "./features/mobile-filter-sheet.js";

/* ------------------------------------------------------------------ */
/*  Default-state, chip row, count, empty-state helpers                */
/* ------------------------------------------------------------------ */

const DEFAULT_VISIBLE_LIMIT = 25;

// Flipped to true the first time any filter / sort / group control changes.
// Lets us apply the "populated landing" override (evidence sort + cap) only
// before the user has touched anything — otherwise we'd hijack their explicit
// "Name A–Z" sort selection by re-applying the evidence-tier sort.
let userHasInteracted = false;
function markInteracted() { userHasInteracted = true; }

/** True when no user filter or non-default sort/group is active AND the user
 *  has not touched any control yet. */
function isDefaultState({ q, cat, comp, known, ev, sortMode, groupBy }) {
  if (userHasInteracted) return false;
  return !q && !cat && !comp && !known && !ev && (!sortMode || sortMode === "title") && !groupBy;
}

/** Reset every filter / sort / group control back to its default. */
function clearAllFilters() {
  if (els.search) els.search.value = "";
  if (els.category) els.category.value = "";
  if (els.compound) els.compound.value = "";
  if (els.knownFor) els.knownFor.value = "";
  if (els.evidenceFilter) els.evidenceFilter.value = "";
  if (els.sort) els.sort.value = "title";
  const groupByEl = document.getElementById("group-by");
  if (groupByEl) groupByEl.value = "";
}

/** Friendly label for a select-control option (uses the option's text). */
function readSelectLabel(selectEl, value) {
  if (!selectEl || !value) return "";
  const opt = [...selectEl.options].find((o) => o.value === value);
  return (opt?.textContent || value).trim();
}

/** Render a single chip button. Returns the element. */
function buildChip({ label, valueText, onRemove }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "chip-active";
  btn.setAttribute("aria-label", `Remove filter: ${label}: ${valueText}`);
  btn.innerHTML =
    `<span class="chip-active__x" aria-hidden="true">&times;</span>` +
    `<span class="chip-active__label">${escapeHtml(label)}:</span> ` +
    `<span class="chip-active__value">${escapeHtml(valueText)}</span>`;
  btn.addEventListener("click", () => {
    onRemove();
    render();
  });
  return btn;
}

/** Re-render the active-filter chip row from current filter state. */
function renderActiveFilters() {
  const container = document.getElementById("active-filters");
  if (!container) return;
  container.replaceChildren();

  const q = els.search?.value.trim() || "";
  const cat = els.category?.value || "";
  const comp = els.compound?.value || "";
  const known = els.knownFor?.value || "";
  const ev = els.evidenceFilter?.value || "";
  const sortMode = els.sort?.value || "";
  const groupByEl = document.getElementById("group-by");
  const groupBy = groupByEl?.value || "";

  const chips = [];

  if (q) {
    chips.push(buildChip({
      label: "SEARCH",
      valueText: q.toUpperCase(),
      onRemove: () => { if (els.search) els.search.value = ""; },
    }));
  }
  if (cat) {
    chips.push(buildChip({
      label: "WELLNESS",
      valueText: (readSelectLabel(els.category, cat) || cat).toUpperCase(),
      onRemove: () => { if (els.category) els.category.value = ""; },
    }));
  }
  if (comp) {
    chips.push(buildChip({
      label: "SUBSTANCE",
      valueText: (readSelectLabel(els.compound, comp) || comp).toUpperCase(),
      onRemove: () => { if (els.compound) els.compound.value = ""; },
    }));
  }
  if (known) {
    const themeLabel = GROUP_THEME_LABELS[known] || known.replace(/_/g, " ");
    chips.push(buildChip({
      label: "THEME",
      valueText: themeLabel.toUpperCase(),
      onRemove: () => { if (els.knownFor) els.knownFor.value = ""; },
    }));
  }
  if (ev) {
    const tier = tierForKey(ev);
    const tierText = tier?.grade ? `${tier.grade} — ${tier.label}` : ev;
    chips.push(buildChip({
      label: "TIER",
      valueText: tierText.toUpperCase(),
      onRemove: () => { if (els.evidenceFilter) els.evidenceFilter.value = ""; },
    }));
  }
  if (sortMode && sortMode !== "title") {
    chips.push(buildChip({
      label: "SORT",
      valueText: (readSelectLabel(els.sort, sortMode) || sortMode).toUpperCase(),
      onRemove: () => { if (els.sort) els.sort.value = "title"; },
    }));
  }
  if (groupBy) {
    chips.push(buildChip({
      label: "GROUP",
      valueText: (readSelectLabel(groupByEl, groupBy) || groupBy).toUpperCase(),
      onRemove: () => { if (groupByEl) groupByEl.value = ""; },
    }));
  }

  for (const chip of chips) container.appendChild(chip);
  // CSS :empty selector handles collapse, but also flag the state for tests/styling.
  container.classList.toggle("active-filters--has-chips", chips.length > 0);
}

/** Update the "Showing N of M entries" line. */
function renderRowCount(visibleCount, totalCount) {
  const el = document.getElementById("row-count");
  if (!el) return;
  if (totalCount <= 0) {
    el.textContent = "";
    return;
  }
  el.textContent = `Showing ${visibleCount} of ${totalCount} entries`;
}

/** Build the brutalist empty-state panel for 0-result filter combos.
 *  Keeps `.empty` as a compatibility class so existing tests/selectors still work.
 *
 *  Copy is intentionally subversive (audit #1b): the marketing voice is
 *  receipts-first, so an empty result is a chance to lean in, not apologize.
 *  One headline is picked per session so the same user doesn't see three
 *  different jokes within one filter sweep. */
const SARCASTIC_EMPTY_HEADINGS = [
  "Couldn't find that. Neither could PubMed.",
  "0 results. Try a real word.",
  "Empty. The good news is — that's exactly the kind of negative signal this site exists for.",
];
let _sessionEmptyHeading = null;
function pickSessionEmptyHeading() {
  if (_sessionEmptyHeading) return _sessionEmptyHeading;
  const idx = Math.floor(Math.random() * SARCASTIC_EMPTY_HEADINGS.length);
  _sessionEmptyHeading = SARCASTIC_EMPTY_HEADINGS[idx];
  return _sessionEmptyHeading;
}

function buildEmptyStatePanel(hiddenExperimental) {
  const panel = document.createElement("div");
  panel.className = "empty-state empty";
  panel.setAttribute("role", "status");

  const heading = document.createElement("p");
  heading.className = "empty-state__heading";
  heading.textContent = pickSessionEmptyHeading();
  panel.appendChild(heading);

  const hint = document.createElement("p");
  hint.className = "empty-state__hint";
  hint.textContent = hiddenExperimental > 0
    ? `${hiddenExperimental} experimental ${hiddenExperimental === 1 ? "entry is" : "entries are"} hidden behind the experimental toggle. Or clear the filters and start over.`
    : "Clear the filters and try a less specific query — or just clear and browse.";
  panel.appendChild(hint);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "empty-state__clear";
  btn.id = "empty-state-clear";
  btn.textContent = "CLEAR ALL FILTERS";
  btn.addEventListener("click", () => {
    clearAllFilters();
    render();
  });
  panel.appendChild(btn);

  return panel;
}

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

  const hasSafetyData = (e) => {
    const se = e.commonSideEffects;
    if (!se) return false;
    return (se.common?.length || 0) + (se.serious?.length || 0) > 0;
  };

  const matchesOtherFilters = (e) =>
    matchesSearch(e, q) &&
    matchesCategory(e, cat) &&
    matchesCompound(e, comp) &&
    matchesKnownFor(e, known) &&
    matchesEvidence(e, ev);

  const groupByForState = document.getElementById("group-by")?.value || "";
  const isDefault = isDefaultState({ q, cat, comp, known, ev, sortMode, groupBy: groupByForState });

  let list = state.db.entries.filter(
    (e) => (state.showExperimental || hasSafetyData(e)) && matchesOtherFilters(e),
  );
  // Default landing experience: sort by evidence (A → F) and cap to 25 so
  // first paint is "populated table" instead of headers + empty body.
  // The full set is one filter-touch away.
  if (isDefault) {
    list = sortEntries(list, "evidence");
    if (list.length > DEFAULT_VISIBLE_LIMIT) list = list.slice(0, DEFAULT_VISIBLE_LIMIT);
  } else {
    list = sortEntries(list, sortMode);
  }
  state.lastVisibleList = list;

  // Active-filter chips + row count update on every render.
  renderActiveFilters();
  renderRowCount(list.length, state.db.entries.length);

  const frag = document.createDocumentFragment();
  const selN = state.selectedIds.size;
  // Count only experimental entries that *would* match the active search /
  // filters, so the "X experimental hidden" hint is contextual instead of
  // always showing the database-wide total.
  const hiddenExperimental = state.showExperimental
    ? 0
    : state.db.entries.filter((e) => !hasSafetyData(e) && matchesOtherFilters(e)).length;
  if (els.stats) {
    const total = state.db.entries.length;
    let html = list.length === total
      ? `${total} COMPOUNDS LOGGED`
      : `${list.length} OF ${total} SHOWING`;
    if (hiddenExperimental > 0) {
      // Promote the experimental count to a click target so users can reveal them inline.
      html += ` \u00b7 ${hiddenExperimental} EXPERIMENTAL HIDDEN <button type="button" id="show-experimental-inline" class="lib-meta-strip__action">[SHOW]</button>`;
    }
    if (selN) html += ` \u00b7 ${selN} SELECTED`;
    els.stats.innerHTML = html;
    // Mirror the count to the off-screen live region for screen
    // readers \u2014 the visible #stats span is now aria-hidden inside
    // the H1 to avoid polluting the document outline.
    const liveStatus = document.getElementById("lib-status");
    if (liveStatus) {
      const plain = list.length === total
        ? `${total} compounds in library`
        : `Showing ${list.length} of ${total} compounds`;
      liveStatus.textContent = plain + (hiddenExperimental > 0 ? `, ${hiddenExperimental} experimental hidden` : "");
    }
    const showBtn = document.getElementById("show-experimental-inline");
    if (showBtn) {
      showBtn.addEventListener("click", () => {
        const cb = document.querySelector(".experimental-toggle input");
        if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change")); }
      });
    }
  }

  const hasFilters = q || cat || comp || known || ev;
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) resetBtn.hidden = !hasFilters;

  const resultCount = document.getElementById("result-count");
  if (resultCount) {
    if (hasFilters) {
      resultCount.textContent = `${list.length} RESULT${list.length !== 1 ? "S" : ""}`;
      resultCount.hidden = false;
    } else {
      resultCount.hidden = true;
    }
  }

  const groupBy = document.getElementById("group-by")?.value || "";

  if (list.length === 0) {
    frag.appendChild(buildEmptyStatePanel(hiddenExperimental));
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
setDetailCallbacks({ render, updateHash, readHashParams, writeHashParams, updateHashFromState });
setCompareCallbacks({ openDetail, updateSelectionToolbar, render });
setStatsCallbacks({ switchTab, render });
setTabCallbacks({ renderComparisonTable, renderStatsDashboard, updateHashFromState });
setRouterCallbacks({ render, switchTab, openDetail });
setKeyboardCallbacks({ closeDetail, showDetailAt, render });

/* ------------------------------------------------------------------ */
/*  Back to top                                                        */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Sticky offsets — measure nav + filter strip so the column header   */
/*  pins beneath both. Re-runs on resize.                              */
/* ------------------------------------------------------------------ */

function measureStickyOffsets() {
  const nav = document.getElementById("site-nav");
  const strip = document.getElementById("filter-strip");
  const navH = nav ? Math.round(nav.getBoundingClientRect().height) : 70;
  const stripH = strip ? Math.round(strip.getBoundingClientRect().height) : 110;
  const root = document.documentElement;
  root.style.setProperty("--nav-h", navH + "px");
  root.style.setProperty("--filter-strip-h", stripH + "px");
}

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
  if (els.disclaimer) {
    const full = state.db.disclaimer || "";
    // The data file's disclaimer field is overloaded with internal field-doc
    // copy after the first ~4 sentences. Render only the legal portion.
    const cutoff = full.indexOf(" Reported benefits");
    els.disclaimer.textContent = (cutoff > 0 ? full.slice(0, cutoff).trim() : full).replace(/\s+/g, " ");
  }
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

  // Bookmarks bar is now a toggle button — click flips the
  // BOOKMARKED-ONLY filter so users can narrow the library to their
  // saved entries from anywhere on the page. (Was visually styled
  // as a button but did nothing.)
  const bookmarksBar = document.getElementById("bookmarks-bar");
  if (bookmarksBar) {
    bookmarksBar.addEventListener("click", () => {
      // The bookmarks-toggle feature renders checkboxes both inside
      // the filter strip and (on mobile) inside the filter sheet.
      // Flip the FIRST one and let the feature module sync the rest.
      const cb = document.querySelector(".bookmarks-toggle input[type='checkbox']");
      if (!cb) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
      bookmarksBar.setAttribute("aria-pressed", String(cb.checked));
    });
  }

  // Filter events. Each change marks "user has interacted" so the
  // PR-D landing override (evidence-tier sort + 25-row cap) stops applying
  // and the user's explicit selections (incl. "Name A-Z") take effect.
  const debouncedRender = debounce(render, 150);
  const onFilterChange = () => { markInteracted(); render(); };
  const onSearchInput = () => { markInteracted(); debouncedRender(); };
  if (els.search) els.search.addEventListener("input", onSearchInput);
  if (els.category) els.category.addEventListener("change", onFilterChange);
  if (els.compound) els.compound.addEventListener("change", onFilterChange);
  if (els.knownFor) els.knownFor.addEventListener("change", onFilterChange);
  if (els.sort) els.sort.addEventListener("change", onFilterChange);
  if (els.evidenceFilter) els.evidenceFilter.addEventListener("change", onFilterChange);
  const groupByEl = document.getElementById("group-by");
  if (groupByEl) groupByEl.addEventListener("change", onFilterChange);

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      clearAllFilters();
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

  // Sticky offsets — measure nav + filter strip
  measureStickyOffsets();
  window.addEventListener("resize", measureStickyOffsets, { passive: true });
  // Also re-measure after fonts load (Oswald nav height shifts)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureStickyOffsets).catch(() => {});
  }

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

  // Help dialog
  const helpDialog = document.getElementById("help-dialog");
  const openHelp = document.getElementById("open-help");
  const helpClose = document.getElementById("help-close");
  if (openHelp && helpDialog) {
    openHelp.addEventListener("click", () => helpDialog.showModal());
  }
  if (helpClose && helpDialog) {
    helpClose.addEventListener("click", () => helpDialog.close());
  }
  if (helpDialog) {
    helpDialog.addEventListener("click", (e) => {
      if (e.target === helpDialog) helpDialog.close();
    });
  }

  // Start-here curated entry clicks
  document.addEventListener("bs:open-detail", (e) => {
    if (e.detail?.entry) openDetail(e.detail.entry);
  });

  // Hash change — re-apply filter state and tab/entry. Without this,
  // back/forward navigation through filter states wouldn't work.
  window.addEventListener("hashchange", () => {
    applyHashOnLoad();
  });

  if (els.grid) els.grid.removeAttribute("aria-busy");

  // Initialize feature enhancements
  initExperimentalToggle({ onChange: render });
  initBookmarksToggle();
  initChips();
  initShare();
  initSearchEnhance();
  initScroll();
  initNotes();
  initDoping();
  initSportFilter();
  initInteractions();
  initGlossaryTooltips();
  initMobileFilterSheet({ onApply: render, onReset: render });
}

init();
