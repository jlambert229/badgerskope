# BadgerSkope: Personas and product vision PRD

**Document type:** Product requirements and vision (persona-led)  
**Scope:** Marketing site (`index.html`), research library (`web/`), supporting pages (`glossary.html`, `evidence-guide.html`), and data model (`peptide-info-database.json`)  
**Sources:** In-repo copy, UI structure, feature modules, and schema disclaimers (see citations in Appendix A)

---

## 1. Executive summary

BadgerSkope is positioned as a **free, vendor-neutral peptide research library** that translates technical and commercial noise into **plain-English summaries** with an explicit **evidence grading system**, **comparison tooling**, and **local-only personalization** (bookmarks, notes, recent history). The product explicitly rejects commerce, medical advice, and hype while still speaking to people who encounter peptides through **grey-market discourse**, **forums**, **clinics**, and **athletic contexts**.

**Receipt:** Hero and positioning copy in root `index.html`; library meta and nav in `web/index.html`; disclaimer block in `peptide-info-database.json` lines 1-2.

The **best version** of this site should double down on **research literacy** (understanding what evidence means, not what to buy), **speed to clarity** (goal-based entry, filters, compare), and **trust mechanics** (sources, tier definitions, sport-ban transparency) without collapsing into either **clinical coldness** or **bro-science cheerleading**.

---

## 2. Product thesis (what “great” looks like)

| Pillar | Intent | In-repo signal |
|--------|--------|----------------|
| **De-noise** | Replace forum/vendor/abstract confusion with one consistent card model | Marketing “problem” section; library browse + detail |
| **Evidence honesty** | Every claim mapped to a tier; weak science labeled weak | `EVIDENCE_TIERS` and explainers in `web/src/constants.js`; marketing evidence stack |
| **Action without prescription** | Help users compare and learn; never instruct dosing or treatment | Database disclaimer; FAQ “not medical advice” in `index.html` |
| **Low-friction depth** | Power features for return visitors (compare, stats, notes, share) | Tabs Browse / Compare / Stats; `features.js`, `notes.js`, `goals.js` |
| **Harm and compliance awareness** | Surface sport bans where relevant | `web/src/features/doping.js` |

---

## 3. Inferred primary audiences

These are **not** mutually exclusive; real users often blend roles (for example athlete plus biohacker).

1. **Self-directed learners** navigating peptides after hearing about them online or from peers.  
   **Receipt:** Marketing addresses “forum bros,” vendor hype, and PubMed friction (`index.html`).

2. **Goal-driven wellness explorers** who think in outcomes (weight, sleep, healing, aging).  
   **Receipt:** Goal bar “What are you looking for?” and theme filters (`web/src/features/goals.js`).

3. **Athletes and tested competitors** who need WADA and anti-doping context.  
   **Receipt:** `WADA_BANNED` map and UI flags (`web/src/features/doping.js`).

4. **Repeat researchers and “synthesizers”** who bookmark, annotate, compare, and share.  
   **Receipt:** Selection/compare flow in `web/index.html`; bookmarks, share, recent, notes in `web/features.js` and `web/src/features/notes.js`.

5. **Professionals and educators** (clinicians, pharmacists, journalists, coaches) who need **sourced**, **tiered** summaries for conversations with patients or the public.  
   **Receipt:** FAQ on data provenance; evidence guide link in library nav; extensive schema legends in `peptide-info-database.json`.

---

## 4. Personas (in depth)

### 4.1 Jordan Reyes — “The overwhelmed investigator”

**Demographics:** 32, US, office job, no formal science background. Found peptides through a podcast and Reddit.

**Context:** Jordan has open tabs: a vendor page, a chaotic forum thread, and an abstract they cannot parse. They feel **smart but lost** and worry about being scammed or misreading risk.

**Goals:**

- Understand **what a compound is** in one screen, without a degree.  
- Know whether a benefit claim is **FDA-level**, **trial-backed**, or **mouse-tier**.  
- Avoid **getting nudged to buy** while reading.

**Frustrations:**

- Marketing superlatives and “clinically proven” with no definition.  
- Jargon-heavy papers.  
- Conflicting anecdotes.

**Behaviors in BadgerSkope:**

- Lands on marketing site, skims “what we’re not,” then opens library.  
- Uses **search** and **evidence filter** to find “strongest science first.”  
- Opens **detail** for dosing *context* but should not treat it as personal instruction (product must reinforce that).

**Definition of success for Jordan:**

- In under **3 minutes**, can answer: “What is this, what is it *actually* known for, and how strong is that knowledge?”  
- Never mistakes **education** for **approval to self-experiment**.

**Design implications:**

- Keep **card summaries** and **tier chips** visually dominant; bury nuance in progressive disclosure, not removal.  
- Marketing tone can be punchy, but **library UX** should feel **calm and legible** (trust > meme).  
- Strengthen **first-run** orientation: short inline “how to read evidence” near first filter use.

**Receipt:** Marketing problem/hero; library search and evidence filter options (`web/index.html`); tier labels in `web/src/constants.js`.

---

### 4.2 Alex Kim — “The goal-first browser”

**Demographics:** 41, parent, time-poor. Interested in **weight and energy**, skeptical of hype.

**Context:** Alex does not want a chemistry lesson first. They think in **problems and outcomes**.

**Goals:**

- Start from **“weight loss,” “sleep,” “healing”** not from compound names.  
- Quickly narrow to a **short list** to read seriously.  
- Compare finalists side by side.

**Frustrations:**

- Databases that assume you already know what “GHRP” stands for.  
- Long articles with no **scannable structure**.

**Behaviors in BadgerSkope:**

- Clicks a **goal button** on the goal bar (`goals.js` explicitly references “Alex” in a comment).  
- Uses **group by** evidence or category to see the landscape.  
- Sends **compare** view to a partner or coach (share link behavior if used).

**Definition of success for Alex:**

- From home or library, **one obvious action** leads to a **relevant subset** in one click.  
- **Compare** answers “what differs” without opening five modals.

**Design implications:**

- Treat **goal buttons** as a **primary navigation** pattern, not a decorative row.  
- After goal selection, show **plain-language recap** of what the filter means (already partially present via `GOAL_DESCRIPTIONS`).  
- Compare table should prioritize **evidence tier**, **class**, and **key cautions** (including sport ban) over esoteric fields.

**Receipt:** `web/src/features/goals.js` (goal bar, descriptions, “Alex” comment).

---

### 4.3 Sam Okonkwo — “The tested athlete”

**Demographics:** 26, competitive athlete subject to **anti-doping rules**.

**Context:** Sam encounters peptides in training culture and needs **fast clarity on prohibition and risk**, not bro anecdotes.

**Goals:**

- Immediately see if something is **banned or high-risk in sport**.  
- Understand **why** (GH secretagogue, peptide X on WADA list).  
- Avoid accidental exposure through **ignorance**, not intent to cheat.

**Frustrations:**

- General wellness sites that **omit** anti-doping context.  
- Binary thinking: “natural vs not” instead of **rule-based** clarity.

**Behaviors in BadgerSkope:**

- Scans cards for **sport ban** chips; opens detail for full context.  
- May use **compare** to contrast compounds that sound similar (for example secretagogue family).

**Definition of success for Sam:**

- **Zero missed** high-risk compounds on **card surfaces** when ban data exists in product.  
- Clear language that **WADA lists change** and users must verify with official sources (product should avoid false certainty).

**Design implications:**

- Expand **doping** coverage thoughtfully: show **last-reviewed date**, link to **official WADA** reference pattern, and separate **“banned”** from **“not approved”** (different problems).  
- Ensure flags are **accessible** (not color-only).

**Receipt:** `web/src/features/doping.js` (WADA map, card and detail banners).

---

### 4.4 Taylor Morgan — “The power researcher”

**Demographics:** 35, analyst mindset. May work in tech, law, or medicine, or be an advanced hobbyist.

**Context:** Taylor builds **personal knowledge bases**. They want **structure**, **exportability**, and **repeatable workflows**.

**Goals:**

- **Bookmark**, **annotate**, and **revisit** without an account.  
- Use **stats** to understand dataset composition (evidence spread, categories).  
- **Share** a specific view with a friend or colleague.

**Frustrations:**

- Sites that reset state on refresh.  
- No way to **compare more than two** things (if limited) or unclear selection UX.

**Behaviors in BadgerSkope:**

- Uses **Stats** tab for orientation, clicks bars to filter.  
- Keeps **private notes** per entry (`localStorage`).  
- Uses **recently viewed** and **search highlight** for speed.

**Definition of success for Taylor:**

- **State is predictable**: selection, filters, theme, and tab behavior work on **mobile and desktop** (existing Playwright specs suggest this matters).  
- Notes and bookmarks feel **trustworthy** (“only on this device” is already stated in notes UI).

**Design implications:**

- Consider **optional export** of notes and bookmarks (JSON) for backup, still privacy-first.  
- Stats dashboard: add **“what changed since last visit”** only if dataset updates become frequent (otherwise skip to avoid noise).

**Receipt:** Stats module `web/src/stats.js`; notes `web/src/features/notes.js`; features bundle `web/features.js`.

---

### 4.5 Dr. Riley Rivera — “The clinical translator”

**Demographics:** 45, MD or NP in primary care or endocrinology; or pharmacist; or science journalist.

**Context:** Patients arrive with **product names from the internet**. The clinician needs **neutral**, **sourced** primers that **do not** replace guidelines but **improve the conversation**.

**Goals:**

- Verify **regulatory status** and **evidence class** quickly.  
- Point patients to **primary sources** without endorsing grey-market use.  
- Use **consistent vocabulary** (glossary, evidence guide).

**Frustrations:**

- Partisan vendor sites.  
- Alarmist mainstream coverage.  
- Resources that **hide** uncertainty.

**Behaviors in BadgerSkope:**

- Reads **detail** sections on sources and tiers.  
- Cross-checks **synergy** claims against legend definitions in JSON meta.  
- May assign **glossary** reading.

**Definition of success for Riley:**

- Every substantive claim has a **visible evidentiary class** and a path to **references**.  
- Disclaimers are **prominent** without undermining usefulness.

**Design implications:**

- Add **“clinician mode”** optional compact layout (future): denser tables, less marketing tone inside app shell only.  
- Ensure **synergy** and **blend** narratives are visually distinct from **single-agent** claims (schema already encodes nuance; UI must not flatten it).

**Receipt:** `peptide-info-database.json` legends for synergy, dose, and benefits; glossary front matter `glossary.html`; evidence link in `web/index.html`.

---

## 5. Jobs to be done (JTBD) summary

| Persona | When I… | I want to… | So I can… |
|---------|---------|------------|-----------|
| Jordan | Hear a peptide name in the wild | See a plain summary with honest evidence | Avoid being fooled |
| Alex | Have a wellness goal | Start from goals, not chemistry | Shortlist options fast |
| Sam | Train competitively | See ban and risk flags early | Stay within rules |
| Taylor | Research deeply | Bookmark, note, compare, share | Build a personal map |
| Riley | Counsel a curious patient | Cite tiers and sources | Have an accurate conversation |

---

## 6. Strategic implications for the “best” site

### 6.1 Voice and tone split (recommended)

- **Marketing layer** may stay bold and humorous to **pierce noise** (“Your peptide dealer has a marketing team”).  
- **Library layer** should feel **neutral, precise, and fast** so trust compounds on repeat visits.

**Receipt:** Contrasting voice in root `index.html` versus library title “Peptide research library” in `web/index.html`.

### 6.2 Trust surface area

- Make **evidence tiers** unavoidable in **card previews**, not only in detail.  
- Add **“last updated”** per entry or global dataset date (meta already has `builtAt`) in UI for pros like Riley.

**Receipt:** `peptide-info-database.json` `meta.builtAt`.

### 6.3 Safety and policy UX

- Global **“not medical advice”** is already present; best version adds **contextual microcopy** next to dosing sections without repeating walls of text.

**Receipt:** Disclaimer in JSON line 1; FAQ in `index.html`.

### 6.4 Athlete pathway

- Consider a **dedicated filter** “Hide banned in sport” or “Show sport risk only” if legally and editorially viable; today flags are compound-name substring based and should evolve toward **structured data** in JSON for maintainability.

**Receipt:** Implementation style in `web/src/features/doping.js` (title substring matching).

---

## 7. Approach options (strategic forks)

### Option A — “Radical clarity” (recommended default)

**Focus:** Evidence-first IA, goal entry, calmer library chrome, richer tier tooltips, structured doping metadata.

| Pros | Cons |
|------|------|
| Highest trust with Jordan, Riley | Less viral than edgier marketing |
| Best retention for Taylor | Slower to ship if restructuring data |
| Safer athlete UX | Requires editorial workflow for new entries |

### Option B — “Community acceleration”

**Focus:** Comments, accounts, crowdsourced errata, faster growth.

| Pros | Cons |
|------|------|
| Scale and engagement | Conflicts with “no forum bros” brand |
| More error reports | Moderation and liability surface explode |

### Option C — “Pro tier”

**Focus:** Clinician exports, CME-like modules, PDFs, API.

| Pros | Cons |
|------|------|
| Revenue for sustainability | Operational overhead; may blur non-commercial positioning stated in FAQ |

**Recommendation:** **Option A** aligns with current codebase and disclaimers. Defer B and C until research literacy core is unbeatable.

---

## 8. Success metrics (suggested)

**Outcome metrics**

- **Time-to-first-confident-understanding** (proxy: scroll depth + detail open + dwell on evidence section in modal).  
- **Compare usage rate** among returning visitors (localStorage return signal optional).  
- **Glossary and evidence guide** clicks from library (education path).  
- **GitHub issue quality** for corrections (flagged fields, sources).

**Guardrail metrics**

- Misinterpretation signals: exits immediately after dosing section without disclaimer interaction (if measured ethically and anonymously).  
- Athlete complaints: “I missed a ban flag” reports.

---

## 9. Phased rollout (product, not just engineering)

| Phase | Deliverable | Validation gate |
|-------|-------------|-----------------|
| P0 | Persona-aligned copy audit (marketing vs library) | 5 user reads: each persona can answer JTBD |
| P1 | Evidence and sport-risk **surface** parity on cards | Heuristic review against `doping.js` and tier chips |
| P2 | Structured **anti-doping** and **regulatory** fields in JSON | No more substring-only card matching |
| P3 | “What changed” dataset notes | Riley and Taylor trust improvement |
| P4 | Optional exports for notes and bookmarks | Privacy review |

---

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Users treat summaries as prescribing | Persistent microcopy; avoid imperative dosing language in UI |
| Dataset errors | Prominent reporting path; versioned schema (`schemaVersion` in JSON) |
| Regulatory perception | Stay informational; no commerce; clear jurisdictional caveats in disclaimer |
| Tone backlash | Keep humor on marketing; keep library sober |

---

## 11. Open questions (need user research)

1. What percentage of visitors arrive **mobile Safari** from social links versus **desktop** deep research? (iOS-specific tests in repo suggest mobile matters; validate with analytics.)  
   **Receipt:** `tests/ios-*.spec.js` files present in repo.

2. Do athletes want **global hide** of GH-axis peptides, or is **flag** enough?

3. Should **goal buttons** persist in URL for sharing (deep links)?

---

## Appendix A: Source citations (repo)

| Artifact | Path | What it establishes |
|----------|------|---------------------|
| Marketing positioning | `/index.html` | Audiences harmed by forum/vendor/abstract noise; free; not medical advice; 53 compounds; six evidence tiers in marketing copy |
| Library shell | `/web/index.html` | Browse / Compare / Stats; filters; glossary and evidence guide; help |
| Evidence model | `/web/src/constants.js` | Tier keys, ranks, plain explainers |
| Goal entry | `/web/src/features/goals.js` | Persona “Alex”; goal-to-theme mapping |
| Athlete signals | `/web/src/features/doping.js` | WADA-related warnings |
| Power user features | `/web/features.js`, `/web/src/features/notes.js` | Recent, bookmarks, share, highlights, private notes |
| Dataset philosophy | `/peptide-info-database.json` | Disclaimers, legends, schema version, entry count |

---

## Appendix B: Assumptions (validate)

- **UNVERIFIED:** Actual traffic mix, conversion from marketing to library, and geographic regulatory concerns are not in-repo; analytics would be required.

---

**End of PRD**
