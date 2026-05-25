// Single source of truth for the embedding vector size. Must match
// `dimensions` in `convex/schema.ts > signals > vectorIndex by_embedding`.
// If you change this, you also need to rewrite the Convex schema and
// re-embed every existing signal (the vector index is fixed-dim).
export const EXPECTED_EMBEDDING_DIM = 3072;

let embeddingDimChecked = false;
export const assertEmbeddingDim = (values: number[]): void => {
  if (embeddingDimChecked) return;
  embeddingDimChecked = true;
  if (values.length !== EXPECTED_EMBEDDING_DIM) {
    console.error(
      `[EMBEDDING] Dimension mismatch: Gemini returned ${values.length}, ` +
        `Convex schema expects ${EXPECTED_EMBEDDING_DIM}. ` +
        `Update lib/vector.ts and convex/schema.ts and redeploy.`
    );
  }
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
