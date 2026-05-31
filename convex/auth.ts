import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * NEWSROOM PASSWORD GATE (server-side verification)
 *
 * The newsroom (Ops) area is editable only after a password check. The password
 * itself NEVER reaches the browser bundle — it lives in the Convex deployment
 * env as NEWSROOM_PASSWORD:
 *     npx convex env set NEWSROOM_PASSWORD <your-password>
 *
 * This is a deliberate "soft wall": the client only stores a boolean flag after a
 * successful check. It keeps the secret server-side and stops casual/accidental
 * (and cost-incurring) edits by anonymous visitors. It is NOT a hard security
 * boundary against a determined attacker calling Convex functions directly — that
 * requires real per-user auth, tracked separately.
 */
export const verifyNewsroomPassword = action({
  args: { password: v.string() },
  handler: async (_ctx, args): Promise<{ ok: boolean; configured: boolean }> => {
    const expected = process.env.NEWSROOM_PASSWORD;
    if (!expected) return { ok: false, configured: false };

    const a = args.password || "";
    // Length-independent, constant-time-ish comparison to avoid trivial timing
    // and short-circuit leaks.
    const n = Math.max(a.length, expected.length);
    let diff = a.length === expected.length ? 0 : 1;
    for (let i = 0; i < n; i++) {
      diff |= (a.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
    }
    return { ok: diff === 0, configured: true };
  },
});
