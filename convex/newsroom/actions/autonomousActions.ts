/* eslint-disable */
//@ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { MODELS } from "../../models";
import { assertEmbeddingDim } from "../../../lib/vector";
import {
  setModelTransport,
  generateEmbedding,
  type ModelTransport,
} from "../../../services/agents/modelClient";
import { EditorialOrchestrator } from "../../../services/editorial/EditorialOrchestrator";

/**
 * AUTONOMOUS SWEEP — now runs on the SHARED agent layer ("one brain", T-1.1.2, A1/A3).
 *
 * Previously this file re-implemented the Scout→Cluster→Debate→Columnist chain
 * inline with its own GoogleGenAI calls and simplified prompts — a second,
 * diverging "truth". It now injects a server-side ModelTransport and drives the
 * SAME agents/orchestrator the client uses (`services/agents` + EditorialOrchestrator),
 * so prompts, schemas and structured `DraftBlock[]` output stay in one place.
 * Embeddings go through the shared `generateEmbedding` → the T-1.0.3 dimension
 * guard now also protects the cron's writes.
 *
 * The server transport calls Gemini directly (no session gate — this is the
 * internal, trusted loop) and records token usage against the run's mission.
 * NOTE: the agent layer reads the transport from a module-level singleton; the
 * 3×/day crons don't overlap, so per-invocation injection is safe here.
 */
const makeServerTransport = (ctx: any): ModelTransport => {
  const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set in the Convex deployment.");
    return new GoogleGenAI({ apiKey });
  };

  const recordUsage = async (missionId: string | undefined, usage: any) => {
    if (!missionId || !usage) return;
    try {
      await ctx.runMutation(api.newsroom.mutations.recordTokenUsage, {
        missionId,
        prompt: usage.promptTokenCount || 0,
        completion: usage.candidatesTokenCount || 0,
        total: usage.totalTokenCount || 0,
      });
    } catch (e) {
      console.warn("[CRON] recordTokenUsage failed", e);
    }
  };

  return {
    generateText: async (params) => {
      const client = getClient();
      const ladder = [...new Set([params.model, MODELS.text, MODELS.textLite])];
      let lastError: any = null;
      for (const model of ladder) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          await recordUsage(params.missionId, (response as any).usageMetadata);
          return {
            text: response.text,
            candidates: (response as any).candidates,
            usageMetadata: (response as any).usageMetadata,
          };
        } catch (e: any) {
          lastError = e;
        }
      }
      throw lastError || new Error("generateText failed across model ladder");
    },
    generateEmbedding: async (text, _missionId) => {
      const client = getClient();
      const response = await client.models.embedContent({
        model: MODELS.embed,
        contents: text,
      });
      const values = response.embeddings?.[0]?.values;
      if (!values) throw new Error("No embedding returned");
      return assertEmbeddingDim(values);
    },
    // The autonomous editorial path (debate → columnist → editor) only needs text
    // + embeddings. Search/image are client-only for now; fail loudly if reached.
    searchTrend: async () => {
      throw new Error("searchTrend is not wired for the autonomous cron transport.");
    },
    generateImage: async () => {
      throw new Error("generateImage is not wired for the autonomous cron transport.");
    },
    editImage: async () => {
      throw new Error("editImage is not wired for the autonomous cron transport.");
    },
  };
};

// 2.0 INTEGRATIVE AUTONOMOUS SWEEP ACTION
export const runScheduledAutonomousRun = action({
  args: {},
  handler: async (ctx) => {
    // A. Honour the Autonomy super-switch.
    const state: any = await ctx.runQuery(
      api.newsroom.queries.getNewsroomStateByKey,
      { key: "current" }
    );
    if (state?.activeMethodology !== "autonomous") {
      console.log("[SYSTEM] Background sweep skipped: Autonomy methodology is off.");
      return "skipped";
    }

    console.log("[SYSTEM] Global Autonomy Core activated. Commencing newsroom pipeline...");

    // Wire the shared agent layer to a server-side transport for this run.
    setModelTransport(makeServerTransport(ctx));

    const missionId = await ctx.runMutation(api.newsroom.mutations.startMission, {
      topic: "Autonomous Background Sync",
      type: "system",
      metadata: { source: "circadian-cron" },
    });

    const log = (agentName: string, message: string, step: string, level: string) =>
      ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName,
        message,
        step,
        level,
        missionId,
      });

    await log("SYSTEM", "Circadian Background Schedule Triggered: Autonomous Sweep Initiated.", "NEWS_TERMINAL", "info");

    try {
      // 1. SCOUT — signal ingestion.
      const sources: any[] = await ctx.runQuery(api.newsroom.queries.getSources, {});
      const activeSources = (sources || []).filter((s) => s.isActive);
      await log("The Scout", `Scanning ${activeSources.length} active intelligence sources...`, "NEWS_TERMINAL", "action");

      const limitPerSource = 15;
      const flatSignals: any[] = [];
      for (const source of activeSources) {
        try {
          let rawSignals: any[] = [];
          if (source.type === "rss") {
            rawSignals = await ctx.runAction(api.newsroom.actions.fetchRss, { url: source.url });
          } else if (
            source.type === "api" &&
            (source.notes?.includes("github") || source.url.includes("github") || source.id === "github-trending")
          ) {
            rawSignals = await ctx.runAction(api.newsroom.actions.fetchGitHub, { limit: limitPerSource });
          }
          if (Array.isArray(rawSignals)) {
            flatSignals.push(
              ...rawSignals.map((s) => ({
                ...s,
                source: source.name,
                sourceId: source._id,
                sourcePack: source.pack,
                sourceTrustTier: source.trustTier,
                fetchedAt: Date.now(),
                missionId,
              }))
            );
          }
        } catch (e: any) {
          console.error(`[Scout] Scan failed for ${source.name}:`, e.message);
        }
      }
      await log("The Scout", `Discovered ${flatSignals.length} intelligence items. Re-ordering pool.`, "NEWS_TERMINAL", "info");

      // Register non-duplicate items — embeddings via the SHARED transport (dim-guarded).
      let registeredCount = 0;
      for (const item of flatSignals) {
        let embedding: number[] = [];
        try {
          embedding = await generateEmbedding(`${item.title} ${item.content || ""}`, missionId);
        } catch (e) {
          console.log("[Scout] Embedding skipped for:", item.title, e);
        }

        let isDuplicate = false;
        let storyId: any = undefined;
        if (embedding.length > 0) {
          const sim = await ctx.runAction(api.newsroom.actions.checkSemanticSimilarity, {
            embedding,
            title: item.title,
          });
          isDuplicate = sim.isDuplicate;
          storyId = sim.storyId;
        }

        if (!isDuplicate) {
          await ctx.runMutation(api.newsroom.mutations.addSignal, {
            title: item.title,
            source: item.source,
            sourceType: item.sourceType || "rss",
            sourceId: item.sourceId,
            sourcePack: item.sourcePack,
            sourceTrustTier: item.sourceTrustTier,
            url: item.url,
            content: item.content,
            status: "new",
            storyId,
            embedding: embedding.length > 0 ? embedding : undefined,
            missionId,
            qualityScore: 70,
            innovation_score: 75,
          });
          registeredCount++;
        }
      }
      await log("The Scout", `Pool stabilized: ${registeredCount} raw signals committed.`, "NEWS_TERMINAL", "success");

      // 2. BOARD — strategic narrative clustering (existing explainable-ish action).
      await log("THE BOARD", "Triggering story discovery (clustering)...", "NEWS_TERMINAL", "action");
      const discovery: any = await ctx.runAction(api.newsroom.actions.discoverStories, { missionId });
      const newStoryIds = discovery?.newStoryIds || [];
      await log("THE BOARD", `${discovery?.newStories || 0} new narrative pillars detected.`, "NEWS_TERMINAL", "success");

      // 3. EDITORIAL — drive the SHARED agents (debate → columnist → editor).
      if (newStoryIds.length > 0) {
        const targetStoryId = newStoryIds[0];
        const story: any = await ctx.runQuery(api.newsroom.queries.getStory, { id: targetStoryId });

        if (story) {
          await log("SYSTEM", `Selected narrative focus: "${story.title}"`, "EDITORIAL_BOARD", "success");

          const orchestrator = new EditorialOrchestrator({ missionId });

          await log("THE BOARD", `Convening editorial board on: "${story.title}"`, "EDITORIAL_BOARD", "action");
          const { angles } = await orchestrator.conductDebate(story.title, story.summary || "", missionId);
          const lens = angles?.[0]?.angle || angles?.[0]?.persona || "Tech-forward Analysis";
          await log("THE BOARD", `Consensus lens: "${lens}". Dispatching to Columnist.`, "EDITORIAL_BOARD", "success");

          await log("THE COLUMNIST", `Drafting structured prose for "${story.title}"...`, "EDITORIAL_BOARD", "action");
          const { article } = await orchestrator.produceDraft(story.title, story.summary || "", lens, 400, missionId);

          // Save as a 'review' draft → lands in the editorial Freigabe-Queue (human-gated publish).
          await ctx.runMutation(api.newsroom.mutations.saveDraft, {
            storyId: targetStoryId,
            missionId,
            headline: article.headline || story.title,
            deck: article.deck || "A strategic assessment of emerging shifts.",
            body: article.body || "",
            blocks: article.blocks,
            tags: [...(article.tags || []), lens, "Autonomous"],
            suggested_visual_prompt:
              article.suggested_visual_prompt ||
              `${article.headline || story.title}, elegant high-contrast editorial photography, swiss-minimalism`,
            status: "review",
          });

          await log("SYSTEM", `Draft "${(article.headline || story.title).slice(0, 35)}..." awaiting approval in the Publishing Room.`, "EDITORIAL_BOARD", "success");
        }
      }

      await ctx.runMutation(api.newsroom.mutations.completeMission, { missionId });
    } catch (err: any) {
      console.error("[SYSTEM] Scheduled cycle failure:", err);
      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "SYSTEM",
        message: `Autonomous cycle exception: ${err.message}`,
        step: "NEWS_TERMINAL",
        level: "error",
        missionId,
      });
      await ctx.runMutation(api.newsroom.mutations.failMission, { missionId, error: err.message });
    }

    return "completed";
  },
});
