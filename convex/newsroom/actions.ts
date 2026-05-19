import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

/**
 * CONVEX ACTIONS (SERVER-SIDE WITH SEARCH & EXTERNAL CALLS)
 */

// 1. SEMANTIC DEDUPLICATION & CLUSTERING
// This action checks if a new signal is semantically similar to existing ones.
export const checkSemanticSimilarity = action({
  args: {
    embedding: v.array(v.float64()),
    title: v.string(),
  },
  handler: async (ctx, args): Promise<{ isDuplicate: boolean, similarId: Id<"ticker_items"> | null, storyId?: Id<"stories">, score?: number }> => {
    // Search for similar items in the last 48 hours
    const results = await ctx.vectorSearch("ticker_items", "by_embedding", {
      vector: args.embedding,
      limit: 5,
    });

    if (results.length === 0) return { isDuplicate: false, similarId: null };

    // Threshold for "This is exactly the same news"
    // and "This is about the same topic (Cluster candidate)"
    const duplicateThreshold = 0.96; 
    const clusterThreshold = 0.85;

    const bestMatch = results[0];
    
    if (bestMatch._score > duplicateThreshold) {
      return { isDuplicate: true, similarId: bestMatch._id as Id<"ticker_items">, score: bestMatch._score };
    }

    if (bestMatch._score > clusterThreshold) {
      // Find what story this similar item belongs to
      const item: any = await ctx.runQuery(api.newsroom.queries.getTickerItem, { id: bestMatch._id as Id<"ticker_items"> });
      return { isDuplicate: false, similarId: bestMatch._id as Id<"ticker_items">, storyId: item?.storyId, score: bestMatch._score };
    }

    return { isDuplicate: false, similarId: null };
  },
});

export const fetchRss = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(args.url);
    const xml = await response.text();
    return xml;
  },
});
