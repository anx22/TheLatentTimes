"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { GoogleGenAI } from "@google/genai";

/**
 * SERVER-SIDE GEMINI TRANSPORT
 *
 * All Gemini calls now run inside Convex actions. The API key lives in
 * the Convex deployment environment (`npx convex env set GEMINI_API_KEY ...`)
 * and never reaches the browser bundle.
 *
 * Token usage is recorded against the originating mission via
 * `recordTokenUsage`; the client tracker is gone.
 */

const PRO_COOLDOWN_MS = 60_000;
let proCooldownUntil = 0;

const getClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set in the Convex deployment. " +
        "Run `npx convex env set GEMINI_API_KEY <your-key>`."
    );
  }
  return new GoogleGenAI({ apiKey });
};

const recordUsage = async (
  ctx: any,
  missionId: string | undefined,
  usage: any
): Promise<void> => {
  if (!missionId || !usage) return;
  try {
    await ctx.runMutation(api.newsroom.mutations.recordTokenUsage, {
      missionId: missionId as any,
      prompt: usage.promptTokenCount || 0,
      completion: usage.candidatesTokenCount || 0,
      total: usage.totalTokenCount || 0,
    });
  } catch (e) {
    // Mission may not exist or have been completed — never block the
    // generation path because of telemetry bookkeeping.
    console.warn("[GEMINI] recordTokenUsage failed", e);
  }
};

/**
 * Try a sequence of models, falling back on rate limits.
 * Returns the raw GenerateContentResponse-like JSON (text + groundingMetadata).
 */
export const generateText = action({
  args: {
    model: v.string(),
    contents: v.any(),
    config: v.optional(v.any()),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args): Promise<any> => {
    const ladder = [
      args.model,
      "gemini-3-flash-preview",
      "gemini-flash-lite-latest",
    ];
    const uniqueModels = [...new Set(ladder)];
    const client = getClient();
    let lastError: any = null;

    for (const model of uniqueModels) {
      if (model.includes("pro") && Date.now() < proCooldownUntil) continue;

      const cfg = args.config ? JSON.parse(JSON.stringify(args.config)) : {};
      if (model.includes("lite") && cfg.tools) delete cfg.tools;

      try {
        const result = await client.models.generateContent({
          model,
          contents: args.contents,
          config: cfg,
        });
        await recordUsage(ctx, args.missionId, result.usageMetadata);
        // Strip non-serialisable bits, keep what callers actually consume.
        return {
          text: result.text,
          candidates: result.candidates,
          usageMetadata: result.usageMetadata,
        };
      } catch (e: any) {
        lastError = e;
        const isRateLimit =
          e.status === 429 ||
          e.code === 429 ||
          e.message?.includes("429") ||
          e.message?.includes("RESOURCE_EXHAUSTED");
        if (isRateLimit && model.includes("pro")) {
          proCooldownUntil = Date.now() + PRO_COOLDOWN_MS;
        }
        // Fall through to next model.
      }
    }

    throw lastError || new Error("All Gemini models unreachable.");
  },
});

export const generateImage = action({
  args: {
    prompt: v.string(),
    aspectRatio: v.string(),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args): Promise<string> => {
    const client = getClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: args.prompt }] },
      config: { imageConfig: { aspectRatio: args.aspectRatio as any } },
    });
    await recordUsage(ctx, args.missionId, response.usageMetadata);
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  },
});

export const editImage = action({
  args: {
    base64Image: v.string(),
    prompt: v.string(),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args): Promise<string> => {
    const client = getClient();
    const base64Data = args.base64Image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: "image/png" } },
          { text: args.prompt },
        ],
      },
    });
    await recordUsage(ctx, args.missionId, response.usageMetadata);
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  },
});

export const generateEmbedding = action({
  args: {
    text: v.string(),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (_ctx, args): Promise<number[]> => {
    const client = getClient();
    try {
      const response = await client.models.embedContent({
        model: "gemini-embedding-2",
        contents: args.text,
      });
      const values = response.embeddings?.[0]?.values;
      if (values) return values;
      throw new Error("No embedding returned");
    } catch (e: any) {
      // Fallback to embedding-001 — older but more widely available.
      const response = await client.models.embedContent({
        model: "gemini-embedding-001",
        contents: args.text,
      });
      const values = response.embeddings?.[0]?.values;
      if (values) return values;
      throw new Error("No embedding returned from fallback");
    }
  },
});

export const searchTrend = action({
  args: {
    query: v.string(),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    text: string;
    groundingUrls: { title: string; url: string }[];
    isFallback: boolean;
  }> => {
    const client = getClient();
    try {
      const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: args.query,
        config: { tools: [{ googleSearch: {} }] },
      });
      await recordUsage(ctx, args.missionId, response.usageMetadata);
      const text = response.text || "No results found.";
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingUrls = chunks
        .map((c: any) =>
          c.web ? { title: c.web.title, url: c.web.uri } : null
        )
        .filter((u: any) => u !== null) as { title: string; url: string }[];
      return { text, groundingUrls, isFallback: false };
    } catch (e) {
      // Fallback: ask the model to summarise from internal knowledge.
      const fallback = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents:
          `You are acting as a search engine. The user queried: "${args.query}". ` +
          `Since live search is unavailable, provide a detailed summary of what you know ` +
          `about this topic from your training data. Be specific and technical.`,
      });
      await recordUsage(ctx, args.missionId, fallback.usageMetadata);
      return {
        text: fallback.text || "Search unavailable and fallback failed.",
        groundingUrls: [],
        isFallback: true,
      };
    }
  },
});
