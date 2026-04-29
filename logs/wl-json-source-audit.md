# WL — JSON source liveness audit (peptide-info-database.json)

Branch: `audit/json-source-liveness`
Base: `main` @ `1705bd5`
Date: 2026-04-29
Scope: every `entries[].sources[].url` in `peptide-info-database.json`.
Out of scope: source *accuracy* (does the page actually support the
claim it's cited for?). This pass only proves URLs resolve.

## TL;DR

51 source URLs across 44 entries (1 entry has no sources). Audited via
`scripts/check-source-liveness.mjs` — HEAD with GET fallback, 10s
timeout, follow redirects, concurrency 8.

| Bucket | Count |
|---|---|
| 2xx OK (no redirect) | 35 |
| 2xx OK (followed redirect) | 14 |
| 4xx broken | **2** |
| 5xx server error | 0 |
| Timeout | 0 |
| Network error | 0 |

**Two broken URLs** — both should be addressed. The other 14 are benign
URL-form drift (NCBI moved PMC to a subdomain; Springer/Frontiers added
path segments; apex → www) and could be normalised in a single batch
edit if you want a totally clean state.

Total elapsed: 5.7 s. Audit is cheap to re-run.

## 🔴 Broken URLs (action required)

### B1 — `3G-RT` entry: PubMed PMID 37015090 → **HTTP 404**
- Label: *"PubMed: retatrutide obesity trial snapshot"*
- URL: https://pubmed.ncbi.nlm.nih.gov/37015090/
- Status: hard 404 — PMID does not resolve (verified with browser UA
  and via WebFetch). Confirmed not a transient bot-block.
- The well-known retatrutide Phase 2 obesity paper that the citation
  *appears* to want is Jastreboff et al. *NEJM* 2023 — that's a real
  paper but a different PMID. The cited PMID 37015090 either was a
  typo at authoring time or points to a withdrawn record.

**Fix:** locate the intended paper (most likely Jastreboff et al.,
*NEJM* 2023, "Triple-Hormone-Receptor Agonist Retatrutide for Obesity
— A Phase 2 Trial") and update the URL to its real PMID.

### B2 — `Survodutide` entry: NEJM `doi/abs/10.1056/NEJMoa2401755` → **HTTP 403**
- Label: *"NEJM: MASH phase 2 surrogate"*
- URL: https://www.nejm.org/doi/abs/10.1056/NEJMoa2401755
- Status: 403 with realistic browser UA. Same response on the `doi/`
  and `doi/full/` paths. The DOI resolver (`https://doi.org/...`)
  successfully redirects to the NEJM canonical URL, then NEJM 403s.
- **Likely cause:** NEJM bot-protection blocks our crawler but the
  page is probably reachable by humans. This is not necessarily a
  dead link.

**Fix options:**
1. Leave as-is and accept the 403 in audit reports as expected NEJM
   behaviour (and document in the script's known-blocked list).
2. Switch the citation to the canonical DOI form
   `https://doi.org/10.1056/NEJMoa2401755` so the URL doesn't need to
   pass NEJM's bot guard for the *citation* to look correct, even if
   our liveness check still 403s.
3. Switch to the PubMed mirror (PMID for the survodutide MASH paper)
   which doesn't bot-block.

Recommend (3) where a PMID exists — keeps the audit clean and matches
the pattern used elsewhere in the file.

## 🟡 Redirect drift (cosmetic, batch fix optional)

All 14 redirects below resolve to 200 — content is fine, citations work
in browsers. Only flagged because:

1. Each redirect adds latency for users and trips up CI liveness checks.
2. NCBI's PMC move (`/pmc/articles/PMCxxxxx/` → subdomain
   `pmc.ncbi.nlm.nih.gov/articles/PMCxxxxx/`) is the new canonical
   form per NCBI's 2023 deprecation notice.

| Entry | From | To |
|---|---|---|
| AOD-9604 | `peptidejournal.org/...` | `www.peptidejournal.org/...` |
| CJC-1295 (no DAC) + IPA | `ncbi.nlm.nih.gov/pmc/articles/PMC2787983/` | `pmc.ncbi.nlm.nih.gov/articles/PMC2787983/` |
| FOXO4-DRI | `ncbi.nlm.nih.gov/pmc/articles/PMC8261234/` | `pmc.ncbi.nlm.nih.gov/articles/PMC8261234/` |
| GHK-Cu | `ncbi.nlm.nih.gov/pmc/articles/PMC3359723/` | `pmc.ncbi.nlm.nih.gov/articles/PMC3359723/` |
| Kisspeptin | `ncbi.nlm.nih.gov/pmc/articles/PMC4678402/` | `pmc.ncbi.nlm.nih.gov/articles/PMC4678402/` |
| MOTS-c | `ncbi.nlm.nih.gov/pmc/articles/PMC9570330/` | `pmc.ncbi.nlm.nih.gov/articles/PMC9570330/` |
| N-acetyl Selank Amidate | `frontiersin.org/articles/10.3389/fphar.2016.00031` | `frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2016.00031/full` |
| N-acetyl Semax Amidate | `ncbi.nlm.nih.gov/pmc/articles/PMC7350263/` | `pmc.ncbi.nlm.nih.gov/articles/PMC7350263/` |
| Pinealon | Springer article URL | Springer URL + cookie-consent error params (cookie wall, not URL drift) |
| TB-500 | `ncbi.nlm.nih.gov/pmc/articles/PMC8724243/` | `pmc.ncbi.nlm.nih.gov/articles/PMC8724243/` |
| Tesa | `ncbi.nlm.nih.gov/pmc/articles/PMC3103937/` | `pmc.ncbi.nlm.nih.gov/articles/PMC3103937/` |
| Thymosin Alpha-1 | `ncbi.nlm.nih.gov/pmc/articles/PMC7747025/` | `pmc.ncbi.nlm.nih.gov/articles/PMC7747025/` |
| Vilon | `calcmypeptide.com/...` | `www.calcmypeptide.com/...` |
| VIP | `ncbi.nlm.nih.gov/pmc/articles/PMC6743256/` | `pmc.ncbi.nlm.nih.gov/articles/PMC6743256/` |

**Suggested batch fix:**
```bash
sed -i 's|https://www\.ncbi\.nlm\.nih\.gov/pmc/articles/|https://pmc.ncbi.nlm.nih.gov/articles/|g' peptide-info-database.json
```
plus the apex→www and Frontiers path swaps. Re-run the validator
afterwards (`node scripts/validate-audit.mjs`) to confirm the JSON
still parses.

## 🟢 What this pass does **not** prove

URL liveness ≠ source accuracy. A page returning 200 might still:
- Be the wrong paper.
- Have been silently revised since the citation was written.
- Have a paywall that hides the abstract from non-subscribers.
- Be a press-release rehash of the underlying study, not the study
  itself.

The home-page audit (#41) caught two phantom citations
(`Sikiric J Pharm Sci 2018`, `Chang Eur J Pharm 2014`) that *did*
return 200s when typed into PubMed — they only failed when the
*content* was cross-checked. A future pass should sample-check N
entries (say, 5 randomly per re-audit cycle) by reading abstracts
and confirming they support the claims they're attached to.

## Methodology

Script: `scripts/check-source-liveness.mjs` (this PR).
- Reads `peptide-info-database.json`.
- For each `entries[].sources[]` with a `url`, issues a `HEAD`
  request with a 10 s timeout.
- Falls back to `GET` if the server returns 405, 403, or 501 (some
  publishers reject HEAD outright; a quick GET disambiguates).
- Follows redirects and records the final URL when it differs from
  the input.
- Writes a JSON snapshot to `logs/source-liveness-results.json`
  containing the bucketised counts plus per-URL detail.
- Concurrency: 8. UA: identifies the audit tool and links to the
  repo so site operators can contact us if needed.
- Always exits 0 — this is an audit tool, not a CI gate. Wire it
  into CI later as a *warning* if you want, but don't fail builds
  on third-party site availability.

## Re-running

```bash
node scripts/check-source-liveness.mjs
# results land in logs/source-liveness-results.json
```

Average 5–10 seconds for the current ~50 URLs. Will scale roughly
linearly as the library grows.

## Receipts

```
$ node scripts/check-source-liveness.mjs
Checking 51 URLs across 45 entries (concurrency 8, timeout 10000ms)...
  10/51
  20/51
  30/51
  40/51
  50/51
  51/51

Done in 5.7s. Buckets:
  ok2xx        35
  redirected   14
  client4xx    2
  server5xx    0
  network      0
  timeout      0

$ curl -sI https://pubmed.ncbi.nlm.nih.gov/37015090/
  HTTP/2 404

$ curl -sI -A "Mozilla/5.0" https://www.nejm.org/doi/abs/10.1056/NEJMoa2401755
  HTTP/2 403   (NEJM bot-blocks; URL likely valid for browser users)
```

## Out of scope (next passes)

- **Source-content accuracy** — does each citation actually support
  the claim it's attached to? Sample-based, manual or LLM-assisted.
- **`web/index.html` SPA copy** — the data-driven library page.
- **Per-entry claim review** — `reportedBenefits`, `dosingTimingNotes`,
  `distinctiveQuality.headline`, etc. all carry assertions that are
  not URL-citable but should be checkable against the entry's sources.
- **CI integration** — wire the script as a weekly job that opens an
  issue when liveness drops below a threshold (e.g. ≥ 3 broken).
