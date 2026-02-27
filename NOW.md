
# The Latent Times Status Log

**Current Cycle:** v1.3.0-newsroom-floor // Granular Collaboration & KI-Linter
**Focus:** Shifting the Newsroom from a linear state machine to an entity-based, block-level editing system.

## Goals (Complete)
- [x] **Newsroom MVP**: Implemented `SimpleNewsroom.tsx` for a streamlined end-to-end pipeline.
- [x] **Agent Integration**: Connected `agentColumnist` (Text) and `agentPhotographer` (Image) directly to the UI.
- [x] **The Newsroom Floor UI**: Refactored the UI into a persistent tabbed "Editorial Chain" (The Wire, The Bullpen, The Darkroom, The Press).
- [x] **Agent Liveliness**: Added Agent Cards that visually indicate when an agent is working and what they are thinking.
- [x] **System Log**: Implemented a collapsible debug console for transparency.
- [x] **Parameter Control UI**: Added a context-sensitive sidebar for adjusting department settings.
- [x] **The Ticker (Real Data)**: Replaced mock data with real zero-token API fetching (GitHub, Arxiv, TechCrunch).
- [x] **Parameter Binding**: Connected "Active Sources" and "Noise Filter" UI controls to the actual fetching logic.
- [x] **Scout Prompt Refinement**: Updated `agentScout` to be strictly "Tech-First" and return multiple signal vectors.
- [x] **Targeted Search Logic**: Implemented a deep-dive research step with real-world grounding verification.
- [x] **Modular Architecture**: Refactored the monolithic `NewsroomFloor.tsx` into specialized sub-components (`TheWire`, `TheBullpen`, etc.).
- [x] **Editorial Board**: Implemented multiple agent personas (The Critic, The Optimist) to debate the signal before drafting.
- [x] **Draft Iteration**: Allowed the user to request rewrites or adjustments to the draft in The Bullpen using new parameters.
- [x] **Image Variation**: Implemented the ability to generate alternative images in The Darkroom using new parameters.

## Next Steps (Granular Collaboration Roadmap)
- [x] **Phase 1: Structured Draft Entity**: Refactor `GeneratedArticle` to use an array of `DraftBlock` objects instead of a single string. Update `agentColumnist` to return JSON blocks.
- [x] **Phase 2: KI-Linter & Micro-Actions**: Create `agentEditor` to analyze blocks. Build `TheEditorPanel` UI in The Bullpen. Implement block-level rewrite/expand actions.
- [ ] **Phase 3: Strategic Directive & Active Consensus**: Add global directive input to The Wire. Implement periodic consensus summarization. Stream visible debate output.
- [ ] **Phase 4: Magic Enhance & Grid Preview**: Add prompt expansion to The Darkroom. Integrate image preview directly into the final layout grid.
- [ ] **Phase 5: Editorial Excellence (Surgical Editing)**:
    *   **Sentence Splitting**: Implement robust sentence-level parsing for `DraftBlock` content.
    *   **Annotation Engine**: Create a modular state for "Surgical Annotations" that can be attached to sentences.
    *   **Multi-Agent Critique**: Expand `agentEditor` to support persona-specific critiques (e.g., "The Fashion-Forward thinks this sentence is too technical").
    *   **Surgical Rewrite**: Implement `agentRewriteSentence` which takes the full article context into account.

## Known Issues
1.  **Image Generation Latency**: Generating images via Gemini 2.5 Flash Image takes a few seconds; UI needs to maintain engagement during this wait.
2.  **Layout Binding**: Currently, published items are prepended to the `items` array. We need to re-enable explicit slot binding for the new MVP artifacts.
