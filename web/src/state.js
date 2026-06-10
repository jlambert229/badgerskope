/**
 * Shared application state. Mutable singletons accessed across modules.
 */

export const state = {
  db: null,
  doseLegend: {},
  selectedIds: new Set(),
  lastVisibleList: [],
  detailQueue: [],
  detailIndex: 0,
  bookmarks: new Set(),
  activeTab: "browse",
  // Default ON: the full catalog is visible on first visit. Entries without
  // documented side-effect data are still labeled experimental; the toggle
  // lets users opt out (persisted in localStorage).
  showExperimental: true,
};

export function getEntryId(entry) {
  return `title:${entry.catalog?.title || "unknown"}`;
}

export function getEntryById(id) {
  return state.db.entries.find((e) => getEntryId(e) === id);
}

function normLookup(s) {
  return (s || "").trim().toLowerCase();
}

/** Resolve by catalog title or common drug name (case-insensitive). */
export function getEntryByTitle(title) {
  const q = normLookup(title);
  if (!q) return undefined;
  return state.db.entries.find((e) => {
    const t = normLookup(e.catalog?.title);
    const c = normLookup(e.catalog?.commonDrugName);
    return t === q || c === q;
  });
}
