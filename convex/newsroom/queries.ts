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
export const getTickerItems = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await (ctx.db as any)
      .query("ticker_items")
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

// 3. GET AGENT LOGS
// Fetches the chat history for the "Agent Chatter" stream.
export const getAgentLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
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
    return image;
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
