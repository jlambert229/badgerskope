# Peptide entry template

`peptide-entry.template.json` mirrors the shape of each object inside `peptide-info-database.json` → `entries[]` as of schema version **3.0** in the live file. Copy the file, replace `REPLACE_`* strings, remove optional blocks you do not need (for example empty `synergisticWith`), and merge with `scripts/merge-*.mjs` or your future DB export pipeline.

## Required top-level keys (as used by the app today)


| Key                      | Role                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `catalog.title`          | Stable SKU string; bookmarks and URLs use it.              |
| `catalog.commonDrugName` | Shown when set; may equal title.                           |
| `compoundType`           | Drives filters and copy helpers. See allowed values below. |
| `researchSummary`        | Card and row summary text.                                 |


## Common blocks

- `**commonSideEffects`:** both `common` and `serious` arrays; the library hides some experimental cards when both are empty and the sport filter applies. Match real data patterns in `peptide-info-database.json`.
- `**doseGuidelines`:** each item has `indicationOrContext`, `evidenceBasis`, `minimumEffectiveDoseNotes`. Evidence chips in the UI derive from `evidenceBasis` (see `web/src/constants.js` `EVIDENCE_TIERS` and `highestTier()`).
- `**potentialApplications`:** pairs of `personCenteredBenefit` + `evidenceNote`.
- `**reportedBenefits`:** array of strings (not objects).
- `**sources`:** `{ label, url }`; prefer primary URLs where audit rules require them.
- `**synergisticWith`:** optional; many live entries use `[]`. When present, each item has `catalogTitles[]`, `evidenceBasis`, `rationale`. Example object:

```json
{
  "catalogTitles": ["Other SKU Title"],
  "evidenceBasis": "named_stack_mechanism_complement",
  "rationale": "One line, educational, not a use recommendation."
}
```

- `**wellnessCategories`:** keys must exist under `meta.wellnessCategoryIndex` in the database root.
- `**distinctiveQuality`:** `headline`, `themes` (use `knownFor` keys from `web/src/constants.js` `KNOWN_FOR_THEME_ORDER` and `meta.knownForThemeIndex`), `basisNote`.

## `compoundType` values observed in the current database

`peptide`, `peptide_incretin`, `peptide_secretagogue`, `peptide_blend`, `peptide_blend_incretin`, `peptide_blend_secretagogue`, `peptide_bioregulator`, `peptide_hormone`, `small_molecule`, `cofactor`, `blend_injection`, `unknown_blend`

Friendly labels live in `web/src/utils.js` `FRIENDLY_COMPOUND_TYPES`.

## `evidenceBasis` (non-exhaustive)

Use only keys your JSON legends and UI already recognize. Examples from live data include: `regulatory_label`, `pivotal_trials`, `phase1_human`, `preclinical_animal`, `compounded_practice`, `unknown_identity`, plus synergy-specific keys such as `clinical_fixed_combo_development`, `named_stack_mechanism_complement`. Full set is defined across `peptide-info-database.json` meta legends and `web/src/detail.js` `EVIDENCE_BASIS_LABELS`.

## Root file you merge into

The full public document also has top-level `disclaimer`, `meta` (legends, `builtAt`, `entryCount`, `schemaVersion`), and `entries`. This template is **one entry** only. After adding an entry, bump `meta.entryCount` and `meta.builtAt` when editing the root file by hand, or let your export job set them.