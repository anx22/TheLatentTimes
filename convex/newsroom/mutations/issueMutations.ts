import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getGenesisIssueContent } from "../seedData";

// 1.1 Maintenance / Reset Database
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("signals").collect();
    for (const item of items) await ctx.db.delete(item._id);
    const clusters = await ctx.db.query("stories").collect();
    for (const cluster of clusters) await ctx.db.delete(cluster._id);
    const logz = await ctx.db.query("agent_logs").collect();
    for (const l of logz) await ctx.db.delete(l._id);
  }
});

// 5. SAVE IMAGE
// Used by the Darkroom to store generated images.
export const saveImage = mutation({
  args: {
    prompt: v.string(),
    storageId: v.id("_storage"),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("images", {
      ...args,
      created_at: Date.now(),
    });
    return imageId;
  },
});

// 5. SAVE NEWSROOM STATE - STYLED PERSISTENCE (VERIFIED)
export const saveNewsroomState = mutation({
  args: {
    data: v.any(),
    key: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const key = args.key ?? "current";
    const existing = await ctx.db
      .query("newsroom_state")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        updated_at: Date.now(),
      });
    } else {
      await ctx.db.insert("newsroom_state", {
        key,
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

// Used to publish an article to the current issue.
export const addItemToLatestIssue = mutation({
  args: {
    item: v.any(),
    layout: v.optional(v.any()), // Array of LayoutItem
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
      
      let newLayout = args.layout || content.layout || [];
      
      // Dynamic Layout Injection: 
      // If the newspaper uses a grid layout, we must place this new item on the grid
      if (!args.layout && newLayout.length >= 0) {
        // Choose alternate templates based on position
        const blockOptions = ["CoverStory", "Glamour", "LargeQuote", "SmallArticle", "SectionHeader"];
        const blockType = newLayout.length === 0 ? "CoverStory" : (blockOptions[newLayout.length % blockOptions.length]);
          
        const newItemLayout = {
          i: args.item.id,
          x: 0,
          y: 0, // Force placement at the visual top
          w: 12, // Span full width initially, ResponsiveGridLayout handles col math
          h: blockType === 'CoverStory' ? 6 : (blockType === 'SmallArticle' ? 4 : 4),
          blockType,
          headline: args.item.title,
          data: args.item,
        };
        
        // Push to top: Shift all existing layouts down by the height of the new block
        const shiftY = newItemLayout.h;
        newLayout = [
          newItemLayout,
          ...newLayout.map((l: any) => ({ ...l, y: l.y + shiftY }))
        ];
      }

      await ctx.db.patch(latestIssue._id, {
        content: {
          ...content,
          items: newItems,
          layout: newLayout,
        },
      });
    } else {
      // Create a new issue if none exists (Shell)
      const initialLayout = [
        {
          i: args.item.id,
          x: 0,
          y: 0,
          w: 12,
          h: 6,
          blockType: "CoverStory",
          headline: args.item.title,
          data: args.item,
        }
      ];
      
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
