
# DECISIONS.md

## 001 - Fine Tuning & Tone Control (v3.5)
**Problem**: The model was producing "safe" generic content. We needed a way to inject "voltage" and specific stylistic constraints without rewriting the code every time.
**Decision**: 
- Added a `RunConfig` object passed through the entire Orchestrator pipeline.
- Added explicit "Fine-Tune" controls in the UI for Audience, Negative Prompts, and Search Vectors.
- **Why**: Allows non-code interventions. "Banned Words" list is the most effective way to kill "AI-slop" (e.g., "delve").

## 002 - Refactoring Strategy (v4.0 Prep)
**Status**: Executed (v3.6)
**Problem**: `TheNewsroom.tsx`, `writer.ts`, and `engine-orchestrator.ts` are becoming unmaintainable "God Files". Adding new agents or UI features increases regression risk significantly.

**Plan**:
1. **Deconstruct `writer.ts`**:
   - Create `services/agents/writing/`
   - Extract `draft.ts`, `rewrite.ts`, `headlines.ts`, `columnist.ts`.
   - *Goal*: Isolate prompt logic. Changing the "Gonzo" persona shouldn't risk breaking the Fact Checker.

2. **Deconstruct `TheNewsroom.tsx`**:
   - Create `components/newsroom/`
   - Extract `NewsroomSidebar` (The Wire/Feed).
   - Extract `NewsroomConsole` (The Right Rail / Commissioning Controls).
   - Extract `NewsroomCanvas` (The center stage).
   - *Goal*: The main file should only handle State and Layout, not rendering 500 lines of buttons.

3. **Orchestrator Separation of Concerns**:
   - The `IssueOrchestrator` currently handles:
     1. State (Leads, Signals, Stories)
     2. Execution (Calling Agents)
     3. Logging
   - *Goal*: Move state to a `NewsroomState` hook or class. Keep Orchestrator purely for execution flow.

**Impact**: 
- This refactor is "Sinnvoll" (Meaningful) because it prepares the codebase for **Autopilot**. 
- Autopilot requires the Orchestrator to run *headless* (without UI). decoupling UI components from logic is prerequisite.

## 003 - Agent Gamification (v3.6)
**Problem**: The "Spinner" loading state is boring and hides the complexity of the agentic workflow. Users don't feel the "Newsroom" vibe.
**Decision**:
- Visualize specific Agents (Scout, Critic, Writer) as "Cards" in the console.
- Orchestrator emits granular `onAgentStart` / `onAgentUpdate` events.
- **Why**: Enhances trust (inspectability) and makes the wait time (30-60s) engaging rather than frustrating. Turns the app into a Simulation.
