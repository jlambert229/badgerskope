/**
 * Bookmarks filter toggle — adds a "Bookmarked only" checkbox to the
 * browse toolbar (always visible) and the selection bar (when entries selected).
 */

export function initBookmarksToggle() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  function applyFilter(checked) {
    grid.classList.toggle("grid--bookmarks-only", checked);
    setTimeout(() => {
      const allCards = document.querySelectorAll(".card");
      const visibleCards = checked
        ? document.querySelectorAll(".card.card--bookmarked")
        : allCards;
      const stats = document.getElementById("stats");
      if (stats && checked) {
        stats.textContent = `${visibleCards.length} BOOKMARKED OF ${allCards.length}`;
      }
    }, 50);
  }

  function syncAll(checked) {
    checkboxes.forEach((cb) => { cb.checked = checked; });
    applyFilter(checked);
  }

  const checkboxes = [];

  function createToggle(parent, position, label) {
    const toggle = document.createElement("label");
    toggle.className = "bookmarks-toggle";
    // Unique id per toggle instance so multiple bookmarks-toggles
    // (sticky bar + filter sheet) get distinct label-input associations.
    const inputId = "toggle-bookmarks-" + (checkboxes.length + 1);
    toggle.htmlFor = inputId;
    toggle.innerHTML = `<input type="checkbox" id="${inputId}" aria-label="${label}"> <span>${label}</span>`;
    if (position === "prepend") parent.prepend(toggle);
    else parent.appendChild(toggle);
    const cb = toggle.querySelector("input");
    checkboxes.push(cb);
    cb.addEventListener("change", () => syncAll(cb.checked));
    return toggle;
  }

  const stripToggles = document.getElementById("filter-strip-toggles")
    || document.querySelector(".filter-strip__toggles");
  if (stripToggles) createToggle(stripToggles, "append", "BOOKMARKED ONLY");

  const selActions = document.querySelector(".lib-selection-actions");
  if (selActions) createToggle(selActions, "prepend", "Bookmarked only");

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    if (document.querySelector("dialog[open]")) return;
    if (e.key === "f") {
      const current = checkboxes[0]?.checked || false;
      syncAll(!current);
    }
  });
}
