import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * CONVEX QUERIES (READ OPERATIONS)
 * 
 * These functions are used to fetch data from the database.
 * They are reactive by default: any changes to the data will automatically
 * update the UI without manual re-fetching (Convex's superpower).
 */

// 1. GET TICKER ITEMS
// Fetches the latest 50 news signals, sorted by timestamp (newest first).
export const getSignals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const rows = await (ctx.db as any)
      .query("signals")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    // Strip the heavy server-only fields before sending to the client. Each
    // embedding is a 3072-float array (~25 KB/doc); the UI only displays title/
    // source/content and never reads embeddings (client clustering uses freshly
    // fetched vectors, not this subscription). This query is subscribed reactively
    // in useNewsroomData and re-runs on every signal write — shipping embeddings
    // here was the dominant Convex read-bandwidth cost.
    return rows.map(({ embedding, cultural_vectors, ...rest }: any) => rest);
  },
});

// 2. GET LATEST DRAFT
// Fetches the most recent draft article.
export const getLatestDraft = query({
  args: {},
  handler: async (ctx) => {
    const draft = await (ctx.db as any)
      .query("drafts")
      .order("desc")
      .first();
    return draft;
  },
});

// 2.2 GET ALL DRAFTS
export const getAllDrafts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await (ctx.db as any)
      .query("drafts")
      .order("desc")
      .take(limit);
  },
});

// 2.5 GET DRAFT BY ID
// Fetches a specific draft by its ID.
export const getDraftById = query({
  args: { id: v.optional(v.id("drafts")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

// 3. GET AGENT LOGS
// Fetches the chat history for the "Agent Chatter" stream.
export const getAgentLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Default lowered 300 -> 50: this query is subscribed reactively and re-runs
    // on every logMessage write (hundreds per sweep). Returning 300 docs each time
    // multiplied reads 6x; the UI only renders the last ~50 lines anyway.
    const limit = args.limit ?? 50;
    return await (ctx.db as any)
      .query("agent_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// 4. GET LATEST IMAGE
// Fetches the most recently generated image.
export const getLatestImage = query({
  args: {},
  handler: async (ctx) => {
    const image = await (ctx.db as any)
      .query("images")
      .order("desc")
      .first();
    if (!image) return null;
    const url = await ctx.storage.getUrl(image.storageId);
    return { ...image, url };
  },
});

// 4.5 GET IMAGE BY ID
export const getImageById = query({
  args: { id: v.optional(v.id("images")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    const image = await ctx.db.get(args.id);
    if (!image) return null;
    const url = await ctx.storage.getUrl(image.storageId);
    return { ...image, url };
  },
});

// 5. GET NEWSROOM STATE - STYLED PERSISTENCE (VERIFIED)
export const getNewsroomStateByKey = query({
  args: { key: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const key = args.key ?? "current";
    const state = await (ctx.db as any)
      .query("newsroom_state")
      .withIndex("by_key", (q: any) => q.eq("key", key))
      .unique();
    return state?.data || null;
  },
});

// 6. GET ARCHIVE INDEX
export const getArchiveIndex = query({
  args: {},
  handler: async (ctx) => {
    return await (ctx.db as any)
      .query("issues")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

// 7. GET LATEST ISSUE
export const getLatestIssue = query({
  args: {},
  handler: async (ctx) => {
    return await (ctx.db as any)
      .query("issues")
      .order("desc")
      .first();
  },
});

// 8. GET IMAGES BY IDS
export const getImagesByIds = query({
  args: { ids: v.array(v.id("images")) },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.ids.map(async (id) => {
        const img = await ctx.db.get(id);
        if (!img) return null;
        const url = await ctx.storage.getUrl(img.storageId);
        return { id: img._id, url };
      })
    );
    return results.filter((r) => r !== null) as { id: string; url: string }[];
  },
});

// 9. GET SOURCES
export const getSources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sources").collect();
  },
});

// 10. GET NEWS CLUSTERS
export const getNewsClusters = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = 1;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_lastUpdatedAt")
      .order("desc")
      .take(limit);

    // Return minimal data
    return stories.map((story) => ({
      _id: story._id,
      _creationTime: story._creationTime,
      title: story.title,
      summary: story.summary,
      keyEntities: story.keyEntities,
      lastUpdatedAt: story.lastUpdatedAt,
      status: story.status,
      cultural_context: story.cultural_context,
      missionId: story.missionId,
      articleCount: 0,
    }));
  },
});

// 11. GET MISSIONS
export const getMissions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("missions")
      .order("desc")
      .take(limit);
  },
});

// 20. DEEP INSIGHT (AI OBSERVABILITY)
export const getDeepInsight = query({
  args: {},
  handler: async (ctx) => {
    const activeMissions = await ctx.db.query("missions").filter(q => q.eq(q.field("status"), "running")).collect();
    
    // Real counts (C1, was hardcoded 0). Stories are few + small → collect.
    // Signals carry 3072-dim embeddings, so an unbounded read is expensive; cap the
    // read at 501 and surface "500+" beyond that. (A sharded counter is the future
    // optimization if the signal table grows large.)
    const storiesCount = (await ctx.db.query("stories").collect()).length;
    const signalsSample = await ctx.db.query("signals").take(501);
    const signalsCount = signalsSample.length;

    const sources = await ctx.db.query("sources").take(50);
    const lastLogs = await ctx.db.query("agent_logs").order("desc").take(50);
    const recentDrafts = await ctx.db.query("drafts").order("desc").take(5);

    return {
      metrics: {
        signals: signalsCount > 500 ? "500+" : signalsCount,
        narrativePillars: storiesCount,
        activeSources: sources.filter(s => s.isActive).length,
        pendingMissions: activeMissions.length,
      },
      activeMissions: activeMissions.map(m => ({
        id: m._id,
        topic: m.topic,
        type: m.type,
        startedAt: m.startedAt,
        parent: m.parentMissionId
      })),
      auditTrail: lastLogs.map(l => `[${l.agentName}] ${l.message}`),
      anomalies: sources.filter(s => Date.now() - s.lastFetchedAt > (s.crawlFrequency * 60 * 1000 * 2)).map(s => `SOURCE_DELAY: ${s.name}`),
      latestDrafts: recentDrafts.map(d => d.headline)
    };
  },
});

// 22. GET ORPHAN TICKER ITEMS
export const getOrphanSignals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    // Convex query filter for undefined fields can be tricky.
    // We will query ordered by timestamp and filter in memory for those missing storyId.
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit * 3); // Over-fetch to account for in-memory filtering (was *5).

    // Strip embeddings/vectors — the only consumer (server-side clustering) uses
    // id/title/content, never the vectors. Avoids shipping 3072-float arrays.
    const orphans = signals
      .filter((s) => !s.storyId)
      .slice(0, limit)
      .map(({ embedding, cultural_vectors, ...rest }: any) => rest);
    return orphans;
  },
});

export const getActiveWorkbenchSession = query({
  args: {},
  handler: async (ctx) => {
    // For now we just return the most recently updated active or processing session
    return await ctx.db
      .query("workbench_sessions")
      .withIndex("by_updatedAt")
      .filter(q => q.neq(q.field("status"), "completed"))
      .order("desc")
      .first();
  },
});

export const getStoryAngles = query({
  args: { workbenchId: v.optional(v.id("workbench_sessions")) },
  handler: async (ctx, args) => {
    if (!args.workbenchId) return [];
    return await ctx.db
      .query("story_angles")
      .withIndex("by_workbench", q => q.eq("workbenchId", args.workbenchId!))
      .collect();
  },
});

export const getSignal = query({
  args: { id: v.id("signals") },
  handler: async (ctx, args) => {
    const sig = await ctx.db.get(args.id);
    if (!sig) return null;
    // Drop the heavy vector fields; consumers only need scalar metadata.
    const { embedding, cultural_vectors, ...rest } = sig as any;
    return rest;
  },
});

// Fetch a single story by id. Needed by the autonomous cron, which used to look
// the story up via getNewsClusters (hardcoded to limit=1) — that lookup missed
// whenever the target story was not the single most-recent one, silently
// skipping the entire drafting branch. Use a direct get instead.
export const getStory = query({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
