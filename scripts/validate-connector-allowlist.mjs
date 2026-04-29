#!/usr/bin/env node
/**
 * Ensures config/connector-allowlist.json is present and each row has required compliance fields (PRD §7.2a).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const allowPath = path.join(root, "config", "connector-allowlist.json");

const raw = fs.readFileSync(allowPath, "utf8");
let list;
try {
  list = JSON.parse(raw);
} catch (e) {
  console.error(`connector allowlist: invalid JSON: ${/** @type {Error} */ (e).message}`);
  process.exit(1);
}

if (!Array.isArray(list)) {
  console.error("connector allowlist: root must be an array");
  process.exit(1);
}

const errors = [];
for (let i = 0; i < list.length; i++) {
  const row = list[i];
  const p = `[${i}]`;
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    errors.push(`${p} must be an object`);
    continue;
  }
  const id = row.id;
  const provider = row.provider;
  const policyUrls = row.policy_urls;
  const allowedOps = row.allowed_operations;
  if (typeof id !== "string" || !id.trim()) {
    errors.push(`${p}.id required`);
  }
  if (typeof provider !== "string" || !provider.trim()) {
    errors.push(`${p}.provider required`);
  }
  if (!Array.isArray(policyUrls) || policyUrls.length === 0) {
    errors.push(`${p}.policy_urls must be a non-empty array of strings`);
  } else if (!policyUrls.every((u) => typeof u === "string" && /^https?:\/\//i.test(u))) {
    errors.push(`${p}.policy_urls must be http(s) URLs`);
  }
  if (!Array.isArray(allowedOps) || allowedOps.length === 0) {
    errors.push(`${p}.allowed_operations must be a non-empty array of strings`);
  } else if (!allowedOps.every((o) => typeof o === "string" && o.trim())) {
    errors.push(`${p}.allowed_operations entries must be non-empty strings`);
  }
}

if (errors.length) {
  console.error("validate-connector-allowlist: failed");
  for (const msg of errors) {
    console.error(`  - ${msg}`);
  }
  process.exit(1);
}

console.log(`validate-connector-allowlist: ok (${list.length} connectors)`);
