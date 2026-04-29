/**
 * Library row rendering — editorial brutalist table layout.
 * Returns an <article class="card lib-row"> so feature modules that
 * query .card / .card__title / .card__summary / .card__category etc.
 * keep working.
 */

import { state, getEntryId } from './state.js';
import { escapeHtml, wellnessLabel, getDisplayName, getCatalogTitle } from './utils.js';
import { highestTier } from './constants.js';
import { toggleBookmark } from './bookmarks.js';

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
  const wellnessShort = topChip ? wellnessLabel(catIndex, topChip).short : "";

  const fileIndex = String(cardIndex + 1).padStart(4, "0");

  const article = document.createElement("article");
  article.className = "card lib-row" +
    (selected ? " card--selected" : "") +
    (isBookmarked ? " card--bookmarked" : "");
  article.dataset.entryId = id;
  article.dataset.catalogTitle = catalogTitle;
  article.dataset.grade = grade;
  article.style.setProperty("--evidence-color", tier.color);
  if (tier.tier === "unknown") {
    article.classList.add("card--evidence-dashed");
  }

  // ── INDEX (mono FILE №NNNN) ──────────────────────────────────────────
  const indexCell = document.createElement("div");
  indexCell.className = "lib-row__index card__file";
  indexCell.dataset.label = "FILE";
  indexCell.textContent = `FILE №${fileIndex}`;

  // ── COMPOUND (name + AKA stack) — clickable, opens detail ────────────
  const nameCell = document.createElement("button");
  nameCell.type = "button";
  nameCell.className = "lib-row__name card__main";
  nameCell.dataset.label = "COMPOUND";
  nameCell.setAttribute("aria-label", `View details for ${displayName}`);
  const titleEl = document.createElement("h2");
  titleEl.className = "lib-row__title card__title";
  titleEl.textContent = displayName;
  nameCell.appendChild(titleEl);
  if (catalogTitle && displayName !== catalogTitle) {
    const sku = document.createElement("p");
    sku.className = "lib-row__sku card__catalog-sku";
    sku.textContent = catalogTitle;
    nameCell.appendChild(sku);
  }
  nameCell.addEventListener("click", () => { if (_openDetail) _openDetail(entry); });

  // ── EVIDENCE chip ────────────────────────────────────────────────────
  const tierCell = document.createElement("div");
  tierCell.className = "lib-row__tier";
  tierCell.dataset.label = "EVIDENCE";
  tierCell.innerHTML = `
    <span class="tier" data-grade="${grade}">
      <span class="tier-letter">${grade}</span>
    </span>
    <span class="card__evidence-label lib-row__tier-label">${escapeHtml(tier.label)}</span>
  `;

  // ── WELLNESS chip ────────────────────────────────────────────────────
  const wellnessCell = document.createElement("div");
  wellnessCell.className = "lib-row__wellness";
  wellnessCell.dataset.label = "WELLNESS";
  if (wellnessShort) {
    wellnessCell.innerHTML = `<span class="card__category">${escapeHtml(wellnessShort)}</span>`;
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────
  const summaryCell = document.createElement("div");
  summaryCell.className = "lib-row__summary card__summary";
  summaryCell.dataset.label = "SUMMARY";
  summaryCell.textContent = summary;

  // ── ACTIONS (bookmark, select, open arrow) ───────────────────────────
  const actionsCell = document.createElement("div");
  actionsCell.className = "lib-row__actions";

  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.type = "button";
  bookmarkBtn.className = "lib-row__bookmark card__bookmark";
  bookmarkBtn.setAttribute("aria-label", `Bookmark ${displayName}`);
  bookmarkBtn.setAttribute("aria-pressed", String(isBookmarked));
  bookmarkBtn.title = isBookmarked
    ? `Remove ${displayName} from bookmarks`
    : `Bookmark ${displayName}`;
  bookmarkBtn.textContent = isBookmarked ? "★" : "☆";
  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBookmark(id);
    const nowOn = state.bookmarks.has(id);
    bookmarkBtn.textContent = nowOn ? "★" : "☆";
    bookmarkBtn.setAttribute("aria-pressed", String(nowOn));
    bookmarkBtn.title = nowOn
      ? `Remove ${displayName} from bookmarks`
      : `Bookmark ${displayName}`;
    article.classList.toggle("card--bookmarked", nowOn);
  });

  const selectLabel = document.createElement("label");
  selectLabel.className = "lib-row__select card__select";
  selectLabel.title = `Select ${displayName} for comparison`;
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = selected;
  cb.setAttribute("aria-label", `Select ${displayName}`);
  cb.addEventListener("click", (e) => e.stopPropagation());
  cb.addEventListener("change", () => {
    if (cb.checked) state.selectedIds.add(id);
    else state.selectedIds.delete(id);
    article.classList.toggle("card--selected", state.selectedIds.has(id));
    if (_updateSelectionToolbar) _updateSelectionToolbar();
  });
  selectLabel.appendChild(cb);

  // hidden compare button kept for keyboard / a11y access; the visible
  // affordance is the checkbox + selection toolbar
  const compareBtn = document.createElement("button");
  compareBtn.type = "button";
  compareBtn.className = "lib-row__compare card__compare-btn";
  compareBtn.textContent = selected ? "−" : "+";
  compareBtn.title = selected
    ? `Remove ${displayName} from comparison`
    : `Add ${displayName} to comparison`;
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
    const nowSelected = state.selectedIds.has(id);
    article.classList.toggle("card--selected", nowSelected);
    compareBtn.textContent = nowSelected ? "−" : "+";
    compareBtn.title = nowSelected
      ? `Remove ${displayName} from comparison`
      : `Add ${displayName} to comparison`;
    if (_updateSelectionToolbar) _updateSelectionToolbar();
  });

  actionsCell.appendChild(bookmarkBtn);
  actionsCell.appendChild(selectLabel);
  actionsCell.appendChild(compareBtn);

  article.appendChild(indexCell);
  article.appendChild(nameCell);
  article.appendChild(tierCell);
  article.appendChild(wellnessCell);
  article.appendChild(summaryCell);
  article.appendChild(actionsCell);

  // Whole-row click opens detail. Inner controls (bookmark / select cb /
  // compare / wellness chip) already stopPropagation so they keep their
  // own behavior. The .lib-row__name <button> still handles keyboard.
  article.addEventListener("click", (e) => {
    // Don't intercept clicks that originated on an interactive control
    // (their handlers already stopPropagation, but belt-and-braces for
    // anything we miss like form labels wrapping inputs).
    if (e.target.closest("button, a, input, label, .card__category, .chip")) return;
    if (_openDetail) _openDetail(entry);
  });

  // ── SAFETY pseudo-fields used by feature modules ────────────────────
  // Several feature modules (doping, scroll, sport-filter, search-enhance)
  // query .card__type / .card__meta-row / .card__meta. Keep an offscreen
  // .card__meta wrapper so those queries find something deterministic.
  const metaWrap = document.createElement("div");
  metaWrap.className = "card__meta lib-row__meta-srt";
  if (wellnessShort) {
    metaWrap.innerHTML = `<span class="card__category">${escapeHtml(wellnessShort)}</span>`;
  }
  article.appendChild(metaWrap);

  return article;
}
