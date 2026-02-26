
# DECISIONS.md

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
