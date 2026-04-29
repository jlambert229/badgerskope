#!/usr/bin/env node
/**
 * File-mode export (PRD §7.5, §13 EXPORT_SOURCE=file): read JSON, enforce invariants, write.
 * Neon path will replace the reader later; this wires Netlify build hooks today.
 *
 * Usage:
 *   node scripts/export-library.mjs --in path/to/in.json --out path/to/out.json
 *   EXPORT_REFRESH_META=1  sets meta.builtAt (now) and meta.entryCount from entries.length
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateLibraryExport } from "./lib/validate-library-export.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

function parseArgs() {
  const argv = process.argv.slice(2);
  let inPath = path.join(repoRoot, "peptide-info-database.json");
  let outPath = "";
  let refreshMeta = process.env.EXPORT_REFRESH_META === "1";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in" && argv[i + 1]) {
      inPath = path.resolve(repoRoot, argv[++i]);
    } else if (a === "--out" && argv[i + 1]) {
      outPath = path.resolve(repoRoot, argv[++i]);
    } else if (a === "--refresh-meta") {
      refreshMeta = true;
    } else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/export-library.mjs [--in <file>] [--out <file>] [--refresh-meta]
Env: EXPORT_REFRESH_META=1 same as --refresh-meta`);
      process.exit(0);
    }
  }
  if (!outPath) {
    outPath = inPath;
  }
  return { inPath, outPath, refreshMeta };
}

const { inPath, outPath, refreshMeta } = parseArgs();

const raw = fs.readFileSync(inPath, "utf8");
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`export-library: JSON parse error: ${/** @type {Error} */ (e).message}`);
  process.exit(1);
}

const validateMode =
  process.env.AUDIT_MODE === "strict" ? "strict" : "public";
const { errors } = validateLibraryExport(data, { mode: validateMode });
if (errors.length) {
  console.error("export-library: validation failed (fix before export)");
  for (const msg of errors) {
    console.error(`  - ${msg}`);
  }
  process.exit(1);
}

const lib = /** @type {{ disclaimer: string; meta: Record<string, unknown>; entries: unknown[] }} */ (
  data
);
if (refreshMeta) {
  lib.meta = { ...lib.meta, builtAt: new Date().toISOString(), entryCount: lib.entries.length };
}

const outJson = `${JSON.stringify(lib, null, 2)}\n`;
const tmp = `${outPath}.${process.pid}.tmp`;
try {
  fs.writeFileSync(tmp, outJson, "utf8");
  fs.renameSync(tmp, outPath);
} catch (e) {
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ignore */
  }
  console.error(`export-library: write failed: ${/** @type {Error} */ (e).message}`);
  process.exit(1);
}

console.log(
  `export-library: wrote ${outPath} (${lib.entries.length} entries${refreshMeta ? ", meta refreshed" : ""})`,
);
