# MODUS Development Plan

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

## Phase 4: The Darkroom & The Press
**Goal**: Advanced drafting, critical editing, and layout.

- [ ] **Critical Editing**: Introduce an Editor agent that reviews the Columnist's draft and forces rewrites if quality is low.
- [ ] **Parameter Binding**: Connect the "Visual Style" and "Aspect Ratio" sidebar settings to the image generation agent.
- [ ] **Layout Engine Integration**: Connect published artifacts directly to the dynamic grid.

## Phase 5: The Living Magazine
**Goal**: The magazine updates itself.

- [ ] **Autopilot**: A master switch that allows the system to run the entire Editorial Chain autonomously.
