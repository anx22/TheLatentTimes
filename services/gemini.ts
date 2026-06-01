import { ConvexReactClient } from "convex/react";
import { AspectRatio } from "../types";
import { api } from "../convex/_generated/api";
import { assertEmbeddingDim } from "../lib/vector";
import { setModelTransport, type ModelTransport } from "./agents/modelClient";

/**
 * CLIENT-SIDE GEMINI TRANSPORT (adapter)
 *
 * The pure, transport-agnostic agent helpers now live in
 * `services/agents/modelClient.ts` (so the Convex cron can reuse the same agent
 * logic — rewrite T-1.1.1). This file is the BROWSER adapter: it implements the
 * `ModelTransport` interface by proxying to the gated Convex actions in
 * `convex/gemini.ts` (the API key never reaches the bundle) and injects it.
 *
 * It re-exports the agent helpers so existing client imports `from '../gemini'`
 * keep working unchanged.
 */

// Re-export the agent-facing helpers (back-compat for client importers).
export {
  Type,
  cleanAndParseJSON,
  safeGenerateContent,
  callJsonAgent,
  generateImage,
  editImage,
  searchTrend,
  generateEmbedding,
  Schemas,
} from "./agents/modelClient";

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

// --- AUTH TOKEN INJECTION (set by AuthContext on login/boot) ---
// The server-side Gemini actions are gated by a newsroom session token (T-1.0.1).
let authToken = "";
export const setGeminiAuthToken = (token: string | null) => {
  authToken = token || "";
};

// --- Browser transport: proxy every model call to the gated Convex actions ---
const clientTransport: ModelTransport = {
  generateText: (params) =>
    transport().action(api.gemini.generateText, {
      accessToken: authToken,
      model: params.model,
      contents: params.contents,
      config: params.config,
      missionId: params.missionId as any,
    }),
  generateImage: (prompt, aspectRatio: AspectRatio, missionId) =>
    transport().action(api.gemini.generateImage, {
      accessToken: authToken,
      prompt,
      aspectRatio,
      missionId: missionId as any,
    }),
  editImage: (base64Image, prompt, missionId) =>
    transport().action(api.gemini.editImage, {
      accessToken: authToken,
      base64Image,
      prompt,
      missionId: missionId as any,
    }),
  searchTrend: (query, missionId) =>
    transport().action(api.gemini.searchTrend, {
      accessToken: authToken,
      query,
      missionId: missionId as any,
    }),
  generateEmbedding: async (text, missionId) => {
    const values: number[] = await transport().action(
      api.gemini.generateEmbedding,
      { accessToken: authToken, text, missionId: missionId as any }
    );
    assertEmbeddingDim(values);
    return values;
  },
};

setModelTransport(clientTransport);
