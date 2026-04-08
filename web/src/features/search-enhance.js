/**
 * Search enhancements — autocomplete dropdown and text highlighting.
 */

import { escapeHtml } from "../utils.js";

export function initSearchEnhance() {
  addSearchAutocomplete();
  addSearchHighlighting();
}

function addSearchAutocomplete() {
  const search = document.getElementById("search");
  if (!search) return;

  const dropdown = document.createElement("div");
  dropdown.className = "search-autocomplete";
  dropdown.hidden = true;
  search.parentNode.style.position = "relative";
  search.parentNode.appendChild(dropdown);

  let debounceTimer;
  search.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = search.value.trim().toLowerCase();
      if (q.length < 2) { dropdown.hidden = true; return; }

      const allCards = document.querySelectorAll(".card");
      const matches = [];
      allCards.forEach(card => {
        const title = card.querySelector(".card__title")?.textContent || "";
        const category = card.querySelector(".card__category")?.textContent || "";
        const evidence = card.querySelector(".card__evidence-label")?.textContent || "";
        const summary = card.querySelector(".card__summary")?.textContent || "";
        if (title.toLowerCase().includes(q) || category.toLowerCase().includes(q) || summary.toLowerCase().includes(q)) {
          matches.push({ title, type: category, evidence, id: card.dataset.entryId });
        }
      });

      if (matches.length === 0 || matches.length > 8) { dropdown.hidden = true; return; }

      dropdown.innerHTML = matches.slice(0, 6).map(m =>
        `<button type="button" class="search-autocomplete__item" data-entry-title="${escapeHtml(m.title)}">
          <span class="search-autocomplete__title">${escapeHtml(m.title)}</span>
          <span class="search-autocomplete__meta">${escapeHtml(m.type)} · ${escapeHtml(m.evidence)}</span>
        </button>`
      ).join("");
      dropdown.hidden = false;

      dropdown.querySelectorAll(".search-autocomplete__item").forEach(item => {
        item.addEventListener("click", () => {
          dropdown.hidden = true;
          window.location.hash = "entry=" + encodeURIComponent(item.dataset.entryTitle);
        });
      });
    }, 200);
  });

  search.addEventListener("blur", () => {
    setTimeout(() => { dropdown.hidden = true; }, 200);
  });

  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dropdown.hidden = true;
  });
}

function addSearchHighlighting() {
  const search = document.getElementById("search");
  const grid = document.getElementById("grid");
  if (!search || !grid) return;

  function applyHighlight() {
    const q = search.value.trim().toLowerCase();
    grid.querySelectorAll(".card__summary").forEach((el) => {
      if (el.dataset.original) {
        el.textContent = el.dataset.original;
      }
      if (!q || q.length < 2) return;
      if (!el.dataset.original) el.dataset.original = el.textContent;

      const text = el.textContent;
      const words = q.split(/\s+/).filter(w => w.length >= 2);
      if (words.length === 0) return;

      const word = words[0];
      const idx = text.toLowerCase().indexOf(word);
      if (idx === -1) return;

      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + word.length);
      const after = text.slice(idx + word.length);
      el.innerHTML = escapeHtml(before) + '<mark class="search-hl">' + escapeHtml(match) + '</mark>' + escapeHtml(after);
    });
  }

  const observer = new MutationObserver(() => {
    requestAnimationFrame(applyHighlight);
  });
  observer.observe(grid, { childList: true });

  search.addEventListener("input", () => {
    requestAnimationFrame(applyHighlight);
  });
}
