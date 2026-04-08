/**
 * BadgerSkope — Additional features module
 * Loaded after app.js, enhances the library with:
 * - Bookmarks-only filter toggle
 * - Click chip to filter by category
 * - Copy share link in detail modal
 * - Related entries via synergisticWith
 * - Recently viewed entries
 * - Search result text highlighting
 */

(function () {
  "use strict";

  /* ---- wait for app to load ---- */
  function waitForApp(cb, tries = 50) {
    if (document.getElementById("grid")?.children.length > 0 || tries <= 0) {
      cb();
    } else {
      setTimeout(() => waitForApp(cb, tries - 1), 200);
    }
  }

  waitForApp(init);

  /* ---- state ---- */
  const RECENT_KEY = "peptide-recent";
  const MAX_RECENT = 6;
  let recentIds = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");

  function saveRecent(id, title) {
    recentIds = recentIds.filter((r) => r.id !== id);
    recentIds.unshift({ id, title, ts: Date.now() });
    if (recentIds.length > MAX_RECENT) recentIds.length = MAX_RECENT;
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds));
    renderRecentBar();
  }

  /* ---- recently viewed bar ---- */
  function renderRecentBar() {
    let bar = document.getElementById("recent-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "recent-bar";
      bar.className = "recent-bar";
      const grid = document.getElementById("grid");
      if (grid) grid.parentNode.insertBefore(bar, grid);
    }
    if (recentIds.length === 0) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.innerHTML =
      '<span class="recent-bar__label">Recently viewed</span>' +
      recentIds
        .map(
          (r) =>
            `<button type="button" class="recent-bar__item" data-recent-id="${escapeAttr(r.id)}">${escapeAttr(r.title)}</button>`
        )
        .join("");
    bar.innerHTML += '<button type="button" class="recent-bar__clear" title="Clear history">&times;</button>';
    bar.querySelectorAll(".recent-bar__item").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.hash = "entry=" + encodeURIComponent(btn.textContent);
      });
    });
    bar.querySelector(".recent-bar__clear").addEventListener("click", () => {
      recentIds = [];
      localStorage.removeItem(RECENT_KEY);
      renderRecentBar();
    });
  }

  /* ---- bookmarks filter toggle ---- */
  function addBookmarksToggle() {
    const selBar = document.getElementById("selection-bar");
    if (!selBar) return;

    const toggle = document.createElement("label");
    toggle.className = "bookmarks-toggle";
    toggle.innerHTML =
      '<input type="checkbox" id="bookmarks-only"> <span>Bookmarked only</span>';
    selBar.querySelector(".selection-bar__actions")?.prepend(toggle);

    const cb = toggle.querySelector("input");
    cb.addEventListener("change", () => {
      document.querySelectorAll(".card").forEach((card) => {
        if (cb.checked && !card.classList.contains("card--bookmarked")) {
          card.style.display = "none";
        } else {
          card.style.display = "";
        }
      });
      // Update count
      const total = document.querySelectorAll(".card").length;
      const visible = document.querySelectorAll('.card:not([style*="display: none"])').length;
      const stats = document.getElementById("stats");
      if (stats && cb.checked) {
        stats.textContent = `Showing ${visible} of ${total} (bookmarked only)`;
      } else if (stats) {
        stats.textContent = `Showing ${total} of ${total}`;
      }
    });
  }

  /* ---- chip click to filter ---- */
  function addChipFiltering() {
    document.getElementById("grid")?.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      e.stopPropagation();
      const catKey = chip.textContent.trim().replace(/\s+/g, "_");
      const catSelect = document.getElementById("category");
      if (catSelect) {
        // Find matching option
        for (const opt of catSelect.options) {
          if (opt.value === catKey) {
            catSelect.value = catKey;
            catSelect.dispatchEvent(new Event("change"));
            catSelect.style.outline = "2px solid var(--accent)";
            setTimeout(() => { catSelect.style.outline = ""; }, 1500);
            // Scroll to top of grid
            document.getElementById("grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
        }
      }
    });
  }

  /* ---- share link in detail modal ---- */
  function addShareButton() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody) return;
      const title = detailBody.querySelector(".detail__title");
      if (!title || detailBody.querySelector(".share-btn")) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "share-btn";
      btn.textContent = "Copy link";
      btn.title = "Copy shareable link to this entry";
      btn.addEventListener("click", () => {
        const url = window.location.origin + window.location.pathname + "#entry=" + encodeURIComponent(title.textContent);
        function done() {
          btn.textContent = "Copied!";
          btn.classList.add("share-btn--done");
          setTimeout(() => { btn.textContent = "Copy link"; btn.classList.remove("share-btn--done"); }, 2000);
        }
        function fallback(u) {
          prompt("Copy this link:", u);
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(done).catch(() => fallback(url));
        } else {
          fallback(url);
        }
      });

      // Insert after the title or bookmark btn
      const header = detailBody.querySelector(".detail__header");
      if (header) header.appendChild(btn);
      else title.after(btn);
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- related entries in detail ---- */
  function addRelatedEntries() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".related-entries")) return;

      // Find synergy pills to get related titles
      const pills = detailBody.querySelectorAll(".synergy-pill");
      if (pills.length === 0) return;

      const relatedTitles = new Set();
      pills.forEach((p) => relatedTitles.add(p.dataset.synergyTitle));

      if (relatedTitles.size === 0) return;

      const section = document.createElement("div");
      section.className = "detail__section related-entries";
      section.innerHTML = `<h3>Related entries</h3>
        <div class="related-grid">${[...relatedTitles]
          .slice(0, 6)
          .map(
            (t) =>
              `<button type="button" class="related-card" data-title="${escapeAttr(t)}">
                <span class="related-card__title">${escapeAttr(t)}</span>
                <span class="related-card__arrow">&rarr;</span>
              </button>`
          )
          .join("")}</div>`;

      detailBody.appendChild(section);

      section.querySelectorAll(".related-card").forEach((card) => {
        card.addEventListener("click", () => {
          // Use synergy pill click logic
          const pill = detailBody.querySelector(`.synergy-pill[data-synergy-title="${card.dataset.title}"]`);
          if (pill) pill.click();
        });
      });
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- track recently viewed ---- */
  function trackRecentViews() {
    const dialog = document.getElementById("detail-dialog");
    if (!dialog) return;

    const observer = new MutationObserver(() => {
      if (!dialog.open) return;
      const title = document.getElementById("detail-title");
      if (!title) return;
      const entryTitle = title.textContent;
      // Find the entry ID from the detail body
      const bookmarkBtn = document.getElementById("detail-body")?.querySelector(".detail__bookmark-btn");
      const id = bookmarkBtn?.dataset.entryId || entryTitle;
      saveRecent(id, entryTitle);
    });

    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  }

  /* ---- search highlighting ---- */
  function addSearchHighlighting() {
    const search = document.getElementById("search");
    if (!search) return;

    let lastQ = "";
    const highlightInterval = setInterval(() => {
      const q = search.value.trim().toLowerCase();
      if (q === lastQ) return;
      lastQ = q;

      document.querySelectorAll(".card__summary, .card__distinctive").forEach((el) => {
        // Reset to original text
        if (el.dataset.original) {
          el.textContent = el.dataset.original;
        }
        if (!q || q.length < 2) return;

        if (!el.dataset.original) el.dataset.original = el.textContent;
        const text = el.textContent;
        const idx = text.toLowerCase().indexOf(q);
        if (idx === -1) return;

        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + q.length);
        const after = text.slice(idx + q.length);
        el.innerHTML = escapeAttr(before) + '<mark class="search-hl">' + escapeAttr(match) + "</mark>" + escapeAttr(after);
      });
    }, 300);
  }

  /* ---- helpers ---- */
  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---- scroll progress indicator ---- */
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

  /* ---- active filter count badge on Browse tab ---- */
  function trackActiveFilters() {
    const browseTab = document.getElementById("tab-browse");
    if (!browseTab) return;

    const check = () => {
      let count = 0;
      const s = document.getElementById("search");
      if (s && s.value.trim()) count++;
      ["category", "compound", "known-for", "evidence-filter"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value) count++;
      });
      if (count > 0) {
        browseTab.textContent = `Browse (${count} filter${count > 1 ? 's' : ''})`;
      } else {
        browseTab.textContent = "Browse";
      }
    };

    // Poll since we can't easily hook into all filter changes
    setInterval(check, 500);
  }

  /* ---- smooth card count transition ---- */
  function addCountAnimation() {
    const stats = document.getElementById("stats");
    if (!stats) return;
    const observer = new MutationObserver(() => {
      stats.style.transform = "scale(1.05)";
      stats.style.transition = "transform 0.2s";
      setTimeout(() => { stats.style.transform = ""; }, 200);
    });
    observer.observe(stats, { childList: true, characterData: true, subtree: true });
  }

  /* ---- keyboard navigation for cards ---- */
  function addCardKeyNav() {
    const grid = document.getElementById("grid");
    if (!grid) return;

    grid.addEventListener("keydown", (e) => {
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const cards = [...grid.querySelectorAll(".card__main")];
      const current = document.activeElement;
      const idx = cards.indexOf(current);
      if (idx === -1) return;

      e.preventDefault();
      let next = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(idx + 1, cards.length - 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(idx - 1, 0);
      cards[next]?.focus();
    });
  }

  /* ---- auto-close mobile nav on hash change ---- */
  function autoCloseNav() {
    window.addEventListener("hashchange", () => {
      const toggle = document.getElementById("nav-toggle");
      if (toggle && toggle.checked) toggle.checked = false;
    });
  }

  /* ---- init ---- */
  function init() {
    addBookmarksToggle();
    addChipFiltering();
    addShareButton();
    addRelatedEntries();
    trackRecentViews();
    addSearchHighlighting();
    renderRecentBar();
    addScrollProgress();
    trackActiveFilters();
    addCountAnimation();
    addCardKeyNav();
    autoCloseNav();

    // Keyboard shortcut: "f" toggles bookmarks filter
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "f") {
        const cb = document.getElementById("bookmarks-only");
        if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event("change")); }
      }
    });
  }
})();
