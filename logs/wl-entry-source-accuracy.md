# WL — Entry source accuracy spot-check (sample-based)

Branch: `audit/entry-source-accuracy`
Base: `main` @ `0ced2a3`
Date: 2026-04-29
Sample: **5 entries** drawn to span evidence tiers.
Method: read each entry's `researchSummary` + `reportedBenefits` +
`distinctiveQuality.headline`, fetch each cited PubMed abstract, check
whether the abstract supports the claims.

## TL;DR

**5 of 5** sampled entries have at least one claim that goes beyond
what the cited source actually documents. None are *factually wrong*
in the broader literature — the underlying facts are real. But on a
site whose pitch is "EVIDENCE > HYPE", a click-to-PubMed that
*doesn't* contain the claim being attributed to it is the same
credibility shape the marketing audit (#41) caught on the homepage.

This is a **content-curation gap**, not a factual-error gap. The
typical pattern: one entry references several trials by name (STEP,
SELECT, SUSTAIN for semaglutide) but only one of those is linked.

## Findings per entry

### 1. `1G-SGT` (Semaglutide) — A tier (regulatory_label)
**Cited source:** [PMID 36216945](https://pubmed.ncbi.nlm.nih.gov/36216945/) — Garvey et al., *"Two-year effects of semaglutide in adults with overweight or obesity: the STEP 5 trial"* (Nature Medicine, 2022)

| Claim in entry | Supported by cited source? |
|---|---|
| "STEP program: produces meaningful weight loss when combined with diet and exercise" | ✅ Yes — the linked paper IS STEP 5; reports 15.2% mean weight reduction |
| "Clinical trials: significantly lowers blood sugar (HbA1c) in people with type 2 diabetes" | ❌ Not in cited paper. References the SUSTAIN program, not linked. |
| "SELECT trial: reduced major heart events in people with obesity and heart disease" | ❌ Not in cited paper. References the SELECT trial (Lincoff et al. NEJM 2023), not linked. |
| "Modest drops in blood pressure and cholesterol" | ⚠️ Tangentially in STEP 5 secondary endpoints, but not headline claim. |

**Action:** add SUSTAIN + SELECT citations (PMIDs available), OR rewrite the multi-trial bullets to attribute each to its source.

### 2. `3G-RT` (Retatrutide) — A tier (pivotal_trials)
**Cited source:** [PMID 37366315](https://pubmed.ncbi.nlm.nih.gov/37366315/) — Jastreboff et al., *"Triple-Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial"* (NEJM 2023)

| Claim | Supported? |
|---|---|
| "Combines three hormone pathways (GIP, GLP-1, glucagon)" | ✅ Yes |
| "Phase 2: largest average weight-loss numbers reported" | ✅ At 12mg dose, –24.2% at 48 weeks |
| "Some of the **largest reported for any drug in this class**" (comparative) | ⚠️ Comparative claim — defensible per recent meta-analyses, but **the cited paper doesn't make the comparison.** |
| "Improvements in fasting blood sugar and insulin levels at higher doses" | ✅ Secondary endpoints in the same paper |
| "Positive shifts in triglycerides and liver enzyme markers" | ✅ Same paper, secondary endpoints |

**Action:** soft — either drop the comparative "largest in class" framing, OR add a cited meta-analysis (Tewari 2025 / Sinha-Ghosal 2025 / Katsi 2025 are all real candidates).

### 3. `Ipamorelin` — B tier (phase1_human)
**Cited source:** [PMID 10496658](https://pubmed.ncbi.nlm.nih.gov/10496658/) — Gobburu et al., *"Pharmacokinetic-pharmacodynamic modeling of ipamorelin, a growth hormone releasing peptide, in human volunteers"* (Pharm Res, 1999)

| Claim | Supported? |
|---|---|
| "Triggers the pituitary gland to release growth hormone in natural pulses" | ✅ Yes — "single episode of GH release with peak at 0.67 hours" |
| "Considered 'cleaner' — less spike in cortisol and prolactin" | ❌ Cited paper does **not** measure cortisol or prolactin at all. This claim is from elsewhere in the literature. |

**Action:** drop the cortisol/prolactin clause, OR add a citation that actually measured those (e.g. Raun et al. *Eur J Endocrinol* 1998 — the original ipamorelin characterization paper).

### 4. `5-amino-1mq` (5-Amino-1MQ) — C tier (preclinical_animal)
**Cited sources:**
- [PMID 29155147](https://pubmed.ncbi.nlm.nih.gov/29155147/) — Neelakantan et al., *"Selective and membrane-permeable small molecule inhibitors of nicotinamide N-methyltransferase reverse high fat diet-induced obesity in mice"* (Biochem Pharm 2018)
- [PMID 34304009](https://pubmed.ncbi.nlm.nih.gov/34304009/) — LC-MS/MS PK paper

| Claim | Supported? |
|---|---|
| "Reduced body fat in obese mice" | ✅ Yes — "significantly reduced body weight and white adipose mass" |
| "Improved **blood sugar control** in obese mice" | ❌ Cited paper measured cholesterol, not blood glucose. **Overstated.** |
| "Compound gets absorbed after dosing" | ✅ Second cited paper covers PK |
| "No human trials" | ✅ Accurate caveat |

**Action:** swap "blood sugar control" for "lipid markers" or "cholesterol" — that's what the source actually documents.

### 5. `SS-31` (Elamipretide) — A tier (pivotal_trials)
**Cited source:** [PMID 37462785](https://pubmed.ncbi.nlm.nih.gov/37462785/) — Pharaoh et al., *"The mitochondrially targeted peptide elamipretide (SS-31) improves ADP sensitivity in aged mitochondria…"* (Geroscience 2023)

| Claim | Supported? |
|---|---|
| "Designed to protect mitochondria, the energy powerhouses inside cells" | ✅ Mechanistic framing matches |
| "Binds to a specific fat molecule (cardiolipin)" | ❌ The cited 2023 paper is about ANT, not cardiolipin. The cardiolipin mechanism is the original SS-31 finding (Szeto group, 2008–2011). |
| "Being developed for Barth syndrome and heart failure" | ❌ Not in cited paper. Real claim — Stealth BioTherapeutics' clinical program — but uncited here. |
| "Trial data: improvements in walking distance and oxygen use" | ❌ Not in cited paper. References the MMPOWER trials (Stealth, 2019–2022), not linked. |
| **Tier classification: `pivotal_trials` (grade A)** | ⚠️ The cited source is a mechanistic mouse study, not pivotal human trial data. The tier should arguably be `phase1_human` (B) or lower until a real pivotal trial is published — **the entry's tier may not match its evidence base.** |

**Action:** the largest gap of the five. Recommend (a) adding a real pivotal-trial citation if one exists (Stealth's TAZPOWER / MMPOWER series), (b) adding the original Szeto cardiolipin paper for the mechanism claim, AND (c) reviewing whether this entry deserves an A grade or should be downgraded to B.

## Pattern across the sample

The same shape repeats: an entry's `researchSummary` + `reportedBenefits` weave together a multi-paper narrative ("clinical trials show X, separate research shows Y, mechanism is Z"), but the `sources[]` array contains **only one or two** PubMed entries — typically the most recent or most prominent paper. Every other claim becomes implicitly attributed to that one source even though it doesn't contain the claim.

This is fine as a *narrative summary*. It's a problem when the site's pitch is **"every claim traces back to a primary source"** (the homepage methodology copy) — and the cited primary source doesn't, in fact, contain the claim.

## Recommended remediation pattern

**For each entry, every distinct claim cluster should have its own primary source.** Concretely:

```json
{
  "reportedBenefits": [
    "STEP program: produces meaningful weight loss …",
    "SELECT trial: reduced major heart events …",
    "SUSTAIN program: lowers HbA1c in type 2 diabetes …"
  ],
  "sources": [
    { "label": "PubMed: STEP 5 trial", "url": "…/36216945/" },
    { "label": "PubMed: SELECT trial", "url": "…/37952131/" },
    { "label": "PubMed: SUSTAIN-6", "url": "…/27633186/" }
  ]
}
```

Each `reportedBenefits` line that names a specific trial should have a matching source. Mechanistic / general claims can share a review citation.

This is a content-effort question, not an engineering question. Suggesting it as a backlog item rather than blocking on it.

## Sample size justification

5 entries × ~4 claims each = **20 claim/source pairs** verified. 100% of entries had ≥1 unsupported claim. Even with N=5, the consistency of the finding suggests the pattern holds across the corpus — a larger audit would surface more instances of the same shape, not different shapes.

A future pass at N=20 (45% of the library) would give higher confidence on the *prevalence per entry* (mean number of unsupported claims per entry).

## Receipts

```
$ for pmid in 36216945 37366315 10496658 29155147 37462785; do
    curl -sI "https://pubmed.ncbi.nlm.nih.gov/$pmid/" | head -1
  done
  HTTP/2 200    (all five PMIDs resolve)

$ # Each abstract fetched via WebFetch; titles confirm the cited paper exists
$ # and IS about the claimed compound. The issue is which CLAIMS the cited
$ # paper supports, not whether the URL is valid.
```

## Out of scope

- **No edits applied** to `peptide-info-database.json`. This is an audit-only deliverable; remediation is a content-effort decision the maintainer should make.
- **N=5 sample**, not exhaustive. Larger N would be straightforward to run.
- **Tier-grade calibration** flagged for SS-31 (point 5) but not systematically reviewed across the corpus.
