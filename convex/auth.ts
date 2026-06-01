import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";

/**
 * NEWSROOM PASSWORD GATE + SESSION TOKENS (server-side)
 *
 * Two layers live here:
 *
 * 1. PASSWORD GATE (soft wall). The newsroom (Ops) area is editable only after a
 *    password check. The password itself NEVER reaches the browser bundle — it
 *    lives in the Convex deployment env as NEWSROOM_PASSWORD:
 *        npx convex env set NEWSROOM_PASSWORD <your-password>
 *
 * 2. SESSION TOKENS (T-1.0.1, S1/P0). A successful password check now MINTS an
 *    opaque session token (`sessions` table). The cost-incurring Gemini actions
 *    (`convex/gemini.ts`) require that token and consume against it via
 *    `consumeRateBudget`, which rejects anonymous callers and enforces a simple
 *    per-session rate cap. This closes the hole where anyone with the deployment
 *    URL could call the Gemini actions directly and run up unbounded model costs.
 *
 * This remains a deliberate "soft wall": it stops casual/accidental (and
 * cost-incurring) abuse. It is NOT a hard security boundary against a determined
 * attacker — that requires real per-user auth, tracked separately.
 */

// --- Session policy (single source of truth for the gate) ---
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — a working editorial session.
const RATE_WINDOW_MS = 60_000; // 1-minute sliding window.
const RATE_MAX_CALLS = 120; // Gemini calls per window per session — generous for a
// full pipeline burst (scout/debate/columnist/editor/polish across signals), but
// a hard ceiling against runaway loops or a leaked token.

export const verifyNewsroomPassword = action({
  args: { password: v.string() },
  handler: async (
    ctx,
    args
  ): Promise<{ ok: boolean; configured: boolean; token?: string }> => {
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
    if (diff !== 0) return { ok: false, configured: true };

    // Correct password → mint a session token the client attaches to every
    // subsequent Gemini call.
    const token: string = await ctx.runMutation(internal.auth.createSession, {});
    return { ok: true, configured: true, token };
  },
});

/**
 * Mint a fresh session token. Internal-only: reachable solely through a
 * successful password check above, never from the client directly.
 */
export const createSession = internalMutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const now = Date.now();

    // Opportunistically prune a handful of expired sessions so the table does
    // not grow unbounded (cheap; full cleanup can be a cron later).
    const stale = await ctx.db
      .query("sessions")
      .withIndex("by_token")
      .take(50);
    for (const s of stale) {
      if (s.expiresAt <= now) await ctx.db.delete(s._id);
    }

    const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    await ctx.db.insert("sessions", {
      token,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
      windowStart: now,
      windowCount: 0,
    });
    return token;
  },
});

/**
 * Validate a session token and consume one unit of its rate budget.
 * Throws `ConvexError` (rejecting the calling action) when the token is missing,
 * unknown, expired, or over its per-window cap. Called at the top of every
 * cost-incurring Gemini action.
 */
export const consumeRateBudget = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<null> => {
    if (!args.token) {
      throw new ConvexError("Unauthorized: no newsroom session token.");
    }
    const now = Date.now();
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session) {
      throw new ConvexError("Unauthorized: invalid newsroom session token.");
    }
    if (session.expiresAt <= now) {
      await ctx.db.delete(session._id);
      throw new ConvexError("Session expired — please log in to the newsroom again.");
    }

    // Fixed-window rate cap, reset once the window rolls over.
    const inWindow = now - session.windowStart < RATE_WINDOW_MS;
    const windowStart = inWindow ? session.windowStart : now;
    const windowCount = (inWindow ? session.windowCount : 0) + 1;

    if (windowCount > RATE_MAX_CALLS) {
      throw new ConvexError(
        `Rate limit: more than ${RATE_MAX_CALLS} model calls in a minute on this session.`
      );
    }

    await ctx.db.patch(session._id, { windowStart, windowCount });
    return null;
  },
});
