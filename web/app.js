/**
 * Peptide Reference Library -- Single Page Application
 * Vanilla JS, no build tools, no framework.
 */

/* ------------------------------------------------------------------ */
/*  Constants & evidence tier mapping                                  */
/* ------------------------------------------------------------------ */

const DATA_URL = "/peptide-info-database.json";

const KNOWN_FOR_THEME_ORDER = [
  "metabolic_incretins",
  "growth_hormone_axis",
  "tissue_healing",
  "multi_ingredient_stack",
  "skin_tanning_libido",
  "mitochondria_nad_redox",
  "immune_mucosal",
  "neuro_mood_sleep",
  "reproduction_social",
  "experimental_weight_adjunct",
  "aging_bioregulators",
];

const EVIDENCE_TIERS = [
  { key: "regulatory_label", tier: "approved", color: "#22c55e", label: "Approved", rank: 0 },
  { key: "pivotal_trials", tier: "pivotal", color: "#14b8a6", label: "Pivotal trials", rank: 1 },
  { key: "phase1_human", tier: "phase1", color: "#f59e0b", label: "Phase 1", rank: 2 },
  { key: "preclinical_animal", tier: "preclinical", color: "#f97316", label: "Preclinical", rank: 3 },
  { key: "compounded_practice", tier: "practice", color: "#9ca3af", label: "Practice", rank: 4 },
  { key: "unknown_identity", tier: "unknown", color: "#9ca3af", label: "Unknown", rank: 5 },
];

function tierForKey(key) {
  return EVIDENCE_TIERS.find((t) => t.key === key) || EVIDENCE_TIERS[EVIDENCE_TIERS.length - 1];
}

function highestTier(entry) {
  const guidelines = entry.doseGuidelines || [];
  let best = null;
  for (const g of guidelines) {
    const t = tierForKey(g.evidenceBasis);
    if (!best || t.rank < best.rank) best = t;
  }
  return best || tierForKey("unknown_identity");
}

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCompoundType(raw) {
  if (!raw) return "";
  return String(raw).replace(/_/g, " ");
}

function parsePrice(priceText) {
  if (!priceText) return NaN;
  const n = parseFloat(String(priceText).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function wellnessLabel(index, key) {
  if (!key) return { short: "", full: "" };
  const full = index[key];
  const short = key.replace(/_/g, " ");
  return { short, full: full || key };
}

/* ------------------------------------------------------------------ */
/*  DOM element references                                             */
/* ------------------------------------------------------------------ */

const els = {
  grid: document.getElementById("grid"),
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  compound: document.getElementById("compound"),
  knownFor: document.getElementById("known-for"),
  sort: document.getElementById("sort"),
  evidenceFilter: document.getElementById("evidence-filter"),
  stats: document.getElementById("stats"),
  loadError: document.getElementById("load-error"),
  disclaimer: document.getElementById("disclaimer"),
  footerMeta: document.getElementById("footer-meta"),
  dialog: document.getElementById("detail-dialog"),
  detailBody: document.getElementById("detail-body"),
  detailClose: document.getElementById("detail-close"),
  detailNav: document.getElementById("detail-nav"),
  detailPrev: document.getElementById("detail-prev"),
  detailNext: document.getElementById("detail-next"),
  detailNavPos: document.getElementById("detail-nav-pos"),
  detailBookmark: document.getElementById("detail-bookmark"),
  selectionCount: document.getElementById("selection-count"),
  selectVisible: document.getElementById("select-visible"),
  clearSelection: document.getElementById("clear-selection"),
  compareSelected: document.getElementById("compare-selected"),
  viewSelected: document.getElementById("view-selected"),
  tabBrowse: document.getElementById("tab-browse"),
  tabCompare: document.getElementById("tab-compare"),
  tabStats: document.getElementById("tab-stats"),
  panelBrowse: document.getElementById("panel-browse"),
  panelCompare: document.getElementById("panel-compare"),
  panelStats: document.getElementById("panel-stats"),
  compareTable: document.getElementById("compare-table"),
  statsDashboard: document.getElementById("stats-dashboard"),
  statCompounds: document.getElementById("stat-compounds"),
  statCategories: document.getElementById("stat-categories"),
  statEvidence: document.getElementById("stat-evidence"),
  statThemes: document.getElementById("stat-themes"),
  themeToggle: document.getElementById("theme-toggle"),
  backToTop: document.getElementById("back-to-top"),
  bookmarksBar: document.getElementById("bookmarks-bar"),
  shortcutsDialog: document.getElementById("shortcuts-dialog"),
};

/* ------------------------------------------------------------------ */
/*  Application state                                                  */
/* ------------------------------------------------------------------ */

let db = null;
let doseLegend = {};
const selectedIds = new Set();
let lastVisibleList = [];
let detailQueue = [];
let detailIndex = 0;
let bookmarks = loadBookmarks();
let activeTab = "browse";

/* ------------------------------------------------------------------ */
/*  Entry identity                                                     */
/* ------------------------------------------------------------------ */

function getEntryId(entry) {
  return entry.catalog?.url || `title:${entry.catalog?.title || "unknown"}`;
}

function getEntryById(id) {
  return db.entries.find((e) => getEntryId(e) === id);
}

function getEntryByTitle(title) {
  return db.entries.find(
    (e) => (e.catalog?.title || "").toLowerCase() === title.toLowerCase()
  );
}

/* ------------------------------------------------------------------ */
/*  Bookmarks (localStorage)                                           */
/* ------------------------------------------------------------------ */

function loadBookmarks() {
  try {
    const raw = localStorage.getItem("peptide-bookmarks");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveBookmarks() {
  localStorage.setItem("peptide-bookmarks", JSON.stringify([...bookmarks]));
  updateBookmarksBar();
}

function toggleBookmark(id) {
  if (bookmarks.has(id)) bookmarks.delete(id);
  else bookmarks.add(id);
  saveBookmarks();
}

function updateBookmarksBar() {
  if (!els.bookmarksBar) return;
  const n = bookmarks.size;
  const countEl = els.bookmarksBar.querySelector("#bookmarks-count") || els.bookmarksBar;
  countEl.textContent = String(n);
  els.bookmarksBar.hidden = n === 0;
}

/* ------------------------------------------------------------------ */
/*  Theme toggle (localStorage)                                        */
/* ------------------------------------------------------------------ */

function loadTheme() {
  const saved = localStorage.getItem("peptide-theme");
  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("peptide-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("peptide-theme", "light");
  }
}

/* ------------------------------------------------------------------ */
/*  Filtering & sorting                                                */
/* ------------------------------------------------------------------ */

function collectCompoundTypes(entries) {
  const set = new Set();
  for (const e of entries) {
    if (e.compoundType) set.add(e.compoundType);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function matchesSearch(entry, q) {
  if (!q) return true;
  const idx = db?.meta?.knownForThemeIndex || {};
  const themeWords = (entry.distinctiveQuality?.themes || [])
    .map((k) => `${k} ${idx[k] || ""}`)
    .join(" ");
  const hay = [
    entry.catalog?.title,
    entry.researchSummary,
    entry.compoundType,
    entry.notes,
    entry.distinctiveQuality?.headline,
    themeWords,
    ...(entry.reportedBenefits || []),
    ...(entry.potentialApplications || []).map(a => a.personCenteredBenefit),
    entry.cyclingNotes,
    entry.dosingTimingNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  return words.every((w) => hay.includes(w));
}

function matchesKnownFor(entry, themeKey) {
  if (!themeKey) return true;
  return (entry.distinctiveQuality?.themes || []).includes(themeKey);
}

function matchesCategory(entry, cat) {
  if (!cat) return true;
  return (entry.wellnessCategories || []).includes(cat);
}

function matchesCompound(entry, c) {
  if (!c) return true;
  return entry.compoundType === c;
}

function matchesEvidence(entry, filterKey) {
  if (!filterKey) return true;
  const t = highestTier(entry);
  return t.key === filterKey;
}

function sortEntries(entries, mode) {
  const out = [...entries];
  if (mode === "title") {
    out.sort((a, b) => (a.catalog?.title || "").localeCompare(b.catalog?.title || ""));
  } else if (mode === "title-desc") {
    out.sort((a, b) => (b.catalog?.title || "").localeCompare(a.catalog?.title || ""));
  } else if (mode === "price-asc") {
    out.sort((a, b) => (parsePrice(a.catalog?.priceText) || 999) - (parsePrice(b.catalog?.priceText) || 999));
  } else if (mode === "price-desc") {
    out.sort((a, b) => (parsePrice(b.catalog?.priceText) || 0) - (parsePrice(a.catalog?.priceText) || 0));
  } else if (mode === "evidence") {
    out.sort((a, b) => highestTier(a).rank - highestTier(b).rank);
  } else if (mode === "type") {
    out.sort((a, b) => (a.compoundType || "zzz").localeCompare(b.compoundType || "zzz"));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Selection toolbar                                                  */
/* ------------------------------------------------------------------ */

function updateSelectionToolbar() {
  const n = selectedIds.size;
  if (els.selectionCount) {
    els.selectionCount.textContent = n === 1 ? "1 selected" : `${n} selected`;
  }
  if (els.clearSelection) els.clearSelection.disabled = n === 0;
  if (els.viewSelected) els.viewSelected.disabled = n === 0;
  if (els.compareSelected) els.compareSelected.disabled = n < 2;
  const compareBadge = els.tabCompare;
  if (compareBadge && n >= 2) {
    compareBadge.textContent = `Compare (${n})`;
  } else if (compareBadge) {
    compareBadge.textContent = "Compare";
  }
}

function selectedEntriesSorted() {
  return [...selectedIds]
    .map((id) => getEntryById(id))
    .filter(Boolean)
    .sort((a, b) => (a.catalog?.title || "").localeCompare(b.catalog?.title || ""));
}

/* ------------------------------------------------------------------ */
/*  Evidence-basis formatting                                          */
/* ------------------------------------------------------------------ */

function formatEvidenceBasis(key) {
  const tip = doseLegend[key] || "";
  const label = key ? key.replace(/_/g, " ") : "";
  const t = tierForKey(key);
  return { label, tip, tier: t.tier, color: t.color };
}

/* ------------------------------------------------------------------ */
/*  Card rendering                                                     */
/* ------------------------------------------------------------------ */

function renderCard(entry, catIndex, cardIndex) {
  const title = entry.catalog?.title || "Untitled";
  const price = entry.catalog?.priceText || "";
  const cleanPrice = price.replace(/Price range:.*$/, '').trim();
  const type = formatCompoundType(entry.compoundType);
  const summary = entry.researchSummary || "";
  const headline = entry.distinctiveQuality?.headline || "";
  const id = getEntryId(entry);
  const selected = selectedIds.has(id);
  const isBookmarked = bookmarks.has(id);
  const tier = highestTier(entry);

  const chips = (entry.wellnessCategories || [])
    .slice(0, 4)
    .map((k) => {
      const w = wellnessLabel(catIndex, k);
      return `<span class="chip" title="${escapeHtml(w.full)}">${escapeHtml(w.short)}</span>`;
    })
    .join("");

  const article = document.createElement("article");
  article.className = "card" +
    (selected ? " card--selected" : "") +
    (isBookmarked ? " card--bookmarked" : "");
  article.dataset.entryId = id;
  article.style.setProperty("--delay", `${Math.min(cardIndex * 40, 600)}ms`);
  article.style.setProperty("--evidence-color", tier.color);
  if (tier.tier === "unknown") {
    article.classList.add("card--evidence-dashed");
  }

  const head = document.createElement("div");
  head.className = "card__head";

  const label = document.createElement("label");
  label.className = "card__select";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = selected;
  cb.title = "Select for compare / batch view";
  cb.setAttribute("aria-label", `Select ${title}`);
  cb.addEventListener("click", (e) => e.stopPropagation());
  cb.addEventListener("change", () => {
    if (cb.checked) selectedIds.add(id);
    else selectedIds.delete(id);
    article.classList.toggle("card--selected", selectedIds.has(id));
    updateSelectionToolbar();
  });
  label.appendChild(cb);

  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.type = "button";
  bookmarkBtn.className = "card__bookmark";
  bookmarkBtn.setAttribute("aria-label", `Bookmark ${title}`);
  bookmarkBtn.textContent = isBookmarked ? "\u2605" : "\u2606";
  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBookmark(id);
    bookmarkBtn.textContent = bookmarks.has(id) ? "\u2605" : "\u2606";
    article.classList.toggle("card--bookmarked", bookmarks.has(id));
  });

  const headText = document.createElement("div");
  headText.className = "card__head-text";
  const h2 = document.createElement("h2");
  h2.className = "card__title";
  h2.textContent = title;
  headText.appendChild(h2);
  if (price) {
    const priceEl = document.createElement("span");
    priceEl.className = "card__price";
    priceEl.textContent = cleanPrice;
    headText.appendChild(priceEl);
  }

  head.appendChild(label);
  head.appendChild(headText);
  head.appendChild(bookmarkBtn);

  const main = document.createElement("button");
  main.type = "button";
  main.className = "card__main";
  main.setAttribute("aria-label", `View details for ${title}`);
  main.innerHTML = `
    ${type ? `<span class="card__type">${escapeHtml(type)}</span>` : ""}
    <span class="card__evidence-badge" style="background:${tier.color}">${escapeHtml(tier.label)}</span>
    ${headline ? `<p class="card__distinctive" title="${escapeHtml(headline)}">${escapeHtml(headline)}</p>` : ""}
    <p class="card__summary">${escapeHtml(summary)}</p>
    <div class="card__chips">${chips}</div>
    <p class="card__hint">View details \u2192</p>
  `;
  main.addEventListener("click", () => {
    article.style.transform = "scale(0.98)";
    setTimeout(() => {
      article.style.transform = "";
      openDetail(entry);
    }, 100);
  });

  article.appendChild(head);
  article.appendChild(main);
  return article;
}

/* ------------------------------------------------------------------ */
/*  Grid render                                                        */
/* ------------------------------------------------------------------ */

function render() {
  const catIndex = db.meta.wellnessCategoryIndex || {};
  const q = els.search.value.trim().toLowerCase();
  const cat = els.category.value;
  const comp = els.compound.value;
  const known = els.knownFor.value;
  const ev = els.evidenceFilter ? els.evidenceFilter.value : "";
  const sortMode = els.sort.value;

  let list = db.entries.filter(
    (e) =>
      matchesSearch(e, q) &&
      matchesCategory(e, cat) &&
      matchesCompound(e, comp) &&
      matchesKnownFor(e, known) &&
      matchesEvidence(e, ev)
  );
  list = sortEntries(list, sortMode);
  lastVisibleList = list;

  const frag = document.createDocumentFragment();
  const selN = selectedIds.size;
  if (els.stats) {
    els.stats.textContent = `Showing ${list.length} of ${db.entries.length}${selN ? ` \u00b7 ${selN} selected` : ""}`;
  }

  const hasFilters = q || cat || comp || known || ev;
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) resetBtn.hidden = !hasFilters;

  const resultCount = document.getElementById("result-count");
  if (resultCount) {
    if (hasFilters) {
      resultCount.textContent = `${list.length} result${list.length !== 1 ? 's' : ''}`;
      resultCount.hidden = false;
    } else {
      resultCount.hidden = true;
    }
  }

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No peptides match your current filters. Try broadening your search.";
    frag.appendChild(empty);
  } else {
    list.forEach((e, i) => frag.appendChild(renderCard(e, catIndex, i)));
  }
  els.grid.replaceChildren(frag);
  updateHashFromState();
}

/* ------------------------------------------------------------------ */
/*  Detail modal                                                       */
/* ------------------------------------------------------------------ */

function renderSynergyPills(synergyList) {
  return (synergyList || [])
    .map((s) => {
      const basis = formatEvidenceBasis(s.evidenceBasis);
      const titles = s.catalogTitles || [];
      const pills = titles
        .map(
          (t) =>
            `<button type="button" class="synergy-pill" data-synergy-title="${escapeHtml(t)}">${escapeHtml(t)}</button>`
        )
        .join(" ");
      return `<li>${pills}
        <span class="evidence-pill" style="background:${basis.color}" title="${escapeHtml(basis.tip)}">${escapeHtml(basis.label)}</span>
        <div class="detail__muted">${escapeHtml(s.rationale || "")}</div></li>`;
    })
    .join("");
}

function renderDetailHtml(entry) {
  const catIndex = db.meta.wellnessCategoryIndex || {};
  const kfIdx = db.meta.knownForThemeIndex || {};
  const title = entry.catalog?.title || "Entry";
  const url = entry.catalog?.url;
  const price = entry.catalog?.priceText;
  const id = getEntryId(entry);
  const isBookmarked = bookmarks.has(id);
  const tier = highestTier(entry);

  const cats = (entry.wellnessCategories || [])
    .map((k) => {
      const w = wellnessLabel(catIndex, k);
      return `<span class="detail__badge" title="${escapeHtml(w.full)}">${escapeHtml(w.short)}</span>`;
    })
    .join("");

  const benefits = (entry.reportedBenefits || [])
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join("");

  const apps = (entry.potentialApplications || [])
    .map(
      (a) =>
        `<li><strong>${escapeHtml(a.personCenteredBenefit || "")}</strong>
        <div class="detail__muted">${escapeHtml(a.evidenceNote || "")}</div></li>`
    )
    .join("");

  const synergy = renderSynergyPills(entry.synergisticWith);

  const sources = (entry.sources || [])
    .map(
      (s) =>
        `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label || s.url)}</a></li>`
    )
    .join("");

  const doseRows = (entry.doseGuidelines || [])
    .map((d) => {
      const ev = formatEvidenceBasis(d.evidenceBasis);
      return `<tr>
        <td>${escapeHtml(d.indicationOrContext || "")}</td>
        <td><span class="evidence-pill" style="background:${ev.color}" title="${escapeHtml(ev.tip)}">${escapeHtml(ev.label)}</span></td>
        <td>${escapeHtml(d.minimumEffectiveDoseNotes || "")}</td>
      </tr>`;
    })
    .join("");

  const dq = entry.distinctiveQuality;
  const dqThemes = (dq?.themes || [])
    .map((k) => {
      const tip = kfIdx[k] || "";
      return `<span class="detail__badge" title="${escapeHtml(tip)}">${escapeHtml(k.replace(/_/g, " "))}</span>`;
    })
    .join("");

  return `
    <div class="detail__header">
      <h2 class="detail__title" id="detail-title">${escapeHtml(title)}</h2>
      <button type="button" class="detail__bookmark-btn" data-entry-id="${escapeHtml(id)}" aria-label="Toggle bookmark">
        ${isBookmarked ? "\u2605" : "\u2606"} Bookmark
      </button>
    </div>
    ${url ? `<a class="detail__link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Catalog link</a>` : ""}
    ${dq?.headline
      ? `<div class="detail__section detail__section--highlight">
      <h3>Distinctive reputation</h3>
      <p class="detail__prose">${escapeHtml(dq.headline)}</p>
      ${dqThemes ? `<div class="detail__row">${dqThemes}</div>` : ""}
      ${dq.basisNote ? `<p class="detail__muted">${escapeHtml(dq.basisNote)}</p>` : ""}
    </div>`
      : ""
    }
    <div class="detail__row">
      ${price ? `<span class="detail__badge">Price: ${escapeHtml(price)}</span>` : ""}
      ${entry.compoundType ? `<span class="detail__badge">${escapeHtml(formatCompoundType(entry.compoundType))}</span>` : ""}
      <span class="evidence-pill" style="background:${tier.color}">${escapeHtml(tier.label)}</span>
    </div>
    ${cats ? `<div class="detail__row">${cats}</div>` : ""}

    <div class="detail__section">
      <h3>Research summary</h3>
      <p class="detail__prose">${escapeHtml(entry.researchSummary || "")}</p>
    </div>

    ${entry.notes ? `<div class="detail__section"><h3>Notes</h3><p class="detail__prose">${escapeHtml(entry.notes)}</p></div>` : ""}

    ${benefits ? `<div class="detail__section"><h3>What people report</h3><ul>${benefits}</ul></div>` : ""}

    <div class="detail__section">
      <h3>Dosing &amp; timing notes</h3>
      <p class="detail__prose">${escapeHtml(entry.dosingTimingNotes || "Not specified.")}</p>
    </div>

    <details class="detail__section detail__collapsible">
      <summary><h3>Cycling</h3></summary>
      <p class="detail__prose">${escapeHtml(entry.cyclingNotes || "Not specified.")}</p>
    </details>

    ${doseRows
      ? `<details class="detail__section detail__collapsible">
      <summary><h3>Published dose info</h3></summary>
      <div class="table-wrap">
        <table class="doses">
          <thead><tr><th>Context</th><th>Evidence basis</th><th>Notes</th></tr></thead>
          <tbody>${doseRows}</tbody>
        </table>
      </div>
    </details>`
      : ""
    }

    ${apps ? `<div class="detail__section"><h3>What it's used for</h3><ul>${apps}</ul></div>` : ""}
    ${synergy ? `<div class="detail__section"><h3>Often paired with</h3><ul class="synergy-list">${synergy}</ul></div>` : ""}
    ${sources ? `<div class="detail__section"><h3>Sources</h3><ul>${sources}</ul></div>` : ""}
  `;
}

function syncDetailNav() {
  const multi = detailQueue.length > 1;
  els.detailNav.hidden = !multi;
  if (!multi) return;
  els.detailNavPos.textContent = `${detailIndex + 1} of ${detailQueue.length}`;
  els.detailPrev.disabled = detailIndex <= 0;
  els.detailNext.disabled = detailIndex >= detailQueue.length - 1;
}

function showDetailAt(index) {
  detailIndex = index;
  const entry = detailQueue[detailIndex];
  if (!entry) return;
  els.detailBody.innerHTML = renderDetailHtml(entry);
  syncDetailNav();
  bindDetailEvents();
  updateHash("entry=" + encodeURIComponent(entry.catalog?.title || ""));
}

function bindDetailEvents() {
  const bookmarkBtn = els.detailBody.querySelector(".detail__bookmark-btn");
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", () => {
      const id = bookmarkBtn.dataset.entryId;
      toggleBookmark(id);
      bookmarkBtn.innerHTML = (bookmarks.has(id) ? "\u2605" : "\u2606") + " Bookmark";
      render();
    });
  }
  els.detailBody.querySelectorAll(".synergy-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const t = pill.dataset.synergyTitle;
      const entry = getEntryByTitle(t);
      if (entry) {
        detailQueue = [entry];
        detailIndex = 0;
        showDetailAt(0);
      }
    });
  });
}

function openDetail(entry, opts = {}) {
  if (opts.multiQueue && opts.multiQueue.length > 1) {
    detailQueue = opts.multiQueue;
    const i = detailQueue.findIndex((e) => getEntryId(e) === getEntryId(entry));
    detailIndex = i >= 0 ? i : 0;
  } else {
    detailQueue = [entry];
    detailIndex = 0;
  }
  showDetailAt(detailIndex);
  els.dialog.showModal();
  els.dialog.querySelector(".modal__panel")?.scrollTo(0, 0);
}

function closeDetail() {
  els.dialog.close();
  const params = readHashParams();
  delete params.entry;
  writeHashParams(params);
}

/* ------------------------------------------------------------------ */
/*  Comparison table                                                   */
/* ------------------------------------------------------------------ */

function renderComparisonTable() {
  if (!els.compareTable) return;
  const emptyEl = document.getElementById("compare-empty");
  const entries = selectedEntriesSorted();
  if (entries.length < 2) {
    els.compareTable.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  const capped = entries.slice(0, 8);
  const catIndex = db.meta.wellnessCategoryIndex || {};

  const rows = [
    {
      label: "",
      fn: (e) => `<button type="button" class="synergy-pill" data-synergy-title="${escapeHtml(e.catalog?.title || "")}" style="font-size:.78rem">Open &rarr;</button>`,
    },
    {
      label: "Title",
      fn: (e) => escapeHtml(e.catalog?.title || ""),
    },
    {
      label: "Price",
      fn: (e) => escapeHtml(e.catalog?.priceText || "N/A"),
    },
    {
      label: "Compound type",
      fn: (e) => escapeHtml(formatCompoundType(e.compoundType)),
    },
    {
      label: "Known for",
      fn: (e) => escapeHtml(e.distinctiveQuality?.headline || ""),
    },
    {
      label: "Summary",
      fn: (e) => `<span class="compare-prose">${escapeHtml(e.researchSummary || "")}</span>`,
    },
    {
      label: "Benefits",
      fn: (e) => {
        const items = (e.reportedBenefits || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
        return items ? `<ul class="compare-list">${items}</ul>` : "";
      },
    },
    {
      label: "Categories",
      fn: (e) =>
        (e.wellnessCategories || [])
          .map((k) => escapeHtml(wellnessLabel(catIndex, k).short))
          .join(", "),
    },
    {
      label: "Evidence",
      fn: (e) => {
        const t = highestTier(e);
        return `<span class="evidence-pill" style="background:${t.color}">${escapeHtml(t.label)}</span>`;
      },
    },
    {
      label: "Dosing",
      fn: (e) =>
        (e.doseGuidelines || [])
          .map((d) => {
            const ev = formatEvidenceBasis(d.evidenceBasis);
            return `<div class="compare-dose"><strong>${escapeHtml(d.indicationOrContext || "")}</strong>
              <span class="evidence-pill" style="background:${ev.color}">${escapeHtml(ev.label)}</span>
              <div>${escapeHtml(d.minimumEffectiveDoseNotes || "")}</div></div>`;
          })
          .join(""),
    },
    {
      label: "Cycling",
      fn: (e) => escapeHtml(e.cyclingNotes || "Not specified."),
    },
    {
      label: "Pairs with",
      fn: (e) =>
        (e.synergisticWith || [])
          .map((s) => escapeHtml((s.catalogTitles || []).join(", ")))
          .join("; "),
    },
    {
      label: "Sources",
      fn: (e) =>
        (e.sources || [])
          .map(
            (s) =>
              `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label || s.url)}</a>`
          )
          .join("<br>"),
    },
  ];

  const headerCells = capped
    .map((e) => {
      const id = getEntryId(e);
      return `<th>
        ${escapeHtml(e.catalog?.title || "")}
        <button type="button" class="compare-remove" data-remove-id="${escapeHtml(id)}" aria-label="Remove from comparison">\u00d7</button>
      </th>`;
    })
    .join("");

  const bodyRows = rows
    .map((row) => {
      const vals = capped.map((e) => row.fn(e));
      const allSame = vals.every((v) => v === vals[0]);
      const cells = vals
        .map((v) => `<td class="${allSame ? "" : "compare-diff"}">${v}</td>`)
        .join("");
      return `<tr><th class="compare-row-label">${escapeHtml(row.label)}</th>${cells}</tr>`;
    })
    .join("");

  els.compareTable.innerHTML = `
    <div class="table-wrap">
      <table class="compare">
        <thead><tr><th></th>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;

  els.compareTable.querySelectorAll(".compare-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedIds.delete(btn.dataset.removeId);
      updateSelectionToolbar();
      renderComparisonTable();
      render();
    });
  });

  els.compareTable.querySelectorAll(".synergy-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const t = pill.dataset.synergyTitle;
      const entry = getEntryByTitle(t);
      if (entry) openDetail(entry);
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Stats dashboard                                                    */
/* ------------------------------------------------------------------ */

function renderBar(label, count, max) {
  const pct = max > 0 ? ((count / max) * 100).toFixed(1) : 0;
  return `<div class="stat-bar">
    <span class="stat-bar__label">${escapeHtml(label)}</span>
    <div class="stat-bar__track">
      <div class="stat-bar__fill" style="--pct:${pct}%"></div>
    </div>
    <span class="stat-bar__count">${count}</span>
  </div>`;
}

function renderStatsDashboard() {
  if (!els.statsDashboard) return;

  const entries = db.entries;
  const totalEl = els.statsDashboard.querySelector(".stat-total") || document.createElement("p");
  totalEl.className = "stat-total";
  totalEl.textContent = "Total entries: " + entries.length;
  const totalValEl = document.getElementById("stat-total-value");
  if (totalValEl) totalValEl.textContent = entries.length;

  /* Compound types */
  const compoundCounts = {};
  for (const e of entries) {
    const ct = e.compoundType || "unknown";
    compoundCounts[ct] = (compoundCounts[ct] || 0) + 1;
  }
  const compSorted = Object.entries(compoundCounts).sort((a, b) => b[1] - a[1]);
  const compMax = compSorted.length ? compSorted[0][1] : 1;
  if (els.statCompounds) {
    const compBody = els.statCompounds.querySelector(".stat-card__body") || els.statCompounds;
    compBody.innerHTML = compSorted.map(([k, c]) => renderBar(formatCompoundType(k), c, compMax)).join("");
  }

  /* Wellness categories */
  const catCounts = {};
  for (const e of entries) {
    for (const c of e.wellnessCategories || []) {
      catCounts[c] = (catCounts[c] || 0) + 1;
    }
  }
  const catSorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const catMax = catSorted.length ? catSorted[0][1] : 1;
  if (els.statCategories) {
    const catBody = els.statCategories.querySelector(".stat-card__body") || els.statCategories;
    catBody.innerHTML = catSorted.map(([k, c]) => renderBar(k.replace(/_/g, " "), c, catMax)).join("");
  }

  /* Evidence tiers */
  const evCounts = {};
  for (const e of entries) {
    const t = highestTier(e);
    evCounts[t.label] = (evCounts[t.label] || 0) + 1;
  }
  const evSorted = Object.entries(evCounts).sort((a, b) => b[1] - a[1]);
  const evMax = evSorted.length ? evSorted[0][1] : 1;
  if (els.statEvidence) {
    const evBody = els.statEvidence.querySelector(".stat-card__body") || els.statEvidence;
    evBody.innerHTML = evSorted.map(([k, c]) => {
      const tier = EVIDENCE_TIERS.find(t => t.label === k);
      const color = tier ? tier.color : "#9ca3af";
      return `<div class="stat-bar">
        <span class="stat-bar__label">${escapeHtml(k)}</span>
        <div class="stat-bar__track">
          <div class="stat-bar__fill" style="--pct:${((c / evMax) * 100).toFixed(1)}%;background:${color}"></div>
        </div>
        <span class="stat-bar__count">${c}</span>
      </div>`;
    }).join("");
  }

  /* Themes */
  const themeCounts = {};
  for (const e of entries) {
    for (const t of e.distinctiveQuality?.themes || []) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
  }
  const themeSorted = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
  const themeMax = themeSorted.length ? themeSorted[0][1] : 1;
  if (els.statThemes) {
    const themeBody = els.statThemes.querySelector(".stat-card__body") || els.statThemes;
    themeBody.innerHTML = themeSorted.map(([k, c]) => renderBar(k.replace(/_/g, " "), c, themeMax)).join("");
  }

  if (!els.statsDashboard.contains(totalEl)) {
    els.statsDashboard.prepend(totalEl);
  }
}

/* ------------------------------------------------------------------ */
/*  Tab navigation                                                     */
/* ------------------------------------------------------------------ */

function switchTab(tab) {
  activeTab = tab;
  const tabs = [
    { btn: els.tabBrowse, panel: els.panelBrowse, key: "browse" },
    { btn: els.tabCompare, panel: els.panelCompare, key: "compare" },
    { btn: els.tabStats, panel: els.panelStats, key: "stats" },
  ];
  for (const t of tabs) {
    if (!t.btn || !t.panel) continue;
    const active = t.key === tab;
    t.btn.classList.toggle("tab--active", active);
    t.btn.setAttribute("aria-selected", String(active));
    t.panel.classList.toggle("tab-panel--active", active);
    t.panel.hidden = !active;
  }
  if (tab === "compare") renderComparisonTable();
  if (tab === "stats") renderStatsDashboard();
  updateHashFromState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------------------------------------------------ */
/*  URL hash routing                                                   */
/* ------------------------------------------------------------------ */

function readHashParams() {
  const hash = location.hash.replace(/^#/, "");
  const params = {};
  for (const part of hash.split("&")) {
    const [k, ...rest] = part.split("=");
    if (k) params[k] = decodeURIComponent(rest.join("="));
  }
  return params;
}

function writeHashParams(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(k + "=" + encodeURIComponent(v));
    }
  }
  const newHash = parts.length ? "#" + parts.join("&") : "";
  if ("#" + location.hash.replace(/^#/, "") !== newHash && location.hash !== newHash) {
    history.replaceState(null, "", newHash || location.pathname);
  }
}

function updateHash(override) {
  if (override) {
    history.replaceState(null, "", "#" + override);
    return;
  }
  updateHashFromState();
}

function updateHashFromState() {
  if (els.dialog && els.dialog.open) return;
  const params = {};
  if (activeTab !== "browse") params.tab = activeTab;
  const q = els.search ? els.search.value.trim() : "";
  if (q) params.search = q;
  const cat = els.category ? els.category.value : "";
  if (cat) params.category = cat;
  const comp = els.compound ? els.compound.value : "";
  if (comp) params.compound = comp;
  const kf = els.knownFor ? els.knownFor.value : "";
  if (kf) params["known-for"] = kf;
  const ev = els.evidenceFilter ? els.evidenceFilter.value : "";
  if (ev) params.evidence = ev;
  writeHashParams(params);
}

function applyHashOnLoad() {
  const params = readHashParams();

  if (params.search && els.search) els.search.value = params.search;
  if (params.category && els.category) els.category.value = params.category;
  if (params.compound && els.compound) els.compound.value = params.compound;
  if (params["known-for"] && els.knownFor) els.knownFor.value = params["known-for"];
  if (params.evidence && els.evidenceFilter) els.evidenceFilter.value = params.evidence;

  if (params.tab === "compare" || params.tab === "stats") {
    switchTab(params.tab);
  }

  render();

  if (params.entry) {
    const entry = getEntryByTitle(params.entry);
    if (entry) openDetail(entry);
  }
}

/* ------------------------------------------------------------------ */
/*  Back to top                                                        */
/* ------------------------------------------------------------------ */

function initBackToTop() {
  if (!els.backToTop) return;
  const check = () => {
    els.backToTop.hidden = window.scrollY <= 400;
  };
  window.addEventListener("scroll", check, { passive: true });
  check();
  els.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ------------------------------------------------------------------ */
/*  Keyboard shortcuts                                                 */
/* ------------------------------------------------------------------ */

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const inInput = tag === "input" || tag === "textarea" || tag === "select";

    if (e.key === "Escape") {
      if (els.shortcutsDialog && els.shortcutsDialog.open) {
        els.shortcutsDialog.close();
        return;
      }
      if (els.dialog && els.dialog.open) {
        closeDetail();
        return;
      }
    }

    if (inInput) return;

    if (e.key === "/") {
      e.preventDefault();
      if (els.search) els.search.focus();
      return;
    }

    if (e.key === "?") {
      e.preventDefault();
      if (els.shortcutsDialog) {
        if (els.shortcutsDialog.open) els.shortcutsDialog.close();
        else els.shortcutsDialog.showModal();
      }
      return;
    }

    if (e.key === "t") {
      toggleTheme();
      return;
    }

    if (e.key === "b" && els.dialog && els.dialog.open) {
      const entry = detailQueue[detailIndex];
      if (entry) {
        toggleBookmark(getEntryId(entry));
        showDetailAt(detailIndex);
        render();
      }
      return;
    }

    if (e.key === "ArrowLeft" && els.dialog && els.dialog.open && detailQueue.length > 1) {
      if (detailIndex > 0) showDetailAt(detailIndex - 1);
      return;
    }
    if (e.key === "ArrowRight" && els.dialog && els.dialog.open && detailQueue.length > 1) {
      if (detailIndex < detailQueue.length - 1) showDetailAt(detailIndex + 1);
      return;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Populate filters                                                   */
/* ------------------------------------------------------------------ */

function sortKnownForKeys(kf) {
  const all = Object.keys(kf);
  const preferred = KNOWN_FOR_THEME_ORDER.filter((k) => kf[k]);
  const rest = all.filter((k) => !preferred.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...preferred, ...rest];
}

function populateFilters() {
  const index = db.meta.wellnessCategoryIndex || {};
  const kf = db.meta.knownForThemeIndex || {};

  if (els.knownFor) {
    els.knownFor.innerHTML = '<option value="">All groups</option>';
    for (const k of sortKnownForKeys(kf)) {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k.replace(/_/g, " ");
      opt.title = kf[k];
      els.knownFor.appendChild(opt);
    }
  }

  if (els.category) {
    els.category.innerHTML = '<option value="">All categories</option>';
    for (const k of Object.keys(index).sort((a, b) => a.localeCompare(b))) {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k.replace(/_/g, " ");
      els.category.appendChild(opt);
    }
  }

  if (els.compound) {
    els.compound.innerHTML = '<option value="">All types</option>';
    for (const c of collectCompoundTypes(db.entries)) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = formatCompoundType(c);
      els.compound.appendChild(opt);
    }
  }

  if (els.evidenceFilter) {
    els.evidenceFilter.innerHTML = '<option value="">All evidence</option>';
    for (const t of EVIDENCE_TIERS) {
      const opt = document.createElement("option");
      opt.value = t.key;
      opt.textContent = t.label;
      els.evidenceFilter.appendChild(opt);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Initialization                                                     */
/* ------------------------------------------------------------------ */

async function init() {
  loadTheme();

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    db = await res.json();
  } catch (err) {
    if (els.loadError) {
      els.loadError.hidden = false;
      els.loadError.textContent =
        `Could not load the peptide database. ${err.message || err}`;
    }
    if (els.grid) els.grid.removeAttribute("aria-busy");
    return;
  }

  document.title = `BadgerSkope — ${db.entries.length} Peptides`;
  doseLegend = db.meta?.doseGuidelinesLegend || {};
  if (els.disclaimer) els.disclaimer.textContent = db.disclaimer || "";
  if (els.footerMeta) {
    const built = db.meta?.builtAt || "";
    const ver = db.meta?.schemaVersion || "";
    els.footerMeta.textContent = [
      `${db.entries.length} entries`,
      ver ? `v${ver}` : "",
      built ? `Updated ${new Date(built).toLocaleDateString()}` : "",
    ]
      .filter(Boolean)
      .join(" \u00b7 ");
  }

  populateFilters();
  updateSelectionToolbar();
  updateBookmarksBar();
  applyHashOnLoad();

  /* Filter events */
  const debouncedRender = debounce(render, 150);
  if (els.search) els.search.addEventListener("input", debouncedRender);
  if (els.category) els.category.addEventListener("change", render);
  if (els.compound) els.compound.addEventListener("change", render);
  if (els.knownFor) els.knownFor.addEventListener("change", render);
  if (els.sort) els.sort.addEventListener("change", render);
  if (els.evidenceFilter) els.evidenceFilter.addEventListener("change", render);

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      els.search.value = "";
      els.category.value = "";
      els.compound.value = "";
      els.knownFor.value = "";
      if (els.evidenceFilter) els.evidenceFilter.value = "";
      els.sort.value = "title";
      render();
    });
  }

  /* Selection actions */
  if (els.selectVisible) {
    els.selectVisible.addEventListener("click", () => {
      for (const e of lastVisibleList) selectedIds.add(getEntryId(e));
      updateSelectionToolbar();
      render();
    });
  }

  if (els.clearSelection) {
    els.clearSelection.addEventListener("click", () => {
      selectedIds.clear();
      updateSelectionToolbar();
      render();
    });
  }

  if (els.viewSelected) {
    els.viewSelected.addEventListener("click", () => {
      const entries = selectedEntriesSorted();
      if (entries.length === 0) return;
      openDetail(entries[0], { multiQueue: entries });
    });
  }

  if (els.compareSelected) {
    els.compareSelected.addEventListener("click", () => {
      if (selectedIds.size >= 2) switchTab("compare");
    });
  }

  /* Detail navigation */
  if (els.detailPrev) {
    els.detailPrev.addEventListener("click", () => {
      if (detailIndex > 0) showDetailAt(detailIndex - 1);
    });
  }
  if (els.detailNext) {
    els.detailNext.addEventListener("click", () => {
      if (detailIndex < detailQueue.length - 1) showDetailAt(detailIndex + 1);
    });
  }
  if (els.detailClose) els.detailClose.addEventListener("click", closeDetail);
  if (els.dialog) {
    els.dialog.addEventListener("click", (e) => {
      if (e.target === els.dialog) closeDetail();
    });
  }

  /* Tab navigation */
  if (els.tabBrowse) els.tabBrowse.addEventListener("click", () => switchTab("browse"));
  if (els.tabCompare) els.tabCompare.addEventListener("click", () => switchTab("compare"));
  if (els.tabStats) els.tabStats.addEventListener("click", () => switchTab("stats"));

  /* Theme toggle */
  if (els.themeToggle) els.themeToggle.addEventListener("click", toggleTheme);

  /* Back to top */
  initBackToTop();

  /* Keyboard shortcuts */
  initKeyboard();

  /* Shortcuts dialog close */
  const shortcutsClose = document.getElementById("shortcuts-close");
  if (shortcutsClose && els.shortcutsDialog) {
    shortcutsClose.addEventListener("click", () => els.shortcutsDialog.close());
  }
  if (els.shortcutsDialog) {
    els.shortcutsDialog.addEventListener("click", (e) => {
      if (e.target === els.shortcutsDialog) els.shortcutsDialog.close();
    });
  }

  /* Hash change */
  window.addEventListener("hashchange", () => {
    const params = readHashParams();
    if (params.entry) {
      const entry = getEntryByTitle(params.entry);
      if (entry) openDetail(entry);
    }
  });

  if (els.grid) els.grid.removeAttribute("aria-busy");

  /* Card mouse-tracking glow */
  if (els.grid) {
    els.grid.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(0);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(0);
      card.style.setProperty("--mouse-x", x + "%");
      card.style.setProperty("--mouse-y", y + "%");
    });
  }
}

init();