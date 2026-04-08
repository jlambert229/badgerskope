/**
 * Global keyboard shortcuts.
 */

import { els } from "./dom.js";
import { state, getEntryId } from "./state.js";
import { toggleTheme } from "./theme.js";
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

    if (e.key === "/") {
      e.preventDefault();
      if (els.search) els.search.focus();
      return;
    }

    if (e.key === "?") {
      e.preventDefault();
      if (els.shortcutsDialog) {
        if (els.shortcutsDialog.open) els.shortcutsDialog.close();
        else els.shortcutsDialog.showModal();
      }
      return;
    }

    if (e.key === "t") {
      toggleTheme();
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

    if (e.key === "ArrowLeft" && els.dialog && els.dialog.open && state.detailQueue.length > 1) {
      if (state.detailIndex > 0 && _showDetailAt) _showDetailAt(state.detailIndex - 1);
      return;
    }
    if (e.key === "ArrowRight" && els.dialog && els.dialog.open && state.detailQueue.length > 1) {
      if (state.detailIndex < state.detailQueue.length - 1 && _showDetailAt) _showDetailAt(state.detailIndex + 1);
      return;
    }
  });
}
