/**
 * Bookmarks filter toggle — adds a "Bookmarked only" checkbox to the selection bar.
 */

export function initBookmarksToggle() {
  const selBar = document.getElementById("selection-bar");
  if (!selBar) return;

  const toggle = document.createElement("label");
  toggle.className = "bookmarks-toggle";
  toggle.innerHTML =
    '<input type="checkbox" id="bookmarks-only"> <span>Bookmarked only</span>';
  selBar.querySelector(".selection-bar__actions")?.prepend(toggle);

  const cb = toggle.querySelector("input");
  cb.addEventListener("change", () => {
    const grid = document.getElementById("grid");
    if (grid) {
      grid.classList.toggle("grid--bookmarks-only", cb.checked);
    }
    setTimeout(() => {
      const allCards = document.querySelectorAll(".card");
      const visibleCards = cb.checked
        ? document.querySelectorAll(".card.card--bookmarked")
        : allCards;
      const stats = document.getElementById("stats");
      if (stats && cb.checked) {
        stats.textContent = `Showing ${visibleCards.length} bookmarked of ${allCards.length}`;
      }
    }, 50);
  });

  // Keyboard shortcut: "f" toggles bookmarks filter
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    if (document.querySelector("dialog[open]")) return;
    if (e.key === "f") {
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change"));
    }
  });
}
