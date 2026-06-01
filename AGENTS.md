# Agent Map — read this first

AI-native editorial engine ("Vogue meets Wired meets The Matrix").
**Vision** → `PRODUCT.md` · **Current focus** → `NOW.md` · **Why (structural)** → `DECISIONS.md`
**Rewrite plan + tracking** → `REWRITE_MASTERPLAN.md` + `.claude/docs/ai/the-latent-times/implementation/`

## The editorial chain (roles)
Scout (discovery) → Board (debate/consensus) → Columnist (copy) → Editor (lint) →
Polisher (tone) → Photographer (assets) → Designer (layout).

## Code surface
- `services/agents/*` — 18 client agents (one fn each); proxy Gemini via `services/gemini.ts` →
  `convex/gemini.ts` (server transport). Canonical list: `services/agents/index.ts`.
  ⚠️ Several dormant (`agentPersonaSpeak/SeedExplorer/LayoutDesigner`) — see TRACKING `A4`.
  ⚠️ The autonomous cron (`convex/newsroom/actions/autonomousActions.ts`) re-implements the chain
  server-side with inline prompts — duplicate "truth". Being unified (rewrite Akt I).
- `services/`: `editorial` (EditorialOrchestrator) · `signals` (SignalBroker) · `visual` (AtelierEngine) ·
  `publication` (PublicationOrchestrator) · `mission` (telemetry).
- Backend `convex/`: `schema.ts`, `queries.ts`, `mutations.ts` (**flat**, TS2589), `actions/`, `gemini.ts`, `crons.ts`.
- Frontend: `App.tsx` → `components/newsroom-v2/*` (5 rooms) + `MagazineGrid`.

## Installed skills (`skills/custom_skills/`)
`convex-database` · `grid-geometry` · `llm-orchestration` · `data-ingestion`.

## Routing
Feature → `PRODUCT.md` + `NOW.md` · Architecture → `ARCHITECTURE.md` + `NOW.md` ·
Structural why → `DECISIONS.md` · Rewrite work → `implementation/TRACKING.md` · In doubt → start here.
