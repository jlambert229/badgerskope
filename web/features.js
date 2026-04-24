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
      const grid = document.getElementById("grid");
      if (grid) {
        grid.classList.toggle("grid--bookmarks-only", cb.checked);
      }
      // Update visible count
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
      setTimeout(() => {
        const title = document.getElementById("detail-title");
        if (!title) return;
        const entryTitle = title.textContent;
        const bookmarkBtn = document.getElementById("detail-body")?.querySelector(".detail__bookmark-btn");
        const id = bookmarkBtn?.dataset.entryId || entryTitle;
        saveRecent(id, entryTitle);
      }, 100);
    });

    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  }

  /* ---- search highlighting ---- */
  function addSearchHighlighting() {
    const search = document.getElementById("search");
    const grid = document.getElementById("grid");
    if (!search || !grid) return;

    function applyHighlight() {
      const q = search.value.trim().toLowerCase();
      grid.querySelectorAll(".card__summary, .card__distinctive").forEach((el) => {
        // Restore original text
        if (el.dataset.original) {
          el.textContent = el.dataset.original;
        }
        if (!q || q.length < 2) return;
        if (!el.dataset.original) el.dataset.original = el.textContent;

        const text = el.textContent;
        const words = q.split(/\s+/).filter(w => w.length >= 2);
        if (words.length === 0) return;

        // Only highlight the first matching word to keep it simple
        const word = words[0];
        const idx = text.toLowerCase().indexOf(word);
        if (idx === -1) return;

        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + word.length);
        const after = text.slice(idx + word.length);
        el.innerHTML = escapeAttr(before) + '<mark class="search-hl">' + escapeAttr(match) + '</mark>' + escapeAttr(after);
      });
    }

    // Listen for grid re-renders
    const observer = new MutationObserver(() => {
      requestAnimationFrame(applyHighlight);
    });
    observer.observe(grid, { childList: true });

    search.addEventListener("input", () => {
      requestAnimationFrame(applyHighlight);
    });
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

  /* ---- personal notes per entry (localStorage) ---- */
  const NOTES_KEY = "peptide-notes";
  let userNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");

  function saveNotes() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(userNotes));
  }

  function addNotesFeature() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".user-notes")) return;
      const bookmarkBtn = detailBody.querySelector(".detail__bookmark-btn");
      const entryId = bookmarkBtn?.dataset.entryId;
      if (!entryId) return;

      const section = document.createElement("div");
      section.className = "detail__section user-notes";
      const existing = userNotes[entryId] || "";
      section.innerHTML = `
        <h3>Your private notes</h3>
        <p class="detail__help">Only stored on this device. Never sent anywhere.</p>
        <textarea class="user-notes__input" placeholder="Add your own notes about this compound..." rows="3">${escapeAttr(existing)}</textarea>
        <div class="user-notes__actions">
          <button type="button" class="user-notes__save">Save note</button>
          ${existing ? '<button type="button" class="user-notes__clear">Clear</button>' : ''}
        </div>
      `;

      const disclaimer = detailBody.querySelector(".detail__disclaimer");
      if (disclaimer) detailBody.insertBefore(section, disclaimer);
      else detailBody.appendChild(section);

      const textarea = section.querySelector("textarea");
      const saveBtn = section.querySelector(".user-notes__save");
      const clearBtn = section.querySelector(".user-notes__clear");

      saveBtn.addEventListener("click", () => {
        const val = textarea.value.trim();
        if (val) {
          userNotes[entryId] = val;
        } else {
          delete userNotes[entryId];
        }
        saveNotes();
        saveBtn.textContent = "Saved!";
        saveBtn.classList.add("user-notes__save--done");
        setTimeout(() => {
          saveBtn.textContent = "Save note";
          saveBtn.classList.remove("user-notes__save--done");
        }, 1500);
      });

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          textarea.value = "";
          delete userNotes[entryId];
          saveNotes();
          clearBtn.remove();
        });
      }
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- export selected entries as CSV ---- */
  function addExportFeature() {
    const selBar = document.getElementById("selection-bar");
    if (!selBar) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--ghost";
    btn.textContent = "Export CSV";
    btn.title = "Download selected entries as a CSV file";
    btn.disabled = true;
    btn.id = "export-csv";

    selBar.querySelector(".selection-bar__actions")?.appendChild(btn);

    // Watch selection count to enable/disable
    const observer = new MutationObserver(() => {
      const count = document.getElementById("selection-count");
      const n = parseInt(count?.textContent) || 0;
      btn.disabled = n === 0;
    });
    const countEl = document.getElementById("selection-count");
    if (countEl) observer.observe(countEl, { childList: true, characterData: true, subtree: true });

    btn.addEventListener("click", () => {
      const cards = document.querySelectorAll(".card--selected, .card[class*=selected]");
      if (cards.length === 0) return;

      const rows = [["Title", "Price", "Type", "Evidence", "Categories", "Summary"]];

      cards.forEach(card => {
        const title = card.querySelector(".card__title")?.textContent || "";
        const price = card.querySelector(".card__price")?.textContent || "";
        const type = card.querySelector(".card__type")?.textContent || "";
        const evidence = card.querySelector(".card__evidence-badge")?.textContent || "";
        const chips = [...card.querySelectorAll(".chip")].map(c => c.textContent).join("; ");
        const summary = card.querySelector(".card__summary")?.textContent || "";
        rows.push([title, price, type, evidence, chips, summary]);
      });

      const csv = rows.map(r => r.map(c => '"' + c.replace(/"/g, '""') + '"').join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "badgerskope-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* ---- print current detail view ---- */
  function addPrintButton() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".print-btn")) return;
      const header = detailBody.querySelector(".detail__hero-actions") || detailBody.querySelector(".detail__header");
      if (!header) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "print-btn";
      btn.textContent = "Print";
      btn.title = "Print this entry";
      btn.addEventListener("click", () => {
        window.print();
      });
      header.appendChild(btn);
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- similar compounds at bottom of detail ---- */
  function addSimilarCompounds() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".similar-compounds")) return;
      const title = document.getElementById("detail-title")?.textContent;
      if (!title) return;

      const allCards = document.querySelectorAll(".card");
      const currentChips = new Set(
        [...(detailBody.querySelectorAll(".detail__cats .detail__badge") || [])].map(b => b.textContent.trim())
      );
      const currentThemes = new Set(
        [...(detailBody.querySelectorAll(".detail__section--highlight .detail__badge") || [])].map(b => b.textContent.trim())
      );

      if (currentChips.size === 0 && currentThemes.size === 0) return;

      const scored = [];
      allCards.forEach(card => {
        const cardTitle = card.querySelector(".card__title")?.textContent;
        if (!cardTitle || cardTitle === title) return;
        const cardChips = new Set([...card.querySelectorAll(".chip")].map(c => c.textContent.trim()));
        let score = 0;
        currentChips.forEach(c => { if (cardChips.has(c)) score += 2; });
        const distinctive = card.querySelector(".card__distinctive")?.textContent || "";
        currentThemes.forEach(t => { if (distinctive.toLowerCase().includes(t.toLowerCase())) score += 1; });
        if (score > 0) scored.push({ title: cardTitle, score, id: card.dataset.entryId });
      });

      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, 4);
      if (top.length === 0) return;

      const section = document.createElement("div");
      section.className = "detail__section similar-compounds";
      section.innerHTML = `<h3>Similar compounds</h3>
        <p class="detail__help">Other entries in similar categories. Click to view.</p>
        <div class="related-grid">${top.map(s =>
          `<button type="button" class="related-card" data-title="${escapeAttr(s.title)}">
            <span class="related-card__title">${escapeAttr(s.title)}</span>
            <span class="related-card__arrow">&rarr;</span>
          </button>`
        ).join("")}</div>`;

      const disclaimer = detailBody.querySelector(".detail__disclaimer");
      if (disclaimer) detailBody.insertBefore(section, disclaimer);
      else detailBody.appendChild(section);

      section.querySelectorAll(".related-card").forEach(card => {
        card.addEventListener("click", () => {
          window.location.hash = "entry=" + encodeURIComponent(card.dataset.title);
        });
      });
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- reading list — mark entries as "read" ---- */
  const READ_KEY = "peptide-read";
  let readEntries = new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));

  function saveReadList() {
    localStorage.setItem(READ_KEY, JSON.stringify([...readEntries]));
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

  /* ---- quick unit reference tooltip ---- */
  function addUnitHelper() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.dataset.unitsProcessed) return;
      detailBody.dataset.unitsProcessed = "true";

      const prose = detailBody.querySelectorAll(".detail__prose, .detail__summary-prose, .detail__what-it-is, .doses td, .detail__benefits li, .detail__apps li");
      prose.forEach(el => {
        el.innerHTML = el.innerHTML
          .replace(/(\d+\.?\d*)\s*(mcg|µg)/gi, '<span class="unit-tip" title="micrograms — one millionth of a gram">$1 $2</span>')
          .replace(/(\d+\.?\d*)\s*mg\b/gi, '<span class="unit-tip" title="milligrams — one thousandth of a gram">$1 mg</span>')
          .replace(/(\d+\.?\d*)\s*IU\b/g, '<span class="unit-tip" title="International Units — a standardized measure of biological activity">$1 IU</span>')
          .replace(/\bsubcutaneous\b/gi, '<span class="unit-tip" title="Injected under the skin into the fat layer, not into muscle">subcutaneous</span>')
          .replace(/\bintramuscular\b/gi, '<span class="unit-tip" title="Injected into a muscle">intramuscular</span>')
          .replace(/\bHbA1c\b/g, '<span class="unit-tip" title="A blood test showing average blood sugar over 2-3 months">HbA1c</span>')
          .replace(/\bIGF-1\b/g, '<span class="unit-tip" title="Insulin-like Growth Factor 1 — a hormone that mediates growth hormone effects">IGF-1</span>')
          .replace(/\bBDNF\b/g, '<span class="unit-tip" title="Brain-Derived Neurotrophic Factor — supports brain cell growth and survival">BDNF</span>')
          .replace(/\bGLP-1\b/g, '<span class="unit-tip" title="A gut hormone that reduces appetite and controls blood sugar. Ozempic and Wegovy target this.">GLP-1</span>')
          .replace(/\bGIP\b/g, '<span class="unit-tip" title="A gut hormone that works with GLP-1 to regulate insulin and blood sugar">GIP</span>')
          .replace(/\bGHRH\b/g, '<span class="unit-tip" title="Growth Hormone Releasing Hormone — tells the pituitary to release growth hormone">GHRH</span>')
          .replace(/\bGHRP\b/g, '<span class="unit-tip" title="Growth Hormone Releasing Peptide — triggers growth hormone release via the ghrelin receptor">GHRP</span>')
          .replace(/\bbioavailability\b/gi, '<span class="unit-tip" title="How much of a substance actually reaches your bloodstream">bioavailability</span>')
          .replace(/\bsecretagogue\b/gi, '<span class="unit-tip" title="A substance that triggers your body to release its own hormones">secretagogue</span>')
          .replace(/\bincretin\b/gi, '<span class="unit-tip" title="A gut hormone that controls blood sugar and appetite after eating">incretin</span>')
          .replace(/\bhalf-life\b/gi, '<span class="unit-tip" title="How long until half the substance is eliminated from your body">half-life</span>')
          .replace(/\blyophilized\b/gi, '<span class="unit-tip" title="Freeze-dried — mixed with water before use">lyophilized</span>')
          .replace(/\breconstitution\b/gi, '<span class="unit-tip" title="Mixing a freeze-dried peptide with sterile water to create an injectable solution">reconstitution</span>')
          .replace(/\bNAD\+?\b/g, '<span class="unit-tip" title="A coenzyme in every cell, essential for energy production and DNA repair. Declines with age.">NAD+</span>')
          .replace(/\bpreclinical\b/gi, '<span class="unit-tip" title="Tested in animals or lab dishes, not yet in humans">preclinical</span>')
          .replace(/\bin vitro\b/gi, '<span class="unit-tip" title="Done in a test tube or petri dish, not in a living body">in vitro</span>')
          .replace(/\bin vivo\b/gi, '<span class="unit-tip" title="Done in a living organism (animal or human)">in vivo</span>');
      });
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- search autocomplete dropdown ---- */
  function addSearchAutocomplete() {
    const search = document.getElementById("search");
    if (!search) return;

    const dropdown = document.createElement("div");
    dropdown.className = "search-autocomplete";
    dropdown.hidden = true;
    search.parentNode.style.position = "relative";
    search.parentNode.appendChild(dropdown);

    let debounceTimer;
    search.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = search.value.trim().toLowerCase();
        if (q.length < 2) { dropdown.hidden = true; return; }

        const allCards = document.querySelectorAll(".card");
        const matches = [];
        allCards.forEach(card => {
          const title = card.querySelector(".card__title")?.textContent || "";
          const type = card.querySelector(".card__type")?.textContent || "";
          const evidence = card.querySelector(".card__evidence-badge")?.textContent || "";
          if (title.toLowerCase().includes(q) || type.toLowerCase().includes(q)) {
            matches.push({ title, type, evidence, id: card.dataset.entryId });
          }
        });

        if (matches.length === 0 || matches.length > 8) { dropdown.hidden = true; return; }

        dropdown.innerHTML = matches.slice(0, 6).map(m =>
          `<button type="button" class="search-autocomplete__item" data-entry-title="${escapeAttr(m.title)}">
            <span class="search-autocomplete__title">${escapeAttr(m.title)}</span>
            <span class="search-autocomplete__meta">${escapeAttr(m.type)} · ${escapeAttr(m.evidence)}</span>
          </button>`
        ).join("");
        dropdown.hidden = false;

        dropdown.querySelectorAll(".search-autocomplete__item").forEach(item => {
          item.addEventListener("click", () => {
            dropdown.hidden = true;
            window.location.hash = "entry=" + encodeURIComponent(item.dataset.entryTitle);
          });
        });
      }, 200);
    });

    search.addEventListener("blur", () => {
      setTimeout(() => { dropdown.hidden = true; }, 200);
    });

    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dropdown.hidden = true;
    });
  }

  /* ---- card quick preview on hover ---- */
  function addQuickPreview() {
    const grid = document.getElementById("grid");
    if (!grid) return;

    let previewEl = document.createElement("div");
    previewEl.className = "quick-preview";
    previewEl.hidden = true;
    document.body.appendChild(previewEl);

    let hoverTimer = null;
    let currentCard = null;

    grid.addEventListener("mouseover", (e) => {
      const card = e.target.closest(".card");
      if (!card || card === currentCard) return;
      clearTimeout(hoverTimer);
      currentCard = card;

      hoverTimer = setTimeout(() => {
        const title = card.querySelector(".card__title")?.textContent || "";
        const type = card.querySelector(".card__type")?.textContent || "";
        const evidence = card.querySelector(".card__evidence-badge")?.textContent || "";
        const summary = card.querySelector(".card__summary")?.textContent || "";
        const chips = [...card.querySelectorAll(".chip")].map(c => c.textContent).join(", ");
        const price = card.querySelector(".card__price")?.textContent || "";
        const isRead = card.classList.contains("card--read");

        previewEl.innerHTML = `
          <div class="quick-preview__header">
            <strong>${escapeAttr(title)}</strong>
            ${price ? `<span class="quick-preview__price">${escapeAttr(price)}</span>` : ""}
          </div>
          <div class="quick-preview__meta">${escapeAttr(type)} · ${escapeAttr(evidence)}${isRead ? ' · Read' : ''}</div>
          <p class="quick-preview__summary">${escapeAttr(summary.slice(0, 200))}${summary.length > 200 ? '...' : ''}</p>
          ${chips ? `<div class="quick-preview__chips">${escapeAttr(chips)}</div>` : ""}
          <span class="quick-preview__hint">Click card to view full details</span>
        `;

        const rect = card.getBoundingClientRect();
        const left = Math.min(rect.left, window.innerWidth - 320);
        previewEl.style.top = (rect.bottom + window.scrollY + 8) + "px";
        previewEl.style.left = Math.max(8, left) + "px";
        previewEl.hidden = false;
      }, 600);
    });

    grid.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".card");
      if (card === currentCard) {
        clearTimeout(hoverTimer);
        currentCard = null;
        previewEl.hidden = true;
      }
    });

    // Hide on scroll
    window.addEventListener("scroll", () => {
      previewEl.hidden = true;
      clearTimeout(hoverTimer);
      currentCard = null;
    }, { passive: true });
  }

  /* ---- report issue button ---- */
  function addReportIssue() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".report-issue-btn")) return;
      const title = document.getElementById("detail-title")?.textContent;
      if (!title) return;

      const actions = detailBody.querySelector(".detail__hero-actions");
      if (!actions) return;

      const btn = document.createElement("a");
      btn.className = "report-issue-btn";
      btn.href = "https://github.com/jlambert229/badgerskope/issues/new?title=" +
        encodeURIComponent("Issue with entry: " + title) +
        "&body=" + encodeURIComponent("Entry: " + title + "\n\nDescribe the issue:\n\n");
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.textContent = "Report issue";
      btn.title = "Report a problem with this entry on GitHub";
      actions.appendChild(btn);
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- toast notifications with undo ---- */
  function showToast(message, undoFn) {
    let existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${escapeAttr(message)}</span>${undoFn ? '<button type="button" class="toast__undo">Undo</button>' : ''}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast--visible"));

    const undoBtn = toast.querySelector(".toast__undo");
    if (undoBtn && undoFn) {
      undoBtn.addEventListener("click", () => {
        undoFn();
        toast.remove();
      });
    }

    setTimeout(() => {
      toast.classList.remove("toast--visible");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ---- swipe navigation on mobile ---- */
  function addSwipeNav() {
    const dialog = document.getElementById("detail-dialog");
    if (!dialog) return;

    let startX = 0;
    let startY = 0;

    dialog.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    dialog.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx)) return;

      const prev = document.getElementById("detail-prev");
      const next = document.getElementById("detail-next");
      if (dx > 0 && prev && !prev.disabled) prev.click();
      if (dx < 0 && next && !next.disabled) next.click();
    }, { passive: true });
  }

  /* ---- dark/light auto-detect on first visit ---- */
  function autoDetectTheme() {
    const saved = localStorage.getItem("peptide-theme");
    if (saved) return; // User already chose
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }

  /* ---- "Build My Stack" synergy map ---- */
  function addStackBuilder() {
    const observer = new MutationObserver(() => {
      const compareTable = document.getElementById("compare-table");
      if (!compareTable || compareTable.querySelector(".stack-map")) return;
      const table = compareTable.querySelector("table");
      if (!table) return;

      // Get selected entry titles from table headers
      const titles = [...table.querySelectorAll("thead th")].slice(1).map(th => th.textContent.replace("×","").trim());
      if (titles.length < 2) return;

      // Find synergy connections from the grid cards' data
      // We'll parse the "Pairs with" row for connections
      const pairsRow = [...table.querySelectorAll("tbody tr")].find(tr => {
        const label = tr.querySelector("th")?.textContent?.trim();
        return label === "Pairs with";
      });

      const connections = [];
      if (pairsRow) {
        const cells = [...pairsRow.querySelectorAll("td")];
        cells.forEach((td, i) => {
          const pairText = td.textContent;
          titles.forEach((other, j) => {
            if (i !== j && pairText.includes(other)) {
              connections.push({ from: titles[i], to: other });
            }
          });
        });
      }

      const map = document.createElement("div");
      map.className = "stack-map";
      map.innerHTML = `
        <h3 class="stack-map__title">Stack Synergy Map</h3>
        <p class="stack-map__help">Lines show which compounds in your selection are discussed together in research or product lines.</p>
        <div class="stack-map__entries">
          ${titles.map((t, i) => `<div class="stack-map__node" style="--idx:${i};--total:${titles.length}">${escapeAttr(t)}</div>`).join("")}
        </div>
        ${connections.length > 0
          ? `<div class="stack-map__connections">
              ${connections.map(c => `<div class="stack-map__link">${escapeAttr(c.from)} <span class="stack-map__arrow">↔</span> ${escapeAttr(c.to)}</div>`).join("")}
            </div>`
          : '<p class="stack-map__none">No documented synergy connections between these compounds in the database.</p>'
        }
        <p class="stack-map__disclaimer">Synergy links reflect research discussions and product pairings, not proven combination benefits. Not a recommendation to combine.</p>
      `;

      compareTable.prepend(map);
    });

    const panel = document.getElementById("panel-compare");
    if (panel) observer.observe(panel, { childList: true, subtree: true });
  }

  /* ---- price per mg calculator ---- */
  function addPricePerMg() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".price-per-mg")) return;
      const titleEl = document.getElementById("detail-title");
      const priceEl = detailBody.querySelector(".detail__price");
      if (!titleEl || !priceEl) return;

      const title = titleEl.textContent;
      const priceText = priceEl.textContent;
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
      if (isNaN(price)) return;

      // Extract mg from title
      const mgMatch = title.match(/(\d+\.?\d*)\s*mg/i);
      if (!mgMatch) return;
      const mg = parseFloat(mgMatch[1]);
      if (isNaN(mg) || mg <= 0) return;

      const perMg = (price / mg).toFixed(2);
      const badge = document.createElement("span");
      badge.className = "price-per-mg";
      badge.textContent = `$${perMg}/mg`;
      badge.title = `${price.toFixed(2)} ÷ ${mg}mg = $${perMg} per milligram`;
      priceEl.after(badge);
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- WADA/Doping status indicator ---- */
  const WADA_BANNED = {
    "BPC-157": "Banned by WADA since 2022",
    "TB-500": "Banned by WADA (thymosin beta-4 related)",
    "Ipamorelin": "Growth hormone secretagogue — banned in sport",
    "Sermorelin": "Growth hormone releasing factor — banned in sport",
    "CJC-1295": "GHRH analog — banned in sport",
    "GHRP": "Growth hormone releasing peptide — banned in sport",
    "SomatoPulse": "Contains banned GH secretagogues",
    "Tesa": "Tesamorelin — growth hormone axis, monitored in sport",
    "MT-II": "Melanotan II — not approved, safety concerns flagged by regulators",
    "SLU-PP-332": "Exercise mimetic — not approved for any use",
    "FOXO4-DRI": "Experimental senolytic — no approved human use",
  };

  function addDopingIndicator() {
    // On cards
    const applyToCards = () => {
      document.querySelectorAll(".card").forEach(card => {
        if (card.querySelector(".doping-flag")) return;
        const title = card.querySelector(".card__title")?.textContent || "";
        for (const [key, reason] of Object.entries(WADA_BANNED)) {
          if (title.includes(key)) {
            const flag = document.createElement("span");
            flag.className = "doping-flag";
            flag.textContent = "⚠ Sport ban";
            flag.title = reason;
            const metaRow = card.querySelector(".card__meta-row");
            if (metaRow) metaRow.appendChild(flag);
            break;
          }
        }
      });
    };

    const grid = document.getElementById("grid");
    if (grid) {
      const obs = new MutationObserver(applyToCards);
      obs.observe(grid, { childList: true });
      applyToCards();
    }

    // On detail modal
    const detailObs = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".doping-banner")) return;
      const title = document.getElementById("detail-title")?.textContent || "";
      for (const [key, reason] of Object.entries(WADA_BANNED)) {
        if (title.includes(key)) {
          const banner = document.createElement("div");
          banner.className = "doping-banner";
          banner.innerHTML = `<strong>⚠ Sport/Doping notice:</strong> ${escapeAttr(reason)}`;
          const heroBar = detailBody.querySelector(".detail__hero-bar");
          if (heroBar) heroBar.after(banner);
          break;
        }
      }
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) detailObs.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- goal-based quick filters ---- */
  function addGoalFilters() {
    const grid = document.getElementById("grid");
    const controls = document.querySelector(".controls");
    if (!controls || !grid) return;

    const goals = [
      { label: "Weight loss", filter: "known-for", value: "metabolic_incretins", icon: "⚖️" },
      { label: "Healing & repair", filter: "known-for", value: "tissue_healing", icon: "🩹" },
      { label: "Brain & mood", filter: "known-for", value: "neuro_mood_sleep", icon: "🧠" },
      { label: "Immune support", filter: "known-for", value: "immune_mucosal", icon: "🛡️" },
      { label: "Anti-aging", filter: "known-for", value: "aging_bioregulators", icon: "⏳" },
      { label: "Growth hormone", filter: "known-for", value: "growth_hormone_axis", icon: "💪" },
      { label: "Skin & tanning", filter: "known-for", value: "skin_tanning_libido", icon: "✨" },
      { label: "Cell energy", filter: "known-for", value: "mitochondria_nad_redox", icon: "⚡" },
    ];

    const bar = document.createElement("div");
    bar.className = "goal-bar";
    bar.innerHTML = '<span class="goal-bar__label">Quick find:</span>' +
      goals.map(g =>
        `<button type="button" class="goal-btn" data-filter="${g.filter}" data-value="${g.value}">${g.icon} ${g.label}</button>`
      ).join("");

    controls.after(bar);

    bar.querySelectorAll(".goal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const filterEl = document.getElementById(btn.dataset.filter);
        if (filterEl) {
          filterEl.value = btn.dataset.value;
          filterEl.dispatchEvent(new Event("change"));
        }
        // Highlight active
        bar.querySelectorAll(".goal-btn").forEach(b => b.classList.remove("goal-btn--active"));
        btn.classList.add("goal-btn--active");
      });
    });

    // Clear active when filters reset
    const resetBtn = document.getElementById("reset-filters");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        bar.querySelectorAll(".goal-btn").forEach(b => b.classList.remove("goal-btn--active"));
      });
    }

    // Hide the bar once any filter select has a non-empty value, or search has text.
    const filterSelects = [
      document.getElementById("category"),
      document.getElementById("compound"),
      document.getElementById("known-for"),
      document.getElementById("evidence-filter"),
    ].filter(Boolean);
    const syncGoalVisibility = () => {
      const anyActive = filterSelects.some((sel) => sel.value !== "" && sel.value != null);
      bar.classList.toggle("goal-bar--hidden", anyActive);
    };
    filterSelects.forEach((sel) => sel.addEventListener("change", syncGoalVisibility));
    const searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const hasSearch = searchInput.value.trim() !== "";
        const anyActive = filterSelects.some((sel) => sel.value !== "" && sel.value != null);
        bar.classList.toggle("goal-bar--hidden", hasSearch || anyActive);
      });
    }
    syncGoalVisibility();
  }

  /* ---- help dialog ---- */
  function addHelpDialog() {
    const helpDialog = document.getElementById("help-dialog");
    const helpClose = document.getElementById("help-close");
    const openHelp = document.getElementById("open-help");

    if (helpDialog && helpClose) {
      helpClose.addEventListener("click", () => helpDialog.close());
      helpDialog.addEventListener("click", (e) => {
        if (e.target === helpDialog) helpDialog.close();
      });
    }

    if (openHelp && helpDialog) {
      openHelp.addEventListener("click", () => helpDialog.showModal());
    }

    // "h" keyboard shortcut
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "h" && helpDialog) {
        e.preventDefault();
        helpDialog.showModal();
      }
    });

    // Show help on first visit
    const helpSeen = localStorage.getItem("peptide-help-seen");
    if (!helpSeen && helpDialog) {
      setTimeout(() => {
        helpDialog.showModal();
        localStorage.setItem("peptide-help-seen", "1");
      }, 2000);
    }
  }

  /* ---- "Start here" smart recommendation ---- */
  function addStartHere() {
    const grid = document.getElementById("grid");
    if (!grid) return;

    // Only show if user hasn't viewed many entries yet
    const readCount = JSON.parse(localStorage.getItem("peptide-read") || "[]").length;
    if (readCount > 5) return;

    const shown = localStorage.getItem("peptide-start-dismissed");
    if (shown) return;

    const banner = document.createElement("div");
    banner.className = "start-here";
    banner.innerHTML = `
      <div class="start-here__content">
        <strong class="start-here__title">New here? Start with the strongest evidence.</strong>
        <p class="start-here__desc">These compounds have FDA approval or major clinical trial data — the most reliable entries in the library.</p>
        <div class="start-here__actions">
          <button type="button" class="start-here__btn" data-action="approved">Show FDA approved</button>
          <button type="button" class="start-here__btn" data-action="trials">Show strong trials</button>
          <button type="button" class="start-here__btn start-here__btn--dismiss" data-action="dismiss">Got it, dismiss</button>
        </div>
      </div>
    `;

    const controls = document.querySelector(".controls");
    if (controls) controls.after(banner);

    banner.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (action === "dismiss") {
          localStorage.setItem("peptide-start-dismissed", "1");
          banner.remove();
          return;
        }
        const evFilter = document.getElementById("evidence-filter");
        if (evFilter) {
          evFilter.value = action === "approved" ? "regulatory_label" : "pivotal_trials";
          evFilter.dispatchEvent(new Event("change"));
        }
        banner.remove();
        localStorage.setItem("peptide-start-dismissed", "1");
      });
    });
  }

  /* ---- random entry button ---- */
  function addRandomEntry() {
    const navBar = document.querySelector(".nav-bar__inner");
    if (!navBar) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--ghost btn--small random-btn";
    btn.textContent = "Random";
    btn.title = "Open a random entry (r)";

    const helpBtn = document.getElementById("open-help");
    if (helpBtn) helpBtn.before(btn);
    else navBar.appendChild(btn);

    btn.addEventListener("click", openRandomEntry);

    // "r" keyboard shortcut
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "r") {
        e.preventDefault();
        openRandomEntry();
      }
    });

    function openRandomEntry() {
      const cards = document.querySelectorAll(".card");
      if (cards.length === 0) return;
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const title = randomCard.querySelector(".card__title")?.textContent;
      if (title) {
        window.location.hash = "entry=" + encodeURIComponent(title);
      }
    }
  }

  /* ---- detail table of contents ---- */
  function addDetailToc() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".detail-toc")) return;

      const sections = detailBody.querySelectorAll(".detail__section h3, .detail__collapsible summary h3");
      if (sections.length < 4) return;

      const toc = document.createElement("nav");
      toc.className = "detail-toc";
      toc.innerHTML = '<span class="detail-toc__label">Jump to:</span>' +
        [...sections].map((h3, i) => {
          const id = "detail-section-" + i;
          const parent = h3.closest(".detail__section") || h3.closest(".detail__collapsible");
          if (parent) parent.id = id;
          return `<a href="#${id}" class="detail-toc__link" onclick="event.preventDefault();document.getElementById('${id}')?.scrollIntoView({behavior:'smooth',block:'start'})">${h3.textContent.trim()}</a>`;
        }).join("");

      const heroBar = detailBody.querySelector(".detail__hero-bar");
      if (heroBar) heroBar.after(toc);
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- export all notes ---- */
  function addExportNotes() {
    const navBar = document.querySelector(".nav-bar__inner");
    if (!navBar) return;

    // Only show if user has notes
    const notes = JSON.parse(localStorage.getItem("peptide-notes") || "{}");
    if (Object.keys(notes).length === 0) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--ghost btn--small";
    btn.textContent = "Export notes";
    btn.title = "Download all your personal notes";

    const helpBtn = document.getElementById("open-help");
    if (helpBtn) helpBtn.before(btn);
    else navBar.appendChild(btn);

    btn.addEventListener("click", () => {
      const notes = JSON.parse(localStorage.getItem("peptide-notes") || "{}");
      if (Object.keys(notes).length === 0) {
        if (typeof showToast === "function") showToast("No notes to export");
        return;
      }
      let text = "BadgerSkope — Personal Notes Export\n";
      text += "Exported: " + new Date().toLocaleString() + "\n";
      text += "=".repeat(50) + "\n\n";
      for (const [id, note] of Object.entries(notes)) {
        // Try to get a friendly title
        const card = document.querySelector(`.card[data-entry-id="${CSS.escape(id)}"]`);
        const title = card?.querySelector(".card__title")?.textContent || id;
        text += "## " + title + "\n";
        text += note + "\n\n";
        text += "-".repeat(40) + "\n\n";
      }
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "badgerskope-notes.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* ---- entry navigation links (prev/next) ---- */
  function addEntryNavLinks() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".entry-nav")) return;
      const titleEl = document.getElementById("detail-title");
      if (!titleEl) return;
      const currentTitle = titleEl.textContent;

      // Get sorted list from visible cards
      const cards = [...document.querySelectorAll(".card")];
      const titles = cards.map(c => c.querySelector(".card__title")?.textContent).filter(Boolean);
      const idx = titles.indexOf(currentTitle);
      if (idx === -1 || titles.length < 2) return;

      const prev = idx > 0 ? titles[idx - 1] : null;
      const next = idx < titles.length - 1 ? titles[idx + 1] : null;

      if (!prev && !next) return;

      const nav = document.createElement("div");
      nav.className = "entry-nav";
      nav.innerHTML = `
        ${prev ? `<button type="button" class="entry-nav__btn entry-nav__prev" data-title="${escapeAttr(prev)}">&larr; ${escapeAttr(prev)}</button>` : '<span></span>'}
        <span class="entry-nav__pos">${idx + 1} of ${titles.length}</span>
        ${next ? `<button type="button" class="entry-nav__btn entry-nav__next" data-title="${escapeAttr(next)}">${escapeAttr(next)} &rarr;</button>` : '<span></span>'}
      `;

      const disclaimer = detailBody.querySelector(".detail__disclaimer");
      if (disclaimer) detailBody.insertBefore(nav, disclaimer);
      else detailBody.appendChild(nav);

      nav.querySelectorAll(".entry-nav__btn").forEach(btn => {
        btn.addEventListener("click", () => {
          window.location.hash = "entry=" + encodeURIComponent(btn.dataset.title);
        });
      });
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- compound timeline view ---- */
  function addTimelineView() {
    const groupByEl = document.getElementById("group-by");
    if (!groupByEl) return;

    // Add timeline option to group-by dropdown
    const opt = document.createElement("option");
    opt.value = "timeline";
    opt.textContent = "Development timeline";
    groupByEl.appendChild(opt);
  }

  function addTimelineOverride() {
    const groupByEl = document.getElementById("group-by");
    if (!groupByEl) return;

    groupByEl.addEventListener("change", () => {
      if (groupByEl.value !== "timeline") return;

      // Wait for render to complete, then re-organize
      setTimeout(() => {
        const grid = document.getElementById("grid");
        if (!grid) return;

        const stages = [
          { key: "approved", label: "Approved & on the market", desc: "FDA or regulator-approved compounds with official prescribing information", color: "#22c55e" },
          { key: "trials", label: "In clinical trials", desc: "Currently being tested in humans — Phase 1, 2, or 3", color: "#14b8a6" },
          { key: "preclinical", label: "Preclinical / animal research", desc: "Tested in animals or lab dishes — not yet proven in people", color: "#f97316" },
          { key: "experimental", label: "Experimental & unclassified", desc: "Research chemicals, vendor blends, or bioregulators with limited formal study", color: "#9ca3af" },
        ];

        const cards = [...grid.querySelectorAll(".card")];
        const frag = document.createDocumentFragment();

        for (const stage of stages) {
          const stageCards = cards.filter(card => {
            const badge = card.querySelector(".card__evidence-badge")?.textContent?.trim() || "";
            if (stage.key === "approved") return badge === "FDA approved";
            if (stage.key === "trials") return badge === "Strong human trials" || badge === "Early human studies";
            if (stage.key === "preclinical") return badge === "Animal studies only";
            return badge === "Clinic practice" || badge === "Unknown";
          });

          if (stageCards.length === 0) continue;

          const header = document.createElement("div");
          header.className = "timeline-header";
          header.innerHTML = `
            <div class="timeline-marker" style="background:${stage.color}"></div>
            <div>
              <h2 class="timeline-header__title">${stage.label}</h2>
              <p class="timeline-header__desc">${stage.desc}</p>
              <span class="group-header__count">${stageCards.length} compound${stageCards.length !== 1 ? 's' : ''}</span>
            </div>
          `;
          frag.appendChild(header);

          const groupGrid = document.createElement("div");
          groupGrid.className = "group-grid";
          stageCards.forEach(c => groupGrid.appendChild(c));
          frag.appendChild(groupGrid);
        }

        grid.replaceChildren(frag);
      }, 100);
    });
  }

  /* ---- compound interaction checker ---- */
  function addInteractionChecker() {
    const observer = new MutationObserver(() => {
      const detailBody = document.getElementById("detail-body");
      if (!detailBody || detailBody.querySelector(".interaction-check")) return;

      const titleEl = document.getElementById("detail-title");
      if (!titleEl) return;
      const currentTitle = titleEl.textContent;

      // Get current entry's categories
      const currentCats = new Set(
        [...detailBody.querySelectorAll(".detail__cats .detail__badge")].map(b => b.textContent.trim())
      );
      const currentType = detailBody.querySelector(".detail__compound-type")?.textContent?.trim() || "";

      // Get bookmarked entries from cards
      const bookmarkedCards = document.querySelectorAll(".card.card--bookmarked");
      if (bookmarkedCards.length === 0) return;

      const overlaps = [];
      bookmarkedCards.forEach(card => {
        const title = card.querySelector(".card__title")?.textContent;
        if (!title || title === currentTitle) return;
        const cardType = card.querySelector(".card__type")?.textContent?.trim() || "";
        const cardChips = new Set([...card.querySelectorAll(".chip")].map(c => c.textContent.trim()));

        // Check for same compound type (mechanism overlap)
        if (currentType && cardType && currentType === cardType) {
          overlaps.push({ title, reason: `Same type: ${cardType}` });
          return;
        }

        // Check for significant category overlap
        let shared = 0;
        currentCats.forEach(c => { if (cardChips.has(c)) shared++; });
        if (shared >= 2) {
          overlaps.push({ title, reason: `${shared} shared categories` });
        }
      });

      if (overlaps.length === 0) return;

      const section = document.createElement("div");
      section.className = "detail__section interaction-check";
      section.innerHTML = `
        <h3>Heads up — overlapping bookmarks</h3>
        <p class="detail__help">These bookmarked compounds share mechanisms or categories with this entry. Overlapping compounds may have additive effects or redundancies worth understanding.</p>
        <ul class="interaction-list">
          ${overlaps.map(o => `<li><strong>${escapeAttr(o.title)}</strong> <span class="interaction-reason">${escapeAttr(o.reason)}</span></li>`).join("")}
        </ul>
        <p class="detail__muted">This is not an interaction warning — just a heads-up that these compounds work in similar areas.</p>
      `;

      const disclaimer = detailBody.querySelector(".detail__disclaimer");
      if (disclaimer) detailBody.insertBefore(section, disclaimer);
    });

    const dialog = document.getElementById("detail-dialog");
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  }

  /* ---- data freshness indicator ---- */
  function addDataFreshness() {
    const footerMeta = document.getElementById("footer-meta");
    if (!footerMeta) return;

    // The footer meta already shows build date. Add a visual freshness indicator.
    const text = footerMeta.textContent;
    const dateMatch = text.match(/Updated\s+(.+)/);
    if (!dateMatch) return;

    const updateDate = new Date(dateMatch[1]);
    const now = new Date();
    const daysSince = Math.floor((now - updateDate) / (1000 * 60 * 60 * 24));

    let freshness, color;
    if (daysSince <= 7) { freshness = "Fresh"; color = "#22c55e"; }
    else if (daysSince <= 30) { freshness = "Recent"; color = "#f59e0b"; }
    else { freshness = "May be outdated"; color = "#ef4444"; }

    const badge = document.createElement("span");
    badge.className = "freshness-badge";
    badge.style.color = color;
    badge.style.borderColor = color;
    badge.textContent = freshness;
    badge.title = `Database last updated ${daysSince} day${daysSince !== 1 ? 's' : ''} ago`;
    footerMeta.appendChild(document.createTextNode(" "));
    footerMeta.appendChild(badge);
  }

  /* ---- compound count per filter option ---- */
  function addFilterCounts() {
    // Add counts to the category dropdown
    const catSelect = document.getElementById("category");
    if (catSelect) {
      const cards = document.querySelectorAll(".card");
      const counts = {};
      cards.forEach(card => {
        card.querySelectorAll(".chip").forEach(chip => {
          const text = chip.textContent.trim();
          counts[text] = (counts[text] || 0) + 1;
        });
      });

      [...catSelect.options].forEach(opt => {
        if (!opt.value) return;
        const label = opt.textContent;
        const count = counts[label] || 0;
        if (count > 0) opt.textContent = `${label} (${count})`;
      });
    }

    // Add counts to evidence dropdown
    const evSelect = document.getElementById("evidence-filter");
    if (evSelect) {
      const cards = document.querySelectorAll(".card");
      const counts = {};
      cards.forEach(card => {
        const badge = card.querySelector(".card__evidence-badge")?.textContent?.trim() || "";
        counts[badge] = (counts[badge] || 0) + 1;
      });

      [...evSelect.options].forEach(opt => {
        if (!opt.value) return;
        const label = opt.textContent;
        const count = counts[label] || 0;
        if (count > 0) opt.textContent = `${label} (${count})`;
      });
    }
  }

  /* ---- local data backup/restore ---- */
  function addDataBackup() {
    const navBar = document.querySelector(".nav-bar__inner");
    if (!navBar) return;

    // Only show the restore option, backup is in help menu
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--ghost btn--small";
    btn.textContent = "Backup";
    btn.title = "Backup or restore your local data";

    const helpBtn = document.getElementById("open-help");
    if (helpBtn) helpBtn.before(btn);
    else navBar.appendChild(btn);

    btn.addEventListener("click", () => {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        bookmarks: JSON.parse(localStorage.getItem("peptide-bookmarks") || "[]"),
        notes: JSON.parse(localStorage.getItem("peptide-notes") || "{}"),
        readList: JSON.parse(localStorage.getItem("peptide-read") || "[]"),
        recent: JSON.parse(localStorage.getItem("peptide-recent") || "[]"),
        theme: localStorage.getItem("peptide-theme") || "dark",
      };

      const action = confirm(
        "Backup: Download your data as a file.\nCancel: Import from a backup file."
      );

      if (action) {
        // Export
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "badgerskope-backup.json";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Import
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.addEventListener("change", () => {
          const file = input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const imported = JSON.parse(reader.result);
              if (imported.version !== 1) throw new Error("Unknown format");
              if (imported.bookmarks) localStorage.setItem("peptide-bookmarks", JSON.stringify(imported.bookmarks));
              if (imported.notes) localStorage.setItem("peptide-notes", JSON.stringify(imported.notes));
              if (imported.readList) localStorage.setItem("peptide-read", JSON.stringify(imported.readList));
              if (imported.recent) localStorage.setItem("peptide-recent", JSON.stringify(imported.recent));
              if (imported.theme) localStorage.setItem("peptide-theme", imported.theme);
              alert("Data restored! Reloading...");
              location.reload();
            } catch (e) {
              alert("Invalid backup file: " + e.message);
            }
          };
          reader.readAsText(file);
        });
        input.click();
      }
    });
  }

  /* ---- init ---- */
  function init() {
    autoDetectTheme();
    addSearchAutocomplete();
    addQuickPreview();
    addReportIssue();
    addSwipeNav();
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
    addNotesFeature();
    addExportFeature();
    addPrintButton();
    addSimilarCompounds();
    addReadTracking();
    addUnitHelper();
    addStackBuilder();
    addPricePerMg();
    addDopingIndicator();
    addGoalFilters();
    addHelpDialog();
    addStartHere();
    addRandomEntry();
    addDetailToc();
    addExportNotes();
    addEntryNavLinks();
    addTimelineView();
    addTimelineOverride();
    addInteractionChecker();
    addDataFreshness();
    addFilterCounts();
    addDataBackup();

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
