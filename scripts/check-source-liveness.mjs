#!/usr/bin/env node
/**
 * Audits liveness of every source URL in peptide-info-database.json.
 * For each entry's sources[]:url, issues a HEAD request (falling back
 * to GET on 405/403) with a 10s timeout, follows redirects, and
 * categorises the response.
 *
 * Usage:
 *   node scripts/check-source-liveness.mjs [--out path/to/results.json]
 *
 * Exits 0 always (this is an audit tool, not a CI gate). The companion
 * report is written by hand into logs/wl-json-source-audit.md based on
 * the JSON output.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;
const USER_AGENT =
  "BadgerSkopeSourceAudit/1.0 (+https://github.com/jlambert229/badgerskope; audit only, not crawling)";

function parseArgs() {
  const argv = process.argv.slice(2);
  let out = path.join(repoRoot, "logs", "source-liveness-results.json");
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out" && argv[i + 1]) out = path.resolve(repoRoot, argv[++i]);
  }
  return { out };
}

async function checkOne(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const opts = {
    headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
    redirect: "follow",
    signal: ctrl.signal,
  };
  try {
    let res = await fetch(url, { method: "HEAD", ...opts });
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, { method: "GET", ...opts });
    }
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url !== url ? res.url : null,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: `${e.name}: ${e.message}`,
    };
  } finally {
    clearTimeout(t);
  }
}

async function pMap(items, mapper, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const idx = next++;
      if (idx >= items.length) return;
      results[idx] = await mapper(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

const { out } = parseArgs();
const dataPath = path.join(repoRoot, "peptide-info-database.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const checks = [];
for (const entry of data.entries) {
  const name =
    entry.catalog?.title || entry.catalog?.commonDrugName || "(unnamed)";
  const sources = Array.isArray(entry.sources) ? entry.sources : [];
  for (const src of sources) {
    if (src && typeof src.url === "string") {
      checks.push({ entry: name, label: src.label || "(no label)", url: src.url });
    }
  }
}

console.error(`Checking ${checks.length} URLs across ${data.entries.length} entries (concurrency ${CONCURRENCY}, timeout ${TIMEOUT_MS}ms)...`);
const start = Date.now();

let done = 0;
const results = await pMap(
  checks,
  async (c) => {
    const r = await checkOne(c.url);
    done++;
    if (done % 10 === 0 || done === checks.length) {
      console.error(`  ${done}/${checks.length}`);
    }
    return { ...c, ...r };
  },
  CONCURRENCY,
);

const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);

const buckets = { ok2xx: 0, redirected: 0, client4xx: 0, server5xx: 0, network: 0, timeout: 0 };
for (const r of results) {
  if (r.ok) {
    if (r.finalUrl) buckets.redirected++;
    else buckets.ok2xx++;
  } else if (r.status >= 400 && r.status < 500) buckets.client4xx++;
  else if (r.status >= 500 && r.status < 600) buckets.server5xx++;
  else if (r.error?.includes("AbortError")) buckets.timeout++;
  else buckets.network++;
}

const summary = {
  generatedAt: new Date().toISOString(),
  databaseEntryCount: data.entries.length,
  databaseSchemaVersion: data.meta?.schemaVersion || "unknown",
  totalChecks: checks.length,
  elapsedSec: Number(elapsedSec),
  buckets,
  results,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(summary, null, 2));

console.error(`\nDone in ${elapsedSec}s. Buckets:`);
for (const [k, v] of Object.entries(buckets)) {
  console.error(`  ${k.padEnd(12)} ${v}`);
}
console.error(`\nWrote ${out}`);
