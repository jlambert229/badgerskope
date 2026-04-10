/**
 * "Start here" curated section.
 * Shows a handful of well-known compounds with strong evidence for new visitors.
 * Picks entries by highest evidence tier so the first impression is credible.
 */

import { state, getEntryByTitle } from "../state.js";
import { highestTier } from "../constants.js";
import { escapeHtml, getDisplayName } from "../utils.js";

const CURATED_TITLES = [
  "Semaglutide",
  "BPC-157",
  "Tirzepatide",
  "Thymosin Alpha-1",
  "NAD+",
];

const STORAGE_KEY = "bs_start_here_dismissed";

export function initStartHere() {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const goalBar = document.querySelector(".goal-bar");
  if (!goalBar) return;

  const curated = CURATED_TITLES
    .map(t => getEntryByTitle(t))
    .filter(Boolean)
    .slice(0, 5);

  if (curated.length === 0) return;

  const section = document.createElement("div");
  section.className = "start-here";
  section.innerHTML = `
    <strong class="start-here__title">Most looked-up compounds</strong>
    <p class="start-here__desc">Not sure where to start? These are the compounds people search for most. Tap one to see the research.</p>
    <div class="start-here__actions">
      ${curated.map(entry => {
        const tier = highestTier(entry);
        const name = getDisplayName(entry);
        return `<button type="button" class="start-here__btn" data-title="${escapeHtml(name)}"
          style="border-color: ${tier.color}33; color: ${tier.color}; background: ${tier.color}11"
          >${escapeHtml(name)}</button>`;
      }).join("")}
      <button type="button" class="start-here__btn start-here__btn--dismiss">Dismiss</button>
    </div>
  `;

  goalBar.after(section);

  section.querySelectorAll(".start-here__btn:not(.start-here__btn--dismiss)").forEach(btn => {
    btn.addEventListener("click", () => {
      const entry = getEntryByTitle(btn.dataset.title);
      if (entry) {
        const event = new CustomEvent("bs:open-detail", { detail: { entry } });
        document.dispatchEvent(event);
      }
    });
  });

  section.querySelector(".start-here__btn--dismiss")?.addEventListener("click", () => {
    section.remove();
    localStorage.setItem(STORAGE_KEY, "1");
  });
}
