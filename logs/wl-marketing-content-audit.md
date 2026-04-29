# WL — Marketing content audit (factual + citation review)

Branch: `audit/marketing-content-review`
Base: `main` @ `1705bd5`
Date: 2026-04-29
Scope: `index.html`, `evidence-guide.html`, `glossary.html`. Web SPA
(`/web/`) and `peptide-info-database.json` entries are **out of scope**
for this pass.

## TL;DR

The marketing site brands itself **"EVIDENCE > HYPE"** and **"RECEIPTS-BASED."**
That positioning is at odds with the current content:

- Two of the four primary citations in the BPC-157 "Receipts" section
  point to **completely unrelated trials** (a probiotic for pre-diabetes
  and a monoclonal antibody for amyloidosis).
- The two literature citations in the same section (Sikiric 2018, Chang 2014)
  could not be located in PubMed.
- The trial count cited for BPC-157 is wrong by **~5–7×** (page says 9 / 14;
  ClinicalTrials.gov returns 2, neither completed).
- The library count is wrong by **~3.2×** (page says 142; actual is 45).
- Multiple "metric" displays — subscriber count, vendor-audit ratios,
  issue numbers, byline timestamps — appear to be illustrative placeholder
  copy with no underlying data source.

The methodology / tier definitions / glossary are largely accurate.
The factual problems are concentrated in the homepage.

## Severity legend

- 🔴 **RED** — factually wrong or unsupported; high-impact for a site
  whose value prop is rigor.
- 🟡 **YELLOW** — fabricated marketing metric / placeholder presented
  as real, no underlying data source.
- 🟢 **GREEN** — verified accurate.

## Findings — RED (factually wrong)

### R1 — `NCT04938843` cited as "BPC-157 human pilot, knee, completed 2023"
**Where:** `index.html:394` (BPC-157 Receipts §[03])
**Reality (per ClinicalTrials.gov v2 API):**
- Title: *"Effect of F. Prausnitzii on Glycemic Control"*
- Intervention: dietary supplement of *F. prausnitzii* and *D. piger*
- Conditions: pre-diabetes / impaired glucose tolerance / NAFLD
- Phase: N/A · Enrollment: 176 · Status: **Unknown** (last update Sep 2021)
- This study has nothing to do with BPC-157, knee, or 2023.

**Fix:** delete the citation, or replace with a real BPC-157 trial NCT
(e.g. `NCT02637284` Phase 1, N=42) and accurate descriptor.

### R2 — `NCT05521022` cited as "BPC-157 human IBD, recruiting 2026"
**Where:** `index.html:395` (BPC-157 Receipts §[04])
**Reality (per ClinicalTrials.gov v2 API):**
- Title: *"Study of AT-02 in Healthy Volunteers and Subjects With
  Systemic Amyloidosis"*
- Intervention: AT-02 humanized monoclonal antibody, IV infusion
- Condition: systemic amyloidosis · Phase 1 · Enrollment: 100
- Status: Recruiting (primary completion estimated Mar 2025)
- Not BPC-157, not IBD.

**Fix:** delete or replace with `NCT07437547` (BPC-157 for acute
hamstring strain, Phase 2, N=120, recruiting) which is the only
currently-recruiting BPC-157 trial registered.

### R3 — BPC-157 trial counts are wrong by ~5–7×
**Where:** three places, mutually inconsistent:
- `index.html:147` (anchor card): "**nine** human trials to its name"
- `index.html:163` (anchor card): "Six completed human trials, none
  double-blinded, none larger than N=80"
- `index.html:376` (feature): "we count **nine** registered human
  trials, six completed, three with published results … None exceed N=80"
- `index.html:582` (ticker): "BPC-157 · TIER B · **14 HUMAN TRIALS**
  LOGGED"

**Reality (ClinicalTrials.gov v2 API, queried 2026-04-29 with terms
"BPC-157", "pentadecapeptide", "PL 14736"):**
- **Two** registered interventional trials, total:
  - `NCT02637284` — PCO-02 safety/PK, Phase 1, N=42, status Unknown
    (last known: active not recruiting)
  - `NCT07437547` — BPC-157 for hamstring strain, Phase 2, N=120,
    Recruiting
- **Zero** completed trials.
- **Zero** with published results.
- Largest enrollment is **N=120** (recruiting), not "≤ N=80."

**Fix:** rewrite to the actual numbers. Suggested wording:
*"As of April 2026 only two BPC-157 interventional trials are registered
on ClinicalTrials.gov — a Phase 1 PK study (N=42, status unclear since
2021) and a recently-recruiting Phase 2 hamstring trial (N=120). Neither
has reported results. Most BPC-157 evidence remains preclinical."*

Also: the ticker's "14 HUMAN TRIALS LOGGED" contradicts the rest of the
page even before checking against reality. Pick one number.

### R4 — Library size cited as "142 files," actual is 45
**Where:**
- `index.html:342` `library-count`: "SHOWING 8 OF 142 FILES"
- `index.html:343` link: "BROWSE ALL 142 →"
- `index.html:357` feature article filed-number: "FILED №0142"
- `index.html:640` JS render: `` `SHOWING ${visible.length} OF 142 FILES` ``

**Reality (`peptide-info-database.json` `meta.entryCount`):** 45 entries
as of `2026-04-07T23:08:32Z`. The post-dedupe library has been ≤ 53 since
PR #36. The "142" number does not correspond to any real count.

**Fix:** read the count from the JSON at build time, or hardcode to 45
and refresh on each library change. The fictional `№0142` filed-number
on the feature article should also be tied to a real entry index.

### R5 — Sikiric et al. *J Pharm Sci* 2018 (rat Achilles, N=72) — citation not found
**Where:** `index.html:392` (Receipts §[01])
**Verification:** PubMed search for `Sikiric BPC-157 tendon 2018`
returns a Seiwerth 2018 review in *Curr Pharm Des*, but no Sikiric
*J Pharm Sci* 2018 paper with the cited parameters surfaces.

The Sikiric group has published extensively on BPC-157, but the
specific journal/year/N combination does not match what PubMed returns.
Either the citation is mis-attributed (wrong journal or year) or
fabricated.

**Fix:** locate the actual primary source the page intended to cite,
and link it as a DOI or PMID. If no specific paper can be produced,
delete the receipt — listing an unverifiable citation under a "RECEIPTS"
banner is the exact failure mode the site critiques in others.

### R6 — Chang et al. *Eur J Pharm* 2014 (rat anastomotic colon) — citation not found
**Where:** `index.html:393` (Receipts §[02])
**Verification:** PubMed search for `Chang BPC-157 anastomotic 2014`
returns **zero results**. There are real BPC-157 anastomotic-healing
papers (e.g. Sebečić, Klicek, Seiwerth groups) but no Chang first-author
paper in *Eur J Pharm* 2014 surfaces.

**Fix:** same as R5 — produce a real DOI/PMID or remove.

## Findings — YELLOW (placeholder metrics presented as real)

These are not factually false in a falsifiable sense (no one can prove
the badger doesn't have 38,402 readers), but they are presented as live
data with no underlying source. On a "receipts-based" site, fabricated
metrics are a credibility problem.

### Y1 — Subscriber count "JOIN 38,402 READERS"
`index.html:467`. No newsletter system shipped; no subscriber list.
**Fix:** remove the count, or wire it to a real Buttondown/Beehiiv/Resend
list. "JOIN THE NEWSLETTER" works without a number.

### Y2 — "PRO TIER $8/MO FOR THE FULL LIBRARY · CANCEL WHENEVER"
`index.html:479`. No payment integration, no gated content.
**Fix:** remove until billing exists, or replace with "FREE WHILE IN
BETA."

### Y3 — "ONE EMAIL EVERY FRIDAY"
`index.html:468`. Cadence claim with no underlying send pipeline.
**Fix:** remove or fulfill.

### Y4 — "Fifteen grades have moved this year because of reader receipts"
`index.html:452` (FAQ #5). No public grade-history audit log to verify
this number. The library has 45 entries; "fifteen grade changes from
readers" implies an active feedback loop that does not appear to exist.
**Fix:** remove the specific count, or add a public grade-history page
and link to it.

### Y5 — "ISSUE 027 / Q2 2026"
`index.html:62`. Magazine-issue framing with sequential numbering. Real
on a magazine; fictional on a static site with no past issues.
**Fix:** acceptable as branding *if* it never moves and is paired with a
visible "what's an issue?" explainer. Otherwise drop.

### Y6 — "VENDOR CLAIMS: 7 / 9 OVERSTATED" (Retatrutide hero card)
`index.html:112`. Specific ratio with no published vendor-audit
methodology, no list of which vendors, no link to the audit. Same
problem as Y4.
**Fix:** link to a published vendor-audit page, or remove the row.

### Y7 — "Vendor audit — 7 of 11 sellers reviewed had no batch COA on file"
`index.html:396` (BPC-157 Receipts §[05]). Same pattern as Y6 — specific
numbers with no underlying methodology document.
**Fix:** publish the audit (which sellers, when, criteria) or remove.

### Y8 — Hero "Current Watch" Retatrutide stats
`index.html:110-113`:
- HUMAN N: **2,148** — closest real Phase 3 trial (NCT05929066) is
  N=2,300; total Phase 3 enrollment across four trials is ~4,865; the
  largest published Phase 2 (Jastreboff NEJM 2023) was N=338. The number
  **2,148** doesn't correspond to a single registered trial.
- WEIGHT Δ @ 48W: **−24.2%** — *defensible*: matches the upper-bound
  weight loss reported for the highest dose arm in the Jastreboff Phase
  2 paper, and is in the 15–24% range Wikipedia summarizes from
  systematic reviews.
- LAST FILED: **26 APR 2026** — fictional timestamp.

**Fix:** if 2,148 is intended to mean "active Phase 3 enrollment as of
date X across these trials," cite the source. Otherwise replace with a
real and traceable number.

### Y9 — Bylines, file numbers, read times in the Feature File
`index.html:357,361-365`: "FILED №0142 · BY THE BADGER · 14 MIN READ ·
POSTED 18 APR 2026". The article exists on the page but is not
attributable to a dated post or named author. The 14-minute read time
also doesn't match the actual word count.
**Fix:** real timestamp + author handle + computed read time, or
acknowledge openly that the "feature" is illustrative copy.

### Y10 — Anchor card "FILED 18 APR 2026 · RE-REVIEW Q3"
`index.html:171`. Same pattern. Defensible if 18 Apr 2026 is the true
last-reviewed date for the BPC-157 entry in the JSON; not verifiable
without that link.

### Y11 — "Orbitzen 40" (evidence-guide tier 06 example)
`evidence-guide.html:382`. No record of "Orbitzen 40" as a real peptide
product, supplement, or compound. Almost certainly an illustrative /
placeholder name, but it sits in an "EXAMPLES —" line implying it's
real.
**Fix:** replace with an actual unknown-identity product the audit team
has flagged, or label the line as "illustrative / TBD."

## Findings — GREEN (verified accurate)

These were spot-checked and found correct as written:

| Where | Claim | Source |
|---|---|---|
| `evidence-guide.html:302` | Semaglutide FDA-approved for diabetes | FDA / Wikipedia |
| `evidence-guide.html:302` | Tesamorelin FDA-approved for HIV-associated lipodystrophy (Egrifta) | FDA |
| `evidence-guide.html:302` | Bremelanotide (PT-141) FDA-approved for HSDD (Vyleesi) | FDA |
| `evidence-guide.html:318` | SURMOUNT is the actual tirzepatide weight-loss trial program | Lilly / NCT |
| `index.html:588` (ticker) | Tirzepatide FDA approved 2022 | FDA (May 2022, diabetes) |
| `glossary.html:391` | Tirzepatide targets GLP-1 and GIP receptors, marketed as Mounjaro | Wikipedia / FDA |
| `glossary.html:390` | Semaglutide and liraglutide are GLP-1 agonists (Ozempic / Wegovy) | FDA |
| `index.html:168` | "Banned in sport by WADA since 2022" (BPC-157) | Wikipedia (S0 category, 2022) |
| `evidence-guide.html:348,397` | "~90% of drugs that work in animal models fail in humans" | Generally accepted ballpark across multiple FDA / industry summaries; not pinned to one source |

The full glossary (60+ terms) was spot-checked at GLP-1, GIP, BPC, NAD+,
RCT, double-blind, telomere, WADA — definitions are accurate.

The evidence-guide tier definitions / red-flag list / verification
walkthrough are opinion / methodology, not factual claims, and are
internally consistent.

## Internal inconsistency to flag separately

Even before any external verification, the BPC-157 trial count
contradicts itself within the **same page**:

- "nine" (anchor + feature)
- "fourteen" (ticker)
- "six completed" (anchor + feature)

A reader who looks twice will notice. Reconcile before fixing the
underlying number.

## Recommended remediation order

1. **Block-merge fixes** (RED, citation integrity) — these directly
   undercut the brand promise. R1, R2, R3, R5, R6.
2. **Library-count truth** — R4, plus wire the count to JSON.
3. **Strip or wire up fabricated metrics** — Y1, Y2, Y3, Y4, Y6, Y7, Y8.
4. **Branding placeholders** — Y5, Y9, Y10, Y11 — judgment calls; either
   own them as illustrative or replace with real data.
5. **Methodology** — no changes recommended.

## Out of scope (not audited this pass)

- `web/index.html` and the rendered library SPA.
- `peptide-info-database.json` — 45 entries × ~5–20 source URLs each
  (~200–900 individual citations). Recommend a separate, scripted
  citation-presence + URL-liveness audit, then a sample-based source-
  accuracy check.
- `kaynos-site` (separate marketing site for kaynos.net).
- Open Graph / structured data accuracy.

## Receipts (verification commands run)

```
$ node -e "const d=JSON.parse(require('fs').readFileSync('peptide-info-database.json'));
   console.log('entries:', d.entries.length, 'meta.entryCount:', d.meta.entryCount)"
   entries: 45 meta.entryCount: 45

$ ClinicalTrials.gov v2 API (machine-readable JSON, not the JS page):
   - studies/NCT04938843  → F. prausnitzii probiotic, glycemic control
   - studies/NCT05521022  → AT-02 mAb, systemic amyloidosis
   - studies?query.intr=BPC-157 → 2 studies (NCT02637284, NCT07437547)
   - studies?query.intr=BPC+157+OR+pentadecapeptide+OR+PL+14736 → same 2

$ PubMed search "Sikiric BPC-157 tendon 2018" → no J Pharm Sci match
$ PubMed search "Chang BPC-157 anastomotic 2014" → zero results
$ Wikipedia BPC-157 → "as of 2022, banned by WADA under S0"
$ Wikipedia Tirzepatide → FDA May 2022 (diabetes), Mounjaro/Zepbound
$ Wikipedia Retatrutide → "15-24% weight loss over 48-72 weeks"
```

No edits to any HTML file were made by this audit. Findings only.
