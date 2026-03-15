# The Latent Times Development Plan

## Phase 1: The Newsroom MVP (Complete)
**Goal**: Build the simplest end-to-end pipeline for generating a magazine article from a topic.

- [x] **Architecture**: Design a simplified `useSimpleNewsroom` hook.
- [x] **UI**: Create a clean, terminal-inspired interface for the MVP (`SimpleNewsroom.tsx`).
- [x] **Agent: The Columnist**: Implement a reliable text generation function (Headline, Deck, Body).
- [x] **Agent: The Photographer**: Implement a reliable image generation function (Prompt -> Image).
- [x] **Integration**: Connect the pipeline so User Input -> Text + Image -> Published Article.

## Phase 2: The Newsroom Floor & The Wire (In Progress)
**Goal**: Build the comprehensive workspace UI and the robust signal-gathering foundation.

- [x] **UI**: Transform `SimpleNewsroom` into a multi-panel "Newsroom Floor" with a persistent "Editorial Chain" (The Wire, The Bullpen, The Darkroom, The Press).
- [x] **Agent Visibility**: Add "Agent Cards" that light up and show current thoughts/actions.
- [x] **System Log**: Implement a collapsible debug console showing detailed agent operations.
- [x] **Parameter Control**: Add a context-sensitive sidebar for adjusting department settings.
- [x] **The Wire (UI)**: Build the 3 ingestion modes (The Ticker, Auto-Scout, Targeted Search).
- [ ] **The Wire (Logic - Ticker)**: Replace mock ticker data with real zero-token API fetching (e.g., GitHub trending, RSS feeds).
- [ ] **The Wire (Logic - Parameters)**: Bind the "Active Sources" and "Noise Filter" UI controls to the actual fetching logic.
- [ ] **The Wire (Logic - Scout Prompt)**: Refine `agentScout` in `newsroom-agents.ts` to be strictly "Tech-First" (focusing on AI, models, code) before applying cultural lenses.
- [ ] **The Wire (Logic - Targeted Search)**: Implement a deep-dive research step for specific queries before sending them to The Bullpen.

## Phase 3: The Bullpen (Ideation & Debate)
**Goal**: Introduce multi-agent ideation and dynamic friction.

- [ ] **Agent Personas**: Implement polarizing agents (Tech-Optimist, Culture-Critic).
- [ ] **The Debate**: Agents take a signal from the Scout and argue different angles (applying the "Fashion/Culture" lens to the "Tech" base).
- [ ] **Selection**: User selects the winning angle to proceed to Drafting.
- [ ] **Parameter Binding**: Connect the "Editorial Lens" and "Word Count" sidebar settings to the drafting agents.

## Phase 4: The Darkroom & The Press (Complete)
**Goal**: Advanced drafting, critical editing, and layout.

- [x] **Critical Editing**: Introduce an Editor agent that reviews the Columnist's draft and forces rewrites if quality is low.
- [x] **Parameter Binding**: Connect the "Visual Style" and "Aspect Ratio" sidebar settings to the image generation agent.
- [x] **Layout Engine Integration**: Connect published artifacts directly to the dynamic grid (`NewspaperGrid`).

## Phase 5: Visual Polish & Editorial Experience (In Progress)
**Goal**: Refine the visual language and user experience to match the "Vogue meets Wired" vision.

- [ ] **Fine Design**: Polish the Press Room UI (lighter background, cleaner rails).
- [ ] **Grid Styling**: Ensure grid lines and handles are subtle and professional.
- [ ] **Block Typography**: Refine `HeroTypePlate` and `FeatureCard` typography for maximum impact.
- [ ] **Autopilot**: A master switch that allows the system to run the entire Editorial Chain autonomously.

## Phase 6: Intelligent News Engine (Vector Clustering & Sources)
**Goal**: Transform the News Terminal from a dumb aggregator into a dynamic Knowledge Graph that understands context, filters noise, and groups related stories.

- [x] **Phase 6.1: Database Foundation & Source Management**:
    *   Create `sources` table in Convex (`url`, `type`, `lastFetchedAt`, `crawlFrequency`).
    *   Update ingestion logic to use `lastFetchedAt` as a hard cutoff for API calls (GitHub, RSS).
    *   Implement basic URL normalization and hard-deduplication on the database level.
- [x] **Phase 6.2: Vector Clustering & Deduplication**:
    *   Add `embedding` field (Vector) to `tickerItems`.
    *   Integrate Gemini to generate embeddings for incoming articles.
    *   Implement Convex Vector Search:
        *   Similarity > 95%: Mark as duplicate/ignore.
        *   Similarity > 75%: Group into an existing `Story` cluster.
        *   Else: Create a new `Story` cluster.
- [x] **Phase 6.3: UI/UX Redesign (The Story View)**:
    *   Redesign the News Terminal to display `Stories` (Clusters) instead of isolated `TickerItems`.
    *   Show metadata for clusters (e.g., "3 Sources: GitHub, TechCrunch, Arxiv").
    *   Implement an "Entity Extraction" view (Named Entity Recognition) to show connections (e.g., "Sam Altman" -> 5 related stories).
- [x] **Phase 6.4: The Synthesis Agent**:
    *   Create an agent that automatically writes a "Meta-Summary" when a `Story` cluster reaches a certain size or velocity.

## Phase 7: Editorial Excellence (Surgical Editing)
**Goal**: Achieve professional-grade prose through granular, multi-agent refinement.

- [ ] **Architecture**: Implement a "Surgical Editing Engine" that manages sentence-level state and annotations.
- [ ] **UI**: Build the "Editorial Desk" interface with semantic highlighting and contextual action cards.
- [ ] **Logic**: Implement `agentRewriteSentence` with "Narrative Skelett" awareness (full article context).
- [ ] **Logic**: Expand the KI-Linter to provide persona-driven critiques (Multi-Agent Feedback).
- [ ] **Refinement**: Implement a "Final Polish" agent that ensures smooth transitions between edited blocks.
