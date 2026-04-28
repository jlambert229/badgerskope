/**
 * Global keyboard shortcuts.
 */

import { els } from "./dom.js";
import { state, getEntryId } from "./state.js";
import { toggleBookmark } from "./bookmarks.js";

let _closeDetail = null;
let _showDetailAt = null;
let _render = null;

export function setKeyboardCallbacks({ closeDetail, showDetailAt, render }) {
  _closeDetail = closeDetail;
  _showDetailAt = showDetailAt;
  _render = render;
}

export function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const inInput = tag === "input" || tag === "textarea" || tag === "select";

    if (e.key === "Escape") {
      if (els.shortcutsDialog && els.shortcutsDialog.open) {
        els.shortcutsDialog.close();
        return;
      }
      if (els.dialog && els.dialog.open) {
        if (_closeDetail) _closeDetail();
        return;
      }
    }

    if (inInput) return;

    if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
      e.preventDefault();
      if (els.shortcutsDialog) {
        if (els.shortcutsDialog.open) els.shortcutsDialog.close();
        else els.shortcutsDialog.showModal();
      }
      return;
    }

    if (e.key === "/") {
      e.preventDefault();
      if (els.search) els.search.focus();
      return;
    }

    if (e.key === "h") {
      const helpDialog = document.getElementById("help-dialog");
      if (helpDialog && typeof helpDialog.showModal === "function") {
        if (!helpDialog.open) helpDialog.showModal();
      }
      return;
    }

    if (e.key === "b" && els.dialog && els.dialog.open) {
      const entry = state.detailQueue[state.detailIndex];
      if (entry) {
        toggleBookmark(getEntryId(entry));
        if (_showDetailAt) _showDetailAt(state.detailIndex);
        if (_render) _render();
      }
      return;
    }

    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && els.dialog && els.dialog.open) {
      // If a multi-detail queue is in flight, navigate within it.
      // Otherwise, fall back to the currently-visible filtered list so
      // single-card opens still get prev/next.
      let queue = state.detailQueue;
      let idx = state.detailIndex;
      if (queue.length <= 1 && Array.isArray(state.lastVisibleList) && state.lastVisibleList.length > 1) {
        queue = state.lastVisibleList;
        const current = state.detailQueue[0];
        const currentId = current ? getEntryId(current) : null;
        idx = currentId ? queue.findIndex((x) => getEntryId(x) === currentId) : -1;
        if (idx < 0) return;
        // Promote the visible list into the active queue so subsequent
        // navigation updates the position indicator correctly.
        state.detailQueue = queue;
        state.detailIndex = idx;
      }
      if (queue.length <= 1) return;
      if (e.key === "ArrowLeft" && idx > 0 && _showDetailAt) _showDetailAt(idx - 1);
      else if (e.key === "ArrowRight" && idx < queue.length - 1 && _showDetailAt) _showDetailAt(idx + 1);
      return;
    }
  });
}
