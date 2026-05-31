import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// 1.2 CLUSTER MANAGEMENT
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
    await ctx.db.patch(clusterId, {
      ...updates,
      lastUpdatedAt: Date.now(),
    });
  },
});

// 2. CREATE OR UPDATE DRAFT
// Used by the Editorial Board to save the article.
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
    // Optional: Check for exact same headline within 1 min (Prevent rapid-click duplicates)
    const recent = await ctx.db.query("drafts")
      .filter(q => q.eq(q.field("headline"), args.headline))
      .order("desc").first();
    if (recent && Date.now() - recent.created_at < 60 * 1000) {
       return recent._id; 
    }

    const { storyId, ...rest } = args;
    const draftId = await ctx.db.insert("drafts", {
      ...rest,
      storyId: storyId as any,
      status: args.status as "draft" | "review" | "published",
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    return draftId;
  },
});

// 2.5 UPDATE DRAFT STATUS
export const updateDraftStatus = mutation({
  args: {
    id: v.id("drafts"),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updated_at: Date.now(),
    });
  },
});

// 2.6 DELETE DRAFT
export const deleteDraft = mutation({
  args: {
    id: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
