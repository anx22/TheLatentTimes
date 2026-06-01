# The Latent Times: Now

> Deploy: **Netlify** (frontend) + **Convex** (backend/crons), deployment `adamant-mastiff-745`
> (**DEV** — see Tech Debt). Required env: Convex `GEMINI_API_KEY`, `NEWSROOM_PASSWORD`;
> Netlify build `VITE_CONVEX_URL` (pinned in `netlify.toml`).

## Current Focus — THE REWRITE
We are executing the consolidated rewrite. **Authority for tasks/status is the tracking board, not this file.**
- **Plan (what/why):** `docs/rewrite/REWRITE_MASTERPLAN.md` (4 pillars · 4 acts · 13 decisions).
- **Tasks/Tracking:** `docs/rewrite/TRACKING.md` (58 tasks).
- **Now:** Akt I — „Eine makellose Ausgabe" auf kanonischem Kern. Next task **`T-1.0.1`** (S1 action auth, P0).
- **Blocked (need human decision):** `T-1.2.0` design baseline · `T-3.3.0` identity/governance · `T-4.0.1` platform.

## Baseline Reality (live DB, observed 2026-05-31)
`GEMINI_API_KEY` set · embeddings live (3072-dim) · sweep ingested **193 signals / 29 active sources** ·
**3 pillars** (story "The Ethics of the Incomputable") · **drafts=0, issues=0** — autonomous drafting was
dead (A1 cron crash + A2 story-lookup; both fixed, awaiting redeploy). Public-site config fix applied.

## Tech Debt
- **Verify `@google/genai` 2.x on Convex side:** frontend build excludes `convex/`, so the 2.x SDK use
  in `convex/gemini.ts` (+ clustering/autonomous actions) is **unverified** here — check at `convex` deploy/codegen.
- **Prod deployment (EF-10):** public site runs on a **DEV** Convex deployment (`dev:adamant-mastiff-745`).
  Stand up a real prod deployment + prod key + `convex deploy` in CI. → `T-1.0.4`.
- **ESLint 10 config:** `npm run build` is green; `npm run lint` config (`eslint.config.js`) may need updates
  for ESLint 10 + react-hooks v7 (not build-blocking).
- **Endpoint hardening (EF-1 / S1):** Gemini actions publicly callable; soft wall is UI-only. → `T-1.0.1`.
- **`@ts-nocheck` islands (EF-9):** `crons.ts`, `autonomousActions.ts`, `clusteringActions.ts`. → `T-2.5.2`.
- **Alt-branch cleanup (EF-8):** delete `claude/eloquent-planck-KFxPA` + `vercel/…` via GitHub UI (manual).
- **`NewsroomProvider` scope (S3):** ~13 live queries on every public page. → `T-1.2.7`.

## Backlog
- Board Debate v2: real-time friction transcript (→ Akt II, `T-2.3.*`).
- Grid Peer-Review: layout designer pitching variations (→ Akt III, `T-3.6.2`).
- Art Direction Profiles: Glitch/Brutalist/Swiss presets (→ Akt III, `T-3.6.1`).
- `chronological` methodology (U4): parked stub.

## Recently Completed (last sprint — durable record in `DECISIONS.md`)
- [2026-06-01] **Stack modernized**: React 19, Vite 8, Tailwind v4, TS 6, ESLint 10, `@google/genai` 2.7 (pinned);
  removed `lodash` + Framer Motion; **GSAP** adopted (1 file migrated, `gsap` skill added). `npm run build` green.
- [2026-06-01] Rewrite consolidation: 4-pillar vision, audit, 13 decisions, implementation hub + doc restructure.
- [2026-05-31] Production connection + Netlify build fix; cron A1 + drafting A2 fixed; read-usage cut ~90%.
- [2026-05-31] Newsroom soft-wall auth (server-verified) + read-only guard; model aliases centralized.
- [2026-05-31] Server actions split (clustering/fetch/autonomous); mutations kept flat (TS2589).
