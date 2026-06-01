
# DECISIONS.md

## [2026-06-01] Rewrite consolidation — four-pillar North Star
**Problem** → The real vision (spectator newsroom, AI-revolution chronicle, social distribution, community, meta-proof) lived in the founder's head, not the docs; `PRODUCT.md` only described the magazine artifact.
**Choice** → Adopt a four-pillar North Star (Spectator · Chronicle · Trust/Proof · Platform), consolidated in `REWRITE_MASTERPLAN.md` with the 10x derivation + decision quiz in `.claude/docs/ai/the-latent-times/10x/`. `PRODUCT.md` updated to the canonical short form.
**Reason** → A publication needs readers, distribution and a "why"; the factory alone is not the product.

## [2026-06-01] Operating boundary — autonomous inside, human-gated outside [HARD]
**Problem** → The reply-agent (autonomous, multi-platform article posting) was the boldest chosen feature but provenance the lightest safeguard → spam/reputation risk.
**Choice** → The internal newsroom runs fully autonomous; everything outbound (social posts, thread replies, published-to-world) requires human approval. Full outbound autonomy is a future milestone after the paper proves itself. Recorded as a [HARD] rule in `ARCHITECTURE.md`.
**Reason** → The world hates AI spam; outbound trust must be earned.

## [2026-06-01] One brain first — canonical pipeline (decision Q13)
**Problem** → Two parallel pipelines (client agents ↔ server cron) duplicate "truth"; provenance, adapters and the spectator view all need one source.
**Choice** → Build the canonical, transport-agnostic agent/orchestration layer + approval queue as the first visible slice of Akt I; the cron reuses it. (Reuse: client agents already route through `api.gemini.generateText`; `drafts.status='review'` already is an approval queue.)
**Reason** → No building on sand; one truth.

## [2026-06-01] Documentation structure — 5-file backbone + rewrite submodule
**Problem** → A new rewrite doc system overlapped the existing 5-file system (`NOW`↔`TRACKING`, `PRODUCT`↔vision) → drift risk (already seen: mutations split, Vercel/Netlify mislabel).
**Choice** → Keep the 5-file system (AGENTS/PRODUCT/ARCHITECTURE/NOW/DECISIONS) as backbone; the rewrite hub (`REWRITE_MASTERPLAN` + `implementation/`) is a scoped submodule it points to. One source per fact: `NOW` points to `TRACKING` for rewrite tasks; `PRODUCT` is canonical vision. Extracted residual value from `CODEBASE_ANALYSIS.md` + `EMERGENCY_FIXES.md` (live baseline, EF-8/9/10) into NOW/ARCHITECTURE/TRACKING, then **deleted** both.
**Reason** → Eliminate the overlap that causes documentation drift.

## [2026-05-31] Production Connection, Newsroom Soft Wall & Cost Normalization (web session)
**Problem**: The public Netlify site was not wired to Convex (`VITE_CONVEX_URL` missing → config-error screen); the autonomous cron crashed at `completeMission` (A1) and never produced drafts (A2, story lookup via `getNewsClusters` limit=1); Convex read usage was extreme; the whole Ops surface and the Gemini endpoints were open to anonymous visitors; model aliases were scattered.
**Choice**:
1. **Connection/build**: pin the regional `VITE_CONVEX_URL` in `netlify.toml`; build with plain `npm run build` (the `convex deploy --cmd` wrapper 403'd on the dev key). Backend deployed separately.
2. **Cron correctness**: drop the invalid `tokenUsage` arg to `completeMission` (A1); add a `getStory` query so the autonomous run finds its pillar by id (A2).
3. **Read-usage**: strip `embedding`/`cultural_vectors` from `getSignals`/`getOrphanSignals`/`getSignal`; lower `getAgentLogs` default 300→50; remove the client-side circadian heartbeat that duplicated the Convex cron.
4. **Soft wall**: password-only newsroom auth, verified server-side (`convex/auth.ts`, `NEWSROOM_PASSWORD`). Read-only for anonymous users is enforced at a **single** `NewsroomContext` choke-point (deny-by-default on every non-`set*` function) so it survives newsroom rebuilds. `useAuth()` fails closed.
5. **Model aliases**: centralized in `convex/models.ts` + `constants.ts` (`MODELS`).
**Reason**: Makes the app actually reachable and functioning end-to-end, stops the dominant Convex read-bandwidth cost, and gives a robust, refactor-proof access boundary without blocking the public magazine. Residual: the Convex actions remain directly callable by URL (soft wall is UI-level) — real per-user hardening tracked in `EMERGENCY_FIXES.md` (EF-1).

## [2026-05-31] Generative Semantics & Thematic Synthesis Engine
**Problem**: The legacy semantic clustering approach (`discoverStories`) mapped signals strictly via mathematical cosine similarity on embeddings (e.g. Euclidean distance > `0.85`). This algorithm was too literal for a creative editorial engine. It grouped articles by vocabulary overlap (e.g. two articles about OpenAI) rather than cultural themes (e.g. connecting a technical breakthrough with a new policy shift).
**Choice**: Ripped out the deterministic vector-distance thresholding matrix from `discoverStories`. Rewrote the pipeline to pipe up to 60 "orphan" signals directly to Gemini 3.5 Flash in a single generational sweep. We now prompt the Board persona to find non-obvious, creative macro-themes across loosely correlated signals to derive new theses dynamically.
**Reason**: Transforms the application from a simplistic News Aggregator into a genuine Editorial Brain. This ensures that out of hundreds of ingested sources, creative, cross-domain stories are consistently discovered.

## [2026-05-31] Observability & Gemini SDK Stability Boundaries
**Problem**: The semantic clustering and autonomous sweep mechanisms were silently failing despite UX interactions indicating active processes. Investigating with hard error boundaries (`console.error` + explicit `throw Error`) revealed the GenAI SDK was throwing invisible HTTP 404 errors due to an illegal model signature constraint (`gemini-3.5-flash`).
**Choice**: Switched clustering and autonomous agents back to `gemini-3-flash-preview` and fully stripped out all silent `rescue` patterns in `clusteringActions`.
**Reason**: Agent pipelines must crash loudly, not swallow root causes, otherwise core autonomous functions appear fully broken in production.

## [2026-05-31] Magazine Front-Page Rendering & Dynamic Grid Injection
**Problem**: After signing off on drafts in the Printing Press, the newly approved articles were added to the `issues` database but failed to appear on the front-page `MagazineGrid`. The root cause was systemic: the underlying layout coordinator extracted the current layout configuration, but newly approved articles were dumped into the `items` array *without* being mapped to a corresponding structural `LayoutItem`. Additionally, recent backend patches accidentally mapped incoming Grid Layout elements to `y: max(y)`, rendering them at the bottom of the grid out of bounds.
**Choice**: Updated `addItemToLatestIssue` in `issueMutations.ts`. It now analyzes the existing layout and securely injects an adaptive grid block component (e.g., `Glamour`, `CoverStory`) corresponding to the new article directly into the issue's structural schema at coordinate `y = 0`, shifting subsequent schema blocks down by `item.h` accordingly.
**Reason**: Restores active grid reactivity. The user can now see approved issues manifest immediately upon the frontend Magazine layout.

## [2026-05-31] Convex Server Actions Clean-up & Absolute Modular Splitting
**Problem**: The central `actions.ts` file had originally grown into a massive monolith of asynchronous processing crossing three distinct operational domains—semantic similarity checks, topological story clustering, raw document parsing (RSS, GitHub), and the full Circadian autonomous background multi-agent sweep process. At 620+ lines, it was a "god actions" module that was difficult to audit or adapt.

**Choice**: Fully decoupled and divided `actions.ts` into a clean, modular structure:
1. Created `/convex/newsroom/actions/` subdirectory.
2. Formulated 3 isolated domain modules:
   - `clusteringActions.ts` (hosts similarity score verification, Topological Resonance discovery, and the neural Gemini cluster title synthesizer)
   - `fetchActions.ts` (hosts RSS parsing, GitHub trending search, and feed path probe discovery)
   - `autonomousActions.ts` (hosts the complete scheduled autonomous background agent process execution loop)
3. Preserved absolute backwards-compatibility across all client hooks and files referencing `api.newsroom.actions` by cleanly re-exporting the submodules from `/convex/newsroom/actions.ts`.

**Reason**: Completely eradicates the god-actions file. By splitting asynchronous logic from data-fetching and background schedules, individual action routines are highly readable (all under 200 lines), while maintaining perfect integration with Convex's type-safe code generation.

## [2026-05-31] Convex Write-Operations Clean-up & Absolute Modular Splitting
> ⚠️ SUPERSEDED (2026-05-31): This split was REVERTED in commit `5399c67`.
> Re-splitting `mutations.ts` into sub-files re-triggered the TypeScript
> error TS2589 ("Type instantiation is excessively deep") via Convex's
> generated types. `convex/newsroom/mutations.ts` is now a single flat
> 534-LOC file again and must stay that way. The `/convex/newsroom/mutations/`
> subdirectory described below does NOT exist. (The `actions.ts` split below
> DID survive — only mutations was flattened.)

**Problem**: The core `mutations.ts` file had originally grown into a massive monolith of write operations crossing wildly unrelated domains—including live telemetry, mission states, story clustering, drafting, workbench interactions, image saving, state persistence, publication, and seeding. This made it difficult to maintain and was highly intimidating for database auditing.

**Choice**: Fully decoupled and divided `mutations.ts` into a clean, modular structure.
1. Created `/convex/newsroom/mutations/` subdirectory.
2. Formulated 5 isolated domain modules:
   - `missionMutations.ts` (startMission, completeMission, failMission, logMessage, clearLogs)
   - `signalMutations.ts` (addSignal, toggleSource, updateSource, addSource, deleteSource, updateSourceFetchTime, updateSignalStory, seedSources)
   - `issueMutations.ts` (clearAll, saveImage, saveNewsroomState, publishIssue, resetNewsroom, addItemToLatestIssue)
   - `workbenchMutations.ts` (createWorkbenchSession, updateWorkbenchSession, saveStoryAngles, toggleStoryAngle)
   - `draftMutations.ts` (addNewsCluster, updateNewsCluster, saveDraft, updateDraftStatus, deleteDraft)
3. Preserved backward compatibility across all 40+ project files referencing `api.newsroom.mutations` by cleanly importing and re-exporting the entire set from the main `/convex/newsroom/mutations.ts` file in just 5 lines.

**Reason**: Completely eradicates the massive monolith. This clean splitting enforces separation of concerns across our tables, makes individual database transactions extremely readable and simple (under 100 lines per file), and avoids breaking any existing backend actions or client hooks.

## [2026-05-31] Convex Write-Operations Clean-up & Modular Seed Isolation
**Problem**: The core `mutations.ts` file grew into a monolithic, multi-purpose database module. It loaded vast static JSON assets (over 20 records) for pipeline bootstrapping and first-run seeder iterations alongside standard write operations, cluttering operational logic and increasing the complexity of standard database updates.

**Choice**: Extracted all structural database seed definitions and bootstrapped shell documents out of the database transaction routines:
1. Created `/convex/newsroom/seedData.ts` to cleanly host `INITIAL_SOURCES` and the structured default layout factory `getGenesisIssueContent`.
2. Refactored `mutations.ts` to import and utilize these encapsulated datasets, slashing the size of transaction schemas.
3. Cleaned backend execution logic by removing redundant variable assignments to unused handles (such as `draftId`), satisfying strict linter rules.

**Reason**: Reduces code complexity footprint in core transactions, decouples static presets from state machine mutation queries, and boosts long-term maintainability for full-stack developers.

## [2026-05-31] Clarifying GDELT Project Scope & Expanding Authority via Elite Primary Technical Sources
**Problem**: The GDELT Project was proposed during strategic restructuring discussions, but did not exist in our system. We needed to confirm its state and ensure that our Signal Ingestion system possesses the highest-authority, most widely available primary sources focused purely on core developer and AI architectural shifts, avoiding low-quality aggregates or noisy geopolitical telemetry.

**Choice**: Handled our technical sourcing strategy with precision:
1. Confirmed that GDELT exists as a geopolitical event database but was not implemented. Because GDELT lacks dedicated AI developer-centric signals and introduces noise, we chose not to integrate it.
2. Formulated a list of 6 new industry-leading, high-signal primary engineering hubs: Lilian Weng's Lil'Log (Meta systems safety/engineering), NVIDIA Developer Blog (Compute/CUDA optimizations), Berkeley AI Research (Academic design shifts), vLLM Project Blog (Runtime serving changes), Google Research Blog, and Simon Willison's Pragmatic Log.
3. Expanded `/services/signals/SourceRegistry.ts` statically and hot-patched live databases non-destructively through `/convex/newsroom/mutations.ts`.

**Reason**: Aligns perfectly with our premium editorial voice of "Vogue meets Wired" — highlighting elite lead indicators from actual system practitioners rather than generic web noise.

## [2026-05-31] Correcting Outdated & 404 RSS Feed URLs with Active Database Self-Healing Paths
**Problem**: The application experienced daily ingestion 404 console errors originating from `fetchRss`:
1. WIRED AI's default news feed was pointing to `https://www.wired.com/feed/category/ai/latest/rss` which returns a HTTP 404.
2. Anthropic News had no active, reliable native RSS endpoint at `https://www.anthropic.com/news/rss.xml` (HTTP 404).

**Choice**: Handled feed failures sustainably:
1. Updated WIRED AI's configuration to use the active, tag-based URL pattern: `https://www.wired.com/feed/tag/ai/latest/rss`.
2. Swapped the broken Anthropic feed for the highly active, stable, and authoritative Hugging Face Blog feed: `https://huggingface.co/blog/feed.xml`.
3. Designed an active migration within `seedSources` in `convex/newsroom/mutations.ts` that patches outdated/broken feed URLs on live database schemas seamlessly.

**Reason**: Completely heals live and new databases, eliminates distracting runtime 404 errors, and replaces them with a higher volume of valid scientific/technical signals.

## [2026-05-31] Eliminating Rules of Hooks Violations & Unstable HOC Generation inside MagazineGrid
**Problem**: The application experienced a critical runtime React crash inside `MagazineGrid.tsx`.
1. The dynamic higher-order component `ResponsiveGridLayout` was created inside a `useMemo` block inside the render method of the functional component. This violated React's Rule of Hooks because HOC initialization functions (such as `WidthProvider` in `react-grid-layout`) register live internal state hooks dynamically during component render cycles.
2. `WidthProvider` was imported as a default export, which in `react-grid-layout` resolves to the `ReactGridLayout` component instead of the helper. This caused an invalid React element type error ("expected a string or class/function but got: object").

**Choice**: Refactored the core layout engine imports and component boundaries:
1. Imported `react-grid-layout` via its default module export `ReactGridLayout` and safely extracted `.Responsive` and `.WidthProvider` components at runtime.
2. Initialized `ResponsiveGridLayout = WidthProvider(Responsive)` statically at the file/module level, permanently outside the `MagazineGrid` React component.

**Reason**: Completely satisfies React's Rule of Hooks guidelines, prevents unstable component regeneration during rendering of the newspaper layouts, and fully resolves runtime crashes.

## [2026-05-30] State Coupling for Asset Generators & Tactile Exception Handling
**Problem**: Two critical issues blocked the visual darkroom editorial loop:
1. When a user clicked "Commit to Publication", the operation silently crashed with `"Cannot read properties of undefined (reading 'layout')"`. This was caused by `useNewsroomState.ts` constructing its action context `allUi` as `{ ...ui, ...params }`, but omitting `atelierState` and `setAtelierState` from it. This left `atelierState` undefined inside `usePublicationFlow` and `useVisualAgents`, causing any layout/aspect-ratio checks to crash.
2. When pipeline exceptions occurred, they set the context `error` state. However, because `error` was never rendered anywhere on the user interface, failures were silently swallowed, rendering buttons inert and giving users the impression that "nothing happens".

**Choice**: Resolved these issues immediately:
1. Updated `allUi` inside `useNewsroomState.ts` to include `atelierState` and `setAtelierState` (`const allUi = { ...ui, ...params, atelierState, setAtelierState };`), fully exposing the active Atelier state parameters to the downstream agent hooks.
2. Added a highly visible, tactical self-dismissible **Pipeline Exception Alert Banner** at the top right of the `NewsroomFloor` workspace, displaying any operational context error messages in clear font paired with a `clear` callback to reset state.

**Reason**: Fully restores state synchronization across the entire publishing pipeline, secures user confidence through real-time feedback, and provides a polished experience.

## [2026-05-30] Visual Layout State Continuity & Department Transition Streamlining
**Problem**: Two critical seams existed in the end-to-end editorial pipeline:
1. When generating a new image asset (clicking "Develop Lead Asset" / `reShoot`), the wizard prematurely changed the view state to `PRINTING_PRESS`. This bypassed the "Commit to Publication" button in the Darkroom component entirely, leaving users stranded on an unpublishable "Awaiting grid placement confirmation..." placeholder screen.
2. In `usePublicationFlow`, the layout coordinator read current layout positions from `(persistedState as any)?.latestIssue?.content?.layout`. However, `persistedState` queried the `newsroom_state["current"]` table, which never has a `latestIssue` property. This fallback evaluates to `[]`, meaning existing publication grid structures were lost upon every single publish event, leading to overlapping elements and screen erasure.
3. If no issues existed in the DB (new run), default bootstrapped issues completely bypassed laying out records and omitted layout properties, discarding initial layouts.

**Choice**: Resolved these seams with three decisive actions:
1. Removed `setStep('PRINTING_PRESS')` from the `reShoot` routine in `/hooks/useVisualAgents.ts`. The darkroom now preserves state during rendering. Once image generation completes, the user can verify the asset in `TheDarkroom` and click "Commit to Publication", which safely transitions them to `'PUBLISHED'`.
2. Added a `latestIssue` query to `useNewsroomData` and plugged it as `data.latestIssue` directly into `usePublicationFlow`. The layout designer now fetches and appends grid elements to the *real* live current issue layout, preserving position parameters.
3. Updated `/convex/newsroom/mutations.ts` to support layout parameters on bootstrapped genesis issues, and added an intuitive "Send to Darkroom" transition button to `TheBullpen.tsx` under finalized drafts.

**Reason**: Ensures a bulletproof, intuitive draft-to-publish chain, avoids grid overlaps and asset wiping, and restores flawless reactivity.

## [2026-05-30] Copyright Shield & Factual Claim Deconstruction (Variant 2)
**Problem**: Redrafting third-party feeds (such as the TechCrunch RSS wire) runs a severe risk of copyright infringement (UrhG § 23 / 44b) if the dramatic arrangement, structure, or verbatim phrases are mirrored. Simple paraphrasing is legally unsafe and journalists need guarantees that they aren't copying form.
**Choice**: Designed and integrated a five-step defensive legal protocol inside the three-zone pipeline:
1. Nominate a signal in Zone 1 as the Lead Article (Seed / Leitartikel).
2. Deconstruct the seed into raw, dry "Atomic Claims" (factual vectors), casting away unique phrasing.
3. Automatically search for independent sources and synthesize a confirmation-rich "Evidence Pack".
4. Prompt the columnist agent using the synthesized facts, with strict instructions to draft a completely original layout with multiple citations.
5. Auto-run a compliance similarity auditor upon draft creation to assign a Safe Distance Score and counsel recommendations.
**Reason**: Enforces absolute legal compliance (UrhG) and promotes original investigative journalism instead of simple automated paraphrasing.

## [2026-05-30] Workbench Context Integration
**Problem**: During the Three-Zone Pipeline workbench drafting trigger ("Draft selected angles"), the raw signal details and directional feedback did not flow forward to the columnist/editor. This left context blank (`''`), forcing an emergency web search fallback and discarding curated telemetry.
**Choice**: Gather and serialize the selected workspace signals' raw metadata (title, publisher/sourceType, and content body) along with the active workbench override/strategic directive. Inject this aggregated document structure as `fullContext` in the `produceDraft` orchestrator flow.
**Reason**: Preserves selected curated context from Zone 1 & 2 without throwing unnecessary search events or causing data loss.

## [2026-05-30] Pipeline Integration & Stability
**Problem**: The news flow from ingestion to publishing required manual coordination between Editorial(Orchestrator), Visual(AtelierEngine), and Publication(PublicationOrchestrator) rooms.
**Choice**: Added `executeFullPipeline` to `useNewsroomState` to unify the end-to-end flow. Also fixed an ingestion schema validation error by updating the mutation validator to include `qualityScore` instead of stripping it.
**Reason**: Enables seamless "one-click" news synthesis from raw signals to published artifact without complex manual scaffolding.
**Problem**: The "Signal Ingestion" was flat-weighted; high-quality technical feeds carried the same gravity as general noise. Directorial control was split between "Global Directive" and accidental "Manual Override."
**Choice**:
1. **Source Packs & Trust Tiers**: Implemented `sourcePack` (e.g., AI_CORE, VC_SENTIMENT) and `sourceTrustTier` (primary/secondary). The fetcher now scores signals based on source quality before embedding. 
2. **Neural Pillar Synthesis**: Clustering now requires "Cross-Pack Resonance" (signals from different packs) to reach a crystallization threshold. New pillars are synthesized via the **Boardmember logic** (Gemini) rather than simple title inheritance.
3. **Unified Directorial Mandate**: Consolidated UI controls into a single "Mandate" injection that weighs the autonomous engine's focus probability vectors.
**Reason**: Increases the signal-to-noise ratio in the high-frequency technical landscape and prevents "echo-chamber" clustering within single sources.

## [2026-05-30] Agentic Reliability & Schema Locking
**Problem**: Inter-agent handoffs (Columnist to Editor) and Board debates were subject to JSON hallucinations and inefficient parallel mutations.
**Choice**:
1.  **Schema Centralization**: Move all Type schemas to `services/gemini.ts`. Every agent now references a "locked" source of truth for its output structure.
2.  **Consensus Serialization**: Replaced individual persona calls with a single `agentDebate` atomic call. The engine now generates the entire transcript and editorial output in one serialized transaction.
3.  **Lexical Shielding**: Added a "Lexical Deduplication" and "Noise Filter" middleware to the `SignalBroker` to purge irrelevant or redundant headlines before expensive embedding generation.
**Reason**: Reduces token waste, prevents "thread snaps" in the pipeline, and ensures industrial-grade reliability for autonomous cycles.

## [2026-05-30] Engine Efficiency & Persistence Isolation
**Problem**: The autonomous engine was running frequent (~1 min) scans regardless of usage. Global settings were reset on reload.
**Choice**: Implemented **Circadian Schedule** (Morning/Midday/Evening triggers) and **Persistence Isolation** (dedicated Convex `settings` key for parameters).
**Reason**: Prioritizes resource conservation and configuration reliability.

## [2026-05-30] Pipeline Visibility & UX Clarity
**Problem**: Autonomous ops were hidden; dark UI grayscale values were too low for legibility.
**Choice**: Replaced standard views with an **Asymmetrical Bento Grid** for the autonomous pipeline and upgraded contrast baselines to `zinc-400`.
**Reason**: Transparency of agentic process and accessibility compliance.

## [2026-05-26] Modular Methodologies & The Three-Zone Pipeline
**Problem**: Editorial flows were hardcoded, limiting manual/automated experimentation.
**Choice**: Converted `TheWire` into a **Methodology Switchboard** and launched the **Three-Zone Pipeline** (Mosaic -> Workbench -> Press).
**Reason**: Empowers the product to adapt to multiple conceptual workflows via structural toggles.

## [2026-05-24 to 2026-05-25] Core Foundation & Cleanup
**Problem**: System bloat, buzzword naming, and monolithic hooks.
**Choice**: 
1. **Signal Convergence**: Eradicated "Ticker" concept for canonical `Signals`.
2. **De-marketing**: Renamed "Deep Discovery" to "Synthesize Clusters" and other literal terms.
3. **Hook Decomposition**: Split 800-line `useNewsroomState` into domain-specific orchestrators.
4. **Mission Registry**: Unified telemetry and logging under a single `missionId` thread.
**Reason**: Adherence to **Architectural Honesty** and maintainability.

## [Historical Foundations]
- **[2026-05-22] AI-Native Layout**: Transitioned to `react-grid-layout` orchestrated by agent metadata.
- **[2026-05-20] Vector Clustering**: Implemented semantic grouping and deduplication for incoming news signals.
- **[2026-05-18] Structured Drafts**: Refactored drafts into `DraftBlock` arrays for surgical agent/human editing.
- **[2026-05-15] Departmental Isolation**: Established the "Editorial Chain" (Floor, Wire, Bullpen, Darkroom, Press).
- **[2026-05-10] Hybrid Ingestion**: Combined deterministic RSS registry with agentic search.
