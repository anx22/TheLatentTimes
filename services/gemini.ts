import { Type } from "@google/genai";
import { ConvexReactClient } from "convex/react";
import { AspectRatio, SearchResult } from "../types";
import { api } from "../convex/_generated/api";
import { assertEmbeddingDim } from "../lib/vector";

/**
 * CLIENT-SIDE GEMINI TRANSPORT
 *
 * This file used to instantiate the Gemini SDK directly in the browser.
 * It now only proxies to Convex actions in `convex/gemini.ts`, so the
 * API key never reaches the bundle.
 *
 * The function signatures match the old API so the agent files do not
 * need to change.
 *
 * NOTE: A subset of agents (introduced by the AI Studio refactor) still
 * import `GoogleGenAI` directly with `process.env.GEMINI_API_KEY`. Those
 * bypass this transport and re-leak the key into the bundle. They should
 * be migrated to call the helpers here — tracked as Phase 2b.
 */

// Re-export Type so agents can keep building responseSchemas with
// `Type.STRING`, `Type.OBJECT`, etc. (Type is a plain enum — safe on client.)
export { Type };

// --- TRANSPORT INJECTION (set once at boot from index.tsx) ---
let convex: ConvexReactClient | null = null;
export const setGeminiTransport = (client: ConvexReactClient) => {
  convex = client;
};

const transport = (): ConvexReactClient => {
  if (!convex) {
    throw new Error(
      "Gemini transport not initialised. Call setGeminiTransport(convexClient) at boot."
    );
  }
  return convex;
};

// --- HELPER: ROBUST JSON PARSER ---
export const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    try {
      const clean = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      try {
        const firstOpen = text.search(/[{[]/);
        const lastClose = text.search(/[}\]](?!.*[}\]])/);
        if (firstOpen !== -1 && lastClose !== -1) {
          return JSON.parse(text.substring(firstOpen, lastClose + 1));
        }
      } catch {
        console.warn("[Parser] JSON Parse Failed", text?.slice(0, 100));
      }
      return {};
    }
  }
};

// --- TEXT GENERATION (proxies to convex/gemini.ts > generateText) ---
export const safeGenerateContent = async (params: {
  model: string;
  contents: any;
  config?: any;
  missionId?: string;
}): Promise<{ text?: string; candidates?: any[]; usageMetadata?: any }> => {
  return await transport().action(api.gemini.generateText, {
    model: params.model,
    contents: params.contents,
    config: params.config,
    missionId: params.missionId as any,
  });
};

// --- JSON AGENT CALLER ---
export const callJsonAgent = async <T>(
  prompt: string,
  schema: any,
  fallback: T,
  missionId?: string
): Promise<T> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema },
    missionId,
  });
  return cleanAndParseJSON(response.text) || fallback;
};

// --- SCHEMA REGISTRY: HARD-CODED SCHEMAS TO PREVENT HALLUCINATION ---
export const Schemas = {
  Columnist: {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      deck: { type: Type.STRING },
      blocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            sentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["id", "text"],
              },
            },
            status: { type: Type.STRING },
          },
          required: ["id", "type", "sentences", "status"],
        },
      },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggested_visual_prompt: { type: Type.STRING },
    },
    required: ["headline", "deck", "blocks", "tags", "suggested_visual_prompt"],
  },
  Editor: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        blockId: { type: Type.STRING },
        sentenceId: { type: Type.STRING },
        persona: { type: Type.STRING },
        type: { type: Type.STRING },
        comment: { type: Type.STRING },
        suggestion: { type: Type.STRING },
      },
      required: ["id", "blockId", "type", "comment"],
    },
  },
  Debate: {
    type: Type.OBJECT,
    properties: {
      transcript: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            message: { type: Type.STRING },
          },
          required: ["persona", "message"],
        },
      },
      angles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            persona: { type: Type.STRING },
            headline: { type: Type.STRING },
            headlineOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            angle: { type: Type.STRING },
          },
          required: ["id", "persona", "headline", "headlineOptions", "angle"],
        },
      },
    },
    required: ["transcript", "angles"],
  },
  Consensus: {
    type: Type.OBJECT,
    properties: {
      consensus: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
    },
    required: ["consensus"],
  },
};

// --- IMAGE GENERATION ---
export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  missionId?: string
): Promise<string> => {
  return await transport().action(api.gemini.generateImage, {
    prompt,
    aspectRatio,
    missionId: missionId as any,
  });
};

// --- IMAGE EDITING ---
export const editImage = async (
  base64Image: string,
  prompt: string,
  missionId?: string
): Promise<string> => {
  return await transport().action(api.gemini.editImage, {
    base64Image,
    prompt,
    missionId: missionId as any,
  });
};

// --- SEARCH GROUNDING ---
export const searchTrend = async (
  query: string,
  missionId?: string
): Promise<SearchResult & { isFallback?: boolean }> => {
  return await transport().action(api.gemini.searchTrend, {
    query,
    missionId: missionId as any,
  });
};

// --- EMBEDDING ---
export const generateEmbedding = async (
  text: string,
  missionId?: string
): Promise<number[]> => {
  const values: number[] = await transport().action(
    api.gemini.generateEmbedding,
    { text, missionId: missionId as any }
  );
  assertEmbeddingDim(values);
  return values;
};
