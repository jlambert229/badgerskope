/**
 * Detail modal: rendering, navigation, and event binding.
 */

import { state, getEntryId, getEntryByTitle } from './state.js';
import { els } from './dom.js';
import {
  escapeHtml, formatCompoundType, wellnessLabel,
  FRIENDLY_CATEGORIES, getDisplayName, getCatalogTitle,
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
  const catalogTitle = getCatalogTitle(entry);
  const displayName = getDisplayName(entry);
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

  const compoundDesc = entry.compoundType ? compoundTypeExplainer(entry.compoundType) : "";

  return `
    <div class="detail__answer-zone" style="border-left: 4px solid ${tier.color}">
      <h2 class="detail__title" id="detail-title" data-catalog-title="${escapeHtml(catalogTitle)}">${escapeHtml(displayName)}</h2>
      ${catalogTitle && displayName !== catalogTitle
        ? `<p class="detail__catalog-line">${escapeHtml(catalogTitle)}</p>`
        : ""
      }
      ${compoundDesc ? `<p class="detail__what-it-is">${escapeHtml(compoundDesc)}</p>` : ""}

      <div class="detail__evidence-block">
        <span class="detail__evidence-badge" style="background:${tier.color}">${escapeHtml(tier.label)}</span>
        <span class="detail__evidence-subtitle">${escapeHtml(tier.subtitle || "")}</span>
      </div>

      ${dq?.headline
        ? `<p class="detail__known-for">${escapeHtml(dq.headline)}</p>`
        : ""
      }

      <p class="detail__summary-prose">${escapeHtml(entry.researchSummary || "")}</p>

      <div class="detail__answer-actions">
        <button type="button" class="detail__bookmark-btn" data-entry-id="${escapeHtml(id)}" aria-label="Toggle bookmark">
          ${isBookmarked ? "\u2605" : "\u2606"} Bookmark
        </button>
      </div>
    </div>

    ${cats ? `<div class="detail__cats">${cats}</div>` : ""}

    ${(() => {
      const fdaStatus = tier.tier === "approved" ? "FDA approved" :
        tier.tier === "pivotal" ? "Not FDA-approved (in clinical trials)" :
        tier.tier === "phase1" ? "Not FDA-approved (early research)" :
        tier.tier === "preclinical" ? "Not FDA-approved (animal studies only)" :
        tier.tier === "practice" ? "Not FDA-approved (clinic use only)" : "Unknown regulatory status";
      const dopingFlag = entry.dopingStatus?.prohibited ? "Prohibited by WADA/sport agencies" : "";
      const srcCount = (entry.sources || []).length;

      return `<div class="detail__section detail__section--safety">
        <h3>Safety & status</h3>
        <ul class="safety-list">
          <li><strong>Regulatory:</strong> ${escapeHtml(fdaStatus)}</li>
          ${dopingFlag ? `<li><strong>Sport:</strong> ${escapeHtml(dopingFlag)}</li>` : ""}
          <li><strong>Sources:</strong> ${srcCount} published reference${srcCount !== 1 ? "s" : ""} linked below</li>
        </ul>
        <p class="detail__muted">Here's what we know. Talk to your doctor about what it means for you.</p>
      </div>`;
    })()}

    ${entry.notes ? `<div class="detail__section detail__section--note"><h3>Heads up</h3><p class="detail__prose">${escapeHtml(entry.notes)}</p></div>` : ""}

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
        <h3>How strong is the evidence?</h3>
        <p class="detail__help">Compared to the ${totalInCat} other entries in "${escapeHtml(catName)}".</p>
        <p class="ev-compare__verdict" style="color:${thisTier.color}">This entry has <strong>${escapeHtml(position)}</strong> evidence for its category (${escapeHtml(thisTier.label)}).</p>
        <div class="ev-compare">${barHtml}</div>
      </div>`;
    })()}

    ${benefits ? `<div class="detail__section">
      <h3>What researchers found</h3>
      <ul class="detail__benefits">${benefits}</ul>
    </div>` : ""}

    ${apps ? `<div class="detail__section">
      <h3>People research this for</h3>
      <ul class="detail__apps">${apps}</ul>
    </div>` : ""}

    ${entry.dosingTimingNotes ? `<div class="detail__section">
      <h3>How people use it</h3>
      <p class="detail__help">This describes what has been reported in studies and forums. It is not a dosing guide for you. Talk to your doctor.</p>
      <p class="detail__prose">${escapeHtml(entry.dosingTimingNotes)}</p>
    </div>` : ""}

    ${entry.cyclingNotes ? `<div class="detail__section">
      <h3>Cycling pattern</h3>
      <p class="detail__help">Cycling patterns come from community reports and limited research. Your needs may differ entirely.</p>
      <p class="detail__prose">${escapeHtml(entry.cyclingNotes)}</p>
    </div>` : ""}

    ${doseRows
      ? `<div class="detail__section">
      <h3>Doses from published research</h3>
      <p class="detail__help">These numbers appeared in published studies. They are not personal dosing instructions. Researchers used these in controlled settings with medical supervision.</p>
      <div class="table-wrap">
        <table class="doses">
          <thead><tr><th>What it was used for</th><th>Evidence</th><th>What the research found</th></tr></thead>
          <tbody>${doseRows}</tbody>
        </table>
      </div>
    </div>`
      : ""
    }

    ${synergy ? `<div class="detail__section">
      <h3>Often mentioned alongside</h3>
      <p class="detail__help">These appear together in research or product lines. Not a recommendation to combine.</p>
      <ul class="synergy-list">${synergy}</ul>
    </div>` : ""}

    ${dqThemes ? `<div class="detail__section">
      <h3>Research themes</h3>
      <div class="detail__row">${dqThemes}</div>${dq?.basisNote ? `<p class="detail__muted">${escapeHtml(dq.basisNote)}</p>` : ""}
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
        <h3>Sources</h3>
        <p class="detail__help">${qualityParts.join(" \u00b7 ")}</p>
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
  if (_updateHash) {
    _updateHash("entry=" + encodeURIComponent(getCatalogTitle(entry)));
  }
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
