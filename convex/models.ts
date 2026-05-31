/**
 * SINGLE SOURCE OF TRUTH FOR GEMINI MODEL ALIASES (server side).
 *
 * Model names were previously scattered as string literals across the transport,
 * the autonomous cron and the clustering actions. Changing a model (or recovering
 * from a deprecation/404) meant editing many call sites. Keep them here.
 *
 * The client mirror lives in /constants.ts (MODELS) — keep the two in sync.
 */
export const MODELS = {
  /** Primary fast text model used for most generation + JSON agents. */
  text: "gemini-3-flash-preview",
  /** Cheapest fallback for the rate-limit ladder (tools stripped). */
  textLite: "gemini-flash-lite-latest",
  /** Heavier reasoning model (used sparingly — higher cost). */
  pro: "gemini-2.5-pro",
  /** Image generation / editing. */
  image: "gemini-2.5-flash-image",
  /** Embeddings (3072-dim) + older fallback. */
  embed: "gemini-embedding-2",
  embedFallback: "gemini-embedding-001",
} as const;
