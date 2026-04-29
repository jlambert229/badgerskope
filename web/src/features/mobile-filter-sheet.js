/**
 * Mobile filter sheet (≤768px).
 *
 * Behaviour:
 *  - At ≤768px viewport width, hides the desktop `.filter-strip` via a
 *    body class, exposes a full-width `FILTERS · N` trigger button, and
 *    reparents the existing filter rows into a bottom-sheet body so the
 *    SAME control nodes (with their existing event listeners) are now
 *    inside the sheet — no state mirroring required.
 *  - At >768px, controls are reparented back to their original slots in
 *    the desktop strip and the trigger / sheet are hidden.
 *  - The `FILTERS · N` count badge stays in sync with the active-filter
 *    chip count by polling the `#active-filters` container via a
 *    MutationObserver (chips are the canonical source of truth set by
 *    `renderActiveFilters()` in main.js, so this avoids re-implementing
 *    the same accounting twice).
 *
 * No mirroring, no duplicate controls — single source of truth for state.
 */

const MOBILE_BREAKPOINT_PX = 768;

let isMobile = false;
let originalParents = []; // [{ node, parent, nextSibling }]

function getRows() {
  const strip = document.getElementById("filter-strip");
  if (!strip) return [];
  return Array.from(strip.querySelectorAll(".filter-strip__row"));
}

function reparentToSheet() {
  const sheetBody = document.getElementById("mobile-filter-sheet-body");
  if (!sheetBody) return;
  if (originalParents.length > 0) return; // already reparented
  const rows = getRows();
  for (const row of rows) {
    originalParents.push({
      node: row,
      parent: row.parentNode,
      nextSibling: row.nextSibling,
    });
    sheetBody.appendChild(row);
  }
}

function reparentBack() {
  if (originalParents.length === 0) return;
  for (const { node, parent, nextSibling } of originalParents) {
    if (!parent) continue;
    if (nextSibling && nextSibling.parentNode === parent) {
      parent.insertBefore(node, nextSibling);
    } else {
      parent.appendChild(node);
    }
  }
  originalParents = [];
}

function countActiveFilters() {
  const container = document.getElementById("active-filters");
  if (!container) return 0;
  return container.querySelectorAll(".chip-active").length;
}

function updateTriggerCount() {
  const countEl = document.getElementById("mobile-filter-count");
  if (!countEl) return;
  countEl.textContent = String(countActiveFilters());
}

function isSheetOpen() {
  const sheet = document.getElementById("mobile-filter-sheet");
  return !!(sheet && sheet.classList.contains("mobile-filter-sheet--open"));
}

function openSheet() {
  const sheet = document.getElementById("mobile-filter-sheet");
  const backdrop = document.getElementById("mobile-filter-backdrop");
  const trigger = document.getElementById("mobile-filter-trigger");
  if (!sheet || !backdrop) return;
  sheet.classList.add("mobile-filter-sheet--open");
  sheet.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  document.body.classList.add("is-mobile-filter-sheet-open");
  if (trigger) trigger.setAttribute("aria-expanded", "true");
  // Move focus to DONE button for keyboard users.
  const done = document.getElementById("mobile-filter-done");
  if (done) {
    try { done.focus({ preventScroll: true }); } catch { /* ignore */ }
  }
}

function closeSheet() {
  const sheet = document.getElementById("mobile-filter-sheet");
  const backdrop = document.getElementById("mobile-filter-backdrop");
  const trigger = document.getElementById("mobile-filter-trigger");
  if (!sheet || !backdrop) return;
  sheet.classList.remove("mobile-filter-sheet--open");
  sheet.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
  document.body.classList.remove("is-mobile-filter-sheet-open");
  if (trigger) {
    trigger.setAttribute("aria-expanded", "false");
    try { trigger.focus({ preventScroll: true }); } catch { /* ignore */ }
  }
}

function clearAllFiltersForSheet() {
  // Click each active-filter chip — their existing onRemove handlers
  // already update the underlying control state and call render().
  const container = document.getElementById("active-filters");
  if (!container) return;
  // Snapshot first because clicks remove the chip mid-iteration.
  const chips = Array.from(container.querySelectorAll(".chip-active"));
  for (const chip of chips) chip.click();
}

function applyBreakpoint() {
  const w = window.innerWidth || document.documentElement.clientWidth || 0;
  const nextIsMobile = w <= MOBILE_BREAKPOINT_PX;
  if (nextIsMobile === isMobile) return;
  isMobile = nextIsMobile;

  const trigger = document.getElementById("mobile-filter-trigger");

  if (isMobile) {
    document.body.classList.add("is-mobile-filters");
    reparentToSheet();
    if (trigger) trigger.hidden = false;
  } else {
    // Always close sheet first (and unlock body scroll) before tearing down.
    closeSheet();
    document.body.classList.remove("is-mobile-filters");
    reparentBack();
    if (trigger) trigger.hidden = true;
  }
  updateTriggerCount();
}

export function initMobileFilterSheet({ onApply, onReset } = {}) {
  const trigger = document.getElementById("mobile-filter-trigger");
  const done = document.getElementById("mobile-filter-done");
  const backdrop = document.getElementById("mobile-filter-backdrop");
  const reset = document.getElementById("mobile-filter-reset");
  const apply = document.getElementById("mobile-filter-apply");

  if (trigger) trigger.addEventListener("click", openSheet);
  if (done) done.addEventListener("click", closeSheet);
  if (backdrop) backdrop.addEventListener("click", closeSheet);
  if (apply) {
    apply.addEventListener("click", () => {
      if (typeof onApply === "function") onApply();
      closeSheet();
    });
  }
  if (reset) {
    reset.addEventListener("click", () => {
      clearAllFiltersForSheet();
      if (typeof onReset === "function") onReset();
      // Stay open after reset so the user sees a fresh, empty state — that
      // matches every reset pattern (Airbnb, Wayfair, etc.).
    });
  }

  // Esc closes when sheet open.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSheetOpen()) {
      e.preventDefault();
      closeSheet();
    }
  });

  // Active-filter chip count drives the badge.
  const activeContainer = document.getElementById("active-filters");
  if (activeContainer) {
    const obs = new MutationObserver(updateTriggerCount);
    obs.observe(activeContainer, { childList: true, subtree: true });
  }

  // Initial breakpoint pass + bind resize.
  applyBreakpoint();
  updateTriggerCount();
  window.addEventListener("resize", applyBreakpoint, { passive: true });
}
