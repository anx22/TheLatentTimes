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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
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

// 8. ADD ITEM TO LATEST ISSUE
// Used to publish an article to the current issue.
export const addItemToLatestIssue = mutation({
  args: {
    item: v.any(),
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
