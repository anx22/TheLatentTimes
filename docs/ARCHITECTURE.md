# The Latent Times: Architecture

## Stack
- **Frontend**: React 19 (Vite) + TailwindCSS v4 + **GSAP** (animation). Deployed on **Netlify**.
- **Backend**: Convex (real-time DB, vector search, actions, crons). Deployed separately.
- **Intelligence**: Gemini, **server-side only** (Convex actions). Model aliases centralized in
  `convex/models.ts` + `constants.ts` (`MODELS`) — never inline literals.
- **Layout**: `react-grid-layout` orchestrated by agent metadata.

## Security — thin-client [HARD]
- The Gemini key lives **only** in Convex env; never in the browser bundle. `vite.config.ts` has no
  `define` block; `.env` (only `VITE_CONVEX_URL`) is gitignored and was purged from git history.

## Access Model
- **Soft wall**: the newsroom (Ops) is editable only after a server-verified password
  (`convex/auth.ts`, `NEWSROOM_PASSWORD`). Anonymous visitors get a **read-only** newsroom.
- **Single choke-point** [HARD]: read-only enforced in `NewsroomContext` (deny-by-default; every
  non-`set*` function becomes a no-op when not authed). Never gate per-button.
- ⚠️ Multi-user identity is **not built yet** (mock single-operator session) — required for Co-Director
  (rewrite Akt III, `T-3.3.0`).

## Layer Rules
- **One Brain / One Truth** [HARD]: a single canonical agent/orchestration layer; the autonomous cron
  MUST reuse it — no inline re-implementation. (Today violated; unified in rewrite Akt I.)
- **Autonomous Inside, Human-Gated Outside** [HARD]: the internal newsroom runs autonomously; everything
  outbound (social posts, replies, published-to-world) requires human approval. Full outbound autonomy is
  a future milestone.
- **Domain Decoupling** [HARD]: agents in `/services`, state logic in domain hooks. `App.tsx` = layout only.
- **Canonical State** [HARD]: Convex is the single source of truth for the "Published Line".
- **Mission Wrapping** [HARD]: every agent execution MUST link to a `missionId` for observability.
- **Persistence Protocol** [HARD]: global parameters / system settings in dedicated Convex state keys.
- **Deep Modules** [PREFER]: encapsulate agent coordination behind high-leverage service interfaces.

## Golden Principles
- **Neural Retrieval vs. Structural Clustering** [HARD]: neural search = interrogation (find signals);
  clustering = synthesis (group signals) — deterministic/explainable, LLM only for naming (rewrite Akt II).
- **Shared Utils over Hand-rolled Helpers** [HARD]: logic in centralized services, not departmental hooks.
- **Validated Boundaries** [HARD]: never assume API/query shapes; validate (no `v.any()` on core objects).
- **Honest by Default** [HARD]: no UI element without real data / real action.
- **Zero-Token Ticker** [PREFER]: cache signals in Convex; deploy LLMs only for value-add synthesis.
