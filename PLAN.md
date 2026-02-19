# MODUS Development Plan

## Phase 1: The Newsroom MVP (Current Focus)
**Goal**: Build the simplest end-to-end pipeline for generating a magazine article from a topic.

- [ ] **Architecture**: Design a simplified `useSimpleNewsroom` hook.
- [ ] **UI**: Create a clean, terminal-inspired interface for the MVP (`SimpleNewsroom.tsx`).
- [ ] **Agent: The Columnist**: Implement a reliable text generation function (Headline, Deck, Body).
- [ ] **Agent: The Photographer**: Implement a reliable image generation function (Prompt -> Image).
- [ ] **Integration**: Connect the pipeline so User Input -> Text + Image -> Published Article.

## Phase 2: The Editorial Board
**Goal**: Introduce multi-agent ideation.

- [ ] **Agent: The Scout**: Mock or implement real RSS scanning.
- [ ] **Agent: The Board**: Implement the "Pitching" phase where 3 personas offer different angles.
- [ ] **UI**: Add a "Pitch Selection" step to the workflow.

## Phase 3: The Production Suite
**Goal**: Advanced layout and refinement.

- [ ] **Layout Engine**: Allow dynamic resizing and placement of assets.
- [ ] **Refinement**: "Make it shorter", "Make it punchier", "Change the image style" tools.
- [ ] **Persistence**: Save drafts to Supabase.

## Phase 4: The Living Magazine
**Goal**: The magazine updates itself.

- [ ] **Autopilot**: The system runs on a loop, finding trends and publishing stories automatically.
