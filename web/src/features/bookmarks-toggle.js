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
        stats.textContent = `Showing ${visibleCards.length} bookmarked of ${allCards.length}`;
      }
    }, 50);
  }

  function syncAll(checked) {
    checkboxes.forEach((cb) => { cb.checked = checked; });
    applyFilter(checked);
  }

  const checkboxes = [];

  function createToggle(parent, position) {
    const toggle = document.createElement("label");
    toggle.className = "bookmarks-toggle";
    toggle.innerHTML = '<input type="checkbox"> <span>Bookmarked only</span>';
    if (position === "prepend") parent.prepend(toggle);
    else parent.appendChild(toggle);
    const cb = toggle.querySelector("input");
    checkboxes.push(cb);
    cb.addEventListener("change", () => syncAll(cb.checked));
    return toggle;
  }

  const toolbar = document.querySelector(".browse-toolbar");
  if (toolbar) createToggle(toolbar, "append");

  const selActions = document.querySelector(".selection-bar__actions");
  if (selActions) createToggle(selActions, "prepend");

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    if (document.querySelector("dialog[open]")) return;
    if (e.key === "f") {
      const current = checkboxes[0]?.checked || false;
      syncAll(!current);
    }
  });
}
