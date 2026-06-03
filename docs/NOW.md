# The Latent Times: Now

> Deploy: **Netlify** (frontend) + **Convex** (backend/crons), deployment `adamant-mastiff-745`
> (**DEV** — see Tech Debt). Required env: Convex `GEMINI_API_KEY`, `NEWSROOM_PASSWORD`;
> Netlify build `VITE_CONVEX_URL` (pinned in `netlify.toml`).

## Current Focus — THE REWRITE
We are executing the consolidated rewrite. **Authority for tasks/status is the tracking board, not this file.**
- **Plan (what/why):** `docs/rewrite/REWRITE_MASTERPLAN.md` (4 pillars · 4 acts · 13 decisions).
- **Tasks/Tracking:** `docs/rewrite/TRACKING.md` (62 tasks · **28 DONE**).
- **Now:** Akt I content-complete (except `T-1.0.4` prod deploy + the paused cockpit redesign `T-1.4.3`).
  Into **Akt II** — „Ein Motor, dem man vertraut": Explainable Wire done; next big rocks are real
  multi-round debate (`T-2.3.1/2`), the full provenance chain (`T-2.4.1`), the signal cache (`T-2.6.1`).
- **Blocked (need human decision):** `T-1.2.0` design baseline · `T-3.3.0` identity/governance · `T-4.0.1` platform.
- **Paused (human):** cockpit redesign `T-1.4.3` — a larger overhaul lands from a parallel session.

## Baseline Reality (live DB, observed 2026-05-31)
`GEMINI_API_KEY` set · embeddings live (3072-dim) · sweep ingested **193 signals / 29 active sources** ·
**3 pillars** (story "The Ethics of the Incomputable") · **drafts=0, issues=0** — autonomous drafting was
dead (A1 cron crash + A2 story-lookup; both fixed, awaiting redeploy). Public-site config fix applied.

## Tech Debt
- **Prod deployment (EF-10):** public site runs on a **DEV** Convex deployment (`dev:adamant-mastiff-745`).
  Stand up a real prod deployment + prod key + `convex deploy` in CI. → `T-1.0.4` (**needs human/Convex access**).
- **ESLint 10 config:** `npm run build` is green; `npm run lint` config (`eslint.config.js`) may need updates
  for ESLint 10 + react-hooks v7 (not build-blocking). The 3 de-`@ts-nocheck`'d convex files (T-2.5.2) also
  dropped their `/* eslint-disable */`; lint isn't gated by the build.
- **Alt-branch cleanup (EF-8):** `dev` ist der Standard-Branch. **Manuell via GitHub-UI löschen** (Proxy blockt
  `git push --delete` mit 403, MCP hat kein Delete-Tool): `claude/intelligent-mayer-PHjEf`,
  `claude/eloquent-planck-KFxPA`, `vercel/setup-vercel-speed-insights-in-rwyfz2`. **Nicht** `main`/`dev`.
- **`@ts-nocheck` (testing.ts):** still carries the directive; out of T-2.5.2 scope (not a runtime file).

> Resolved this sprint: S1 endpoint gate (`T-1.0.1`), `@ts-nocheck` on cron/clustering/autonomous (`T-2.5.2`),
> `NewsroomProvider` scope S3 (`T-1.2.7`), `@google/genai` 2.x (verified green via repeated `convex codegen`).

## Backlog
- Board Debate v2: real-time friction transcript (→ Akt II, `T-2.3.*`).
- Grid Peer-Review: layout designer pitching variations (→ Akt III, `T-3.6.2`).
- Art Direction Profiles: Glitch/Brutalist/Swiss presets (→ Akt III, `T-3.6.1`).
- `chronological` methodology (U4): parked stub.

## Recently Completed (last sprint — durable record in `DECISIONS.md`)
- [2026-06-03] **Akt II — Explainable Wire**: `discoverStories` now groups orphan signals **deterministically**
  by embedding cosine (leader clustering, 0.74); the LLM only names; each story stores an `intentTrace` and a
  `centroid_embedding` (T-2.1.1/2/3, T-2.2.1). Cron clustering is reproducible/explainable.
- [2026-06-03] **Akt II hygiene**: cluster-limit bug (T-2.2.2), honest token telemetry `⚠ partial` (T-2.6.2),
  `drafts.storyId` real FK (T-2.2.3), `@ts-nocheck` removed from cron/clustering/autonomous (T-2.5.2),
  boundary validators for `drafts.blocks`/`missions.metadata`/`newsroom_state.data` (T-2.5.1).
- [2026-06-03] **Akt I finished (content)**: Glass-Box provenance v1 — published articles carry a sources +
  atomic-claims snapshot shown in ArticleDetail (T-1.3.1); plus the Slice-2 technical close-out: `issues.content`
  boundary validator (T-1.2.6), `NewsroomProvider` query scoping (T-1.2.7), persisted editor grid layout (T-1.2.3).
- [2026-06-01] **Stack modernized**: React 19, Vite 8, Tailwind v4, TS 6, ESLint 10, `@google/genai` 2.7 (pinned);
  removed `lodash` + Framer Motion; **GSAP** adopted (1 file migrated, `gsap` skill added). `npm run build` green.
- [2026-06-01] Rewrite consolidation: 4-pillar vision, audit, 13 decisions, implementation hub + doc restructure.
- [2026-05-31] Production connection + Netlify build fix; cron A1 + drafting A2 fixed; read-usage cut ~90%.
- [2026-05-31] Newsroom soft-wall auth (server-verified) + read-only guard; model aliases centralized.
- [2026-05-31] Server actions split (clustering/fetch/autonomous); mutations kept flat (TS2589).
