/**
 * Detail modal: rendering, navigation, and event binding.
 */

import { state, getEntryId, getEntryByTitle } from './state.js';
import { els } from './dom.js';
import {
  escapeHtml, formatCompoundType, wellnessLabel,
  FRIENDLY_CATEGORIES
} from './utils.js';
import {
  highestTier, evidenceTierExplainer, compoundTypeExplainer,
  tierForKey, EVIDENCE_TIERS
} from './constants.js';
import { GROUP_THEME_LABELS } from './groups.js';
import { toggleBookmark } from './bookmarks.js';

/* Late-bound callbacks injected by main.js to avoid circular deps */
let _render = null;
let _updateHash = null;
let _readHashParams = null;
let _writeHashParams = null;

export function setDetailCallbacks({ render, updateHash, readHashParams, writeHashParams }) {
  _render = render;
  _updateHash = updateHash;
  _readHashParams = readHashParams;
  _writeHashParams = writeHashParams;
}

/* ------------------------------------------------------------------ */
/*  Evidence-basis formatting                                          */
/* ------------------------------------------------------------------ */

export function formatEvidenceBasis(key) {
  const tip = state.doseLegend[key] || "";
  const label = key ? key.replace(/_/g, " ") : "";
  const t = tierForKey(key);
  return { label, tip, tier: t.tier, color: t.color };
}

/* ------------------------------------------------------------------ */
/*  Synergy pills                                                      */
/* ------------------------------------------------------------------ */

export function renderSynergyPills(synergyList) {
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

/* ------------------------------------------------------------------ */
/*  Detail HTML builder                                                */
/* ------------------------------------------------------------------ */

export function renderDetailHtml(entry) {
  const catIndex = state.db.meta.wellnessCategoryIndex || {};
  const kfIdx = state.db.meta.knownForThemeIndex || {};
  const title = entry.catalog?.title || "Entry";
  const id = getEntryId(entry);
  const isBookmarked = state.bookmarks.has(id);
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
      const friendlyTheme = GROUP_THEME_LABELS[k] || k.replace(/_/g, " ");
      return `<span class="detail__badge" title="${escapeHtml(tip)}">${escapeHtml(friendlyTheme)}</span>`;
    })
    .join("");

  return `
    <div class="detail__hero-bar" style="border-left: 4px solid ${tier.color}">
      <div class="detail__hero-top">
        <div>
          <h2 class="detail__title" id="detail-title">${escapeHtml(title)}</h2>
          ${entry.compoundType ? `<span class="detail__compound-type" title="${escapeHtml(compoundTypeExplainer(entry.compoundType))}">${escapeHtml(formatCompoundType(entry.compoundType))}</span>` : ""}
        </div>
        <div class="detail__hero-right">
          <span class="detail__evidence-badge" style="background:${tier.color}" title="${escapeHtml(evidenceTierExplainer(tier.tier))}">${escapeHtml(tier.label)}</span>
        </div>
      </div>
      <div class="detail__hero-actions">
        <button type="button" class="detail__bookmark-btn" data-entry-id="${escapeHtml(id)}" aria-label="Toggle bookmark">
          ${isBookmarked ? "\u2605" : "\u2606"} Bookmark
        </button>
      </div>
    </div>

    ${cats ? `<div class="detail__cats">${cats}</div>` : ""}

    ${dq?.headline
      ? `<div class="detail__section detail__section--highlight">
      <h3>What it's known for</h3>
      <p class="detail__prose detail__prose--lg">${escapeHtml(dq.headline)}</p>
      ${dqThemes ? `<div class="detail__row">${dqThemes}</div>` : ""}
      ${dq.basisNote ? `<p class="detail__muted">${escapeHtml(dq.basisNote)}</p>` : ""}
    </div>`
      : ""
    }

    <div class="detail__section">
      <h3>In plain English</h3>
      <p class="detail__prose">${escapeHtml(entry.researchSummary || "")}</p>
    </div>

    ${(() => {
      const primaryCat = (entry.wellnessCategories || [])[0];
      if (!primaryCat) return "";
      const catEntries = state.db.entries.filter(e => (e.wellnessCategories || []).includes(primaryCat));
      if (catEntries.length < 2) return "";
      const catName = FRIENDLY_CATEGORIES[primaryCat] || primaryCat.replace(/_/g, " ");
      const tierCounts = {};
      catEntries.forEach(e => {
        const t = highestTier(e);
        tierCounts[t.label] = (tierCounts[t.label] || 0) + 1;
      });
      const thisTier = tier;
      const betterCount = catEntries.filter(e => highestTier(e).rank < thisTier.rank).length;
      const sameCount = catEntries.filter(e => highestTier(e).rank === thisTier.rank).length;
      const totalInCat = catEntries.length;
      const position = betterCount === 0 ? "the strongest" : betterCount < totalInCat / 2 ? "above average" : "below average";

      const barHtml = EVIDENCE_TIERS
        .filter(t => tierCounts[t.label])
        .map(t => {
          const count = tierCounts[t.label] || 0;
          const pct = ((count / totalInCat) * 100).toFixed(0);
          const isThis = t.tier === thisTier.tier;
          return `<div class="ev-compare__bar${isThis ? ' ev-compare__bar--current' : ''}">
            <span class="ev-compare__label">${escapeHtml(t.label)}${isThis ? ' (this)' : ''}</span>
            <div class="ev-compare__track"><div class="ev-compare__fill" style="width:${pct}%;background:${t.color}"></div></div>
            <span class="ev-compare__count">${count}</span>
          </div>`;
        }).join("");

      return `<div class="detail__section">
        <h3>Evidence in context</h3>
        <p class="detail__help">How this compound's evidence compares to the ${totalInCat} other entries in "${escapeHtml(catName)}".</p>
        <p class="ev-compare__verdict" style="color:${thisTier.color}">This entry has <strong>${escapeHtml(position)}</strong> evidence for its category (${escapeHtml(thisTier.label)}).</p>
        <div class="ev-compare">${barHtml}</div>
      </div>`;
    })()}

    ${entry.notes ? `<div class="detail__section detail__section--note"><h3>Important note</h3><p class="detail__prose">${escapeHtml(entry.notes)}</p></div>` : ""}

    ${benefits ? `<div class="detail__section">
      <h3>What the research shows</h3>
      <p class="detail__help">Each line is tagged by the type of evidence behind it.</p>
      <ul class="detail__benefits">${benefits}</ul>
    </div>` : ""}

    <div class="detail__section">
      <h3>How it's typically used</h3>
      <p class="detail__prose">${escapeHtml(entry.dosingTimingNotes || "No established dosing information available.")}</p>
    </div>

    <details class="detail__section detail__collapsible">
      <summary><h3>Cycling pattern</h3></summary>
      <p class="detail__prose">${escapeHtml(entry.cyclingNotes || "No established cycling pattern.")}</p>
    </details>

    ${doseRows
      ? `<details class="detail__section detail__collapsible">
      <summary><h3>Published doses from the literature</h3></summary>
      <p class="detail__help">These are doses that appeared in published research. They are not personal dosing instructions.</p>
      <div class="table-wrap">
        <table class="doses">
          <thead><tr><th>What it was used for</th><th>Evidence</th><th>What the research found</th></tr></thead>
          <tbody>${doseRows}</tbody>
        </table>
      </div>
    </details>`
      : ""
    }

    ${apps ? `<div class="detail__section">
      <h3>Potential uses people explore</h3>
      <p class="detail__help">What people are looking for when they research this compound, with evidence quality noted.</p>
      <ul class="detail__apps">${apps}</ul>
    </div>` : ""}

    ${synergy ? `<div class="detail__section">
      <h3>Often discussed alongside</h3>
      <p class="detail__help">These appear together in research, product lines, or practice patterns \u2014 not a recommendation to combine.</p>
      <ul class="synergy-list">${synergy}</ul>
    </div>` : ""}

    ${(() => {
      const srcList = entry.sources || [];
      if (srcList.length === 0) return '<div class="detail__section"><h3>Sources</h3><p class="detail__muted">No linked sources for this entry.</p></div>';

      let pubmed = 0, pmc = 0, wiki = 0, fda = 0, other = 0;
      srcList.forEach(s => {
        const url = (s.url || "").toLowerCase();
        if (url.includes("pubmed.ncbi") || url.includes("/pubmed/")) pubmed++;
        else if (url.includes("/pmc/") || url.includes("ncbi.nlm.nih.gov/pmc")) pmc++;
        else if (url.includes("wikipedia.org")) wiki++;
        else if (url.includes("fda.gov") || url.includes("medlineplus")) fda++;
        else other++;
      });

      const qualityParts = [];
      if (fda > 0) qualityParts.push(`${fda} regulatory`);
      if (pubmed + pmc > 0) qualityParts.push(`${pubmed + pmc} peer-reviewed`);
      if (wiki > 0) qualityParts.push(`${wiki} reference`);
      if (other > 0) qualityParts.push(`${other} other`);

      const qualityScore = fda * 4 + (pubmed + pmc) * 3 + wiki * 1 + other * 1;
      const maxScore = srcList.length * 4;
      const pct = maxScore > 0 ? Math.round((qualityScore / maxScore) * 100) : 0;
      const barColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#14b8a6" : pct >= 25 ? "#f59e0b" : "#9ca3af";

      return `<div class="detail__section">
        <h3>Verify it yourself</h3>
        <p class="detail__help">Published references you can check.</p>
        <div class="source-quality">
          <div class="source-quality__bar">
            <span class="source-quality__label">Source quality</span>
            <div class="source-quality__track"><div class="source-quality__fill" style="width:${pct}%;background:${barColor}"></div></div>
            <span class="source-quality__pct">${pct}%</span>
          </div>
          <span class="source-quality__breakdown">${qualityParts.join(" \u00b7 ")}</span>
        </div>
        <ul class="detail__sources">${sources}</ul>
      </div>`;
    })()}

    <div class="detail__disclaimer">
      <strong>Reminder:</strong> This is a research summary, not medical advice. Consult a licensed professional before making health decisions.
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/*  Detail navigation                                                  */
/* ------------------------------------------------------------------ */

export function syncDetailNav() {
  const multi = state.detailQueue.length > 1;
  els.detailNav.hidden = !multi;
  if (!multi) return;
  els.detailNavPos.textContent = `${state.detailIndex + 1} of ${state.detailQueue.length}`;
  els.detailPrev.disabled = state.detailIndex <= 0;
  els.detailNext.disabled = state.detailIndex >= state.detailQueue.length - 1;
}

export function showDetailAt(index) {
  state.detailIndex = index;
  const entry = state.detailQueue[state.detailIndex];
  if (!entry) return;
  els.detailBody.innerHTML = renderDetailHtml(entry);
  syncDetailNav();
  bindDetailEvents();
  if (_updateHash) _updateHash("entry=" + encodeURIComponent(entry.catalog?.title || ""));
}

export function bindDetailEvents() {
  const bookmarkBtn = els.detailBody.querySelector(".detail__bookmark-btn");
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", () => {
      const id = bookmarkBtn.dataset.entryId;
      toggleBookmark(id);
      bookmarkBtn.innerHTML = (state.bookmarks.has(id) ? "\u2605" : "\u2606") + " Bookmark";
      if (_render) _render();
    });
  }
  els.detailBody.querySelectorAll(".synergy-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const t = pill.dataset.synergyTitle;
      const entry = getEntryByTitle(t);
      if (entry) {
        state.detailQueue = [entry];
        state.detailIndex = 0;
        showDetailAt(0);
      }
    });
  });
}

export function openDetail(entry, opts = {}) {
  if (opts.multiQueue && opts.multiQueue.length > 1) {
    state.detailQueue = opts.multiQueue;
    const i = state.detailQueue.findIndex((e) => getEntryId(e) === getEntryId(entry));
    state.detailIndex = i >= 0 ? i : 0;
  } else {
    state.detailQueue = [entry];
    state.detailIndex = 0;
  }
  showDetailAt(state.detailIndex);
  els.dialog.showModal();
  els.dialog.querySelector(".modal__panel")?.scrollTo(0, 0);
}

export function closeDetail() {
  els.dialog.close();
  if (_readHashParams && _writeHashParams) {
    const params = _readHashParams();
    delete params.entry;
    _writeHashParams(params);
  }
}
