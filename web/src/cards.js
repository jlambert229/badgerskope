/**
 * Card rendering for the browse grid.
 */

import { state, getEntryId } from './state.js';
import { escapeHtml, wellnessLabel, getDisplayName, getCatalogTitle } from './utils.js';
import { highestTier } from './constants.js';
import { toggleBookmark } from './bookmarks.js';

/* Late-bound callbacks injected by main.js to avoid circular deps */
let _openDetail = null;
let _updateSelectionToolbar = null;

export function setCardCallbacks({ openDetail, updateSelectionToolbar }) {
  _openDetail = openDetail;
  _updateSelectionToolbar = updateSelectionToolbar;
}

export function renderCard(entry, catIndex, cardIndex) {
  const catalogTitle = getCatalogTitle(entry);
  const displayName = getDisplayName(entry);
  const summary = entry.researchSummary || "";
  const id = getEntryId(entry);
  const selected = state.selectedIds.has(id);
  const isBookmarked = state.bookmarks.has(id);
  const tier = highestTier(entry);
  const grade = tier.grade || "F";

  const topChip = (entry.wellnessCategories || [])[0];
  const chipHtml = topChip
    ? `<span class="card__category">${escapeHtml(wellnessLabel(catIndex, topChip).short)}</span>`
    : "";

  const fileIndex = String(cardIndex + 1).padStart(4, "0");

  const article = document.createElement("article");
  article.className = "card" +
    (selected ? " card--selected" : "") +
    (isBookmarked ? " card--bookmarked" : "");
  article.dataset.entryId = id;
  article.dataset.catalogTitle = catalogTitle;
  article.dataset.grade = grade;
  article.style.setProperty("--evidence-color", tier.color);
  if (tier.tier === "unknown") {
    article.classList.add("card--evidence-dashed");
  }

  // \u2500\u2500 HEAD: file index + bookmark \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const head = document.createElement("div");
  head.className = "card__head";

  const fileTag = document.createElement("span");
  fileTag.className = "card__file";
  fileTag.textContent = `FILE\u00a0\u2116${fileIndex}`;

  const label = document.createElement("label");
  label.className = "card__select";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = selected;
  cb.title = "Select for compare / batch view";
  cb.setAttribute("aria-label", `Select ${displayName}`);
  cb.addEventListener("click", (e) => e.stopPropagation());
  cb.addEventListener("change", () => {
    if (cb.checked) state.selectedIds.add(id);
    else state.selectedIds.delete(id);
    article.classList.toggle("card--selected", state.selectedIds.has(id));
    if (_updateSelectionToolbar) _updateSelectionToolbar();
  });
  label.appendChild(cb);

  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.type = "button";
  bookmarkBtn.className = "card__bookmark";
  bookmarkBtn.setAttribute("aria-label", `Bookmark ${displayName}`);
  bookmarkBtn.textContent = isBookmarked ? "\u2605" : "\u2606";
  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBookmark(id);
    bookmarkBtn.textContent = state.bookmarks.has(id) ? "\u2605" : "\u2606";
    article.classList.toggle("card--bookmarked", state.bookmarks.has(id));
  });

  head.appendChild(fileTag);
  head.appendChild(label);
  head.appendChild(bookmarkBtn);

  // \u2500\u2500 TITLE BLOCK \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const headText = document.createElement("div");
  headText.className = "card__head-text";
  const h2 = document.createElement("h2");
  h2.className = "card__title";
  h2.textContent = displayName;
  headText.appendChild(h2);
  if (catalogTitle && displayName !== catalogTitle) {
    const sku = document.createElement("p");
    sku.className = "card__catalog-sku";
    sku.textContent = catalogTitle;
    headText.appendChild(sku);
  }

  // \u2500\u2500 MAIN: tier chip + summary + meta \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const main = document.createElement("button");
  main.type = "button";
  main.className = "card__main";
  main.setAttribute("aria-label", `View details for ${displayName}`);
  main.innerHTML = `
    <div class="card__evidence-row">
      <span class="tier" data-grade="${grade}">
        <span class="tier-letter">${grade}</span>
      </span>
      <span class="card__evidence-label">${escapeHtml(tier.label)}</span>
    </div>
    <p class="card__summary">${escapeHtml(summary)}</p>
    ${chipHtml ? `<div class="card__meta">${chipHtml}</div>` : ""}
  `;
  main.addEventListener("click", () => {
    if (_openDetail) _openDetail(entry);
  });

  // \u2500\u2500 FOOT: compare action \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const compareBtn = document.createElement("button");
  compareBtn.type = "button";
  compareBtn.className = "card__compare-btn";
  compareBtn.textContent = selected ? "\u2212 REMOVE" : "+ COMPARE";
  compareBtn.setAttribute("aria-label", `Toggle compare for ${displayName}`);
  compareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.selectedIds.has(id)) {
      state.selectedIds.delete(id);
      cb.checked = false;
    } else {
      state.selectedIds.add(id);
      cb.checked = true;
    }
    article.classList.toggle("card--selected", state.selectedIds.has(id));
    compareBtn.textContent = state.selectedIds.has(id) ? "\u2212 REMOVE" : "+ COMPARE";
    if (_updateSelectionToolbar) _updateSelectionToolbar();
  });

  article.appendChild(head);
  article.appendChild(headText);
  article.appendChild(main);
  article.appendChild(compareBtn);
  return article;
}
