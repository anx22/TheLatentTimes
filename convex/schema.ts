import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * CONVEX SCHEMA DEFINITION
 * 
 * This file defines the database structure for the Newsroom.
 * Convex uses a TypeScript-based schema definition that ensures end-to-end type safety.
 * 
 * Tables:
 * - ticker_items: Stores raw news signals (RSS, Scout results).
 * - drafts: Stores the evolving article content (headline, deck, body).
 * - agent_logs: Stores the chat history for the "Agent Chatter" stream.
 * - images: Stores generated image URLs and prompts.
 */

export default defineSchema({
  // 1. TICKER ITEMS (Raw Signals)
  ticker_items: defineTable({
    title: v.string(),
    source: v.string(),
    url: v.optional(v.string()),
    timestamp: v.number(), // Unix timestamp
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("archived")),
  }).index("by_timestamp", ["timestamp"]),

  // 2. DRAFTS (The Article)
  drafts: defineTable({
    headline: v.string(),
    deck: v.string(),
    body: v.string(),
    blocks: v.optional(v.any()), // Storing blocks as JSON for now
    tags: v.optional(v.array(v.string())),
    suggested_visual_prompt: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published")),
    created_at: v.number(),
    updated_at: v.number(),
  }),

  // 3. AGENT LOGS (Chatter Stream)
  agent_logs: defineTable({
    agentName: v.string(), // e.g., "Scout", "Editor", "Columnist"
    message: v.string(),
    step: v.string(), // Context: "NEWS_TERMINAL", "EDITORIAL_BOARD", etc.
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  // 4. IMAGES (Visual Assets)
  images: defineTable({
    prompt: v.string(),
    storageId: v.id("_storage"),
    created_at: v.number(),
  }),

  // 5. NEWSROOM WORKING STATE (UI Persistence)
  newsroom_state: defineTable({
    key: v.string(), // e.g., "current"
    data: v.any(),
    updated_at: v.number(),
  }).index("by_key", ["key"]),

  // 6. PUBLISHED ISSUES (The Archive)
  issues: defineTable({
    vol: v.string(),
    theme: v.string(),
    date: v.string(),
    editor: v.string(),
    content: v.any(), // Full IssueContent JSON
    published_at: v.number(),
  }).index("by_date", ["date"]),
});
