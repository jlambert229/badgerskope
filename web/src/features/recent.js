/**
 * Recently viewed entries bar — tracks last N viewed entries in localStorage.
 */

import { escapeHtml } from "../utils.js";

const RECENT_KEY = "peptide-recent";
const MAX_RECENT = 6;
let recentIds = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");

function saveRecent(id, title) {
  recentIds = recentIds.filter((r) => r.id !== id);
  recentIds.unshift({ id, title, ts: Date.now() });
  if (recentIds.length > MAX_RECENT) recentIds.length = MAX_RECENT;
  localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds));
  renderRecentBar();
}

function renderRecentBar() {
  let bar = document.getElementById("recent-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "recent-bar";
    bar.className = "recent-bar";
    const grid = document.getElementById("grid");
    if (grid) grid.parentNode.insertBefore(bar, grid);
  }
  if (recentIds.length === 0) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  bar.innerHTML =
    '<span class="recent-bar__label">Recently viewed</span>' +
    recentIds
      .map(
        (r) =>
          `<button type="button" class="recent-bar__item" data-recent-id="${escapeHtml(r.id)}">${escapeHtml(r.title)}</button>`
      )
      .join("");
  bar.innerHTML += '<button type="button" class="recent-bar__clear" title="Clear history">&times;</button>';
  bar.querySelectorAll(".recent-bar__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.hash = "entry=" + encodeURIComponent(btn.textContent);
    });
  });
  bar.querySelector(".recent-bar__clear").addEventListener("click", () => {
    recentIds = [];
    localStorage.removeItem(RECENT_KEY);
    renderRecentBar();
  });
}

function trackRecentViews() {
  const dialog = document.getElementById("detail-dialog");
  if (!dialog) return;

  const observer = new MutationObserver(() => {
    if (!dialog.open) return;
    setTimeout(() => {
      const title = document.getElementById("detail-title");
      if (!title) return;
      const entryTitle = title.textContent;
      const bookmarkBtn = document.getElementById("detail-body")?.querySelector(".detail__bookmark-btn");
      const id = bookmarkBtn?.dataset.entryId || entryTitle;
      saveRecent(id, entryTitle);
    }, 100);
  });

  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
}

export function initRecent() {
  renderRecentBar();
  trackRecentViews();
}
