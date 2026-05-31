---
name: convex-database
description: Guidelines and best practices for interacting with the Convex database. Use whenever creating queries, mutations, or actions.
---

# Convex Database Skill

This skill provides mandatory guidelines for interacting with the Convex backend to prevent data corruption, silent errors, and schema mismatches.

## Fundamental Limitations & Anti-Patterns
1. **Filtering by `undefined`**: Querying `undefined` with `q.eq(q.field("x"), undefined)` inside `.filter()` is often buggy or fails unless properly indexed. It's safer to query the broader dataset (ordered by an index) and `.filter(item => !item.x)` in memory, especially when the field may not exist on old documents.
2. **Missing Environment Variables in Actions**: `process.env.XXX` might not be available in Actions causing silent 404s or crashes if not strictly checked. Always use hard error boundaries (`if (!key) throw new Error(...)`).
3. **Array Mutation / Shifting Coordinates**: When updating nested arrays or layouts, do not rely on implicit indices. Calculate precise geometric shifts (e.g. `y: maxY + item.h`) and update all elements explicitly.
4. **Model Limitations in Convex Actions**: Convex actions execute via standard Node/V8 fetch. When calling Gemini or external LLMs, ensure the correct model alias is used (e.g. `gemini-3-flash-preview`), handle `catch` blocks loudly, and avoid swallowing errors.
5. **No Direct DOM or Browser APIs**: Never use `window`, `document`, or `localStorage` inside `/convex/` directory files.

## Observability & Error Handling
- Never use silent `catch (e) { }` in `actions.ts`. Always log `console.error("[ActionName] FATAL: ", e)` and `throw new Error(...)`.
- Break monolithic files (`mutations.ts`, `actions.ts`) into domain-specific namespaced files (e.g., `clusteringActions.ts`, `fetchActions.ts`) and re-export them cleanly in an `index.ts` or directly in the manifest.

