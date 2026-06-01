# DECISIONS.md
> Append-only. Format: **[date] Problem → Choice → Reason.** Current structural decisions in full;
> older operational fixes condensed to one-liners (full prose lives in git history).

---

## Current — structural (keep full)

### [2026-06-01] Dev-branch standard
**Problem** → Ad-hoc per-session branches (`claude/intelligent-mayer-PHjEf`, `claude/eloquent-planck-KFxPA`, `vercel/…`) cluttered the repo; no standing development branch.
**Choice** → All development happens on a single long-lived **`dev`** branch (created from the rewrite work at `9814813`); `main` stays the release branch. The 3 ad-hoc non-main branches are deleted via the **GitHub UI** — the managed git proxy blocks ref deletions (403) and the GitHub MCP exposes no delete-branch tool.
**Reason** → One clear working branch; less clutter; predictable PR/release flow.

### [2026-06-01] Stack modernization (React 19 · Vite · Tailwind v4 · TS 6 · ESLint 10 · GSAP)
**Problem** → Stack drifting toward old majors; `@google/genai` pinned to `"latest"` (non-reproducible); `lodash` a dead dependency; Framer Motion (`motion`) unreliable for the typography/micro-animation we want.
**Choice** → Upgrade to current majors; pin `@google/genai`; **remove `lodash`** (0 imports) and **`motion`**; adopt **GSAP** as the animation layer (skill `skills/custom_skills/gsap`). Migrate the one motion file (`components/newsroom-v2/NewsroomUI.tsx`).
**Reason** → Performant, well-known, not-at-risk versions; one powerful animation system for modern typographic motion.

### [2026-06-01] Four-pillar North Star
**Problem** → The real vision (spectator newsroom, AI-revolution chronicle, social distribution, community, meta-proof) lived in the founder's head, not the docs; `docs/PRODUCT.md` only described the magazine artifact.
**Choice** → Four pillars — **Spectator · Chronicle · Trust/Proof · Platform** — consolidated in `docs/rewrite/REWRITE_MASTERPLAN.md`; 10x derivation + decision quiz in `docs/rewrite/10x/`.
**Reason** → A publication needs readers, distribution and a "why"; the factory alone is not the product.

### [2026-06-01] Operating boundary — autonomous inside, human-gated outside [HARD]
**Problem** → The reply-agent (autonomous, multi-platform article posting) was the boldest chosen feature but provenance the lightest safeguard → spam/reputation risk.
**Choice** → Internal newsroom runs fully autonomous; everything outbound (social posts, replies, published-to-world) requires human approval. Full outbound autonomy is a future milestone. Recorded [HARD] in `docs/ARCHITECTURE.md`.
**Reason** → The world hates AI spam; outbound trust must be earned.

### [2026-06-01] Gemini-action gate — session token + per-session rate cap (T-1.0.1, audit S1/P0)
**Problem** → The five cost-incurring Gemini actions (`generateText/generateImage/editImage/generateEmbedding/searchTrend`) were public Convex actions callable by anyone with the deployment URL → unbounded model-billing exposure. The existing soft wall only stored a client-side boolean; it issued no token an action could verify, and Convex's `ctx.auth` is unused (no real auth provider).
**Choice** → A successful `NEWSROOM_PASSWORD` check now **mints a server-issued session token** (new `sessions` table, logic hosted in the existing `convex/auth.ts`). Every Gemini action takes an `accessToken` arg and calls `internal.auth.consumeRateBudget` first, which validates the token (existence + 12h TTL) and enforces a fixed-window **per-session rate cap** (120 calls/min). The client (`services/gemini.ts` ← `AuthContext`) attaches the token to every call; `canEdit` is now derived from token presence (storage bumped `v1→v2`, so pre-token sessions must re-auth). Hosting in `auth.ts` (not a new module) lets the generated `api`/`dataModel` types resolve via `typeof` without a codegen run.
**Reason** → Closes the P0 billing hole with the smallest real (non-theatrical) mechanism, reusing the existing password wall instead of inventing new infra. The autonomous cron is untouched — it uses its own inline `GoogleGenAI`, not these actions — so the gate adds no friction to the internal loop. Stays a deliberate soft wall (not hard per-user auth, tracked separately).

### [2026-06-01] One brain first — canonical pipeline (decision Q13)
**Problem** → Two parallel pipelines (client agents ↔ server cron) duplicate "truth".
**Choice** → Build the canonical, transport-agnostic agent/orchestration layer + approval queue as the first visible slice of Akt I; the cron reuses it. (Reuse: client agents already route through `api.gemini.generateText`; `drafts.status='review'` already is an approval queue.)
**Reason** → No building on sand; one truth.

### [2026-06-01] Documentation structure — 5-file backbone + rewrite submodule
**Problem** → A new rewrite doc system overlapped the existing 5-file system (NOW↔TRACKING, PRODUCT↔vision) → drift risk.
**Choice** → 5-file backbone (AGENTS root; `docs/{PRODUCT,ARCHITECTURE,NOW,DECISIONS}`); rewrite hub at `docs/rewrite/`. Only `AGENTS.md` + `README.md` (GitHub landing) in root; everything else under `docs/`. One source per fact. Added `docs/CODEBASE_MAP.md`. Retired `CODEBASE_ANALYSIS.md` + `EMERGENCY_FIXES.md` (value extracted).
**Reason** → Eliminate the overlap that causes documentation drift.

---

## Recent operational (condensed)

- **[2026-05-31] Production connection & soft-wall** → pinned regional `VITE_CONVEX_URL` in `netlify.toml`; plain `npm run build` (dev-key 403'd on `convex deploy`); fixed cron crash A1 (`completeMission` arg) + drafting A2 (`getStory`); read-usage −90% (strip embeddings, logs 300→50); password-only server-verified newsroom auth with single read-only choke-point in `NewsroomContext`; model aliases centralized.
- **[2026-05-31] Generative semantic clustering** → ⚠️ **SUPERSEDED (2026-06-01)**: had switched `discoverStories` to a single generative Gemini sweep. *Rewrite Akt II reverts to explainable/hybrid:* deterministic vector correlation for grouping, LLM only for naming (Authority over Aggregation).
- **[2026-05-31] Loud error boundaries** → stripped silent catches; pinned `gemini-3-flash-preview` (the `gemini-3.5-flash` alias 404'd). Pipelines must crash loudly.
- **[2026-05-31] Magazine grid injection** → `addItemToLatestIssue` injects approved articles at `y=0`, shifts others down (were vanishing into grid holes).
- **[2026-05-31] Convex actions split** → `actions.ts` → `actions/{clustering,fetch,autonomous}.ts` (re-export shim). **Mutations split REVERTED** (`5399c67`): sub-files re-triggered TS2589 → `mutations.ts` stays flat. Seed data isolated to `seedData.ts`.
- **[2026-05-31] Sourcing** → GDELT rejected (geopolitical noise); +6 primary AI-dev sources; self-healing RSS migration for dead WIRED/Anthropic feeds (→ HF Blog).
- **[2026-05-31] MagazineGrid crash** → hoisted `WidthProvider(Responsive)` to module level (Rules-of-Hooks/HOC fix).
- **[2026-05-30] Pipeline state coupling** → exposed `atelierState` into action context (Darkroom publish crash); visible pipeline error banner; preserve live issue layout on publish; "Send to Darkroom" transition.
- **[2026-05-30] Copyright shield (UrhG §23/44b)** → five-step legal protocol: seed → atomic claims → evidence pack → original draft with citations → similarity audit.
- **[2026-05-30] Workbench context** → serialize selected signals + directive into `produceDraft` (no blank-context search fallback).
- **[2026-05-30] Reliability** → `executeFullPipeline` one-click chain; schema centralization in `services/gemini.ts`; single atomic `agentDebate` call; lexical noise filter + dedup in `SignalBroker`; source packs + trust tiers + cross-pack clustering; circadian schedule + persistence isolation.

## Historical foundations (condensed)
- [2026-05-26] Methodology switchboard + Three-Zone Pipeline (Mosaic→Workbench→Press).
- [2026-05-24/25] Signal convergence (retired "Ticker"), de-marketing renames, hook decomposition, mission registry.
- [2026-05-22] `react-grid-layout` AI-orchestrated layout · [05-20] vector clustering/dedup · [05-18] `DraftBlock` arrays · [05-15] editorial-chain rooms · [05-10] hybrid RSS+agentic ingestion.
- [2026-02-12] Genesis: Google AI Studio. (Auth existed Feb → later removed; mock single-operator session today — multi-user identity returns in rewrite Akt III.)
