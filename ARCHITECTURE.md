# The Latent Times: Architecture

## Stack
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion.
- **Backend**: Convex (Real-time DB, Vector Search).
- **Intelligence**: Gemini (via standard genai SDK for server-side logic).
- **Layout**: `react-grid-layout` orchestrated by agent metadata.

## Layer Rules
- **Domain Decoupling** [HARD]: Agents live in `/services`, State logic in domain hooks. `App.tsx` is for layout only.
- **Canonical State** [HARD]: Convex is the single source of truth for the "Published Line".
- **Mission Wrapping** [HARD]: Every agent execution MUST be linked to a `missionId` for observability.
- **Persistence Protocol** [HARD]: Global parameters and system settings MUST be stored in dedicated Convex state keys to ensure session reliability.
- **Deep Modules** [PREFER]: Encapsulate agent coordination behind high-leverage service interfaces (e.g., `EditorialOrchestrator`).

## Golden Principles
- **Neural Retrieval vs. Structural Clustering** [HARD]: Neural search = Interrogation (finding signals); Clustering = Synthesis (grouping signals).
- **Shared Utils over Hand-rolled Helpers** [HARD]: Logic belongs in centralized services, not inside departmental hooks.
- **Interface is the Test Surface** [PREFER]: Design interfaces that can be run "headless" for architecture drills.
- **Zero-Token Ticker** [PREFER]: Cache signals in Convex; only deploy LLMs for value-add transformation/synthesis.
- **Validated Boundaries** [HARD]: Never assume the shape of API responses or Convex query results; use Zod or standard validation.
