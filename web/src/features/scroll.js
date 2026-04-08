/**
 * Scroll progress bar and reading tracker dots.
 */

const READ_KEY = "peptide-read";
let readEntries = new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));

function saveReadList() {
  localStorage.setItem(READ_KEY, JSON.stringify([...readEntries]));
}

function addScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.prepend(bar);
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
    bar.style.width = pct + "%";
  }, { passive: true });
}

function applyReadState() {
  document.querySelectorAll(".card").forEach(card => {
    if (readEntries.has(card.dataset.entryId)) {
      card.classList.add("card--read");
    }
  });
  updateReadCount();
}

function updateReadCount() {
  const stats = document.getElementById("stats");
  if (!stats) return;
  const total = document.querySelectorAll(".card").length;
  const read = document.querySelectorAll(".card--read").length;
  if (read > 0 && total > 0) {
    const existing = stats.textContent;
    if (!existing.includes("read")) {
      stats.textContent = existing + ` \u00b7 ${read} read`;
    }
  }
}

function addReadTracking() {
  const dialog = document.getElementById("detail-dialog");
  if (!dialog) return;

  const observer = new MutationObserver(() => {
    if (!dialog.open) return;
    const bookmarkBtn = document.getElementById("detail-body")?.querySelector(".detail__bookmark-btn");
    const entryId = bookmarkBtn?.dataset.entryId;
    if (entryId && !readEntries.has(entryId)) {
      readEntries.add(entryId);
      saveReadList();
      const card = document.querySelector(`.card[data-entry-id="${CSS.escape(entryId)}"]`);
      if (card) card.classList.add("card--read");
      updateReadCount();
    }
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });

  applyReadState();

  const grid = document.getElementById("grid");
  if (grid) {
    const gridObserver = new MutationObserver(applyReadState);
    gridObserver.observe(grid, { childList: true });
  }
}

export function initScroll() {
  addScrollProgress();
  addReadTracking();
}
