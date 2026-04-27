/**
 * Experimental-entries toggle — a "Show experimental" checkbox in the
 * browse toolbar that controls whether entries without documented
 * side-effect data appear in the grid. Persists across visits.
 */

import { state } from "../state.js";

const STORAGE_KEY = "badgerskope.showExperimental";

export function initExperimentalToggle({ onChange } = {}) {
  const toolbar = document.querySelector(".browse-toolbar");
  if (!toolbar) return;

  try {
    state.showExperimental = localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    state.showExperimental = false;
  }

  const label = document.createElement("label");
  label.className = "experimental-toggle";
  label.title =
    "Show entries without documented side-effect data (early-stage, " +
    "preclinical, or grey-market peptides)";
  label.innerHTML =
    '<input type="checkbox"> <span>Show experimental</span>';
  toolbar.appendChild(label);

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
}
