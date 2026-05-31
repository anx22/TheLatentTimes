import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { INITIAL_SOURCES } from "../seedData";

// Used by the Scout Agent to add new signals to the feed.
export const addSignal = mutation({
  args: {
    title: v.string(),
    source: v.string(),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.id("sources")),
    sourcePack: v.optional(v.string()),
    sourceTrustTier: v.optional(v.string()),
    url: v.string(),
    content: v.optional(v.string()),
    status: v.string(),
    storyId: v.optional(v.id("stories")),
    embedding: v.optional(v.array(v.float64())),
    missionId: v.optional(v.id("missions")),
    innovation_score: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
    hash: v.optional(v.string()),
    cultural_vectors: v.optional(v.array(v.object({
      trend: v.string(),
      resonance: v.number(),
      connection: v.string()
    }))),
  },
  handler: async (ctx, args) => {
    // Hard Deduplication: Check if URL already exists
    const existing = await ctx.db
      .query("signals")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) {
      return existing._id; // Return existing ID, don't insert duplicate
    }

    const { ...rest } = args;

    const id = await ctx.db.insert("signals", {
      ...rest,
      status: args.status as "new" | "processing" | "archived",
      timestamp: Date.now(),
    });
    return id;
  },
});

export const toggleSource = mutation({
  args: { id: v.id("sources"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  }
});

export const updateSource = mutation({
  args: {
    id: v.id("sources"),
    priority: v.optional(v.number()),
    crawlFrequency: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    trustTier: v.optional(v.string()),
    rightsMode: v.optional(v.string()),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  }
});

export const addSource = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    type: v.union(v.literal("rss"), v.literal("api"), v.literal("github"), v.literal("html_watch")),
    crawlFrequency: v.number(),
    pack: v.optional(v.string()),
    priority: v.optional(v.number()),
    trustTier: v.optional(v.string()),
    rightsMode: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sources")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("sources", {
      ...args,
      lastFetchedAt: 0,
      isActive: true,
    });
  },
});

export const deleteSource = mutation({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  }
});

export const updateSourceFetchTime = mutation({
  args: {
    sourceId: v.id("sources"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, {
      lastFetchedAt: args.timestamp,
    });
  },
});

// 1.3 UPDATE TICKER ITEM STORY
export const updateSignalStory = mutation({
  args: {
    id: v.id("signals"),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      storyId: args.storyId,
    });
  },
});

// 15. SEED SOURCES (LNT v2.5 AI Sources)
export const seedSources = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sources").collect();

    // Run active migration for all databases containing broken/outdated URLs
    for (const s of existing) {
      if (s.url === "https://www.anthropic.com/news/rss.xml") {
        await ctx.db.patch(s._id, {
          name: "Hugging Face Blog",
          url: "https://huggingface.co/blog/feed.xml"
        });
      }
      if (s.url === "https://www.wired.com/feed/category/ai/latest/rss") {
        await ctx.db.patch(s._id, {
          url: "https://www.wired.com/feed/tag/ai/latest/rss"
        });
      }
    }

    if (existing.length <= 5) {
      // Clear minimal/old set
      if (existing.length > 0) {
        for (const s of existing) await ctx.db.delete(s._id);
      }
      // Insert full set
      for (const source of INITIAL_SOURCES) {
        await ctx.db.insert("sources", source);
      }
    } else {
      // Live database exists: only insert the premium sources that don't already exist in the database (by URL check)
      const existingUrls = new Set(existing.map(s => s.url));
      for (const source of INITIAL_SOURCES) {
        if (!existingUrls.has(source.url)) {
          await ctx.db.insert("sources", source);
        }
      }
    }
  }
});
