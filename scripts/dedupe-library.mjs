#!/usr/bin/env node
/**
 * Library dedupe — drop SKU size variants and strip "(N mg)" / trailing dose
 * suffixes from catalog.title and catalog.commonDrugName.
 *
 * Drops 9 entries (53 → 44):
 *   Tirzepatide 15/30/60mg, Retatrutide 20/36mg, Semaglutide 20mg,
 *   Tesamorelin 15/20mg (pure-size dupes; SomatoPulse combo is preserved).
 *
 * Run: node scripts/dedupe-library.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, "..", "peptide-info-database.json");

const DROP_TITLES = new Set([
  "2G-TZ 15mg",
  "2G-TZ 30mg",
  "2G-TZ 60mg",
  "3G-RT 20mg",
  "3G-RT 36mg",
  "1G-SGT 20mg",
  "Tesa-15mg",
  "Tesa-20mg",
]);

// Strip trailing "(NN mg)" / "(NNmg)" — case-insensitive.
const PARENS_DOSE = /\s*\(\s*\d+\s*mg\s*\)\s*$/i;
// Strip a trailing dose with a separator: " 10mg", "-10mg", "10 mg" (after a space/dash).
const TRAILING_DOSE = /[\s-]+\d+\s*mg\s*$/i;
// Some titles use mg unit with hundreds (e.g. "Glutathione 1500mg" or "NAD+ 500mg").
// The same TRAILING_DOSE handles those.

function clean(s) {
  if (typeof s !== "string") return s;
  let out = s;
  out = out.replace(PARENS_DOSE, "");
  out = out.replace(TRAILING_DOSE, "");
  return out.trim();
}

const raw = readFileSync(FILE, "utf8");
const db = JSON.parse(raw);
const before = db.entries.length;

// 1) Drop the 9 size dupes
const dropped = [];
db.entries = db.entries.filter((e) => {
  const t = e?.catalog?.title || "";
  if (DROP_TITLES.has(t)) {
    dropped.push(t);
    return false;
  }
  return true;
});

// 2) Strip dose suffixes from remaining entries
let titleChanges = 0;
let commonChanges = 0;
for (const e of db.entries) {
  if (!e.catalog) continue;
  const t0 = e.catalog.title;
  const c0 = e.catalog.commonDrugName;
  // Skip combo / blend titles whose trailing component looks like a dose but
  // is actually part of the compound identity. Detection rules:
  //   - "SomatoPulse (Tesa 10mg/Ipamorelin 3mg)" — explicit dose list inside parens
  //   - "LIPO-C with B12" — "with X" pattern
  //   - " + " or " / " between names (combo separator with whitespace)
  // NB: "NAD+" has a "+" but no surrounding whitespace, so it's not a combo here.
  const isCombo =
    /SomatoPulse/i.test(t0 || "") ||
    /\b(blend|combo|with B12)\b/i.test(t0 || "") ||
    /\s[+/]\s/.test(t0 || "");
  if (!isCombo) {
    const t1 = clean(t0);
    if (t1 !== t0) {
      e.catalog.title = t1;
      titleChanges++;
    }
  }
  // commonDrugName: always strip the parens dose; never strip a trailing
  // bare dose (some commonDrugNames have trailing notes like "(SS-31)").
  if (typeof c0 === "string") {
    const c1 = c0.replace(PARENS_DOSE, "").trim();
    if (c1 !== c0) {
      e.catalog.commonDrugName = c1;
      commonChanges++;
    }
  }
}

// 3) Update meta.entryCount
if (db.meta && typeof db.meta.entryCount === "number") {
  db.meta.entryCount = db.entries.length;
}

const after = db.entries.length;
writeFileSync(FILE, JSON.stringify(db, null, 2) + "\n", "utf8");

console.log("dedupe complete.");
console.log("  before:", before);
console.log("  after:", after);
console.log("  dropped:", dropped);
console.log("  catalog.title cleaned:", titleChanges);
console.log("  catalog.commonDrugName cleaned:", commonChanges);
