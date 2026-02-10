```md
# PLAN.md v2  
## Self-Building Editorial System  
**Iteration 1 (Autopublish DROPs) + Full Newsroom Observability + Image Branch**

---

## 0. PURPOSE

This system is a **machine-run editorial newsroom** that can operate fully autonomously,
while remaining **completely inspectable, auditable, and overridable by humans**.

It must allow an editor to see:
- exactly what was found on the internet,
- how signals were merged and judged,
- how agents debated and decided,
- how text evolved draft → rewrite → final,
- which tone variant was chosen,
- which claims map to which sources,
- how layout and imagery were assigned,
- and why something was published.

This is not automation for speed.  
This is **automation for editorial clarity**.

---

## 1. CORE CONSTITUTION (IMMUTABLE)

1. **Editorial Authority**
   - The system judges. It does not summarize.
2. **Traceability**
   - Every sentence has a lineage.
3. **Visible Uncertainty**
   - Opinion, speculation, and reporting are always labeled.
4. **Autonomy by Default**
   - Human input is optional, never required.
5. **Human Override Without Collapse**
   - Any step can be rerun without restarting the system.
6. **Print Logic, Web Reality**
   - Cover, drops, index, colophon, corrections.

---

## 2. MODES OF OPERATION

### Autopublish Mode (default)
- Time-based runs
- Automatic publishing after gates pass

### Audit Mode
- Human approval required before publish
- Same pipeline, additional hold gates

Mode is set per `run_id`.

---

## 3. HIGH-LEVEL STATE MACHINE

```

SCHEDULE_RUN
↓
RETRIEVAL_SNAPSHOT
↓
SOURCE_CAPTURE
↓
SIGNAL_DOSSIER_BUILD
↓
DEDUP_AND_NOVELTY
↓
PITCH_GENERATION
↓
DEBATE_ROOM
↓
EDITORIAL_VERDICT
↓
HEADLINE_FORGE
↓
DROP_DRAFT
↓
REWRITE_CHAIN
↓
FACT_AND_PROVENANCE_GATE
↓
CLAIM_MAP_BUILD
↓
IMAGE_BRANCH (optional)
↓
LAYOUT_DIRECTIVES
↓
LAYOUT_COMPILER
↓
PUBLISH or QUEUE

````

Each state:
- writes artifacts
- logs decisions
- can be rerun independently

---

## 4. RETRIEVAL & OBSERVABILITY LAYER

### 4.1 RETRIEVAL_SNAPSHOT

**Purpose**  
Capture *exactly* what the system saw on the internet.

**Stored Artifact**
```json
{
  "run_id": "",
  "query": "",
  "timestamp": "",
  "locale": "",
  "result_count": 0,
  "results": [
    {
      "url": "",
      "title": "",
      "snippet": "",
      "domain": "",
      "detected_date": ""
    }
  ],
  "hash": ""
}
````

### Newsroom UI

* Query Log (all searches)
* Result Inspector (per URL)
* Diff view between retrieval runs

---

### 4.2 SOURCE_CAPTURE

**Purpose**
Normalize untrusted web content into safe excerpts.

**Rules**

* Strip HTML, scripts, instructions
* No agent receives raw web text
* Everything marked `untrusted`

**Stored Artifact**

```json
{
  "url": "",
  "canonical_url": "",
  "domain": "",
  "publish_date": "",
  "author": "",
  "text_excerpts": [],
  "source_tier": "primary|secondary|social",
  "trust_notes": ""
}
```

---

## 5. SIGNAL & MEMORY LAYER

### 5.1 SIGNAL_DOSSIER

```json
{
  "signal_id": "",
  "title_candidate": "",
  "what_happened": "",
  "why_now": "",
  "claims": [
    {
      "claim_id": "",
      "text": "",
      "source_urls": [],
      "date": ""
    }
  ],
  "entities": [],
  "tags": [],
  "risk_flags": []
}
```

---

### 5.2 DEDUP_AND_NOVELTY (ARCHIVIST)

```json
{
  "signal_id": "",
  "novelty_score": 0,
  "repetition_note": "",
  "similar_signals": [],
  "recommendation": "keep|merge|demote"
}
```

Rule:

* novelty < 2 → INDEX only

---

## 6. PITCH & DEBATE LAYER

### 6.1 PITCH

```json
{
  "signal_id": "",
  "angle": "",
  "thesis_fit": "",
  "cultural_voltage": 0,
  "craft_potential": 0,
  "suggested_format": "DROP|INDEX|HOLD",
  "risk_summary": ""
}
```

---

### 6.2 DEBATE_TRANSCRIPT

Structured, short, auditable.

```json
{
  "signal_id": "",
  "statements": {
    "scout": [],
    "fact_editor": [],
    "archivist": [],
    "critic": [],
    "atelier": [],
    "runway_editor": []
  },
  "scores": {
    "novelty": 0,
    "proof": 0,
    "heat": 0,
    "longevity": 0
  }
}
```

### Newsroom View

* Debate Room
* Score breakdown
* Load-bearing sources highlighted

---

### 6.3 EDITORIAL_VERDICT

```json
{
  "signal_id": "",
  "placement": "DROP|INDEX|HOLD",
  "tone_default": "VERDICT_IMPERIAL|WIT_DRY|SKEPTICAL_NEAT|NEUTRAL_INDEX",
  "reason": ""
}
```

---

## 7. WRITING SYSTEM

### 7.1 HEADLINE_FORGE

Multiple tone variants generated.

```json
{
  "headline_sets": {
    "VERDICT_IMPERIAL": [],
    "WIT_DRY": [],
    "SKEPTICAL_NEAT": [],
    "NEUTRAL_INDEX": []
  },
  "dek_variants": [],
  "pull_quotes": [],
  "footnote_candidates": []
}
```

Human can:

* preview
* lock tone
* lock specific headline

---

### 7.2 DROP_DRAFT

```json
{
  "headline": "",
  "body": "",
  "tone_preset": "",
  "sources": [],
  "footnote": ""
}
```

---

### 7.3 REWRITE_CHAIN

Versions stored as immutable artifacts:

* `draft`
* `rewrite_clarity`
* `rewrite_authority`
* `final`

**Diff Artifacts**

```json
{
  "from": "",
  "to": "",
  "sentence_diff": [],
  "claim_diff": [],
  "tone_shift_score": 0
}
```

---

## 8. FACT, PROVENANCE & CLAIM MAP

### 8.1 FACT_AND_PROVENANCE_GATE

```json
{
  "verified_claims": [],
  "disputed_claims": [],
  "missing_sources": [],
  "label": "Reported|Opinion|Experimental",
  "gate_status": "PASS|FAIL"
}
```

---

### 8.2 CLAIM_MAP (PUBLISHED)

```json
{
  "claim_id": "",
  "claim_text": "",
  "status": "verified|disputed|speculative",
  "sources": [],
  "appears_in": ["headline|body|footnote"]
}
```

### Newsroom UI

* Click sentence → see claim + sources
* Promote/demote sources
* Force labeling

---

## 9. IMAGE BRANCH (OPTIONAL BUT FIRST-CLASS)

### 9.1 IMAGE_BRIEF_AGENT

```json
{
  "story_id": "",
  "concept": "",
  "visual_metaphor": "",
  "composition": "",
  "typography_overlay": "",
  "color_constraints": "",
  "prohibited_cliches": []
}
```

---

### 9.2 IMAGE_GENERATION_RECORD

```json
{
  "prompt": "",
  "model": "",
  "version": "",
  "seed": "",
  "parameters": {},
  "timestamp": ""
}
```

---

### 9.3 IMAGE_QA

Checks:

* cliché detection
* palette compliance
* safe content
* overlay legibility

Human can:

* approve
* regenerate
* reassign slot

---

## 10. LAYOUT SYSTEM

### 10.1 LAYOUT_DIRECTIVES

```json
{
  "template": "drop_v1",
  "headline_scale": "L|XL",
  "margin_footnote": "left|right",
  "accent_usage": "none|rule|stamp",
  "hero_media_slot": "none|image|typographic"
}
```

---

### 10.2 LAYOUT_COMPILER

Rules enforced:

* headline max 2 lines
* body max 3 paragraphs
* sources visible
* label visible
* footnote rendered in margin

Violations logged, not silent.

---

## 11. INDEX & COLOPHON

### INDEX

* alphabetical
* by topic
* by heat
* by date

### COLOPHON

* contributors (agents + humans)
* tools
* source count
* corrections
* changelog

---

## 12. MONITORING / NEWSROOM UI

### Required Screens

1. Run Dashboard
2. Query Log & Source Inspector
3. Signal Explorer (clusters)
4. Debate Room
5. Writing Studio (diffs + tone)
6. Provenance Panel
7. Image Tray
8. Layout Preview
9. Publish Queue
10. Audit Log

---

## 13. VERSIONING & CORRECTIONS

* No silent edits
* Every change → new version
* Corrections visible on page + colophon

Example:

```
drop/kling-update-v1
drop/kling-update-v1.1 (Correction)
```

---

## 14. SECURITY & SAFETY

* Web content never enters prompts raw
* No agent can both retrieve and decide
* Claims cannot appear without source objects
* Human override logged, never hidden

---

## 15. SUCCESS CRITERIA (ITERATION 1)

* You can replay any DROP end-to-end
* You can explain *why* it exists
* You can point to every source
* You can see how the language evolved
* You can override without breaking the system

---

**This PLAN.md v2 is the operating system.
If the newsroom becomes opaque, the system is broken.**

```
```
