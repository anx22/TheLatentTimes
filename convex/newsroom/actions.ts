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
  handler: async (ctx, args): Promise<{ isDuplicate: boolean, similarId: Id<"signals"> | null, storyId?: Id<"stories">, score?: number }> => {
    // Search for similar items in the last 48 hours
    const results = await ctx.vectorSearch("signals", "by_embedding", {
      vector: args.embedding,
      limit: 5,
    });

    if (results.length === 0) return { isDuplicate: false, similarId: null };

    // Threshold for "This is exactly the same news"
    // and "This is about the same topic (Cluster candidate)"
    const duplicateThreshold = 0.96; 
    const clusterThreshold = 0.78;

    const bestMatch = results[0];
    
    if (bestMatch._score > duplicateThreshold) {
      return { isDuplicate: true, similarId: bestMatch._id as Id<"signals">, score: bestMatch._score };
    }

    if (bestMatch._score > clusterThreshold) {
      // Find what story this similar item belongs to
      const item: any = await ctx.runQuery(api.newsroom.queries.getSignal, { id: bestMatch._id as Id<"signals"> });
      return { isDuplicate: false, similarId: bestMatch._id as Id<"signals">, storyId: item?.storyId, score: bestMatch._score };
    }

    return { isDuplicate: false, similarId: null };
  },
});

// 1.5 DEEP DISCOVERY: TOPOLOGICAL RESONANCE ENGINE
// Scans orphan items and clusters them using Density-Based Linkage and Cross-Source Bias.
export const discoverStories = action({
  args: { missionId: v.optional(v.id("missions")) },
  handler: async (ctx, args) => {
    // 1. Fetch Orphans with High Innovation Potential
    const orphans = await ctx.runQuery(api.newsroom.queries.getOrphanSignals, { limit: 50 });
    if (orphans.length === 0) return { processed: 0, newStories: 0 };

    let processedCount = 0;
    let newStoriesCount = 0;
    const processedIds = new Set<string>();

    // 2. Sort by Innovation Score to find "Seeds"
    const seeds = [...orphans].sort((a, b) => (b.innovation_score || 0) - (a.innovation_score || 0));

    for (const seed of seeds) {
      if (processedIds.has(seed._id)) continue;
      if (!seed.embedding || seed.embedding.length === 0) continue;

      // 3. Find Semantic Neighborhood
      const neighbors = await ctx.vectorSearch("signals", "by_embedding", {
        vector: seed.embedding,
        limit: 15,
      });

      // Filter for unprocessed orphans in the neighborhood
      const relevantOrphans = (neighbors as any[]).filter(n => 
        n._id !== seed._id && 
        !processedIds.has(n._id) && 
        orphans.some(o => o._id === n._id)
      );

      // 4. Calculate Density and Cross-Source Resonance
      const resonanceThreshold = 0.75;
      const coreCluster = relevantOrphans.filter(n => n._score > resonanceThreshold);

      if (coreCluster.length >= 1) {
        // High Resonance Cluster Detected (Seed + Neighbors)
        const clusterMembers = [seed, ...coreCluster.map(c => orphans.find(o => o._id === c._id)!)];
        
        // Multi-Source Check
        const sources = new Set(clusterMembers.map(m => m.sourceType));
        const hasCrossResonance = sources.size > 1;

        // 5. Synthesis: Calculate Centroid Embedding
        const embedDim = seed.embedding.length;
        const centroid = new Array(embedDim).fill(0);
        clusterMembers.forEach(m => {
          if (m.embedding) m.embedding.forEach((v, i) => centroid[i] += v);
        });
        const normalizedCentroid = centroid.map(v => v / clusterMembers.length);

        // 6. Persistence: Create a new Narrative Pillar
        const storyId = await ctx.runMutation(api.newsroom.mutations.addNewsCluster, {
           title: seed.title,
           summary: `Topological resonance detected between ${clusterMembers.length} signals. ${hasCrossResonance ? 'Cross-source verification confirmed.' : 'Niche signal emerging.'}`,
           keyEntities: [],
           missionId: args.missionId,
           centroid_embedding: normalizedCentroid
        });

        // Link all members
        for (const member of clusterMembers) {
          await ctx.runMutation(api.newsroom.mutations.updateSignalStory, {
            id: member._id,
            storyId
          });
          processedIds.add(member._id);
          processedCount++;
        }
        newStoriesCount++;
      } else {
        // 7. Individual Linkage: Does this outlier belong to an EXISTING Pillar?
        const strongCandidate = neighbors.find(n => n._id !== seed._id && n._score > 0.80); // Higher bar for adding to existing
        if (strongCandidate) {
          const matchedItem: any = await ctx.runQuery(api.newsroom.queries.getSignal, { id: strongCandidate._id as Id<"signals"> });
          if (matchedItem?.storyId) {
            await ctx.runMutation(api.newsroom.mutations.updateSignalStory, {
              id: seed._id,
              storyId: matchedItem.storyId
            });
          }
        }
        
        // Either it linked to an existing, or it remains an orphan. Either way, we processed it this run.
        processedIds.add(seed._id);
        processedCount++;
      }
    }

    return { processed: processedCount, newStories: newStoriesCount };
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
