import { Type } from "@google/genai";
import type { AspectRatio, SearchResult } from "../../types";
import { MODELS } from "../../constants";

/**
 * TRANSPORT-AGNOSTIC MODEL CLIENT ("one brain" — rewrite T-1.1.1, audit A1/A3)
 *
 * This is the single seam that lets the editorial agent layer run in BOTH
 * runtimes without duplication:
 *   - the browser (client), where `services/gemini.ts` injects a transport that
 *     proxies to the gated Convex actions (with a session token), and
 *   - the Convex autonomous cron, which injects a server-side transport that
 *     calls the model directly (no session gate — it is internal/trusted).
 *
 * The agent functions (`services/agents/*`) import their model helpers from HERE
 * and never touch a concrete transport, React, or `convex/react`. That keeps them
 * pure and bundleable by Convex, so the cron can reuse the exact same logic
 * instead of re-implementing the Scout→Cluster→Debate→Columnist chain inline.
 */

// Re-export the schema enum so agents keep building responseSchemas with
// `Type.STRING`, `Type.OBJECT`, etc. (plain enum — safe in any runtime).
export { Type };

// --- Injected transport (set once per runtime) ---
export interface ModelTransport {
  generateText(params: {
    model: string;
    contents: any;
    config?: any;
    missionId?: string;
  }): Promise<{ text?: string; candidates?: any[]; usageMetadata?: any }>;
  generateImage(
    prompt: string,
    aspectRatio: AspectRatio,
    missionId?: string
  ): Promise<string>;
  editImage(
    base64Image: string,
    prompt: string,
    missionId?: string
  ): Promise<string>;
  searchTrend(
    query: string,
    missionId?: string
  ): Promise<SearchResult & { isFallback?: boolean }>;
  generateEmbedding(text: string, missionId?: string): Promise<number[]>;
}

let transport: ModelTransport | null = null;

/** Wire the concrete transport. Client: at boot (`services/gemini.ts`). Server: inside the Convex action. */
export const setModelTransport = (impl: ModelTransport): void => {
  transport = impl;
};

const active = (): ModelTransport => {
  if (!transport) {
    throw new Error(
      "Model transport not initialised. Call setModelTransport(...) — on the client " +
        "this happens in services/gemini.ts at boot; on the server, inside the Convex action."
    );
  }
  return transport;
};

// --- Robust JSON parser (used by callJsonAgent and a few agents directly) ---
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

// --- Agent-facing helpers (delegate to the injected transport) ---
export const safeGenerateContent = (params: {
  model: string;
  contents: any;
  config?: any;
  missionId?: string;
}): Promise<{ text?: string; candidates?: any[]; usageMetadata?: any }> =>
  active().generateText(params);

export const callJsonAgent = async <T>(
  prompt: string,
  schema: any,
  fallback: T,
  missionId?: string
): Promise<T> => {
  const response = await active().generateText({
    model: MODELS.text,
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema },
    missionId,
  });
  return cleanAndParseJSON(response.text) || fallback;
};

export const generateImage = (
  prompt: string,
  aspectRatio: AspectRatio,
  missionId?: string
): Promise<string> => active().generateImage(prompt, aspectRatio, missionId);

export const editImage = (
  base64Image: string,
  prompt: string,
  missionId?: string
): Promise<string> => active().editImage(base64Image, prompt, missionId);

export const searchTrend = (
  query: string,
  missionId?: string
): Promise<SearchResult & { isFallback?: boolean }> =>
  active().searchTrend(query, missionId);

export const generateEmbedding = (
  text: string,
  missionId?: string
): Promise<number[]> => active().generateEmbedding(text, missionId);

// --- Schema registry: hard-coded schemas to prevent hallucination ---
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
