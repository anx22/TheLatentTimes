# Codebase Map — The Latent Times
> Token-effizienter Navigations-Index. **Zuerst hier nachschlagen, dann gezielt die Datei lesen** —
> nicht das halbe Repo grep'en. Pfade sind repo-root-relativ. Bei Struktur-Drift: hier mitpflegen.

## Stack (Ist)
React 19 + Vite + TailwindCSS v4 + **GSAP** (Animation) · Convex (DB/Vektor/Actions/Crons) ·
Gemini via `@google/genai` (server-only) · TypeScript · ESLint. Deploy: Netlify (FE) + Convex (BE).

## Entry points
- **Frontend:** `index.tsx` → `App.tsx` (Layout: Header + Ticker + `MagazineGrid`/`MainNewspaper` + `NewsroomFloor`-Overlay).
- **Backend:** `convex/` (Schema, Queries, Mutations, Actions, Crons). Generated: `convex/_generated`.
- **Model transport:** client `services/gemini.ts` (`safeGenerateContent`, `callJsonAgent`, `Schemas`) → server `convex/gemini.ts`.

## „Wo ist was" (nach Anliegen)
| Anliegen | Ort |
|---|---|
| **Agenten-Logik** (18) | `services/agents/*` — Barrel `services/agents/index.ts` |
| **Orchestrierung** Debatte/Draft | `services/editorial/EditorialOrchestrator.ts` |
| **Signal-Ingestion/Dedup/Scoring** | `services/signals/SignalBroker.ts` (+ Adapter, SourceRegistry mit 23 Quellen) |
| **Visual/Atelier** | `services/visual/` (AtelierEngine) · `hooks/useVisualAgents.ts` |
| **Publikation** | `services/publication/` · `hooks/usePublicationFlow.ts` |
| **Telemetrie/Missions** | `services/mission/` · Missions in Convex (`startMission`/`completeMission`/`logMessage`) |
| **Modell-Transport (Gemini)** | `convex/gemini.ts` (server) · `services/gemini.ts` (client-proxy) · Aliasse `convex/models.ts` + `constants.ts MODELS` |
| **Autonomer Cron-Sweep** | `convex/newsroom/actions/autonomousActions.ts` (⚠️ dupliziert Agenten-Kette — Akt I vereinheitlicht) |
| **Clustering/Similarity** | `convex/newsroom/actions/clusteringActions.ts` (`checkSemanticSimilarity` 0.96/0.74, `discoverStories`) |
| **Quellen-Fetch** | `convex/newsroom/actions/fetchActions.ts` (`fetchRss`/`fetchGitHub`/`discoverFeeds`) |
| **DB-Schema** | `convex/schema.ts` (11 Tabellen; `v.any()` an `drafts.blocks`/`issues.content`/`missions.metadata`/`newsroom_state.data`) |
| **Queries** | `convex/newsroom/queries.ts` (`getDeepInsight`, `getSignals`, `getOrphanSignals`, `getStory`, …) |
| **Mutations** | `convex/newsroom/mutations.ts` (**flach**, 534 LOC, muss flach bleiben — TS2589) |
| **Crons** | `convex/crons.ts` (08/13/19 UTC Sweeps + stündl. Cleanup) |
| **Auth/Soft-Wall** | `convex/auth.ts` · Guard in `contexts/NewsroomContext.tsx` (`applyReadOnlyGuard`) |
| **State/Contexts** | `contexts/` (Newsroom, Atelier, Parameter) + `hooks/useNewsroom*` |
| **Räume (UI)** | `components/newsroom-v2/`: `TheWire` · `TheBullpen` · `TheDarkroom` · `PrintingPress` · `NewsroomFloor` (Router) · `AutonomousPipeline`/`ThreeZonePipeline` · `ObservabilityDashboard` · `NewsroomUI` (GSAP) |
| **Magazin-Bausteine** | `components/blocks/templates/*` (18 Templates + Registry) |
| **Leser-Grid** | `components/MagazineGrid.tsx` (react-grid-layout) · `components/ArticleDetail.tsx` |
| **Vektor-Utils** | `lib/vector.ts` (3072-dim Guard) · `lib/utils.ts` |
| **Typen** | `types.ts` (IssueContent, DraftBlock, …) |

## Convex-Tabellen (11)
`sources` · `stories` (centroid_embedding) · `signals` (VectorIndex `by_embedding`, 3072) · `drafts`
(status draft|review|published = Freigabe-Queue) · `agent_logs` · `missions` · `images` ·
`newsroom_state` · `issues` · `workbench_sessions` · `story_angles`.

## Root-Konfig & Cruft
`vite.config.ts` (kein `define` → Key leakt nie) · `tailwind.config.js` · `tsconfig.json` ·
`eslint.config.js` · `netlify.toml` (pinnt `VITE_CONVEX_URL`). ⚠️ `vercel.json` = veraltet (Deploy ist Netlify).
Scripts/Cruft: `replace.ts`, `check_env.js`, `metadata.json`, `frontendApi.ts`.

## Groben Umfang
components ~4,2k LOC · services ~2,9k · convex ~2,1k · hooks ~1,2k · contexts ~0,3k.

## Docs
`AGENTS.md` (Root, Einstieg) · `docs/{PRODUCT,ARCHITECTURE,NOW,DECISIONS}.md` · `docs/rewrite/` (Masterplan,
TRACKING, COVERAGE, ACT-1…4, 10x/). Diese Map: `docs/CODEBASE_MAP.md`.
