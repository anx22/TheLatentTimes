// Single source of truth for the embedding vector size. Must match
// `dimensions` in `convex/schema.ts > signals > vectorIndex by_embedding`.
// If you change this, you also need to rewrite the Convex schema and
// re-embed every existing signal (the vector index is fixed-dim).
export const EXPECTED_EMBEDDING_DIM = 3072;

/**
 * Hard guard (T-1.0.3 / audit C2). Throws on ANY dimension mismatch and on every
 * call — a wrong-dim vector (e.g. the 768-dim `gemini-embedding-001` fallback)
 * must never be returned or written, because the `by_embedding` vector index is
 * fixed at EXPECTED_EMBEDDING_DIM and a mismatch silently corrupts it.
 * Returns the values so callers can guard inline: `return assertEmbeddingDim(v)`.
 */
export const assertEmbeddingDim = (values: number[]): number[] => {
  if (!Array.isArray(values) || values.length !== EXPECTED_EMBEDDING_DIM) {
    throw new Error(
      `[EMBEDDING] Dimension mismatch: got ${Array.isArray(values) ? values.length : typeof values}, ` +
        `expected ${EXPECTED_EMBEDDING_DIM}. Refusing to use/store this vector — it would corrupt the ` +
        `fixed-dim "by_embedding" index. Check MODELS.embed / MODELS.embedFallback in convex/models.ts.`
    );
  }
  return values;
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
