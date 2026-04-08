/**
 * Interaction checker — highlights bookmarked compounds that overlap
 * in mechanism or category with the currently viewed entry.
 */

import { escapeHtml } from "../utils.js";

export function initInteractions() {
  const observer = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody || detailBody.querySelector(".interaction-check")) return;

    const titleEl = document.getElementById("detail-title");
    if (!titleEl) return;
    const currentTitle = titleEl.textContent;

    const currentCats = new Set(
      [...detailBody.querySelectorAll(".detail__cats .detail__badge")].map(b => b.textContent.trim())
    );
    const currentType = detailBody.querySelector(".detail__compound-type")?.textContent?.trim() || "";

    const bookmarkedCards = document.querySelectorAll(".card.card--bookmarked");
    if (bookmarkedCards.length === 0) return;

    const overlaps = [];
    bookmarkedCards.forEach(card => {
      const title = card.querySelector(".card__title")?.textContent;
      if (!title || title === currentTitle) return;
      const cardType = card.querySelector(".card__type")?.textContent?.trim() || "";
      const cardChips = new Set([...card.querySelectorAll(".chip")].map(c => c.textContent.trim()));

      if (currentType && cardType && currentType === cardType) {
        overlaps.push({ title, reason: `Same type: ${cardType}` });
        return;
      }

      let shared = 0;
      currentCats.forEach(c => { if (cardChips.has(c)) shared++; });
      if (shared >= 2) {
        overlaps.push({ title, reason: `${shared} shared categories` });
      }
    });

    if (overlaps.length === 0) return;

    const section = document.createElement("div");
    section.className = "detail__section interaction-check";
    section.innerHTML = `
      <h3>Heads up \u2014 overlapping bookmarks</h3>
      <p class="detail__help">These bookmarked compounds share mechanisms or categories with this entry. Overlapping compounds may have additive effects or redundancies worth understanding.</p>
      <ul class="interaction-list">
        ${overlaps.map(o => `<li><strong>${escapeHtml(o.title)}</strong> <span class="interaction-reason">${escapeHtml(o.reason)}</span></li>`).join("")}
      </ul>
      <p class="detail__muted">This is not an interaction warning \u2014 just a heads-up that these compounds work in similar areas.</p>
    `;

    const disclaimer = detailBody.querySelector(".detail__disclaimer");
    if (disclaimer) detailBody.insertBefore(section, disclaimer);
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) observer.observe(dialog, { childList: true, subtree: true });
}
