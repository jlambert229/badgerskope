#!/usr/bin/env node
/**
 * CI gate: validate peptide-info-database.json (PRD §7.6, rollout B6).
 * Usage: node scripts/validate-audit.mjs [--strict] [path/to/peptide-info-database.json]
 * Default mode is **public** (sparse keys allowed). **--strict** enforces full entry template shape.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateLibraryExport } from "./lib/validate-library-export.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const strict = argv.includes("--strict");
const inputArgs = argv.filter((a) => a !== "--strict");
const input =
  inputArgs[0] ||
  process.env.PEPTIDE_LIBRARY_PATH ||
  path.join(root, "peptide-info-database.json");

let raw;
try {
  raw = fs.readFileSync(input, "utf8");
} catch (e) {
  console.error(`validate-audit: cannot read ${input}: ${/** @type {Error} */ (e).message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`validate-audit: invalid JSON: ${/** @type {Error} */ (e).message}`);
  process.exit(1);
}

const { errors, warnings } = validateLibraryExport(data, {
  mode: strict ? "strict" : "public",
});
for (const w of warnings) {
  console.warn(`warning: ${w}`);
}
if (errors.length) {
  console.error("validate-audit: failed");
  for (const msg of errors) {
    console.error(`  - ${msg}`);
  }
  process.exit(1);
}

console.log(
  `validate-audit: ok (${strict ? "strict" : "public"}, ${input}, ${/** @type {{ entries: unknown[] }} */ (data).entries.length} entries)`,
);
