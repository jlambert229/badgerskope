/**
 * Shared checks for peptide library export (PRD Part III §7.5–7.6, B6).
 * - **public** (default): matches shipped `peptide-info-database.json` (sparse keys allowed).
 * - **strict**: aligns with `templates/peptide-entry.template.json` for post-normalization CI.
 */

const REQUIRED_ENTRY_KEYS_STRICT = [
  "catalog",
  "compoundType",
  "commonSideEffects",
  "cyclingNotes",
  "doseGuidelines",
  "dosingTimingNotes",
  "notes",
  "potentialApplications",
  "reportedBenefits",
  "researchSummary",
  "sources",
  "synergisticWith",
  "wellnessCategories",
  "distinctiveQuality",
];

const DOSE_GUIDELINE_KEYS = [
  "indicationOrContext",
  "evidenceBasis",
  "minimumEffectiveDoseNotes",
];

const POTENTIAL_APP_KEYS = ["evidenceNote", "personCenteredBenefit"];

const SOURCE_KEYS = ["label", "url"];

/**
 * @param {unknown} data
 * @param {{ mode?: "public" | "strict" }} [options]
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateLibraryExport(data, options = {}) {
  const mode = options.mode === "strict" ? "strict" : "public";
  if (mode === "strict") {
    return validateStrict(data);
  }
  return validatePublic(data);
}

/**
 * @param {unknown} data
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validatePublic(data) {
  const errors = [];
  const warnings = [];

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    errors.push("root must be a JSON object");
    return { errors, warnings };
  }

  const root = /** @type {Record<string, unknown>} */ (data);

  if (typeof root.disclaimer !== "string" || !root.disclaimer.trim()) {
    errors.push("disclaimer must be a non-empty string");
  }

  if (!root.meta || typeof root.meta !== "object" || Array.isArray(root.meta)) {
    errors.push("meta must be an object");
  } else {
    const meta = /** @type {Record<string, unknown>} */ (root.meta);
    if (typeof meta.builtAt !== "string" || !meta.builtAt.trim()) {
      errors.push("meta.builtAt must be a non-empty string (ISO-8601 recommended)");
    }
    if (typeof meta.entryCount !== "number" || !Number.isInteger(meta.entryCount) || meta.entryCount < 0) {
      errors.push("meta.entryCount must be a non-negative integer");
    }
    if (typeof meta.schemaVersion !== "string" || !meta.schemaVersion.trim()) {
      errors.push("meta.schemaVersion must be a non-empty string");
    }
  }

  if (!Array.isArray(root.entries)) {
    errors.push("entries must be an array");
    return { errors, warnings };
  }

  const entries = root.entries;
  const meta = /** @type {Record<string, unknown>} */ (root.meta || {});
  if (typeof meta.entryCount === "number" && meta.entryCount !== entries.length) {
    errors.push(
      `meta.entryCount (${meta.entryCount}) must equal entries.length (${entries.length})`,
    );
  }

  const titles = [];
  let sparseSynergy = 0;
  let sparseSafety = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prefix = `entries[${i}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    const e = /** @type {Record<string, unknown>} */ (entry);

    if (!e.catalog || typeof e.catalog !== "object" || Array.isArray(e.catalog)) {
      errors.push(`${prefix}.catalog must be an object`);
    } else {
      const cat = /** @type {Record<string, unknown>} */ (e.catalog);
      if (typeof cat.title !== "string" || !cat.title.trim()) {
        errors.push(`${prefix}.catalog.title must be a non-empty string`);
      } else {
        titles.push(cat.title.trim());
      }
      if (
        "commonDrugName" in cat &&
        cat.commonDrugName !== null &&
        typeof cat.commonDrugName !== "string"
      ) {
        errors.push(`${prefix}.catalog.commonDrugName must be a string if present`);
      }
    }

    if (typeof e.compoundType !== "string" || !e.compoundType.trim()) {
      errors.push(`${prefix}.compoundType must be a non-empty string`);
    }

    if ("researchSummary" in e && typeof e.researchSummary !== "string") {
      errors.push(`${prefix}.researchSummary must be a string when present`);
    }

    if ("cyclingNotes" in e && e.cyclingNotes !== null && typeof e.cyclingNotes !== "string") {
      errors.push(`${prefix}.cyclingNotes must be a string when present`);
    }
    if ("dosingTimingNotes" in e && e.dosingTimingNotes !== null && typeof e.dosingTimingNotes !== "string") {
      errors.push(`${prefix}.dosingTimingNotes must be a string when present`);
    }
    if ("notes" in e && e.notes !== null && typeof e.notes !== "string") {
      errors.push(`${prefix}.notes must be a string when present`);
    }

    if (!("synergisticWith" in e)) {
      sparseSynergy += 1;
    } else {
      validateSynergisticWith(prefix, e.synergisticWith, errors);
    }

    if (!("commonSideEffects" in e)) {
      sparseSafety += 1;
    } else {
      validateCommonSideEffects(prefix, e.commonSideEffects, errors);
    }

    validateDoseGuidelinesIfPresent(prefix, e.doseGuidelines, errors);
    validatePotentialApplicationsIfPresent(prefix, e.potentialApplications, errors);
    validateReportedBenefitsIfPresent(prefix, e.reportedBenefits, errors);
    validateSourcesIfPresent(prefix, e.sources, errors);
    validateStringArrayIfPresent(prefix, "wellnessCategories", e.wellnessCategories, errors, false);
    validateDistinctiveQualityIfPresent(prefix, e.distinctiveQuality, errors);
  }

  const seen = new Map();
  for (const t of titles) {
    seen.set(t, (seen.get(t) || 0) + 1);
  }
  for (const [t, n] of seen) {
    if (n > 1) {
      errors.push(`duplicate catalog.title across entries: "${t}" (${n} occurrences)`);
    }
  }

  if (sparseSynergy > 0) {
    warnings.push(
      `${sparseSynergy} entries omit synergisticWith (strict mode will require []); normalize when tightening export.`,
    );
  }
  if (sparseSafety > 0) {
    warnings.push(
      `${sparseSafety} entries omit commonSideEffects (hidden under experimental filter until filled); see web/src/main.js hasSafetyData.`,
    );
  }

  return { errors, warnings };
}

/**
 * @param {unknown} data
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validateStrict(data) {
  const errors = [];
  const warnings = [];

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    errors.push("root must be a JSON object");
    return { errors, warnings };
  }

  const root = /** @type {Record<string, unknown>} */ (data);

  if (typeof root.disclaimer !== "string" || !root.disclaimer.trim()) {
    errors.push("disclaimer must be a non-empty string");
  }

  if (!root.meta || typeof root.meta !== "object" || Array.isArray(root.meta)) {
    errors.push("meta must be an object");
  } else {
    const meta = /** @type {Record<string, unknown>} */ (root.meta);
    if (typeof meta.builtAt !== "string" || !meta.builtAt.trim()) {
      errors.push("meta.builtAt must be a non-empty string (ISO-8601 recommended)");
    }
    if (typeof meta.entryCount !== "number" || !Number.isInteger(meta.entryCount) || meta.entryCount < 0) {
      errors.push("meta.entryCount must be a non-negative integer");
    }
    if (typeof meta.schemaVersion !== "string" || !meta.schemaVersion.trim()) {
      errors.push("meta.schemaVersion must be a non-empty string");
    }
  }

  if (!Array.isArray(root.entries)) {
    errors.push("entries must be an array");
    return { errors, warnings };
  }

  const entries = root.entries;
  const meta = /** @type {Record<string, unknown>} */ (root.meta || {});
  if (typeof meta.entryCount === "number" && meta.entryCount !== entries.length) {
    errors.push(
      `meta.entryCount (${meta.entryCount}) must equal entries.length (${entries.length})`,
    );
  }

  const titles = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prefix = `entries[${i}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    const e = /** @type {Record<string, unknown>} */ (entry);
    for (const key of REQUIRED_ENTRY_KEYS_STRICT) {
      if (!(key in e)) {
        errors.push(`${prefix} missing required key "${key}"`);
      }
    }
    if (!e.catalog || typeof e.catalog !== "object" || Array.isArray(e.catalog)) {
      errors.push(`${prefix}.catalog must be an object`);
    } else {
      const cat = /** @type {Record<string, unknown>} */ (e.catalog);
      if (typeof cat.title !== "string" || !cat.title.trim()) {
        errors.push(`${prefix}.catalog.title must be a non-empty string`);
      } else {
        titles.push(cat.title.trim());
      }
      if (
        "commonDrugName" in cat &&
        cat.commonDrugName !== null &&
        typeof cat.commonDrugName !== "string"
      ) {
        errors.push(`${prefix}.catalog.commonDrugName must be a string if present`);
      }
    }
    if (typeof e.compoundType !== "string" || !e.compoundType.trim()) {
      errors.push(`${prefix}.compoundType must be a non-empty string`);
    }
    if ("commonSideEffects" in e) {
      validateCommonSideEffects(prefix, e.commonSideEffects, errors);
    }
    if ("cyclingNotes" in e && typeof e.cyclingNotes !== "string") {
      errors.push(`${prefix}.cyclingNotes must be a string`);
    }
    if ("doseGuidelines" in e) {
      validateDoseGuidelines(prefix, e.doseGuidelines, errors);
    }
    if ("dosingTimingNotes" in e && typeof e.dosingTimingNotes !== "string") {
      errors.push(`${prefix}.dosingTimingNotes must be a string`);
    }
    if ("notes" in e && typeof e.notes !== "string") {
      errors.push(`${prefix}.notes must be a string`);
    }
    if ("potentialApplications" in e) {
      validatePotentialApplications(prefix, e.potentialApplications, errors);
    }
    if ("reportedBenefits" in e) {
      validateReportedBenefits(prefix, e.reportedBenefits, errors);
    }
    if ("researchSummary" in e) {
      if (typeof e.researchSummary !== "string" || !e.researchSummary.trim()) {
        errors.push(`${prefix}.researchSummary must be a non-empty string`);
      }
    }
    if ("sources" in e) {
      validateSources(prefix, e.sources, errors);
    }
    if ("synergisticWith" in e) {
      validateSynergisticWith(prefix, e.synergisticWith, errors);
    }
    if ("wellnessCategories" in e) {
      validateStringArray(prefix, "wellnessCategories", e.wellnessCategories, errors, true);
    }
    if ("distinctiveQuality" in e) {
      validateDistinctiveQuality(prefix, e.distinctiveQuality, errors);
    }
  }

  const seen = new Map();
  for (const t of titles) {
    seen.set(t, (seen.get(t) || 0) + 1);
  }
  for (const [t, n] of seen) {
    if (n > 1) {
      errors.push(`duplicate catalog.title across entries: "${t}" (${n} occurrences)`);
    }
  }

  return { errors, warnings };
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateDoseGuidelinesIfPresent(prefix, arr, errors) {
  if (arr === undefined || arr === null) {
    return;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${prefix}.doseGuidelines must be an array when present`);
    return;
  }
  if (arr.length === 0) {
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.doseGuidelines[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    for (const k of DOSE_GUIDELINE_KEYS) {
      if (typeof o[k] !== "string" || !String(o[k]).trim()) {
        errors.push(`${p}.${k} must be a non-empty string`);
      }
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validatePotentialApplicationsIfPresent(prefix, arr, errors) {
  if (arr === undefined || arr === null) {
    return;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${prefix}.potentialApplications must be an array when present`);
    return;
  }
  if (arr.length === 0) {
    errors.push(`${prefix}.potentialApplications must be non-empty when present`);
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.potentialApplications[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    for (const k of POTENTIAL_APP_KEYS) {
      if (typeof o[k] !== "string" || !String(o[k]).trim()) {
        errors.push(`${p}.${k} must be a non-empty string`);
      }
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateReportedBenefitsIfPresent(prefix, arr, errors) {
  if (arr === undefined || arr === null) {
    return;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${prefix}.reportedBenefits must be an array when present`);
    return;
  }
  if (arr.length === 0) {
    errors.push(`${prefix}.reportedBenefits must be non-empty when present`);
    return;
  }
  for (let j = 0; j < arr.length; j++) {
    const line = arr[j];
    if (typeof line !== "string" || !line.trim()) {
      errors.push(`${prefix}.reportedBenefits[${j}] must be a non-empty string`);
    }
  }
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateSourcesIfPresent(prefix, arr, errors) {
  if (arr === undefined || arr === null) {
    return;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${prefix}.sources must be an array when present`);
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.sources[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    for (const k of SOURCE_KEYS) {
      if (typeof o[k] !== "string" || !String(o[k]).trim()) {
        errors.push(`${p}.${k} must be a non-empty string`);
      }
    }
    if (typeof o.url === "string" && o.url.startsWith("javascript:")) {
      errors.push(`${p}.url must not be a javascript: URL`);
    }
  });
}

/**
 * @param {string} prefix
 * @param {string} key
 * @param {unknown} arr
 * @param {string[]} errors
 * @param {boolean} nonEmptyWhenPresent
 */
function validateStringArrayIfPresent(prefix, key, arr, errors, nonEmptyWhenPresent) {
  if (arr === undefined || arr === null) {
    return;
  }
  const path = `${prefix}.${key}`;
  if (!Array.isArray(arr)) {
    errors.push(`${path} must be an array when present`);
    return;
  }
  if (nonEmptyWhenPresent && arr.length === 0) {
    errors.push(`${path} must be non-empty when present`);
    return;
  }
  arr.forEach((item, j) => {
    if (typeof item !== "string" || !item.trim()) {
      errors.push(`${path}[${j}] must be a non-empty string`);
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} v
 * @param {string[]} errors
 */
function validateDistinctiveQualityIfPresent(prefix, v, errors) {
  if (v === undefined || v === null) {
    return;
  }
  validateDistinctiveQuality(prefix, v, errors);
}

/**
 * @param {string} prefix
 * @param {unknown} v
 * @param {string[]} errors
 */
function validateCommonSideEffects(prefix, v, errors) {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    errors.push(`${prefix}.commonSideEffects must be an object`);
    return;
  }
  const o = /** @type {Record<string, unknown>} */ (v);
  validateStringArray(prefix, "commonSideEffects.common", o.common, errors, false);
  validateStringArray(prefix, "commonSideEffects.serious", o.serious, errors, false);
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateDoseGuidelines(prefix, arr, errors) {
  if (!Array.isArray(arr) || arr.length === 0) {
    errors.push(`${prefix}.doseGuidelines must be a non-empty array`);
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.doseGuidelines[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    for (const k of DOSE_GUIDELINE_KEYS) {
      if (typeof o[k] !== "string" || !String(o[k]).trim()) {
        errors.push(`${p}.${k} must be a non-empty string`);
      }
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validatePotentialApplications(prefix, arr, errors) {
  if (!Array.isArray(arr) || arr.length === 0) {
    errors.push(`${prefix}.potentialApplications must be a non-empty array`);
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.potentialApplications[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    for (const k of POTENTIAL_APP_KEYS) {
      if (typeof o[k] !== "string" || !String(o[k]).trim()) {
        errors.push(`${p}.${k} must be a non-empty string`);
      }
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateReportedBenefits(prefix, arr, errors) {
  if (!Array.isArray(arr) || arr.length === 0) {
    errors.push(`${prefix}.reportedBenefits must be a non-empty array`);
    return;
  }
  for (let j = 0; j < arr.length; j++) {
    const line = arr[j];
    if (typeof line !== "string" || !line.trim()) {
      errors.push(`${prefix}.reportedBenefits[${j}] must be a non-empty string`);
    }
  }
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateSources(prefix, arr, errors) {
  if (!Array.isArray(arr) || arr.length === 0) {
    errors.push(`${prefix}.sources must be a non-empty array`);
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.sources[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    for (const k of SOURCE_KEYS) {
      if (typeof o[k] !== "string" || !String(o[k]).trim()) {
        errors.push(`${p}.${k} must be a non-empty string`);
      }
    }
    if (typeof o.url === "string" && o.url.startsWith("javascript:")) {
      errors.push(`${p}.url must not be a javascript: URL`);
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} arr
 * @param {string[]} errors
 */
function validateSynergisticWith(prefix, arr, errors) {
  if (!Array.isArray(arr)) {
    errors.push(`${prefix}.synergisticWith must be an array`);
    return;
  }
  arr.forEach((row, j) => {
    const p = `${prefix}.synergisticWith[${j}]`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${p} must be an object`);
      return;
    }
    const o = /** @type {Record<string, unknown>} */ (row);
    if (!Array.isArray(o.catalogTitles)) {
      errors.push(`${p}.catalogTitles must be an array`);
    } else if (o.catalogTitles.length === 0) {
      errors.push(`${p}.catalogTitles must be non-empty`);
    } else if (!o.catalogTitles.every((t) => typeof t === "string" && t.trim())) {
      errors.push(`${p}.catalogTitles must be non-empty strings`);
    }
    if (typeof o.evidenceBasis !== "string" || !o.evidenceBasis.trim()) {
      errors.push(`${p}.evidenceBasis must be a non-empty string`);
    }
    if (typeof o.rationale !== "string" || !o.rationale.trim()) {
      errors.push(`${p}.rationale must be a non-empty string`);
    }
  });
}

/**
 * @param {string} prefix
 * @param {string} key
 * @param {unknown} arr
 * @param {string[]} errors
 * @param {boolean} nonEmpty
 */
function validateStringArray(prefix, key, arr, errors, nonEmpty) {
  const path = `${prefix}.${key}`;
  if (!Array.isArray(arr)) {
    errors.push(`${path} must be an array`);
    return;
  }
  if (nonEmpty && arr.length === 0) {
    errors.push(`${path} must be non-empty`);
    return;
  }
  arr.forEach((item, j) => {
    if (typeof item !== "string" || !item.trim()) {
      errors.push(`${path}[${j}] must be a non-empty string`);
    }
  });
}

/**
 * @param {string} prefix
 * @param {unknown} v
 * @param {string[]} errors
 */
function validateDistinctiveQuality(prefix, v, errors) {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    errors.push(`${prefix}.distinctiveQuality must be an object`);
    return;
  }
  const o = /** @type {Record<string, unknown>} */ (v);
  for (const k of ["headline", "basisNote"]) {
    if (typeof o[k] !== "string" || !String(o[k]).trim()) {
      errors.push(`${prefix}.distinctiveQuality.${k} must be a non-empty string`);
    }
  }
  validateStringArray(prefix, "distinctiveQuality.themes", o.themes, errors, true);
}
