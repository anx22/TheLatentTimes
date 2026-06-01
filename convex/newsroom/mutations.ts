import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { INITIAL_SOURCES, getGenesisIssueContent } from "./seedData";

// ── MISSIONS ─────────────────────────────────────────────────────────────────

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
    await ctx.db.patch(args.missionId, {
      status: "completed",
      completedAt: Date.now(),
      resultId: args.resultId,
      durationMs,
    });
  },
});

// Incremented by the server-side Gemini transport (convex/gemini.ts) after
// every AI call — keeps a running total without client coordination.
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

export const clearLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("agent_logs").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});

// ── SIGNALS & SOURCES ────────────────────────────────────────────────────────

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
    const existing = await ctx.db
      .query("signals")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (existing) return existing._id;

    const { ...rest } = args;
    return await ctx.db.insert("signals", {
      ...rest,
      status: args.status as "new" | "processing" | "archived",
      timestamp: Date.now(),
    });
  },
});

export const toggleSource = mutation({
  args: { id: v.id("sources"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
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
  },
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
  },
});

export const updateSourceFetchTime = mutation({
  args: {
    sourceId: v.id("sources"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, { lastFetchedAt: args.timestamp });
  },
});

export const updateSignalStory = mutation({
  args: {
    id: v.id("signals"),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { storyId: args.storyId });
  },
});

export const seedSources = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sources").collect();

    for (const s of existing) {
      if (s.url === "https://www.anthropic.com/news/rss.xml") {
        await ctx.db.patch(s._id, {
          name: "Hugging Face Blog",
          url: "https://huggingface.co/blog/feed.xml",
        });
      }
      if (s.url === "https://www.wired.com/feed/category/ai/latest/rss") {
        await ctx.db.patch(s._id, {
          url: "https://www.wired.com/feed/tag/ai/latest/rss",
        });
      }
    }

    if (existing.length <= 5) {
      if (existing.length > 0) {
        for (const s of existing) await ctx.db.delete(s._id);
      }
      for (const source of INITIAL_SOURCES) {
        await ctx.db.insert("sources", source);
      }
    } else {
      const existingUrls = new Set(existing.map(s => s.url));
      for (const source of INITIAL_SOURCES) {
        if (!existingUrls.has(source.url)) {
          await ctx.db.insert("sources", source);
        }
      }
    }
  },
});

// ── ISSUES & DRAFTS ──────────────────────────────────────────────────────────

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("signals").collect();
    for (const item of items) await ctx.db.delete(item._id);
    const clusters = await ctx.db.query("stories").collect();
    for (const cluster of clusters) await ctx.db.delete(cluster._id);
    const logz = await ctx.db.query("agent_logs").collect();
    for (const l of logz) await ctx.db.delete(l._id);
  },
});

export const saveImage = mutation({
  args: {
    prompt: v.string(),
    storageId: v.id("_storage"),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const saveNewsroomState = mutation({
  args: {
    data: v.any(),
    key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const key = args.key ?? "current";
    const existing = await ctx.db
      .query("newsroom_state")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { data: args.data, updated_at: Date.now() });
    } else {
      await ctx.db.insert("newsroom_state", { key, data: args.data, updated_at: Date.now() });
    }
  },
});

export const publishIssue = mutation({
  args: {
    vol: v.string(),
    theme: v.string(),
    date: v.string(),
    editor: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("issues", { ...args, published_at: Date.now() });
  },
});

export const resetNewsroom = mutation({
  args: {},
  handler: async (ctx) => {
    const drafts = await ctx.db.query("drafts").collect();
    for (const draft of drafts) await ctx.db.delete(draft._id);

    const images = await ctx.db.query("images").collect();
    for (const image of images) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
    }
  },
});

export const addItemToLatestIssue = mutation({
  args: {
    item: v.any(),
    layout: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const latestIssue = await ctx.db.query("issues").order("desc").first();

    if (latestIssue) {
      const content = latestIssue.content;
      const newItems = [args.item, ...(content.items || [])];

      let newLayout = args.layout || content.layout || [];

      if (!args.layout && newLayout.length >= 0) {
        const blockOptions = ["CoverStory", "Glamour", "LargeQuote", "SmallArticle", "SectionHeader"];
        const blockType = newLayout.length === 0 ? "CoverStory" : (blockOptions[newLayout.length % blockOptions.length]);

        const newItemLayout = {
          i: args.item.id,
          x: 0, y: 0,
          w: 12,
          h: blockType === "CoverStory" ? 6 : 4,
          blockType,
          headline: args.item.title,
          data: args.item,
        };

        const shiftY = newItemLayout.h;
        newLayout = [
          newItemLayout,
          ...newLayout.map((l: any) => ({ ...l, y: l.y + shiftY })),
        ];
      }

      await ctx.db.patch(latestIssue._id, {
        content: { ...content, items: newItems, layout: newLayout },
      });
    } else {
      const initialLayout = [{
        i: args.item.id, x: 0, y: 0, w: 12, h: 6,
        blockType: "CoverStory",
        headline: args.item.title,
        data: args.item,
      }];

      await ctx.db.insert("issues", {
        vol: "VOL. 1.0",
        theme: "THE GENESIS ISSUE",
        date: new Date().toISOString(),
        editor: "SYSTEM",
        content: getGenesisIssueContent(args.item, initialLayout),
        published_at: Date.now(),
      });
    }
  },
});

export const addNewsCluster = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    keyEntities: v.array(v.string()),
    cultural_context: v.optional(v.string()),
    missionId: v.optional(v.id("missions")),
    centroid_embedding: v.optional(v.array(v.float64())),
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
    centroid_embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    const { clusterId, ...updates } = args;
    await ctx.db.patch(clusterId, { ...updates, lastUpdatedAt: Date.now() });
  },
});

export const saveDraft = mutation({
  args: {
    storyId: v.optional(v.string()),
    missionId: v.optional(v.id("missions")),
    headline: v.string(),
    deck: v.string(),
    body: v.string(),
    blocks: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    suggested_visual_prompt: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const recent = await ctx.db.query("drafts")
      .filter(q => q.eq(q.field("headline"), args.headline))
      .order("desc").first();
    if (recent && Date.now() - recent.created_at < 60 * 1000) return recent._id;

    const { storyId, ...rest } = args;
    return await ctx.db.insert("drafts", {
      ...rest,
      storyId: storyId as any,
      status: args.status as "draft" | "review" | "published",
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const updateDraftStatus = mutation({
  args: {
    id: v.id("drafts"),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updated_at: Date.now() });
  },
});

export const deleteDraft = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ── DISCOVERY LOCK (A5) ─────────────────────────────────────────────────────────
// Client `discoverStories` and the autonomous cron can fire concurrently and form
// duplicate story pillars. A short TTL lock (stored under a dedicated newsroom_state
// key, so it never clobbers "current") lets only one discovery run cluster at a time.
export const tryDiscoveryLock = mutation({
  args: { ttlMs: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ acquired: boolean }> => {
    const ttl = args.ttlMs ?? 3 * 60 * 1000;
    const now = Date.now();
    const row = await ctx.db
      .query("newsroom_state")
      .withIndex("by_key", (q) => q.eq("key", "discovery_lock"))
      .unique();
    if (row && ((row.data as any)?.expiresAt ?? 0) > now) return { acquired: false };
    if (row) await ctx.db.patch(row._id, { data: { expiresAt: now + ttl }, updated_at: now });
    else await ctx.db.insert("newsroom_state", { key: "discovery_lock", data: { expiresAt: now + ttl }, updated_at: now });
    return { acquired: true };
  },
});

export const releaseDiscoveryLock = mutation({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("newsroom_state")
      .withIndex("by_key", (q) => q.eq("key", "discovery_lock"))
      .unique();
    if (row) await ctx.db.patch(row._id, { data: { expiresAt: 0 }, updated_at: Date.now() });
  },
});

// ── WORKBENCH ─────────────────────────────────────────────────────────────────

export const createWorkbenchSession = mutation({
  args: {
    signals: v.array(v.id("signals")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workbench_sessions", {
      signals: args.signals,
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const updateWorkbenchSession = mutation({
  args: {
    id: v.id("workbench_sessions"),
    context: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("processing"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updated_at: Date.now() });
  },
});

export const saveStoryAngles = mutation({
  args: {
    angles: v.array(v.object({
      workbenchId: v.id("workbench_sessions"),
      title: v.string(),
      summary: v.string(),
      selected: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    if (args.angles.length > 0) {
      const workbenchId = args.angles[0].workbenchId;
      const existing = await ctx.db.query("story_angles")
        .withIndex("by_workbench", q => q.eq("workbenchId", workbenchId))
        .collect();
      for (const angle of existing) await ctx.db.delete(angle._id);
    }

    const ids = [];
    for (const angle of args.angles) {
      ids.push(await ctx.db.insert("story_angles", { ...angle, created_at: Date.now() }));
    }
    return ids;
  },
});

export const toggleStoryAngle = mutation({
  args: { id: v.id("story_angles"), selected: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { selected: args.selected });
  },
});
