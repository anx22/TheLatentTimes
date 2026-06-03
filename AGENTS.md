# Agent Map — read this first

AI-native editorial engine ("Vogue meets Wired meets The Matrix").
**Vision** → `docs/PRODUCT.md` · **Current focus** → `docs/NOW.md` · **Why (structural)** → `docs/DECISIONS.md`
**Rewrite plan + tracking** → `docs/rewrite/REWRITE_MASTERPLAN.md` + `docs/rewrite/`
**Where-is-what (token-efficient map)** → `docs/CODEBASE_MAP.md`

## The editorial chain (roles)
Scout (discovery) → Board (debate/consensus) → Columnist (copy) → Editor (lint) →
Polisher (tone) → Photographer (assets) → Designer (layout).

## Code surface
- `services/agents/*` — 18 client agents (one fn each); proxy Gemini via `services/gemini.ts` →
  `convex/gemini.ts` (server transport). Canonical list: `services/agents/index.ts`.
  ⚠️ Several dormant (`agentPersonaSpeak/SeedExplorer/LayoutDesigner`) — see TRACKING `A4` / `T-2.1.4`.
  ✅ The autonomous cron (`convex/newsroom/actions/autonomousActions.ts`) now reuses the shared layer
  (`EditorialOrchestrator` + the same agents), not inline prompts — one brain (T-1.1.2). Clustering in
  `actions/clusteringActions.ts` is deterministic (embedding cosine), LLM only names (T-2.1.1/2).
- `services/`: `editorial` (EditorialOrchestrator) · `signals` (SignalBroker) · `visual` (AtelierEngine) ·
  `publication` (PublicationOrchestrator) · `mission` (telemetry).
- Backend `convex/`: `schema.ts`, `queries.ts`, `mutations.ts` (**flat**, TS2589), `actions/`, `gemini.ts`, `crons.ts`.
- Frontend: `App.tsx` → `components/newsroom-v2/*` (5 rooms) + `MagazineGrid`.

## Installed skills (`skills/custom_skills/`)
`convex-database` · `grid-geometry` · `llm-orchestration` · `data-ingestion` · `gsap` (animation).

## Stack note
Animations use **GSAP** (not Framer Motion — removed). Stack is modernized (React 19, Vite, Tailwind v4,
TS 6) — see `docs/ARCHITECTURE.md` + `docs/DECISIONS.md`.

## Routing
Feature → `docs/PRODUCT.md` + `docs/NOW.md` · Architecture → `docs/ARCHITECTURE.md` + `docs/NOW.md` ·
Structural why → `docs/DECISIONS.md` · Rewrite work → `docs/rewrite/TRACKING.md` · In doubt → start here.
