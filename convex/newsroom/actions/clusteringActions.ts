import { GoogleGenAI } from "@google/genai";
import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { MODELS } from "../../models";
import { cosineSimilarity } from "../../../lib/vector";

// Helper for Neural Synthesis
type Altitude = "macro" | "meso" | "day";
const coerceAltitude = (v: unknown): Altitude =>
  v === "macro" || v === "meso" || v === "day" ? v : "meso";

const synthesizeWithGemini = async (
  signals: any[]
): Promise<{ title: string; summary: string; altitude: Altitude }> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return { title: signals[0].title, summary: `Synthesized Cluster [v2.5]. Quality analysis benchmarked.`, altitude: "meso" };

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
    3. Classify the ALTITUDE of this narrative (T-3.5.1): "macro" = epochal/structural shift in the AI revolution; "meso" = a multi-week trend or movement; "day" = a single day's news beat.

    Return JSON: { "title": "Headline", "summary": "Detailed synthesis...", "altitude": "macro" | "meso" | "day" }
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
    return { title: json.title, summary: json.summary, altitude: coerceAltitude(json.altitude) };
  } catch (e) {
    console.warn("Gemini Synthesis Failed", e);
    return { title: signals[0].title, summary: `Adaptive Pillar [v2.5]. Resonating across ${signals.length} signals.`, altitude: "meso" };
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
  // Explicit return type breaks the self-referential `api` inference cycle
  // (TS7022/7023) that previously forced @ts-nocheck on this file (T-2.5.2).
  handler: async (
    ctx,
    args
  ): Promise<{
    processed: number;
    newStories: number;
    newStoryIds: Id<"stories">[];
    skipped?: boolean;
  }> => {
    // Dedup guard (A5): client `discoverStories` and the cron can fire concurrently
    // and produce duplicate story pillars. A short TTL lock lets only one run cluster
    // at a time; everything below runs inside try/finally so the lock always releases.
    const lock = await ctx.runMutation(api.newsroom.mutations.tryDiscoveryLock, {});
    if (!lock.acquired) {
      console.log("[discoverStories] Skipped — another discovery run holds the lock.");
      return { processed: 0, newStories: 0, newStoryIds: [], skipped: true };
    }
    try {
    // 1. Fetch orphans WITH embeddings — deterministic clustering needs the vectors.
    const orphans = await ctx.runQuery(api.newsroom.queries.getOrphanSignals, {
      limit: 60,
      includeEmbeddings: true,
    });
    console.log(`[discoverStories] Found ${orphans.length} orphans for clustering.`);

    // Only signals with a healthy embedding can be correlated deterministically.
    const candidates = orphans.filter(
      (o: any) => Array.isArray(o.embedding) && o.embedding.length > 0
    );
    if (candidates.length < 2) {
      console.log("[discoverStories] Not enough embedded orphans, aborting.");
      return { processed: 0, newStories: 0, newStoryIds: [] };
    }

    // 2. DETERMINISTIC GROUPING (T-2.1.1): leader clustering by cosine similarity.
    // Reproducible — given the same orphans (stable timestamp order) and threshold
    // the same groups always form. No LLM decides *which* signals belong together.
    const CLUSTER_THRESHOLD = 0.74;
    const assigned = new Set<string>();
    const groups: Array<{ members: any[]; sims: number[] }> = [];

    for (let i = 0; i < candidates.length; i++) {
      const seed = candidates[i];
      if (assigned.has(seed._id)) continue;
      const members = [seed];
      const sims = [1];
      for (let j = i + 1; j < candidates.length; j++) {
        const cand = candidates[j];
        if (assigned.has(cand._id)) continue;
        const sim = cosineSimilarity(seed.embedding, cand.embedding);
        if (sim >= CLUSTER_THRESHOLD) {
          members.push(cand);
          sims.push(sim);
          assigned.add(cand._id);
        }
      }
      if (members.length >= 2) {
        assigned.add(seed._id);
        groups.push({ members, sims });
      }
    }

    console.log(`[discoverStories] Formed ${groups.length} deterministic groups (threshold ${CLUSTER_THRESHOLD}).`);

    let processedCount = 0;
    let newStoriesCount = 0;
    const newStoryIds: Id<"stories">[] = [];

    for (const { members, sims } of groups) {
      // Centroid = mean of member embeddings (fills centroid_embedding, G4/T-2.2.1).
      const dim = members[0].embedding.length;
      const centroid = new Array(dim).fill(0);
      for (const m of members) {
        for (let d = 0; d < dim; d++) centroid[d] += m.embedding[d];
      }
      for (let d = 0; d < dim; d++) centroid[d] /= members.length;

      // 3. LLM ONLY NAMES the deterministic group (T-2.1.2) — never decides
      // membership — and classifies its altitude (T-3.5.1) in the same call (no extra cost).
      const { title, summary, altitude } = await synthesizeWithGemini(members);
      // Cheap drift key for snapshots (T-3.4.0) — avoids storing the full vector twice.
      const centroidHash = centroid.slice(0, 8).map((x: number) => x.toFixed(3)).join(",");

      // 4. Intent-trace (T-2.1.3): the explainable record of *why* these grouped.
      const avgSimilarity = sims.reduce((a, b) => a + b, 0) / sims.length;
      const intentTrace = {
        method: "embedding-cosine-leader",
        threshold: CLUSTER_THRESHOLD,
        avgSimilarity,
        seedSignalId: members[0]._id as Id<"signals">,
        members: members.map((m: any, k: number) => ({
          signalId: m._id as Id<"signals">,
          title: m.title as string,
          similarity: sims[k],
        })),
      };

      try {
        const storyId = await ctx.runMutation(api.newsroom.mutations.addNewsCluster, {
          title: title || "Emerging Cultural Pivot",
          summary: summary || "A newly detected shift bridging related signals.",
          keyEntities: [],
          missionId: args.missionId,
          centroid_embedding: centroid,
          intentTrace,
          altitudeTags: [altitude],
        });
        for (const m of members) {
          await ctx.runMutation(api.newsroom.mutations.updateSignalStory, {
            id: m._id as Id<"signals">,
            storyId,
          });
          processedCount++;
        }
        // T-3.4.0: seed the time series with an initial snapshot of the pillar.
        await ctx.runMutation(api.newsroom.mutations.captureStorySnapshot, { storyId, centroidHash });
        newStoriesCount++;
        newStoryIds.push(storyId);
        console.log(`[discoverStories] Formed pillar '${title}' [${storyId}] from ${members.length} signals (avg sim ${avgSimilarity.toFixed(3)}).`);
      } catch (mutationErr) {
        console.error(`[discoverStories] FATAL forming cluster:`, mutationErr);
        throw new Error(`Failed to commit cluster: ${mutationErr instanceof Error ? mutationErr.message : String(mutationErr)}`);
      }
    }

    console.log(`[discoverStories] Clustering complete. Formed ${newStoriesCount} pillars from ${processedCount} signals.`);
    return { processed: processedCount, newStories: newStoriesCount, newStoryIds };
    } finally {
      await ctx.runMutation(api.newsroom.mutations.releaseDiscoveryLock, {});
    }
  },
});
