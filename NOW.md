
# MODUS Status Log

**Current Cycle:** v1.2.0-newsroom-floor // The Wire (Logic & Integration)
**Focus:** Connecting the UI shell of The Wire to real data sources and refining the Scout agent.

## Goals (Complete)
- [x] **Newsroom MVP**: Implemented `SimpleNewsroom.tsx` for a streamlined end-to-end pipeline.
- [x] **Agent Integration**: Connected `agentColumnist` (Text) and `agentPhotographer` (Image) directly to the UI.
- [x] **The Newsroom Floor UI**: Refactored the UI into a persistent tabbed "Editorial Chain" (The Wire, The Bullpen, The Darkroom, The Press).
- [x] **Agent Liveliness**: Added Agent Cards that visually indicate when an agent is working and what they are thinking.
- [x] **System Log**: Implemented a collapsible debug console for transparency.
- [x] **Parameter Control UI**: Added a context-sensitive sidebar for adjusting department settings.
- [x] **Documentation**: Updated `PROJECT.md` and `PLAN.md` to reflect the new "Newspaper" terminology.

## Next Steps (The Wire - Logic Phase)
- [ ] **The Ticker (Real Data)**: Replace `MOCK_TICKER` with real zero-token API fetching (e.g., GitHub trending, RSS feeds).
- [ ] **Parameter Binding**: Connect the "Active Sources" and "Noise Filter" UI controls to the actual fetching logic.
- [ ] **Scout Prompt Refinement**: Update `agentScout` in `newsroom-agents.ts` to be strictly "Tech-First" (focusing on AI, models, code) before applying cultural lenses.
- [ ] **Targeted Search Logic**: Implement a deep-dive research step for specific queries before sending them to The Bullpen.

## Known Issues
1.  **Image Generation Latency**: Generating images via Gemini 2.5 Flash Image takes a few seconds; UI needs to maintain engagement during this wait.
2.  **Layout Binding**: Currently, published items are prepended to the `items` array. We need to re-enable explicit slot binding for the new MVP artifacts.
