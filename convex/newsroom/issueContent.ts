/**
 * Boundary validator for `issues.content` (T-1.2.6).
 *
 * The stored content object is large, freeform and was historically written
 * with `v.any()`. Its real shape diverges from the `IssueContent` TS type
 * (e.g. `getGenesisIssueContent` writes a `ticker` field the type never
 * declares), so a strict Convex *table* validator would reject legacy patches
 * and otherwise-valid writes. Instead we assert — at every write boundary —
 * only the structural contract the reader grid actually relies on, and reject
 * anything that would render a structurally broken issue. Unknown extra fields
 * are tolerated on purpose; missing/mistyped critical fields are not.
 */

const fail = (msg: string): never => {
  throw new Error(`[issues.content] invalid structure: ${msg}`);
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function validateIssueContent(content: unknown): void {
  if (!isPlainObject(content)) fail("content must be an object");
  const c = content as Record<string, unknown>;

  if (!isPlainObject(c.meta)) fail("`meta` must be an object");
  if (!isPlainObject(c.cover)) fail("`cover` must be an object");

  if (c.items !== undefined && !Array.isArray(c.items)) {
    fail("`items` must be an array when present");
  }

  if (c.layout !== undefined) {
    if (!Array.isArray(c.layout)) fail("`layout` must be an array when present");
    (c.layout as unknown[]).forEach((item, idx) => {
      if (!isPlainObject(item)) fail(`layout[${idx}] must be an object`);
      const l = item as Record<string, unknown>;
      if (typeof l.i !== "string") fail(`layout[${idx}].i must be a string`);
      for (const k of ["x", "y", "w", "h"] as const) {
        if (typeof l[k] !== "number") fail(`layout[${idx}].${k} must be a number`);
      }
    });
  }
}
