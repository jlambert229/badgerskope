/**
 * Comparison table rendering.
 */

import { state, getEntryId, getEntryByTitle } from './state.js';
import { els } from './dom.js';
import { escapeHtml, formatCompoundType, wellnessLabel } from './utils.js';
import { highestTier } from './constants.js';
import { formatEvidenceBasis } from './detail.js';
import { selectedEntriesSorted } from './selection.js';

/* Late-bound callbacks injected by main.js to avoid circular deps */
let _openDetail = null;
let _updateSelectionToolbar = null;
let _render = null;

export function setCompareCallbacks({ openDetail, updateSelectionToolbar, render }) {
  _openDetail = openDetail;
  _updateSelectionToolbar = updateSelectionToolbar;
  _render = render;
}

export function renderComparisonTable() {
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
  const catIndex = state.db.meta.wellnessCategoryIndex || {};

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

  /* Highlight winners in comparison rows */
  els.compareTable.querySelectorAll("tbody tr").forEach(tr => {
    const label = tr.querySelector("th")?.textContent?.trim();
    const cells = [...tr.querySelectorAll("td")];
    if (cells.length < 2) return;

    if (label === "Evidence") {
      const tierRank = { "FDA approved": 0, "Strong human trials": 1, "Early human studies": 2, "Animal studies only": 3, "Clinic practice": 4, "Unknown": 5 };
      let bestRank = 999, bestIdx = -1;
      cells.forEach((td, i) => {
        const text = td.textContent.trim();
        const rank = tierRank[text] ?? 999;
        if (rank < bestRank) { bestRank = rank; bestIdx = i; }
      });
      if (bestIdx >= 0 && bestRank < 5) cells[bestIdx].classList.add("compare-winner");
    }
  });

  els.compareTable.querySelectorAll(".compare-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedIds.delete(btn.dataset.removeId);
      if (_updateSelectionToolbar) _updateSelectionToolbar();
      renderComparisonTable();
      if (_render) _render();
    });
  });

  els.compareTable.querySelectorAll(".synergy-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const t = pill.dataset.synergyTitle;
      const entry = getEntryByTitle(t);
      if (entry && _openDetail) _openDetail(entry);
    });
  });
}
