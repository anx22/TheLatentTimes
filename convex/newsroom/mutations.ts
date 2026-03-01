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
    url: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ticker_items", {
      ...args,
      status: args.status as "new" | "processing" | "archived",
      timestamp: Date.now(),
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
    await ctx.db.insert("drafts", {
      ...args,
      status: args.status as "draft" | "review" | "published",
      created_at: Date.now(),
      updated_at: Date.now(),
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
    url: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", {
      ...args,
      created_at: Date.now(),
    });
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

    // Delete all images
    const images = await ctx.db.query("images").collect();
    for (const image of images) await ctx.db.delete(image._id);

    // Keep logs and ticker items for history, or clear them if desired.
    // For now, let's keep logs to show continuity.
  },
});
