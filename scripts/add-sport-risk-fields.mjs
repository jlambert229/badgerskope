#!/usr/bin/env node
/**
 * Schema 3.1: replace the UI's title-substring WADA map (PRD §10 P2) with
 * structured per-entry data, and add per-entry `lastReviewed` dates.
 *
 * - `sportRisk: { status: "banned" | "caution", reason }` is seeded from the
 *   exact substring map previously hardcoded in web/src/features/doping.js,
 *   so UI behavior is preserved while the source of truth moves into JSON.
 * - `lastReviewed: "2026-05-24"` reflects the BAD-48 research refresh, which
 *   verified all 63 entries against 2024–2026 public research (31 updated,
 *   32 confirmed unchanged — see logs/wl-badgerskope-research-refresh.md).
 *
 * Run: node scripts/add-sport-risk-fields.mjs
 * Then: node scripts/export-library.mjs --refresh-meta
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, "../peptide-info-database.json");

const LAST_REVIEWED = "2026-05-24"; // BAD-48 full-catalog research refresh

// Former WADA_BANNED substring map from web/src/features/doping.js, split
// into "banned" (on a prohibited list) vs "caution" (monitored / not
// approved) per the PRD's requirement to separate the two.
const SPORT_RISK_RULES = [
  { match: "BPC-157", status: "banned", reason: "Banned by WADA since 2022" },
  { match: "TB-500", status: "banned", reason: "Banned by WADA (thymosin beta-4 related)" },
  { match: "Ipamorelin", status: "banned", reason: "Growth hormone secretagogue — banned in sport" },
  { match: "Sermorelin", status: "banned", reason: "Growth hormone releasing factor — banned in sport" },
  { match: "CJC-1295", status: "banned", reason: "GHRH analog — banned in sport" },
  { match: "GHRP", status: "banned", reason: "Growth hormone releasing peptide — banned in sport" },
  { match: "SomatoPulse", status: "banned", reason: "Contains banned GH secretagogues" },
  { match: "Tesa", status: "caution", reason: "Tesamorelin — growth hormone axis, monitored in sport" },
  { match: "MT-II", status: "caution", reason: "Melanotan II — not approved, safety concerns flagged by regulators" },
  { match: "SLU-PP-332", status: "caution", reason: "Exercise mimetic — not approved for any use" },
  { match: "FOXO4-DRI", status: "caution", reason: "Experimental senolytic — no approved human use" },
];

function sportRiskFor(entry) {
  const haystack = `${entry.catalog?.title || ""} ${entry.catalog?.commonDrugName || ""}`;
  for (const rule of SPORT_RISK_RULES) {
    if (haystack.includes(rule.match)) {
      return { status: rule.status, reason: rule.reason };
    }
  }
  return null;
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));

let flagged = 0;
for (const entry of db.entries) {
  const risk = sportRiskFor(entry);
  if (risk) {
    entry.sportRisk = risk;
    flagged++;
  } else {
    delete entry.sportRisk;
  }
  entry.lastReviewed = entry.lastReviewed || LAST_REVIEWED;
}

db.meta.schemaVersion = "3.1";

writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
console.log(
  `add-sport-risk-fields: ${flagged}/${db.entries.length} entries flagged with sportRisk; ` +
  `lastReviewed set; schemaVersion -> 3.1`,
);
