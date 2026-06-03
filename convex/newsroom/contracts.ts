/**
 * Boundary validators for the remaining `v.any()` core objects (T-2.5.1, Schicht 5).
 *
 * Same rationale as `issueContent.ts` (T-1.2.6): these fields are written from
 * LLM output and evolving/polymorphic UI blobs, so a strict Convex *table*
 * validator (which rejects any extra field) would break legitimate writes. We
 * instead assert the structural contract that consumers actually rely on at each
 * write boundary, tolerating extra/unknown fields and rejecting malformed data.
 *
 * - `drafts.blocks`   — an array of blocks, each with an id and a sentence list
 *   (type stays a free string: agents and the press emit values beyond the
 *   'p|h2|h3|quote' union, e.g. "text").
 * - `missions.metadata` — diagnostic bag; only required to be an object.
 * - `newsroom_state.data` — polymorphic per key ("current" UI state /
 *   "discovery_lock" / "autonomy_control"); only required to be an object.
 */

const fail = (scope: string, msg: string): never => {
  throw new Error(`[${scope}] invalid structure: ${msg}`);
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function validateDraftBlocks(blocks: unknown): void {
  if (blocks === undefined || blocks === null) return; // optional
  if (!Array.isArray(blocks)) fail("drafts.blocks", "must be an array");
  (blocks as unknown[]).forEach((block, i) => {
    if (!isPlainObject(block)) fail("drafts.blocks", `block[${i}] must be an object`);
    const b = block as Record<string, unknown>;
    if (typeof b.id !== "string") fail("drafts.blocks", `block[${i}].id must be a string`);
    if (!Array.isArray(b.sentences)) fail("drafts.blocks", `block[${i}].sentences must be an array`);
    (b.sentences as unknown[]).forEach((s, j) => {
      if (!isPlainObject(s)) fail("drafts.blocks", `block[${i}].sentences[${j}] must be an object`);
      const sn = s as Record<string, unknown>;
      if (typeof sn.id !== "string") fail("drafts.blocks", `block[${i}].sentences[${j}].id must be a string`);
      if (typeof sn.text !== "string") fail("drafts.blocks", `block[${i}].sentences[${j}].text must be a string`);
    });
  });
}

export function validateMissionMetadata(metadata: unknown): void {
  if (metadata === undefined || metadata === null) return; // optional
  if (!isPlainObject(metadata)) fail("missions.metadata", "must be an object when present");
}

export function validateNewsroomStateData(data: unknown): void {
  if (!isPlainObject(data)) fail("newsroom_state.data", "must be an object");
}
