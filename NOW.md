
# MODUS Redaktionssystem Status

**Current Cycle:** v2.1.0 Architecture Shift
**Focus:** Backend Migration (Supabase) & Deployment

## Architecture Roadmap

### Phase 1: Database & Auth (Supabase) [IN PROGRESS]
- [x] **Relational Schema**: Mapped `IssueContent` to `modus_issues`, `modus_articles`, `modus_recipes`.
- [x] **Storage Service**: Replaced `localStorage`/GCP adapter with `services/storage.ts` (Supabase Client).
- [ ] **Public Read / Authenticated Write**: Update App logic to allow public reading without login.
- [ ] **Auth State Management**: Fix synchronous auth checks in UI.

### Phase 2: Deployment (Vercel) [PENDING]
- [ ] **Environment Variables**: Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`.
- [ ] **Build Pipeline**: Ensure clean build on Vercel.

## Progress Tracker

### Meta [COMPLETE]
- [x] **Agent Modularization**: Refactored monolithic `engine-agents.ts` into role-based modules.
- [x] **Persistence Layer**: Implemented `localStorage` adapter (`services/storage.ts`).
- [x] **Rate Limit Defense**: Implemented `safeGenerateContent` with exponential backoff.
- [x] **Simulation Mode**: Implemented "True Simulation" for search.

### Iteration 1-9: Editorial Engine [COMPLETE]
- [x] **Drop Engine**: Automated brief generation.
- [x] **Visual Intelligence**: Automated prompt engineering and image generation.
- [x] **Director Control**: Full text and prompt editing in the Review Queue.
- [x] **Debate Artifacts**: `IssueContent` captures Pitches + Verdicts.
- [x] **Layout Intelligence**: Dynamic templates (Minimal/Editorial/Immersive).

## Observations (Auffälligkeiten)
1. **Supabase Transition**: The relational mapping allows for querying individual articles later, rather than loading the massive JSON blob every time.
2. **Auth Flow**: Users expect to read the magazine without logging in. The "Storage Offline" banner was confusing for readers.

## Next Steps
1. **Fix Auth Logic**: Ensure `App.tsx` checks session asynchronously.
2. **Deploy**: Push to Vercel.
