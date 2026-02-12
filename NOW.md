
# MODUS Redaktionssystem Status

**Current Cycle:** v3.5.0 Normprompt / Fine-Tuning
**Focus:** Mission Control & Codebase Health

## Architecture State (Plan v3.3 Alignment)

We are building an **Agentic Era magazine**: a high-gloss editorial system that rides the weekly AI wave (models, tools, workflows, creator culture) and turns raw internet signals into **curated, styled, provable editorial outputs**.

### ✅ Phase 1: Tiered Intelligence (The Wire)
*Implemented the "Search → Scan" compression pipeline (Plan Sec 6.1).*
- [x] **Discovery Layer**: `executeSearch` uses Gemini 3 Flash to snapshot raw search results into strict JSON (`RetrievalSnapshot`).
- [x] **Scanner Agent**: `agentScanner` (Flash Lite) processes dense context to generate `Lead[]` without deep reading.
- [x] **Wire UI**: Split-pane interface for scanning targets and reviewing Leads with risk scores and editorial fit metrics.

### ✅ Phase 2: Forensic Deep Dive (The Commission)
*Implemented the "Commission → Snapshot → Dossier" flow (Plan Sec 6.3 & 7).*
- [x] **Retrieval Snapshot**: Captures immutable source of truth (URLs, snippets, timestamps).
- [x] **Scout Agent**: `agentDossierCompiler` extracts atomic `SignalClaim`s mapped to specific `supporting_sources`.
- [x] **Forge UI**: 3-Pane "Forensic Inspector" (Timeline / Claims Map / Evidence Inspector) to visualize provenance.
- [x] **Fact Check Gate**: `agentFactCheck` validates drafted stories against the Dossier Snapshot.

### ✅ Phase 3: The Debate & Verdict
*Implemented the "Pitch → Debate → Decision" logic (Plan Sec 5.8 & 5.9).*
- [x] **Pitching Engine**: `agentPitching` generates angles from Critic, Runway, and Atelier personas.
- [x] **Verdict Authority**: `agentVerdict` applies editorial gates (Novelty, Cultural Voltage) to determine placement.
- [x] **Production Console**: Real-time view of the debate outcome in the Newsroom.

### ✅ Phase 4: The Craft (Headlines & Rewrite)
*Moving from "generating text" to "forging artifacts" (Plan Sec 10).*
- [x] **Headline Forge**: `agentHeadlineForge` generates candidates (Vogue/New Yorker/Paradox).
- [x] **Rewrite Chain**: Implemented explicit `Draft` → `Rewrite` → `Final` chain with delta tracking.
- [x] **UI: Compare Bay**: Visualized the "Before/After" of rewrites and headlines in the Newsroom.

### ✅ Phase 5: Mission Control (Fine-Tuning)
*Implemented granular overrides for the engine (Plan Sec 9).*
- [x] **Tuning Board**: UI inputs for Audience, Focus Query, Negative Prompts, and Temperature.
- [x] **Pipeline Injection**: `RunConfig` now passes overrides down to `writer.ts` and `scout.ts`.
- [x] **Tone Control**: Explicit "Audience Level" (General/Expert/Insider) injection into the Rewrite Chain.

### 🔄 Phase 6: Automation & Archival [Active]
*Plan Sec 2.2 & 12*
- [x] **RSS Feed Ingestor**: `agentFeedReader` scans high-signal domains (Wired, Verge, etc.) via search grounding.
- [x] **Output Package**: Implemented JSON export of the finished issue with full provenance logs.
- [ ] **Autopublish Mode**: Time-based runs with trust thresholds (Next Step).

## Refactoring Targets (v4.0 Preparation)
The application logic is congregating in a few "God Files". To maintain velocity, we must decouple:

1.  **TheNewsroom.tsx (~400 LOC)**: Needs to be split into `NewsroomSidebar`, `NewsroomConsole`, and `NewsroomCanvas`.
2.  **writer.ts (~350 LOC)**: Contains 5 distinct agents. Needs to be split into a `writing/` directory.
3.  **engine-orchestrator.ts (~400 LOC)**: Mixing state management with execution logic.

## Roadmap (Next Steps)

1.  **Systemic Refactor**
    *   Execute the split defined in `DECISIONS.md` to ensure modularity before adding Autopilot logic.

2.  **Autopublish Policy**
    *   Implement logic to trigger Commission/Publish loops automatically based on score thresholds.
