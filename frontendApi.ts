import { api as rawApi } from "./convex/_generated/api";

// Loosely-typed escape hatch for call sites that reference functions which may
// not yet be in the generated types (or use `any`-shaped args). Intentionally
// `any` — this is the one sanctioned place for it.
export const api: any = rawApi;
