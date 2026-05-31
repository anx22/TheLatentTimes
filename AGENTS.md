# Agent Map: The Newsroom Staff

## Overview
This project is an AI-native editorial engine ("Vogue meets Wired").
**Current Sprint**: [NOW.md](/NOW.md)

## The Editorial Chain (Conceptual Roles)
- **The Scout**: Signal discovery and targeted research.
- **The Board**: Agent debate and consensus logic.
- **The Columnist**: Narrative / copy generation.
- **The Editor**: Linter and structural peer.
- **The Polisher**: Tone and consistency varnish.
- **The Photographer**: Asset development (Atelier).
- **The Designer**: Strategic layout and grid orchestration.

## Implemented Agents (18 — `services/agents/`)
Each file exports a single agent function. These run client-side and call
Gemini through `services/gemini.ts` (which proxies to the server-side
transport in `convex/gemini.ts`). NOTE: the autonomous cron pipeline in
`convex/newsroom/actions/autonomousActions.ts` re-implements the
Scout→Cluster→Debate→Columnist chain server-side with inline prompts and a
direct `GoogleGenAI` instance — it does NOT reuse these agent files. This Convex
cron is now the **single** scheduler; the old client-side circadian heartbeat in
`AutonomousPipeline.tsx` was removed (it duplicated the cron). Authoritative list — keep in sync
with `services/agents/index.ts`.

### Discovery & research
- `agentScout` — broad signal sweep, identifies high-impact topics.
- `agentTargetedSearch` — deep dive on a single topic with grounding.
- `agentCulturalGrounding` — maps technical signals to philosophy / culture.

### Editorial deliberation
- `agentPersonaSpeak` — generates a single persona contribution to a debate.
- `agentDebate` — synthesises a multi-persona debate into editorial angles.
- `agentConsensus` — extracts a global consensus from a signal batch.
- `agentSynthesis` — collapses a cluster of signals into a story summary.

### Drafting & editing
- `agentColumnist` — produces the structured `DraftBlock[]` article.
- `agentEditor` — KI-Linter; flags blocks with `BlockAnnotation`s.
- `agentRewriteBlock` — block-level rewrite with persona / instruction.
- `agentRewriteSentence` — sentence-level surgical edit.
- `agentPolisher` — final tone / consistency pass.

### Visual atelier
- `agentArtDirector` — visual concepts + colour palettes from a draft.
- `agentPromptEnhancer` — refines an image prompt.
- `agentPhotographer` — calls Gemini Image Gen with the final prompt.

### Layout & afterlife
- `agentLayoutDesigner` — assigns block templates and (x, y, w, h) on the grid.
- `agentCriticsCorner` — generates witty post-publication critic comments.
- `agentConverseWithCritic` — back-and-forth with a critic persona.

## Status
Several of the 18 agents are exploratory and may be merged or removed as
the editorial chain settles. Treat this list as the current code surface,
not a final taxonomy — see `DECISIONS.md` for the architectural intent.

## Service Map
- `/services/agents`: Core LLM logic for specific personas (above).
- `/services/editorial`: Orchestration of the draft / debate cycle (`EditorialOrchestrator`).
- `/services/visual`: Art direction and asset processing (`AtelierEngine`).
- `/services/publication`: Final release prep (`PublicationOrchestrator`).
- `/services/signals`: Ingestion broker + adapters (RSS, GitHub, Search).
- `/services/mission`: Lifecycle, telemetry, observability.
- `/services/testing`: Architecture drills (smoke tests).

## Standardized Agent Skills (Installed)
- **`convex-database`** (`/skills/custom_skills/convex-database/SKILL.md`): Hardened rules against silent Convex action failures and missing environment variables detection.
- **`grid-geometry`** (`/skills/custom_skills/grid-geometry/SKILL.md`): Rules governing 2D responsive grid matrices, aspect ratios, and preventing structural layout overlaps in React-Grid-Layout based systems.
- **`llm-orchestration`** (`/skills/custom_skills/llm-orchestration/SKILL.md`): Hard error boundaries, rigid model aliasing policies (e.g., Gemini Flash), and observability patterns for autonomous agents like 'The Board'.
- **`data-ingestion`** (`/skills/custom_skills/data-ingestion/SKILL.md`): Best practices for robust external fetching (RSS/scrapes), handling transient network closures, and data sanitization prior to DB writes.

## Routing
- Feature task -> read [PRODUCT.md](/PRODUCT.md) + [NOW.md](/NOW.md)
- Architecture task -> read [ARCHITECTURE.md](/ARCHITECTURE.md) + [NOW.md](/NOW.md)
- Structural question -> read [DECISIONS.md](/DECISIONS.md)
