/**
 * Card rendering for the browse grid.
 */

import { state, getEntryId } from './state.js';
import { escapeHtml, formatCompoundType, wellnessLabel } from './utils.js';
import { highestTier, evidenceTierExplainer } from './constants.js';
import { toggleBookmark } from './bookmarks.js';

/* Late-bound callbacks injected by main.js to avoid circular deps */
let _openDetail = null;
let _updateSelectionToolbar = null;

export function setCardCallbacks({ openDetail, updateSelectionToolbar }) {
  _openDetail = openDetail;
  _updateSelectionToolbar = updateSelectionToolbar;
}

export function renderCard(entry, catIndex, cardIndex) {
  const title = entry.catalog?.title || "Untitled";
  const type = formatCompoundType(entry.compoundType);
  const summary = entry.researchSummary || "";
  const headline = entry.distinctiveQuality?.headline || "";
  const id = getEntryId(entry);
  const selected = state.selectedIds.has(id);
  const isBookmarked = state.bookmarks.has(id);
  const tier = highestTier(entry);

  const chips = (entry.wellnessCategories || [])
    .slice(0, 4)
    .map((k) => {
      const w = wellnessLabel(catIndex, k);
      return `<span class="chip" title="${escapeHtml(w.full)}">${escapeHtml(w.short)}</span>`;
    })
    .join("");

  const article = document.createElement("article");
  article.className = "card" +
    (selected ? " card--selected" : "") +
    (isBookmarked ? " card--bookmarked" : "");
  article.dataset.entryId = id;
  article.style.setProperty("--delay", `${Math.min(cardIndex * 40, 600)}ms`);
  article.style.setProperty("--evidence-color", tier.color);
  if (tier.tier === "unknown") {
    article.classList.add("card--evidence-dashed");
  }

  const head = document.createElement("div");
  head.className = "card__head";

  const label = document.createElement("label");
  label.className = "card__select";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = selected;
  cb.title = "Select for compare / batch view";
  cb.setAttribute("aria-label", `Select ${title}`);
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
  bookmarkBtn.setAttribute("aria-label", `Bookmark ${title}`);
  bookmarkBtn.textContent = isBookmarked ? "\u2605" : "\u2606";
  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBookmark(id);
    bookmarkBtn.textContent = state.bookmarks.has(id) ? "\u2605" : "\u2606";
    article.classList.toggle("card--bookmarked", state.bookmarks.has(id));
  });

  const headText = document.createElement("div");
  headText.className = "card__head-text";
  const h2 = document.createElement("h2");
  h2.className = "card__title";
  h2.textContent = title;
  headText.appendChild(h2);

  head.appendChild(label);
  head.appendChild(headText);
  head.appendChild(bookmarkBtn);

  const main = document.createElement("button");
  main.type = "button";
  main.className = "card__main";
  main.setAttribute("aria-label", `View details for ${title}`);
  main.innerHTML = `
    <div class="card__meta-row">
      ${type ? `<span class="card__type">${escapeHtml(type)}</span>` : ""}
      <span class="card__evidence-badge" style="background:${tier.color}" title="${escapeHtml(evidenceTierExplainer(tier.tier))}">${escapeHtml(tier.label)}</span>
    </div>
    ${headline ? `<p class="card__distinctive">${escapeHtml(headline)}</p>` : ""}
    <p class="card__summary">${escapeHtml(summary)}</p>
    <div class="card__chips">${chips}</div>
    <span class="card__hint">View details \u2192</span>
  `;
  main.addEventListener("click", () => {
    article.style.transform = "scale(0.98)";
    setTimeout(() => {
      article.style.transform = "";
      if (_openDetail) _openDetail(entry);
    }, 50);
  });

  article.appendChild(head);
  article.appendChild(main);
  return article;
}
