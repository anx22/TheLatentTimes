import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * CONVEX SCHEMA DEFINITION
 * 
 * This file defines the database structure for the Newsroom.
 * Convex uses a TypeScript-based schema definition that ensures end-to-end type safety.
 * 
 * Tables:
 * - signals: Stores raw news signals (RSS, Scout results).
 * - drafts: Stores the evolving article content (headline, deck, body).
 * - agent_logs: Stores the chat history for the "Agent Chatter" stream.
 * - images: Stores generated image URLs and prompts.
 */

export default defineSchema({
  // 1. SOURCES (The Crawl Targets)
  sources: defineTable({
    name: v.string(), // e.g., "GitHub Trending", "TechCrunch"
    url: v.string(), // The RSS or API endpoint
    type: v.union(v.literal("rss"), v.literal("api"), v.literal("github"), v.literal("html_watch")),
    pack: v.optional(v.string()), // AI_MODEL_FRONTIER, etc.
    priority: v.optional(v.number()), // 1-5
    trustTier: v.optional(v.string()), // primary, expert, media, etc.
    rightsMode: v.optional(v.string()), // metadata_only, etc.
    lastFetchedAt: v.number(), // Timestamp of last successful fetch
    crawlFrequency: v.number(), // Minutes between crawls
    isActive: v.boolean(),
    notes: v.optional(v.string()),
  }).index("by_url", ["url"])
    .index("by_pack", ["pack"]),

  // 2. STORIES (The Clusters / Knowledge Graph)
  stories: defineTable({
    title: v.string(), // Auto-generated meta-title
    summary: v.string(), // Auto-generated meta-summary
    keyEntities: v.array(v.string()), // e.g., ["OpenAI", "Sam Altman"]
    lastUpdatedAt: v.number(),
    status: v.union(v.literal("emerging"), v.literal("trending"), v.literal("archived")),
    cultural_context: v.optional(v.string()), // Broad philosophical/cultural link
    missionId: v.optional(v.id("missions")), // The execution thread that produced this story
    centroid_embedding: v.optional(v.array(v.float64())), // The representative vector of the pillar
  }).index("by_lastUpdatedAt", ["lastUpdatedAt"])
    .index("by_mission", ["missionId"]),

  // 3. TICKER ITEMS (Raw Signals)
  signals: defineTable({
    title: v.string(),
    source: v.string(),
    sourceId: v.optional(v.id("sources")), // Link to the source
    url: v.optional(v.string()), // Changed to required for deduplication
    content: v.optional(v.string()), // Snippet or full text for embedding
    timestamp: v.number(), // Unix timestamp
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("archived")),
    sourceType: v.optional(v.string()), // e.g., 'rss', 'github', 'api'
    sourcePack: v.optional(v.string()),
    sourceTrustTier: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
    hash: v.optional(v.string()), // For deduplication
    storyId: v.optional(v.id("stories")), // The cluster it belongs to
    embedding: v.optional(v.array(v.float64())), // The vector representation
    missionId: v.optional(v.id("missions")), // The mission that ingested this item
    innovation_score: v.optional(v.number()),
    cultural_vectors: v.optional(v.array(v.object({
      trend: v.string(),
      resonance: v.number(), // 0-100
      connection: v.string() // Explanation
    }))),
  })
  .index("by_timestamp", ["timestamp"])
  .index("by_url", ["url"]) // For hard deduplication
  .index("by_mission", ["missionId"])
  .index("by_storyId", ["storyId"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 3072, // gemini-embedding-2 dimensions
    filterFields: ["storyId"],
  }),

  // 2. DRAFTS (The Article)
  drafts: defineTable({
    storyId: v.optional(v.string()),
    missionId: v.optional(v.id("missions")), // The research/editorial mission
    headline: v.string(),
    deck: v.string(),
    body: v.string(),
    blocks: v.optional(v.any()), // Storing blocks as JSON for now
    tags: v.optional(v.array(v.string())),
    suggested_visual_prompt: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published")),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_mission", ["missionId"]),

  // 3. AGENT LOGS (Chatter Stream)
  agent_logs: defineTable({
    agentName: v.string(), // e.g., "Scout", "Editor", "Columnist"
    message: v.string(),
    step: v.string(), // Context: "NEWS_TERMINAL", "EDITORIAL_BOARD", etc.
    level: v.optional(v.string()), // "info", "action", "success", "error", "warning"
    missionId: v.optional(v.id("missions")), // Grouping logs by execution thread
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"])
    .index("by_mission", ["missionId"]),

  // 4. MISSIONS (Execution Threads)
  missions: defineTable({
    topic: v.string(),
    type: v.union(v.literal("editorial"), v.literal("scout"), v.literal("system")),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    parentMissionId: v.optional(v.id("missions")), // Chaining for sub-missions
    metadata: v.optional(v.any()), // Extended diagnostic data
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    tokenUsage: v.optional(v.object({
      promptTokens: v.number(),
      completionTokens: v.number(),
      totalTokens: v.number(),
    })),
    error: v.optional(v.string()),
    resultId: v.optional(v.string()), // e.g. draftId or storyId
  }).index("by_startedAt", ["startedAt"]),

  // 5. IMAGES (Visual Assets)
  images: defineTable({
    prompt: v.string(),
    storageId: v.id("_storage"),
    missionId: v.optional(v.id("missions")), // The mission that triggered the visual generation
    created_at: v.number(),
  }).index("by_mission", ["missionId"]),

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
  // 7. WORKBENCH SESSIONS (Methodology 1: Staging Ground)
  workbench_sessions: defineTable({
    signals: v.array(v.id("signals")), // The selected signals from Zone 1
    context: v.optional(v.string()), // The user's directive/context
    status: v.union(v.literal("active"), v.literal("processing"), v.literal("completed")),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_updatedAt", ["updated_at"]),

  // 8. STORY ANGLES (Methodology 1: Zone 2 Generated Component)
  story_angles: defineTable({
    workbenchId: v.id("workbench_sessions"),
    title: v.string(), // Extracted angle, e.g., "The Economic Impact"
    summary: v.string(), // Pitch or summary
    selected: v.boolean(), // If the user clicked to advance this angle
    created_at: v.number(),
  }).index("by_workbench", ["workbenchId"]),
});
