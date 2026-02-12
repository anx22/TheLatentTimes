
# PLAN.md v3.4 — NORMPROMPT / Prompt Magazine
## Self-Building Editorial Newsroom (Inspectable, Auditable, Overrideable)

---

## 0) PURPOSE

We are building an **Agentic Era magazine**: a high-gloss editorial system that rides the weekly AI wave
(models, tools, workflows, creator culture, agentic engineering) and turns raw internet signals into
**curated, styled, provable editorial outputs**.

This system is a **machine-run newsroom** that can operate autonomously while remaining:
- **Inspectable**: show exactly what was seen, extracted, judged, rewritten.
- **Auditable**: every claim, headline, and decision maps to sources and logs.
- **Overrideable**: humans can intervene at any step without breaking the pipeline.

Primary output (for now): **Headline + Angle + Dossier** (not a full article by default).

---

## 1) CORE CONSTITUTION (IMMUTABLE)

1. Editorial Authority
   - The system judges. It does not “summarize and pray.”
2. Traceability
   - Every artifact has lineage (parents, prompts, models, timestamps).
3. Visible Uncertainty
   - Verified / Disputed / Speculative are always labeled.
4. Autonomy by Default
   - Human input optional; human override always available.
5. Human Override Without Collapse
   - Any stage can be rerun or overridden without restarting the system.
6. Print Logic, Web Reality
   - Cover, drops, index, colophon, corrections mindset.
7. Tiered Intelligence
   - Scan cheap & wide; read smart & deep.
8. Magazine Spirit (Agentic Era)
   - Momentum, curation, provable claims, daring phrasing without hallucination.

---

## 2) MODES OF OPERATION

### 2.1 WIRE MODE (Default)
- System scans continuously.
- Human commissions a lead for deep dive.
- Human approves for publishing outputs.

### 2.2 AUTOPUBLISH MODE
- Time-based runs.
- System commissions + approves automatically if gates pass.
- Configurable thresholds:
  - source trust
  - provenance strictness
  - dispute policy (hold if disputes > 0, etc.)

---

## 3) HIGH-LEVEL STATE MACHINE

DISCOVERY (Search+Feeds)
→ SCAN (L0 leads)
→ COMMISSION (human or auto)
→ RETRIEVAL_SNAPSHOT (source capture)
→ DOSSIER_BUILD (claims + evidence)
→ PITCH_SET (angles)
→ DEBATE (Scout / Critic / Runway)
→ VERDICT (Editor)
→ HEADLINE_FORGE (candidates)
→ REWRITE_CHAIN (finalize)
→ OUTPUT_PACKAGE (publishable artifacts)

---

## 4) ARTIFACT MODEL (IMMUTABLE + VERSIONED)

### 4.1 Artifact Rules
- Every stage emits immutable artifacts.
- Edits create new versions with `parent_artifact_id`.
- All artifacts store:
  - `artifact_id`, `parent_artifact_id`
  - `created_at`, `model_used`, `prompt_hash`
  - `source_refs[]` (URLs and snapshot/chunk refs)
  - `decision_log_refs[]` (why this happened)

### 4.2 Required Artifacts
1. `DiscoveryBatch` (search results + RSS items)
2. `Lead[]`
3. `Commission`
4. `RetrievalSnapshot`
5. `SignalDossier`
6. `FactCheckReport`
7. `PitchSet`
8. `DebateTranscript`
9. `EditorialVerdict`
10. `HeadlineCandidates`
11. `RewriteChain`
12. `HeadlineDecisionLog`
13. `OutputPackage`

---

## 5) AGENT ROLES (CONTRACTS)

### 5.1 Discoverer (Search Grounding)
- Purpose: fetch raw candidates cheaply and consistently.
- In: query seeds (topics), time window, source policy.
- Out: `DiscoveryBatch.search_items[]` (strict schema):
  - `{ title, url, source_domain, snippet }` (top N capped)
- Notes: no interpretation; just acquisition.

### 5.2 Feed Ingestor (RSS Layer)
- Purpose: continuous second discovery layer (steady signal stream).
- In: RSS whitelist + schedules.
- Out: `DiscoveryBatch.rss_items[]` (same strict schema):
  - `{ title, url, source_domain, snippet }`
- Notes: merges into DiscoveryBatch, deduped by canonical URL.

### 5.3 Scanner (L0 / cheap)
- Purpose: noise filtering + lead generation.
- In: `DiscoveryBatch` (compressed representation).
- Out: `Lead[] { headline, angle_hint, why_now, sources[], score }`
- Must: never deep read; no invented facts.

### 5.4 Retriever / Archivist (L1)
- Purpose: capture exactly what was seen (audit basis).
- In: `Commission`
- Out: `RetrievalSnapshot { sources[], chunks[], timestamps, raw_payload_refs }`

### 5.5 Scout (Facts Extractor)
- In: `RetrievalSnapshot`
- Out: `Claims[] { id, claim_text, evidence_refs[], label_hint }`

### 5.6 Verifier / Gatekeeper
- In: `Claims[] + evidence`
- Out: `FactCheckReport { verified[], disputed[], speculative[], missing_fields[], notes }`

### 5.7 Pitch Editor
- In: `SignalDossier + FactCheckReport`
- Out: `PitchSet[] { angle, hook, audience, risks, tone_suggestions }`

### 5.8 Debate Trio
- Scout: strongest provable facts.
- Critic: gaps, contradictions, hype-policing.
- Runway: magazine framing + zeitgeist lens.
- In: `PitchSet + FactCheckReport`
- Out: `DebateTranscript { turns[], deltas[], citations[] }`

### 5.9 Editor (Verdict)
- In: `DebateTranscript + PitchSet + FactCheckReport`
- Out: `EditorialVerdict { chosen_angle, tone_preset, constraints, rewrite_requests[] }`

### 5.10 Headline Forge
- In: `EditorialVerdict + top claims`
- Out: `HeadlineCandidates[] { text, tone, risk_score, novelty_score, cadence_score, constrained_claim_refs[] }`

### 5.11 Rewrite Chain
- In: `HeadlineCandidates + Critic notes`
- Out: `RewriteChain { draft, rewrite, final, notes }`
- Also emits `HeadlineDecisionLog`.

---

## 6) DISCOVERY + RETRIEVAL SYSTEM (CURRENT IMPLEMENTATION + RSS LAYER)

### 6.1 Two-Stage Compression (Search → Scan)
Goal: keep discovery cheap, structured, and token-tight while preserving editorial signal quality.

#### Layer A — Search Grounding (Discovery)
- Model: `gemini-3-flash-preview`
- Output (strict JSON schema, capped top 8):
  - `{ title, url, source_domain, snippet }`
- Stored as: `DiscoveryBatch.search_items[]`

#### Layer B — Scanner (Lead Analysis)
- Model: `gemini-flash-lite-latest`
- Input: dense compressed text built from the 8 items (not raw JSON).
- Output: `Lead[]` (headline/angle/why-now/score/sources)

### 6.2 RSS as Second Discovery Layer
RSS runs in parallel as an always-on stream, merged into `DiscoveryBatch`:
- Same strict item schema
- Canonical URL dedupe across Search + RSS
- RSS items can be promoted into the Scan input when:
  - they are recent,
  - from trusted sources,
  - or fill diversity gaps (topic/source spread).

### 6.3 Commissioned Deep Dive (Snapshot)
Commission triggers `RetrievalSnapshot`:
- capture sources, timestamps, canonical URLs
- chunk extraction
- raw payload refs for audit

---

## 7) CONTENT FLOW (WHAT HAPPENS TO CONTENT)

### 7.1 Discovery → Leads
DiscoveryBatch (Search + RSS) becomes Leads (ranked editorial candidates).

### 7.2 Leads → Snapshot
Commission selects one lead; snapshot captures the real text basis.

### 7.3 Snapshot → Dossier
Dossier builds:
- what_happened (1–3 lines)
- why_now (trigger)
- numbered claims[] with evidence refs
Verifier labels uncertainty.

### 7.4 Dossier → Pitch → Debate → Verdict
Pick a framing that fits the Agentic Era magazine spirit while respecting gates.

### 7.5 Verdict → Headline Forge → Rewrite
Generate candidates, score them, select and rewrite into a final set:
- COVER_LINE
- INDEX_LINE
- TEASER_LINE

---

## 8) GATES & POLICIES (SAFETY + QUALITY)

### 8.1 Provenance Gate (hard)
Every non-trivial claim must map to evidence refs.

### 8.2 Uncertainty Gate (hard)
Disputed/speculative must be labeled in dossier and derived text where relevant.

### 8.3 Dupes Gate
Canonical URL unique or explicitly flagged.

### 8.4 Trust Gate
Whitelist sources; enforce trust thresholds.

### 8.5 Headline Safety Gate (hard)
Headlines cannot state speculative/disputed as fact.

---

## 9) TONE & CONTROL SYSTEM (FINE TUNING)

### 9.1 Tone Presets
- VOGUE: bold, high-gloss, cultural assertion, typographic rhythm.
- NEW_YORKER: cerebral, precise, careful claims.
- PARADOX: punchy tension-driven future shock.
- INDEX: signal-first utility.
- COVER: maximum statement, minimum words.

### 9.2 Mission Control Overrides
Human editors can inject hard constraints into the Agent Pipeline at runtime:
- **Audience Level**: 'General' (explain everything) vs 'Insider' (high jargon, no hand-holding).
- **Focus Query**: Force the Scout agent to search for a specific term instead of the headline.
- **Negative Prompts**: A "Banned Words" list injected into the Rewrite Chain to kill clichés (e.g., "delve", "tapestry").
- **Temperature**: Slider control for Model Entropy (0.1 for facts, 0.9 for creative fiction).

### 9.3 Headline Types (by function)
- COVER_LINE
- INDEX_LINE
- TEASER_LINE

Headline Forge should output all three when possible.

---

## 10) HEADLINE SYSTEM (DEFINITIVE)

### 10.1 Candidate Generation
- 12–30 candidates grouped by tone + type.

### 10.2 Scoring
- angle_fit, novelty, cadence, risk, specificity.

### 10.3 Selection
- 1 final + 2 backups.
- emit `HeadlineDecisionLog` (why chosen/rejected, constraints applied).

### 10.4 Rewrite Chain
draft → rewrite → final with delta notes.

---

## 11) NEWSROOM UI (DASHBOARD LAYOUT, FEATURE PATTERNS)

> One frame. Dense. Editorial. Digital instrumentation. No tab fatigue.

### 11.1 Dashboard Frame
- **Masthead Bar**: issue/mode/status/search/alerts
- **Desk Rail (left)**: work areas (Wire, Research, Dossier, Debate, Copy, Press, Ops)
- **Work Surface (center)**: stacked results + compare bay
- **Editor Desk (right, collapsible)**: provenance + overrides + modifiers
- **Audit Drawer (bottom, collapsible)**: snapshots/logs/raw payload

### 11.2 Feature Patterns (inside the newsroom)
- **Run Tape (Typewriter lane)**: timestamped events + inline action chips (COMMISSION, APPROVE, RERUN, OPEN SNAPSHOT)
- **Needles + Scanline (only while running)**: Focus / Confidence / Diversity + “reading now” highlight
- **Stacked Result Piles**: Leads / Evidence / Claims / Drafts (dense, z-stacked edges)
- **Conversation Strip (non-chat)**: Scout/Critic/Runway turns with footnote citations
- **Compare Bay**: before/after plates (snippet→chunk, claim→evidence, draft→rewrite, candidates→chosen)
- **Modifier Chips**: Trust threshold, Evidence strictness, Diversity bias, Tone preset (with tiny WHY tooltip)
- **Proof Stamps**: PROVENANCE / DUPES / TRUST / DISPUTES as proofing marks

### 11.3 UI ↔ Artifacts Mapping
- Wire: `DiscoveryBatch`, `Lead[]`, `Commission`
- Research: `RetrievalSnapshot` + raw payload refs
- Dossier: `SignalDossier`, `FactCheckReport`
- Debate: `DebateTranscript`, `EditorialVerdict`
- Copy: `HeadlineCandidates`, `RewriteChain`, `HeadlineDecisionLog`
- Press: `OutputPackage` + gate summary

---

## 12) OUTPUT PACKAGE (WHAT GETS “PUBLISHED”)

Minimum publishable unit:
- Final Headline set (cover/index/teaser)
- Chosen Angle
- What Happened / Why Now (short)
- Claim labels summary
- Sources (attribution + links)
- Decision logs (headline + gates)

---

## 13) MVP ROADMAP

### Phase 0 — Running Wire
- Search grounding discovery + scanner leads
- RSS second discovery layer + merge/dedupe
- Commission → snapshot → dossier → debate → headline

### Phase 1 — Newsroom Dashboard Patterns
- Run tape, needles, stacks, conversation strip, compare bay
- editor desk + audit drawer

### Phase 2 — Autopublish Policies
- thresholds + hold rules
- dispute policies
- scheduled runs

---
