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
};

export function getEntryId(entry) {
  return `title:${entry.catalog?.title || "unknown"}`;
}

export function getEntryById(id) {
  return state.db.entries.find((e) => getEntryId(e) === id);
}

export function getEntryByTitle(title) {
  return state.db.entries.find(
    (e) => (e.catalog?.title || "").toLowerCase() === title.toLowerCase()
  );
}
