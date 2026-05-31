/* eslint-disable */
//@ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

// 2.0 INTEGRATIVE AUTONOMOUS SWEEP ACTION
// Replicates the entire multi-agent, multistep pipeline server-side for background run cycles.
export const runScheduledAutonomousRun = action({
  args: {},
  handler: async (ctx) => {
    // A. Read persisted global newsroom state to see if Autonomy methodology is enabled.
    // If not, we skip the cron execution silently in accordance with the user's super switch directive.
    const state: any = await ctx.runQuery(api.newsroom.queries.getNewsroomStateByKey, { key: "current" });
    const isAutonomous = state?.activeMethodology === "autonomous";

    if (!isAutonomous) {
      console.log("[SYSTEM] Background sweep skipped: Engine Autonomy methodology is currently turned off.");
      return "skipped";
    }

    console.log("[SYSTEM] Global Autonomy Core activated. Commencing newsroom pipeline execution...");

    // B. Start background systems tracking mission
    const missionId = await ctx.runMutation(api.newsroom.mutations.startMission, {
      topic: "Autonomous Background Sync",
      type: "system",
      metadata: { source: "circadian-cron" }
    });

    await ctx.runMutation(api.newsroom.mutations.logMessage, {
      agentName: "SYSTEM",
      message: "Circadian Background Schedule Triggered: Autonomous Sweep Initiated.",
      step: "NEWS_TERMINAL",
      level: "info",
      missionId
    });

    try {
      // 1. Scout Signal Ingestion
      const sources: any[] = await ctx.runQuery(api.newsroom.queries.getSources, {});
      const activeSources = (sources || []).filter(s => s.isActive);

      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "The Scout",
        message: `Scanning ${activeSources.length} active global intelligence boundaries...`,
        step: "NEWS_TERMINAL",
        level: "action",
        missionId
      });

      const limitPerSource = 15;
      const flatSignals: any[] = [];
      for (const source of activeSources) {
        try {
          let rawSignals: any[] = [];
          if (source.type === 'rss') {
            rawSignals = await ctx.runAction(api.newsroom.actions.fetchRss, { url: source.url });
          } else if (source.type === 'api' && (source.notes?.includes('github') || source.url.includes('github') || source.id === 'github-trending')) {
            rawSignals = await ctx.runAction(api.newsroom.actions.fetchGitHub, { limit: limitPerSource });
          }

          if (Array.isArray(rawSignals)) {
            const enriched = rawSignals.map(s => ({
              ...s,
              source: source.name,
              sourceId: source._id,
              sourcePack: source.pack,
              sourceTrustTier: source.trustTier,
              fetchedAt: Date.now(),
              missionId
            }));
            flatSignals.push(...enriched);
          }
        } catch (e: any) {
          console.error(`[Scout] Scan failed for target node ${source.name}:`, e.message);
        }
      }

      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "The Scout",
        message: `Discovered ${flatSignals.length} intelligence items. Re-ordering pool.`,
        step: "NEWS_TERMINAL",
        level: "info",
        missionId
      });

      // Register non-duplicate items
      let registeredCount = 0;
      for (const item of flatSignals) {
        let embedding: number[] = [];
        try {
          const textToEmbed = `${item.title} ${item.content || ''}`;
          // Generate embedding using server key
          const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
          if (apiKey) {
            const client = new GoogleGenAI({ 
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });
            const response = await client.models.embedContent({
              model: 'gemini-embedding-2',
              contents: textToEmbed,
            });
            if (response.embeddings && response.embeddings.length > 0) {
              embedding = response.embeddings[0].values || [];
            }
          }
        } catch (e) {
          console.log("[Scout] Warning generating embedding for item title:", item.title, e);
        }

        // Semantic redundancy check
        let isDuplicate = false;
        let storyId: any = undefined;
        if (embedding.length > 0) {
          const simResult = await ctx.runAction(api.newsroom.actions.checkSemanticSimilarity, {
            embedding,
            title: item.title
          });
          isDuplicate = simResult.isDuplicate;
          storyId = simResult.storyId;
        }

        if (!isDuplicate) {
          await ctx.runMutation(api.newsroom.mutations.addSignal, {
            title: item.title,
            source: item.source,
            sourceType: item.sourceType || 'rss',
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
            innovation_score: 75
          });
          registeredCount++;
        }
      }

      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "The Scout",
        message: `Pool Stabilized: ${registeredCount} pristine raw signals committed to bullpen database.`,
        step: "NEWS_TERMINAL",
        level: "success",
        missionId
      });

      // 2. Discover Strategic Narrative Clusters
      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "THE BOARD",
        message: "Triggering Topological Resonance Engine (Discovery Phase)...",
        step: "NEWS_TERMINAL",
        level: "action",
        missionId
      });

      const discovery: any = await ctx.runAction(api.newsroom.actions.discoverStories, { missionId });
      const newStoryCount = discovery?.newStories || 0;
      const newStoryIds = discovery?.newStoryIds || [];

      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "THE BOARD",
        message: `Resonance Stable: ${newStoryCount} newly crystallized storytelling pillars detected in current cycle.`,
        step: "NEWS_TERMINAL",
        level: "success",
        missionId
      });

      // 3. Editorial debate & columnist compilation
      if (newStoryCount > 0 && newStoryIds.length > 0) {
        const targetStoryId = newStoryIds[0];
        
        // Retrieve newly created story cluster
        const clusters: any[] = await ctx.runQuery(api.newsroom.queries.getNewsClusters, {});
        const story = clusters.find(c => c._id === targetStoryId);
        
        if (story) {
          await ctx.runMutation(api.newsroom.mutations.logMessage, {
            agentName: "SYSTEM",
            message: `Selected high-value narrative focus: "${story.title}"`,
            step: "EDITORIAL_BOARD",
            level: "success",
            missionId
          });

          await ctx.runMutation(api.newsroom.mutations.logMessage, {
            agentName: "THE BOARD",
            message: `Debating intellectual angles and storytelling lens: "${story.title}"`,
            step: "EDITORIAL_BOARD",
            level: "action",
            missionId
          });

          const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
          if (apiKey) {
            const client = new GoogleGenAI({ 
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });
            
            // Fast editorial consensus debate sim
            const debatePrompt = `
              Conducting board consensus on: "${story.title}". Context: "${story.summary}".
              Analyze this event from architectural, geopolitical, and technical shifts.
              Provide a selected storytelling lens (e.g., Tech-forward, Geopolitical, Creative Critique) and draft angle pitch.
              Return raw JSON: {
                "decision": "compelling narrative angle",
                "lens": "Tech-forward Analysis",
                "pitch": "draft pitch explanation"
              }
            `;
            
            const debateResult = await client.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [{ role: 'user', parts: [{ text: debatePrompt }] }],
              config: { responseMimeType: "application/json" }
            });

            const parsedDebate = JSON.parse(debateResult.text || '{}');
            const selectedLens = parsedDebate.lens || 'Tech-forward Analysis';

            await ctx.runMutation(api.newsroom.mutations.logMessage, {
              agentName: "THE BOARD",
              message: `Consensus achieved: Adopting [${selectedLens}] lens. Dispatching draft assignment to Columnist.`,
              step: "EDITORIAL_BOARD",
              level: "success",
              missionId
            });

            await ctx.runMutation(api.newsroom.mutations.logMessage, {
              agentName: "THE COLUMNIST",
              message: `Drafting highly detailed prose for "${story.title}" under "${selectedLens}" lens.`,
              step: "EDITORIAL_BOARD",
              level: "action",
              missionId
            });

            const columnistPrompt = `
              You are 'The Columnist'. Write a stunning, elite, narrative news digest.
              TITLE: "${story.title}"
              SUMMARY: "${story.summary}"
              LENS: "${selectedLens}"
              
              Rule: Write like an elite editor ("Wired meets Vogue") with sophisticated prose, rich context, and zero fluff.
              Return exactly a JSON object: {
                "headline": "${story.title}",
                "deck": "A sophisticated sub-headline.",
                "body": "Write a massive, 400-word spectacular narrative story. Incorporate analytical critique and architectural insights."
              }
            `;

            const columnistResult = await client.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [{ role: 'user', parts: [{ text: columnistPrompt }] }],
              config: { responseMimeType: "application/json" }
            });

            const parsedColumnist = JSON.parse(columnistResult.text || '{}');
            
            const newHeadline = parsedColumnist.headline || story.title;
            const newDeck = parsedColumnist.deck || "A strategic assessment of emerging global trends.";
            const newBody = parsedColumnist.body || "Completed adaptive autonomous draft dispatch.";

            // Save the draft with status 'review' so it is visible inside the Publish Room awaiting editorial approval!
            await ctx.runMutation(api.newsroom.mutations.saveDraft, {
              storyId: targetStoryId,
              missionId,
              headline: newHeadline,
              deck: newDeck,
              body: newBody,
              status: "review",
              blocks: [
                {
                  id: "b1",
                  type: "text",
                  sentences: [{ id: "b1-s1", text: newBody }]
                }
              ],
              tags: [selectedLens, "Autonomous"],
              suggested_visual_prompt: `${newHeadline}, elegant high-contrast editorial photography, swiss-minimalism style`
            });

            await ctx.runMutation(api.newsroom.mutations.logMessage, {
              agentName: "SYSTEM",
              message: `Circated Draft successfully committed! "${newHeadline.slice(0,35)}..." is awaiting approval in the Publishing Room.`,
              step: "EDITORIAL_BOARD",
              level: "success",
              missionId
            });
          }
        }
      }

      // completeMission only accepts { missionId, resultId? }. Token totals are
      // accumulated separately via recordTokenUsage, so passing a tokenUsage arg
      // here triggers a Convex argument-validation error and fails the mission at
      // its final step every run. Keep the call to the validated signature.
      await ctx.runMutation(api.newsroom.mutations.completeMission, {
        missionId,
      });

    } catch (err: any) {
      console.error("[SYSTEM] Scheduled Automatic Cycle Failure:", err);
      await ctx.runMutation(api.newsroom.mutations.logMessage, {
        agentName: "SYSTEM",
        message: `Autonomous scheduled cycle exception: ${err.message}`,
        step: "NEWS_TERMINAL",
        level: "error",
        missionId
      });
      await ctx.runMutation(api.newsroom.mutations.failMission, {
        missionId,
        error: err.message
      });
    }

    return "completed";
  }
});
