/**
 * "Most looked-up compounds" curated picker.
 * Uses brand voice: mono uppercase labels, no tier color in foreground
 * (was failing 4.5:1 contrast against #0B0B0A). Border + hover use accent.
 */

import { getEntryByTitle } from "../state.js";
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

  // Place "most looked-up" between the masthead and the search input.
  // Falls back to inserting before the filter strip if the search is missing.
  const insertBefore = document.querySelector(".lib-search")
    || document.querySelector(".filter-strip");
  if (!insertBefore || !insertBefore.parentNode) return;

  const curated = CURATED_TITLES
    .map((t) => getEntryByTitle(t))
    .filter(Boolean)
    .slice(0, 5);

  if (curated.length === 0) return;

  const section = document.createElement("div");
  section.className = "start-here";
  section.innerHTML = `
    <strong class="start-here__title">Most looked-up compounds</strong>
    <p class="start-here__desc">Quick picks &mdash; tap to open the file.</p>
    <div class="start-here__actions">
      ${curated
        .map((entry) => {
          const name = getDisplayName(entry);
          return `<button type="button" class="start-here__btn" data-title="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
        })
        .join("")}
      <button type="button" class="start-here__btn start-here__btn--dismiss" aria-label="Dismiss">DISMISS</button>
    </div>
  `;

  insertBefore.parentNode.insertBefore(section, insertBefore);

  section
    .querySelectorAll(".start-here__btn:not(.start-here__btn--dismiss)")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const entry = getEntryByTitle(btn.dataset.title);
        if (entry) {
          const event = new CustomEvent("bs:open-detail", { detail: { entry } });
          document.dispatchEvent(event);
        }
      });
    });

  section
    .querySelector(".start-here__btn--dismiss")
    ?.addEventListener("click", () => {
      section.remove();
      localStorage.setItem(STORAGE_KEY, "1");
    });
}
