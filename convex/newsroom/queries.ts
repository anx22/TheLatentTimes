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
    return await (ctx.db as any)
      .query("signals")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
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
    const limit = args.limit ?? 300;
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

// 5. GET NEWSROOM STATE
// Fetches the persisted UI state.
export const getNewsroomState = query({
  args: {},
  handler: async (ctx) => {
    const state = await (ctx.db as any)
      .query("newsroom_state")
      .withIndex("by_key", (q: any) => q.eq("key", "current"))
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
    const limit = args.limit ?? 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_lastUpdatedAt")
      .order("desc")
      .take(limit);

    // Compute density for each story
    return await Promise.all(
      stories.map(async (story) => {
        const items = await ctx.db
          .query("signals")
          .filter((q) => q.eq(q.field("storyId"), story._id))
          .collect();
        return {
          ...story,
          articleCount: items.length,
        };
      })
    );
  },
});

// 20. DEEP INSIGHT (AI OBSERVABILITY)
export const getDeepInsight = query({
  args: {},
  handler: async (ctx) => {
    const activeMissions = await ctx.db.query("missions").filter(q => q.eq(q.field("status"), "running")).collect();
    const tickerCount = (await ctx.db.query("signals").collect()).length;
    const storiesCount = (await ctx.db.query("stories").collect()).length;
    const sources = await ctx.db.query("sources").collect();
    const lastLogs = await ctx.db.query("agent_logs").order("desc").take(50);
    const recentDrafts = await ctx.db.query("drafts").order("desc").take(5);

    return {
      metrics: {
        signals: tickerCount,
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
    return await ctx.db
      .query("signals")
      .filter((q) => q.eq(q.field("storyId"), undefined))
      .order("desc")
      .take(limit);
  },
});

export const getSignal = query({
  args: { id: v.id("signals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
