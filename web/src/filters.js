/**
 * Search, filter, sort, and filter-population helpers.
 */

import { tierForKey, highestTier, KNOWN_FOR_THEME_ORDER, EVIDENCE_TIERS } from "./constants.js";
import { formatCompoundType, FRIENDLY_CATEGORIES } from "./utils.js";
import { state } from "./state.js";
import { els } from "./dom.js";
import { GROUP_THEME_LABELS, sortKnownForKeys } from "./groups.js";

export function collectCompoundTypes(entries) {
  const set = new Set();
  for (const e of entries) {
    if (e.compoundType) set.add(e.compoundType);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function matchesSearch(entry, q) {
  if (!q) return true;
  const idx = state.db?.meta?.knownForThemeIndex || {};
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

export function matchesKnownFor(entry, themeKey) {
  if (!themeKey) return true;
  return (entry.distinctiveQuality?.themes || []).includes(themeKey);
}

export function matchesCategory(entry, cat) {
  if (!cat) return true;
  return (entry.wellnessCategories || []).includes(cat);
}

export function matchesCompound(entry, c) {
  if (!c) return true;
  return entry.compoundType === c;
}

export function matchesEvidence(entry, filterKey) {
  if (!filterKey) return true;
  const t = highestTier(entry);
  return t.key === filterKey;
}

export function sortEntries(entries, mode) {
  const out = [...entries];
  if (mode === "title") {
    out.sort((a, b) => (a.catalog?.title || "").localeCompare(b.catalog?.title || ""));
  } else if (mode === "title-desc") {
    out.sort((a, b) => (b.catalog?.title || "").localeCompare(a.catalog?.title || ""));
  } else if (mode === "evidence") {
    out.sort((a, b) => highestTier(a).rank - highestTier(b).rank);
  } else if (mode === "type") {
    out.sort((a, b) => (a.compoundType || "zzz").localeCompare(b.compoundType || "zzz"));
  }
  return out;
}

export function populateFilters() {
  const index = state.db.meta.wellnessCategoryIndex || {};
  const kf = state.db.meta.knownForThemeIndex || {};

  if (els.knownFor) {
    els.knownFor.innerHTML = '<option value="">All themes</option>';
    for (const k of sortKnownForKeys(kf)) {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = GROUP_THEME_LABELS[k] || k.replace(/_/g, " ");
      opt.title = kf[k];
      els.knownFor.appendChild(opt);
    }
  }

  if (els.category) {
    els.category.innerHTML = '<option value="">All categories</option>';
    for (const k of Object.keys(index).sort((a, b) => {
      const la = FRIENDLY_CATEGORIES[a] || a;
      const lb = FRIENDLY_CATEGORIES[b] || b;
      return la.localeCompare(lb);
    })) {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = FRIENDLY_CATEGORIES[k] || k.replace(/_/g, " ");
      els.category.appendChild(opt);
    }
  }

  if (els.compound) {
    els.compound.innerHTML = '<option value="">All types</option>';
    for (const c of collectCompoundTypes(state.db.entries)) {
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
