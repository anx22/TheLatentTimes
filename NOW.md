# The Latent Times: Current Sprint

## Current Sprint
- [x] **Pipeline Integration**: End-to-end Editorial-Visual-Publishing flow operational. [HARD]
- [x] **Legal Security Compliance**: Multi-agent system to bypass copyright and raw paraphrasing traps under UrhG § 23 / 44b. [HARD]
- [ ] **Agent Debate v2**: Finalize real-time friction transcripts between Board members during consensus logic. [HARD]
- [x] **Visual Layout Mapping**: Standardize aspect ratio handling and grid density across the Magazine view. [PREFER]

## Recently Completed
- [2026-05-31] **Generative Semantic Synthesis Fix & Hard Error Limits**: Re-instrumented `discoverStories` with severe observability boundaries. Discovered that the LLM call was silently exiting via empty catch blocks due to an invalid model alias. Changed calls to `gemini-3-flash-preview` and enforced `throw Error` chains so all autonomous sweep operations correctly populate Pillars again.
- [2026-05-31] **Magazine Grid Dynamic Injection Bug**: Fixed the geometric grid injection logic in `issueMutations` after PrintingPress dispatch. Newly approved issues now correctly map to a visual `LayoutItem` anchoring firmly at `y: 0` to organically push older issues down stream, replacing the bugged mapping logic which caused fresh prints to vanish into grid holes or below fold.
- [2026-05-31] **Server Actions Hygiene & Domain Decoupling**: Refactored the monolithic 624-line `actions.ts` file into three highly isolated domain action files (`clusteringActions.ts`, `fetchActions.ts`, `autonomousActions.ts`) under `/convex/newsroom/actions/` with frictionless, backwards-compatible re-exports.
- [2026-05-31] **Backend Code Hygiene & Domain Splitting**: Decomposed the monolithic 630+ line `mutations.ts` file into 5 clean, domain-specific modules (`missionMutations.ts`, `signalMutations.ts`, `issueMutations.ts`, `workbenchMutations.ts`, `draftMutations.ts`) inside `/convex/newsroom/mutations/` and implemented transparent namespace-compatible re-exports.
- [2026-05-31] **Primary Sourcing Expansion**: Audited ingestion registry, analyzed GDELT's geopolitical scope / verified its status, and integrated 6 new industry-leading developer and architectural primary signal channels (NVIDIA Dev, Lil'Log, BAIR, vLLM, Google Research, Simon Willison) into the codebase and Convex hot-patched schemas.
- [2026-05-31] **Ingestion Path Resolution**: Patched broken RSS feeds (outdated WIRED AI category format & missing Anthropic RSS) by implementing active database self-healing schemas and migrating them to active Hugging Face and tag-based WIRED endpoints.
- [2026-05-31] **Magazine Layout Repair**: Resolved React runtime crashes and Rules of Hooks exceptions inside `MagazineGrid` by statically hoisting HOC bindings and correcting module export structure.
- [2026-05-30] **Strategic Control Coupling**: Linked active Atelier state variables to sub-actions, fully correcting darkroom buttons and solving silent publishing pipeline failures.
- [2026-05-30] **Tactile Error Exposure**: Implemented live pipeline error banners with dismiss/clear controls, ensuring clear operational reporting instead of swallowed state crashes.
- [2026-05-30] **Legal Compliance Integration**: Built claim-deconstruction, web-sourcing discovery search engines, and live resemblance auditors for the three-zone pipeline.
- [2026-05-30] **Context Integration**: Enabled rich context extraction from physical signal pools during Three-Zone workbench drafted triggers, neutralizing emergency search fallbacks.

- [2026-05-30] **Showstopper Mitigations**: Solved token overflows in consensus synthesis, type crashes on numeric word targets, and conditional Hook violations.
- [2026-05-30] **Ingestion Fix**: Fixed signal ingestion schema validation errors and stabilized pipeline.
- [2026-05-30] **Pipeline Orchestration**: Unified Editorial-Visual-Publish chain into a single command-driven flow.

## Tech Debt
- **Pipeline Hardening**: Introduce integration tests for the full "Ingest-to-Press" lifecycle. [IN PROGRESS]
- **Schema Cleanup**: Purge legacy `news_clusters` table once Three-Zone is fully verified.

## Backlog
- **Board Debate v2**: Real-time friction transcript between agents.
- **Grid Peer-Review**: Layout designer pitching multiple variations.
- **Art Direction Profiles**: 'Glitch Art', 'Brutalist', and 'Swiss Modernism' presets.

