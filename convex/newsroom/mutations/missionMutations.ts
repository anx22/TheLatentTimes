import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// 0. MISSION COORDINATION - RE-SYNC TRIGGER
export const startMission = mutation({
  args: {
    topic: v.string(),
    type: v.union(v.literal("editorial"), v.literal("scout"), v.literal("system")),
    parentMissionId: v.optional(v.id("missions")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("missions", {
      ...args,
      status: "running",
      startedAt: Date.now(),
    });
  },
});

export const completeMission = mutation({
  args: {
    missionId: v.id("missions"),
    resultId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    const durationMs = mission ? Date.now() - mission.startedAt : undefined;

    // Token usage is accumulated server-side via `recordTokenUsage` while
    // the mission runs, so we deliberately do not patch it here (otherwise
    // we'd clobber the running total with undefined).
    await ctx.db.patch(args.missionId, {
      status: "completed",
      completedAt: Date.now(),
      resultId: args.resultId,
      durationMs,
    });
  },
});

// Token accounting — incremented by the server-side Gemini transport
// (convex/gemini.ts) after every call. Keeps a running total on the
// mission record so the UI can read it without coordinating client state.
export const recordTokenUsage = mutation({
  args: {
    missionId: v.id("missions"),
    prompt: v.number(),
    completion: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (!mission) return;
    const prev = mission.tokenUsage || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };
    await ctx.db.patch(args.missionId, {
      tokenUsage: {
        promptTokens: prev.promptTokens + args.prompt,
        completionTokens: prev.completionTokens + args.completion,
        totalTokens: prev.totalTokens + args.total,
      },
    });
  },
});

export const failMission = mutation({
  args: {
    missionId: v.id("missions"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.missionId, {
      status: "failed",
      completedAt: Date.now(),
      error: args.error,
    });
  },
});

// 3. LOG AGENT MESSAGE
// Used by all agents to post to the "Chatter" stream.
export const logMessage = mutation({
  args: {
    agentName: v.string(),
    message: v.string(),
    step: v.string(),
    level: v.optional(v.string()),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agent_logs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// 9. CLEAR LOGS
export const clearLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("agent_logs").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});
