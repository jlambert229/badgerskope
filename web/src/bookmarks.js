/**
 * Bookmark persistence and UI (localStorage-backed).
 */

import { state } from "./state.js";
import { els } from "./dom.js";

export function loadBookmarks() {
  try {
    const raw = localStorage.getItem("peptide-bookmarks");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveBookmarks() {
  localStorage.setItem("peptide-bookmarks", JSON.stringify([...state.bookmarks]));
  updateBookmarksBar();
}

export function toggleBookmark(id) {
  if (state.bookmarks.has(id)) state.bookmarks.delete(id);
  else state.bookmarks.add(id);
  saveBookmarks();
}

export function updateBookmarksBar() {
  if (!els.bookmarksBar) return;
  const n = state.bookmarks.size;
  const countEl = els.bookmarksBar.querySelector("#bookmarks-count") || els.bookmarksBar;
  countEl.textContent = String(n);
  els.bookmarksBar.hidden = n === 0;
}
