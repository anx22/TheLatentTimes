
# DECISIONS.md

## 031 - Domain Refactor: Decomposition of useNewsroomState
**Problem**: Even with orchestrators, `useNewsroomState.ts` was an over-complex "Monster Hook" (800+ lines) mixing UI state, Convex data fetching, and agent coordination.
**Decision**: 
1.  **Decomposition**: Split the monster hook into 5 specialized domain hooks: `useNewsroomUIState`, `useNewsroomData`, `useEditorialAgents`, `useVisualAgents`, and `usePublicationFlow`.
2.  **Aggregation**: `useNewsroomState` now acts as a "Shallow Aggregator," providing a unified interface to the Context while delegating all logic.
**Why**: Dramatically improves maintainability and allows for fine-grained testing and independent scaling of newsroom domains.

## 032 - Systematic Deletion: Atmospheric Soundscapes
**Problem**: The Soundscape feature was an "Additive Feature" that didn't provide enough editorial leverage to justify its complexity and token cost.
**Decision**: 
1.  **Deletion**: Completely removed `agentSoundDesigner`, its types, and its UI presence.
2.  **Principles**: Adhered to the "Minimal but Real" architecture guideline—removing speculative features to focus on core End-to-End editorial flow.
**Why**: Reduces noise and maintenance burden, keeping the system lean for the deepening phase.

## 030 - Latent Layout: AI-Controlled Grids
**Problem**: The front page was a static list, failing to reflect the "Visual First" editorial vision of dynamic, AI-placed layouts.
**Decision**: 
1.  **Grid Engine**: Transition `App.tsx` from a list to `react-grid-layout`.
2.  **AI Orchestration**: Use `agentLayoutDesigner` during publication to determine (x, y, w, h) based on the story's importance and visual type.
3.  **Unified State**: Persist both `MagazineItem` and its `LayoutItem` in a single transactional mutation to ensure grid-data parity.
**Why**: Moves the system from "AI Content" to "AI Publication," where the presentation itself is agentic.

## 029 - Canonical State Ownership & Write Paths
**Problem**: As the app grew, data was being updated in multiple places (local state, context, different mutations), risking fragmentation.
**Decision**: 
1.  **Convex as Truth**: Any data intended for the "Published Line" must live in the `issues` table and be written via the `addItemToLatestIssue` mutation.
2.  **Mission State**: All operational telemetry (logs, token usage) belongs to the `missions` table, indexed by `missionId`.
**Why**: Ensures predictable data flow and a single source of truth for the magazine's persistent history.

## 028 - Systematic Integrity: The Architecture Drill
**Problem**: As the codebase deepens, regressive bugs in service coordination become harder to catch during feature development.
**Decision**: 
1.  **Drill Service**: Implement an `ArchitectureDrill` that exercising deep module interfaces via "Dry Runs".
2.  **Simulation over Mocks**: Prefer running the actual module logic with minimal/deterministic inputs to verify cross-module paths.
**Why**: Ensures the "Interface is the Test Surface" principle is actionable and observable.

## 027 - Release Depth: The Publication Orchestrator
**Problem**: The final "Press" phase (polishing, layout synthesis, artifact prep) was implemented as a sequence of state updates in the hook.
**Decision**: 
1.  **Release Module**: Extract the final preparation logic into a `PublicationOrchestrator`.
2.  **Synthesis**: Move metadata generation and layout decision-making into the orchestrator.
**Why**: Concentrates "Release Knowledge" in one place and ensures published items follow a consistent structural canonical.

## 026 - Image Deepening: The Atelier Engine
**Problem**: Visual production logic (concepts, palettes, aspect ratios) was tightly coupled with the React hook, making the Darkroom brittle and hard to extend.
**Decision**: 
1.  **Visual Orchestrator**: Create an `AtelierEngine` to manage design sessions.
2.  **Session state**: The engine initializes a `VisualConcept` and `ColorPalette` strategy from the draft.
3.  **Prompt Refinement**: Centralize prompt construction logic (applying modifiers/palettes) inside the engine.
**Why**: Ensures visual consistency and allows for more complex "Image-to-Image" or multi-model visual flows in the future.

## 025 - Decoupled Ingestion: The Signal Broker
**Problem**: News ingestion was "shallow," with the hook handling RSS parsing, normalization, and noisy filtering.
**Decision**: 
1.  **Broker Pattern**: Implement a `SignalBroker` that manages a collection of `SignalAdapters`.
2.  **Adapters**: Create specific adapters for RSS, GitHub, etc., each returning canonical tokens.
3.  **Hiding Complexity**: The broker handles the noise filter and embedding generation internally.
**Why**: Promotes **Locality** of ingestion logic and makes adding new data sources trivial.

## 024 - Observable Execution: The Mission Thread
**Problem**: Global agent logs are difficult to trace, making it impossible to determine which agent contributed to a specific draft or where a failure occurred in the chain.
**Decision**: 
1.  **Mission Entity**: Introduce a `missions` table to track execution runs (editorial, scout).
2.  **Breadcrumb Logging**: Update `logMessage` to include a `missionId` (link to context).
3.  **Threaded Logic**: The `EditorialOrchestrator` tags every agent interaction with the active `missionId`.
**Why**: Enables deep observability and future "Replay" or "Explainable AI" features within the newsroom.

## 023 - Architecture Depth: The Editorial Orchestrator
**Problem**: `useNewsroomState.ts` was becoming a "God Hook," containing complex multi-agent coordination logic that was difficult to test and maintain.
**Decision**: 
1.  **Orchestrator Module**: Extract the coordination of Scout, Board, Columnist, and Editor into a dedicated `EditorialOrchestrator` service.
2.  **Deep Interface**: Provide high-leverage entry points like `conductDebate` and `produceDraft` that encapsulate multiple agent cycles and context management.
3.  **Seam for Testing**: Decouple agent coordination from React state to allow for backend / headless testing of the editorial chain.
**Why**: Improves **Locality** of editorial knowledge and provides **Leverage** to UI callers, reducing hook complexity by ~40%.
**Problem**: Once published, articles feel "dead". There is no feedback loop or sense of a living community within the magazine.
**Decision**: 
1.  **Peer Review Sidebar**: Implement a "Critic's Corner" in the published article view.
2.  **Persona Feedback**: Upon publication, a separate multi-agent call (`agentCriticsCorner`) generates 3 witty, provocative comments from distinct AI personas (The Brutalist, The Accelerationist, etc.).
3.  **Avatar Vibrancy**: Each critic has a "Visual Vibe" that colors their appearance.
**Why**: Adds "soul" and a sense of ongoing conversation to the magazine, fulfilling the vision of a "living organism."

## 021 - Deep Context: Cultural Grounding (Querverbindungen)
**Problem**: Technical signals (e.g., "New LLM release") often feel disconnected from broader human history, philosophy, or cultural trends. They are "tote News" (dead news).
**Decision**: 
1.  **Vector Extraction**: Introduce an automated agent (`agentCulturalGrounding`) that runs whenever news signals are ingested or synthesized.
2.  **Cultural Resonance Mapping**: This agent maps technical data points to philosophical concepts, art movements, or historical events (e.g., mapping "Autonomous Agents" to "Leibniz's Monads").
3.  **Visualization**: Display these "Querverbindungen" as a Mood Board in the Darkroom to influence visual asset production and editorial depth.
**Why**: Ensures The Latent Times remains the "Spearhead of the Tech Cultural AI Revolution" by revealing philosophies that others miss, giving weight to "weakly written but powerful thoughts."

## 020 - Intelligent News Engine (Vector Clustering & Source Cutoffs)
**Problem**: The Ticker acts as a dumb aggregator. It fetches the same news repeatedly, causing redundancy, and fails to connect related articles from different sources (e.g., a GitHub repo and a TechCrunch article about the same tool).
**Decision**: 
1.  **Source Management**: Introduce a `sources` table in Convex with `last_fetched_at` timestamps to implement hard cutoffs and prevent redundant API calls.
2.  **Vector Embeddings**: Every incoming article is embedded via Gemini.
3.  **Semantic Clustering**: Use vector similarity search to group related articles into `Stories` (Clusters). High similarity (>95%) triggers deduplication; moderate similarity (>75%) groups articles into a single evolving story.
4.  **UI Shift**: The News Terminal will display "Stories" (clusters of articles) rather than isolated, chronological items.
**Why**: Transforms the app from a simple RSS reader into a "Knowledge Graph" that understands context, reduces noise, and provides a much richer foundation for the Editorial Board.

## 019 - Native Grid Layout Handles
**Problem**: Custom resize handles (e.g., "Magenta Corner Markers") were over-engineered, causing duplication issues and visual glitches during drag operations.
**Decision**: Reverted to using the native `react-grid-layout` resize handles, styled minimally with CSS.
**Why**: Prioritizes stability and standard behavior over complex custom UI code. "Boring is better" for core interaction mechanics.

## 018 - Editorial Excellence: Surgical Sentence Editing
**Problem**: Block-level rewrites (paragraphs) are still too coarse. A user might want to fix a single awkward sentence without risking the rest of the paragraph's flow. Additionally, AI rewrites often lose the "global context" of the article.
**Decision**: 
1.  **Sentence-Level Granularity**: Implement a system that can split blocks into sentences for targeted editing.
2.  **Annotation-First Workflow**: The Editor (KI-Linter) will now provide "Surgical Annotations" that target specific sentences or phrases.
3.  **Contextual Memory Buffer**: When an agent rewrites a sentence, it is provided with the *entire* article context (the "Narrative Skelett") to ensure tonal and logical consistency.
4.  **Multi-Agent Refinement**: Allow different agents (e.g., The Critic, The Fashion-Forward) to "pitch" sentence-level improvements based on their specific personas.
**Why**: This achieves "Exzellenz" by moving away from generic LLM outputs toward highly crafted, individualistic prose that feels human-edited.

## 017 - Shift to Granular Collaboration (Structured Drafts)
**Problem**: The "Re-Draft" button was a blunt instrument. If a user liked 90% of a draft but hated one paragraph, they had to regenerate the entire text, risking the loss of the good parts. The system was a linear "Generator" rather than a "Collaborator".
**Decision**: 
1.  **Structured Drafts**: Refactored the `GeneratedArticle` body from a single `string` to an array of `DraftBlock` objects (`{ id, type, content, status }`).
2.  **KI-Linter (The Editor)**: Introduced an agent that analyzes individual blocks and attaches annotations (Tone Mismatch, Clarity, Fact Check).
3.  **Micro-Actions**: Allowed users to trigger block-level rewrites or expansions without affecting the rest of the document.
**Why**: This moves the Newsroom from a simple prompt-wrapper to a professional editorial tool. It gives the user granular control, builds trust through transparent AI critiques, and aligns with the "Director's Overview" philosophy.

## 016 - Modular Newsroom Architecture
**Problem**: `NewsroomFloor.tsx` became a "monster god file" (800+ lines) containing all logic for every department, making it impossible to maintain or scale.
**Decision**: Refactored the monolithic component into a modular architecture.
1.  **Departmental Isolation**: Extracted `TheWire`, `TheBullpen`, `TheDarkroom`, and `ThePress` into their own files.
2.  **Shared Context**: Leveraged `NewsroomContext` and the `useNewsroom` hook to manage global state, eliminating prop drilling.
3.  **UI Orchestration**: `NewsroomFloor.tsx` now acts as a lightweight orchestrator, managing only high-level layout and navigation.
**Why**: Improves code readability, allows for independent development of department features, and follows React best practices for component composition.

## 015 - Newspaper Terminology & Tabbed Editorial Chain
**Problem**: The "Cockpit" metaphor and 4-column layout felt too generic and cluttered, lacking the specific "soul" of a futuristic newspaper.
**Decision**: 
1.  **Terminology**: Renamed all modules to reflect a physical newspaper (The Newsroom Floor, The Wire, The Bullpen, The Darkroom, The Press) and agents to specific roles (The Scout, The Columnist, The Editor, The Photographer).
2.  **Layout**: Replaced the 4-column grid with a persistent, tabbed "Editorial Chain". Only one department is fully visible at a time, but the chain always shows the status and item count of all departments.
3.  **Liveliness**: Added "Agent Cards" that visually pulse and display current actions when an agent is working.
**Why**: Deepens the immersion and thematic consistency ("Vogue meets Wired meets The Matrix"). The tabbed layout provides more horizontal space for complex tasks (like writing and image review) while maintaining global situational awareness.

## 014 - Multi-Modal Scout & Zero-Token Ticker
**Problem**: Running AI on every incoming signal from the web is too expensive and token-intensive.
**Decision**: The Scout now has three modes. Mode A (The Ticker) is a zero-token aggregator of real-world sources (GitHub, RSS) filtered purely by user settings. Mode B (Research) and Mode C (Specific) are active, token-consuming AI searches triggered manually by the user from the Ticker.
**Why**: Saves costs, reduces noise, and gives the user control over when to deploy expensive AI resources.

## 013 - Tech-First Foundation & Lenses
**Problem**: The magazine's focus was too broad, treating fashion, culture, and tech equally, leading to generic outputs.
**Decision**: AI Technology (models, workflows, code) is now the absolute foundation. Fashion, culture, and social issues are treated as "add-ons" or "lenses" applied to the tech foundation.
**Why**: Creates a sharper, more unique editorial voice ("Vogue meets Wired") and grounds the content in hard, verifiable facts before abstracting it.

## 012 - The Cockpit Architecture
**Problem**: The linear wizard UI of the MVP hid the complexity and operational power of the newsroom.
**Decision**: Transition the Newsroom to a "Cockpit" model where all modules (Ingestion, Board, Desk, Art) are simultaneously visible and interactive.
**Why**: Treats the Newsroom as a professional workspace. Allows the user to intervene at any point in the pipeline, adjust settings, and see the entire operational chain at a glance.

## 011 - Environment Variable Standardization
**Problem**: The application crashed in the browser with "An API Key must be set" because different environments (local, platform, headless) inject the Gemini API key under different names (`GEMINI_API_KEY`, `API_KEY`, `VITE_GEMINI_API_KEY`).
**Decision**: Implemented a robust fallback chain in `vite.config.ts` `define` block: `process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY || env.VITE_GEMINI_API_KEY`.
**Why**: Ensures the API key is always available to the client-side `@google/genai` SDK regardless of how the container or platform provisions it.

## 010 - The Simple Newsroom MVP
**Problem**: The legacy `TheNewsroom` component became too complex with multi-agent pitching, debates, and layout binding all happening simultaneously, making it hard to debug the core generation pipeline.
**Decision**: Bypassed the complex implementation in favor of `SimpleNewsroom.tsx`.
**Why**: Establishes a reliable, linear end-to-end pipeline (Topic -> Columnist Draft -> Photographer Image -> Publish) first. We will layer complexity (Editorial Board, RSS scanning) back on top of this stable foundation in Phase 2.

## 009 - Hybrid Signal Ingestion (The Live Wire)
**Problem**: Pure LLM-based search is expensive, slow, and can miss "breaking" updates from specific high-trust niches (e.g., specific Substack feeds or TechCrunch).
**Decision**: Implement a **Hybrid Ingestion Model**.
1.  **Deterministic Layer (RSS)**: A hardcoded `FEED_REGISTRY` of high-signal sources (Wired, 404 Media, Arxiv) polled via a CORS proxy. This provides the "Baseline Hum" of the newsroom.
2.  **Agentic Layer (Search)**: Gemini-driven query expansion for specific topics ("Agentic Patterns") to find signals *outside* the registry.
**Why**: Reduces hallucination risk, ensures coverage of trusted domains, and lowers the "Time to Signal" for breaking news.

## 008 - Tactile Layout Binding
**Problem**: Assigning content to layout slots via dropdowns or ID pasting is tedious and breaks flow.
**Decision**: Implement native HTML5 Drag-and-Drop.
- **Source**: Asset Pool cards (`draggable=true`).
- **Payload**: `itemId` string.
- **Target**: Block wrapper in `LayoutEngine`.
- **Feedback**: Visual highlight (Emerald Ring) on valid drop targets.
**Why**: Aligns with the "Editor's Desk" metaphor. Makes the layout process feel like physical collage.

## 007 - Separation of Church and State (Content vs Layout)
**Problem**: Trying to "write" the news and "design" the page in the same view created cognitive overload and UI clutter.
**Decision**: Split the Newsroom into two distinct modes:
1.  **Content Mode**: For gathering signals, writing copy, and editorial approval.
2.  **Layout Mode**: For binding assets to slots, managing the grid, and art direction.
**Why**: Allows for specialized UI (e.g., Asset Pool vs. Agent Console) and mirrors real-world editorial workflows (Editor vs. Art Director).

## 006 - The Layout Engine (v3.0)
**Problem**: Hardcoded React components (`CoverStory.tsx`, `TheEdit.tsx`) made it impossible for AI Agents to "design" the page. The magazine was static structure with dynamic text.
**Decision**: 
- Adopt a **Headless CMS Pattern** where the "Page" is a JSON array of `BlockInstances`.
- Create a `LayoutEngine` component that maps `block_type` strings to React components.
- **Why**: Allows the "Editor Agent" to move sections, change layouts, and invent new page structures without code changes.

## 005 - Tone Physics vs. Presets (v4.3 Legacy)
**Problem**: "Gonzo" or "Academic" presets were too rigid.
**Decision**: Replaced with **Tone EQ** sliders.

## 004 - The Glass Box Principle
**Decision**: Expose raw agent logs and JSON data to the user to build trust.
