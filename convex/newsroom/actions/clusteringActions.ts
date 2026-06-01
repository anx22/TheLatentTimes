/* eslint-disable */
//@ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { MODELS } from "../../models";

// Helper for Neural Synthesis
const synthesizeWithGemini = async (signals: any[]): Promise<{ title: string, summary: string }> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return { title: signals[0].title, summary: `Synthesized Cluster [v2.5]. Quality analysis benchmarked.` };

  const client = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const prompt = `
    You are 'The Board', the consensus logic of an elite newsroom.
    Analyze these ${signals.length} signals and synthesize them into a single logical narrative pillar.
    
    SIGNALS:
    ${signals.map((m, i) => `${i+1}. ${m.title}: ${m.content?.slice(0, 300)}`).join('\n')}
    
    GOAL:
    1. Create a professional editorial TITLE for this pillar (max 10 words). Avoid clickbait.
    2. Create an analytical, dense SUMMARY that connects the dots (max 50 words).
    
    Return JSON: { "title": "Headline", "summary": "Detailed synthesis..." }
  `;

  try {
    const result = await client.models.generateContent({
      model: MODELS.text,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });
    
    const text = result.text;
    if (!text) throw new Error("Empty response");
    
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    return json;
  } catch (e) {
    console.warn("Gemini Synthesis Failed", e);
    return { title: signals[0].title, summary: `Adaptive Pillar [v2.5]. Resonating across ${signals.length} signals.` };
  }
};

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
    const clusterThreshold = 0.74; // Adjusted for v2.5 synthesis

    const bestMatch = results[0];
    
    if (bestMatch._score > duplicateThreshold) {
      return { isDuplicate: true, similarId: bestMatch._id as Id<"signals">, score: bestMatch._score };
    }

    if (bestMatch._score > clusterThreshold) {
      // Find what story this similar item belongs to
      const item: any = await ctx.runQuery(api.newsroom.queries.getSignal as any, { id: bestMatch._id as any });
      
      // Bonus: If it's from a higher quality source, it might become the new seed
      return { isDuplicate: false, similarId: bestMatch._id as Id<"signals">, storyId: item?.storyId, score: bestMatch._score };
    }

    return { isDuplicate: false, similarId: null };
  },
});

// 1.5 DEEP DISCOVERY: THEMATIC SYNTHESIS ENGINE
// Scans orphan items and clusters them creatively using an LLM.
export const discoverStories = action({
  args: { missionId: v.optional(v.id("missions")) },
  handler: async (ctx, args) => {
    // Dedup guard (A5): client `discoverStories` and the cron can fire concurrently
    // and produce duplicate story pillars. A short TTL lock lets only one run cluster
    // at a time; everything below runs inside try/finally so the lock always releases.
    const lock = await ctx.runMutation(api.newsroom.mutations.tryDiscoveryLock, {});
    if (!lock.acquired) {
      console.log("[discoverStories] Skipped — another discovery run holds the lock.");
      return { processed: 0, newStories: 0, newStoryIds: [], skipped: true };
    }
    try {
    // 1. Fetch Orphans with High Innovation Potential
    const orphans = await ctx.runQuery(api.newsroom.queries.getOrphanSignals, { limit: 60 });
    
    console.log(`[discoverStories] Found ${orphans.length} orphans for clustering.`);

    if (orphans.length < 2) {
      console.log("[discoverStories] Not enough orphans, aborting.");
      return { processed: 0, newStories: 0, newStoryIds: [] };
    }

    const signalsForPrompt = orphans.map(o => ({
      id: o._id,
      title: o.title,
      summary: (o.content || "").slice(0, 300)
    }));

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error("[discoverStories] FATAL: Missing API Key.");
      throw new Error("Missing Gemini API Key for Synthesis.");
    }

    const client = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const prompt = `
      You are 'The Board', the creative editorial engine of a high-fashion, high-impact publication ("Vogue meets Wired").
      Analyze these ${signalsForPrompt.length} recent news signals.
      Your task is to find non-obvious, high-level cultural or technological threads that connect seemingly disparate signals.
      Be highly creative—derive new theses and broad trends. Group them into 1 to 3 "Pillars" (clusters).
      
      SIGNALS:
      ${JSON.stringify(signalsForPrompt, null, 2)}
      
      Find up to 3 compelling thematic clusters. A cluster requires at least 2 distinct signals.
      
      CRITICAL: For 'signalIds', you MUST use the EXACT 'id' string from the SIGNALS array provided above. Do not invent IDs.
      
      Return a JSON array of clusters ONLY (no markdown formatting, no backticks, just raw JSON). Format:
      [
        {
          "title": "Editorial Headline for the Pillar (Short, punchy)",
          "summary": "Deep, analytical summary of the thesis connecting these specific signals (max 60 words)",
          "signalIds": ["<exact string id>", "<exact string id>"]
        }
      ]
    `;

    console.log(`[discoverStories] Sending ${signalsForPrompt.length} prompt instructions to Gemini 3.5 Flash...`);

    let clusters;
    let rawText = "";

    try {
      const result = await client.models.generateContent({
        model: MODELS.text,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      
      rawText = result.text || "";
      if (!rawText) throw new Error("Received empty response from Gemini.");
      
      const jsonStr = rawText.replace(/```json|```/g, '').trim();
      console.log("[discoverStories] Gemini returned payload:", jsonStr);
      clusters = JSON.parse(jsonStr);
      
    } catch (e) {
      console.error(`[discoverStories] GEMINI SYNTHESIS FAILED. Raw Output was: ${rawText}`, e);
      throw new Error(`Semantic Synthesis Failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    let processedCount = 0;
    let newStoriesCount = 0;
    const newStoryIds: Id<"stories">[] = [];
    const processedIds = new Set<string>();

    for (const cluster of clusters) {
      if (!cluster.signalIds || !Array.isArray(cluster.signalIds)) {
        console.warn(`[discoverStories] Missing or invalid signalIds array in cluster:`, cluster);
        continue;
      }
      
      // Ensure no duplicates and only valid IDs
      const validIds = cluster.signalIds.filter((id: string) => 
        typeof id === 'string' && 
        signalsForPrompt.some(s => s.id === id) &&
        !processedIds.has(id)
      );

      if (validIds.length < 2) {
        console.warn(`[discoverStories] Cluster '${cluster.title}' rejected. Only ${validIds.length} valid distinct orphans found. Payload IDs: ${cluster.signalIds}`);
        continue;
      }

      console.log(`[discoverStories] Creating News Cluster '${cluster.title}' with ${validIds.length} signals.`);

      try {
        const storyId = await ctx.runMutation(api.newsroom.mutations.addNewsCluster, {
           title: cluster.title || "Emerging Cultural Pivot",
           summary: cluster.summary || "A newly detected shift bridging disparate technological signals.",
           keyEntities: [],
           missionId: args.missionId,
        });

        for (const id of validIds) {
          await ctx.runMutation(api.newsroom.mutations.updateSignalStory, {
            id: id as Id<"signals">,
            storyId
          });
          processedIds.add(id);
          processedCount++;
        }
        newStoriesCount++;
        newStoryIds.push(storyId);
        console.log(`[discoverStories] Successfully formed News Cluster '${cluster.title}' [ID: ${storyId}]`);
      } catch (mutationErr) {
        console.error(`[discoverStories] FATAL ERRROR forming News Cluster '${cluster.title}':`, mutationErr);
        throw new Error(`Failed to commit cluster to database: ${mutationErr instanceof Error ? mutationErr.message : String(mutationErr)}`);
      }
    }

    console.log(`[discoverStories] Clustering complete. Formed ${newStoriesCount} Pillars from ${processedCount} orphans.`);
    return { processed: processedCount, newStories: newStoriesCount, newStoryIds, debugClusters: clusters, debugIds: signalsForPrompt.map(s => s.id) };
    } finally {
      await ctx.runMutation(api.newsroom.mutations.releaseDiscoveryLock, {});
    }
  },
});
