"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
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
exports.default = (0, server_1.defineSchema)({
    // 1. TICKER ITEMS (Raw Signals)
    ticker_items: (0, server_1.defineTable)({
        title: values_1.v.string(),
        source: values_1.v.string(),
        url: values_1.v.optional(values_1.v.string()),
        timestamp: values_1.v.number(), // Unix timestamp
        status: values_1.v.union(values_1.v.literal("new"), values_1.v.literal("processing"), values_1.v.literal("archived")),
    }).index("by_timestamp", ["timestamp"]),
    // 2. DRAFTS (The Article)
    drafts: (0, server_1.defineTable)({
        headline: values_1.v.string(),
        deck: values_1.v.string(),
        body: values_1.v.string(),
        blocks: values_1.v.optional(values_1.v.any()), // Storing blocks as JSON for now
        tags: values_1.v.optional(values_1.v.array(values_1.v.string())),
        suggested_visual_prompt: values_1.v.optional(values_1.v.string()),
        status: values_1.v.union(values_1.v.literal("draft"), values_1.v.literal("review"), values_1.v.literal("published")),
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
    }),
    // 3. AGENT LOGS (Chatter Stream)
    agent_logs: (0, server_1.defineTable)({
        agentName: values_1.v.string(), // e.g., "Scout", "Editor", "Columnist"
        message: values_1.v.string(),
        step: values_1.v.string(), // Context: "NEWS_TERMINAL", "EDITORIAL_BOARD", etc.
        timestamp: values_1.v.number(),
    }).index("by_timestamp", ["timestamp"]),
    // 4. IMAGES (Visual Assets)
    images: (0, server_1.defineTable)({
        prompt: values_1.v.string(),
        url: values_1.v.string(),
        created_at: values_1.v.number(),
    }),
});
