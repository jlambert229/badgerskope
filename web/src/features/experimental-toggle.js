/**
 * Experimental-entries toggle — a "Show experimental" checkbox in the
 * browse toolbar that controls whether entries without documented
 * side-effect data appear in the grid. Persists across visits.
 */

import { state } from "../state.js";

const STORAGE_KEY = "badgerskope.showExperimental";

export function initExperimentalToggle({ onChange } = {}) {
  const slot = document.getElementById("filter-strip-toggles")
    || document.querySelector(".filter-strip__toggles");
  if (!slot) return;

  let stored = false;
  try {
    stored = localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    stored = false;
  }
  const changed = stored !== state.showExperimental;
  state.showExperimental = stored;

  const label = document.createElement("label");
  label.className = "experimental-toggle";
  label.title =
    "Show entries without documented side-effect data (early-stage, " +
    "preclinical, or grey-market peptides)";
  label.innerHTML =
    '<input type="checkbox"> <span>SHOW EXPERIMENTAL</span>';
  slot.appendChild(label);

  const cb = label.querySelector("input");
  cb.checked = state.showExperimental;

  cb.addEventListener("change", () => {
    state.showExperimental = cb.checked;
    try {
      localStorage.setItem(STORAGE_KEY, cb.checked ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (typeof onChange === "function") onChange();
  });

  // If the persisted value differed from the default, the initial render
  // already ran with the wrong filter. Trigger a re-render so the grid
  // matches the checkbox state.
  if (changed && typeof onChange === "function") onChange();
}
