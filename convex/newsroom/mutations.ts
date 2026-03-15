import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * CONVEX MUTATIONS (WRITE OPERATIONS)
 * 
 * These functions modify the database state.
 * They are transactional by default: if any part fails, the whole operation rolls back.
 */

// 1. ADD TICKER ITEM
// Used by the Scout Agent to add new signals to the feed.
export const addTickerItem = mutation({
  args: {
    title: v.string(),
    source: v.string(),
    sourceId: v.optional(v.id("sources")),
    url: v.string(),
    content: v.optional(v.string()),
    status: v.string(),
    storyId: v.optional(v.id("stories")),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    // Hard Deduplication: Check if URL already exists
    const existing = await ctx.db
      .query("ticker_items")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) {
      return existing._id; // Return existing ID, don't insert duplicate
    }

    const id = await ctx.db.insert("ticker_items", {
      ...args,
      status: args.status as "new" | "processing" | "archived",
      timestamp: Date.now(),
    });
    return id;
  },
});

// 1.1 SOURCES MANAGEMENT
export const addSource = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    type: v.union(v.literal("rss"), v.literal("api"), v.literal("github")),
    crawlFrequency: v.number(),
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

// 1.2 CLUSTER MANAGEMENT
export const addNewsCluster = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    keyEntities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stories", {
      ...args,
      status: "emerging",
      lastUpdatedAt: Date.now(),
    });
  },
});

export const updateNewsCluster = mutation({
  args: {
    clusterId: v.id("stories"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    keyEntities: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("emerging"), v.literal("trending"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const { clusterId, ...updates } = args;
    await ctx.db.patch(clusterId, {
      ...updates,
      lastUpdatedAt: Date.now(),
    });
  },
});

// 1.3 UPDATE TICKER ITEM STORY
export const updateTickerItemStory = mutation({
  args: {
    id: v.id("ticker_items"),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      storyId: args.storyId,
    });
  },
});

// 2. CREATE OR UPDATE DRAFT
// Used by the Editorial Board to save the article.
export const saveDraft = mutation({
  args: {
    headline: v.string(),
    deck: v.string(),
    body: v.string(),
    blocks: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    suggested_visual_prompt: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // For simplicity, we'll just create a new draft entry for now.
    // In a real app, we might update an existing ID.
    const draftId = await ctx.db.insert("drafts", {
      ...args,
      status: args.status as "draft" | "review" | "published",
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    return draftId;
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agent_logs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// 4. SAVE IMAGE
// Used by the Darkroom to store generated images.
export const saveImage = mutation({
  args: {
    prompt: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("images", {
      ...args,
      created_at: Date.now(),
    });
    return imageId;
  },
});

// 5. SAVE NEWSROOM STATE
// Used to persist UI state across sessions.
export const saveNewsroomState = mutation({
  args: {
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsroom_state")
      .withIndex("by_key", (q) => q.eq("key", "current"))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        updated_at: Date.now(),
      });
    } else {
      await ctx.db.insert("newsroom_state", {
        key: "current",
        data: args.data,
        updated_at: Date.now(),
      });
    }
  },
});

// 6. PUBLISH ISSUE (ARCHIVE)
export const publishIssue = mutation({
  args: {
    vol: v.string(),
    theme: v.string(),
    date: v.string(),
    editor: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("issues", {
      ...args,
      published_at: Date.now(),
    });
  },
});

// 7. CLEAR ALL DATA (RESET)
// Used for the "Start New Cycle" button.
export const resetNewsroom = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all drafts
    const drafts = await ctx.db.query("drafts").collect();
    for (const draft of drafts) await ctx.db.delete(draft._id);

    // Delete all images and their storage files
    const images = await ctx.db.query("images").collect();
    for (const image of images) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
    }

    // Keep logs and ticker items for history, or clear them if desired.
    // For now, let's keep logs to show continuity.
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
// Used to publish an article to the current issue.
export const addItemToLatestIssue = mutation({
  args: {
    item: v.any(),
    layout: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const latestIssue = await ctx.db
      .query("issues")
      .order("desc")
      .first();

    if (latestIssue) {
      const content = latestIssue.content;
      // Prepend the new item
      const newItems = [args.item, ...(content.items || [])];
      
      await ctx.db.patch(latestIssue._id, {
        content: {
          ...content,
          items: newItems,
          ...(args.layout ? { layout: args.layout } : {}),
        },
      });
    } else {
      // Create a new issue if none exists (Shell)
      await ctx.db.insert("issues", {
        vol: "VOL. 1.0",
        theme: "THE GENESIS ISSUE",
        date: new Date().toISOString(),
        editor: "SYSTEM",
        content: {
            meta: {
                run_id: 'shell_v1',
                issue_id: 'shell_v1',
                vol: 'VOL. 1.0',
                theme: 'THE GENESIS ISSUE',
                date: 'OCT 2025',
                editor: 'SYSTEM',
                status: 'COLLECTING',
                template_key: 'T1_CoverRail',
                metrics: { signals_ingested: 0, avg_confidence: 0, error_rate: 0 }
            },
            items: [args.item],
            ticker: [],
            cover: {
                eyebrow: "ISSUE 01",
                title: "ZERO DAY", 
                deck: "Blank slate. Rigid grid. Pure signal.",
                coverlines: [],
                imgPrompt: "Void",
                img_base64: ""
            },
            edit: [],
            drops: [],
            debates: [],
            features: [],
            columns: [],
            atelier: [],
            index_keys: [],
            colophon: { contributors: [], sources: [], corrections: [] }
        },
        published_at: Date.now(),
      });
    }
  },
});

// 15. SEED SOURCES
export const seedSources = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sources").collect();
    if (existing.length > 0) return;

    const initialSources = [
      { name: "Hacker News", url: "https://hnrss.org/frontpage", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60 },
      { name: "TechCrunch", url: "https://techcrunch.com/feed/", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60 },
      { name: "GitHub Trending", url: "https://github.com", type: "github" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60 },
      { name: "ArXiv CS", url: "http://export.arxiv.org/rss/cs", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60 }
    ];

    for (const source of initialSources) {
      await ctx.db.insert("sources", source);
    }
  }
});
