
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, SearchResult } from "../types";

// The API Key is managed via process.env.API_KEY
export { Type };

// --- CIRCUIT BREAKER STATE ---
let proCooldownUntil = 0;
const PRO_COOLDOWN_MS = 60000; // 1 Minute

// --- HELPER: ROBUST JSON PARSER ---
export const cleanAndParseJSON = (text: string | undefined): any => {
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch (e) {
        try {
            const clean = text.replace(/```json\n?|```/g, '').trim();
            return JSON.parse(clean);
        } catch (e2) {
            try {
                const firstOpen = text.search(/[{[]/);
                const lastClose = text.search(/[}\]](?!.*[}\]])/);
                if (firstOpen !== -1 && lastClose !== -1) {
                    return JSON.parse(text.substring(firstOpen, lastClose + 1));
                }
            } catch (e3) {
                console.warn("[Parser] JSON Parse Failed", text?.slice(0, 100));
            }
            return {};
        }
    }
};

// --- SAFE WRAPPER FOR TEXT GENERATION (Handles 429s & Transient Errors) ---
export const safeGenerateContent = async (
  params: { model: string; contents: any; config?: any }
): Promise<GenerateContentResponse> => {
    
    // MODEL FALLBACK LADDER (Strict adherence to v3/v2.5)
    const modelLadder = [
        params.model, // Try requested model first
        'gemini-3-flash-preview', // Fallback 1: Fast & Reliable
        'gemini-flash-lite-latest' // Fallback 2: Ultra fast
    ];

    // Remove duplicates and filter
    const uniqueModels = [...new Set(modelLadder)];

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let lastError = null;

    for (const model of uniqueModels) {
        // Skip Pro if cooldown is active
        if (model.includes('pro') && Date.now() < proCooldownUntil) {
            console.debug(`[NET] Skipping ${model} due to cooldown.`);
            continue;
        }

        try {
            const start = performance.now();
            console.debug(`[NET] Attempting ${model}...`);
            
            const result = await client.models.generateContent({
                ...params,
                model: model
            });
            
            const duration = Math.round(performance.now() - start);
            console.debug(`[NET] ${model} OK in ${duration}ms`);
            return result;

        } catch (e: any) {
            lastError = e;
            const isRateLimit = e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED');
            
            if (isRateLimit) {
                console.warn(`[NET] Quota Exceeded on ${model}. Switching to backup.`);
                if (model.includes('pro')) {
                    proCooldownUntil = Date.now() + PRO_COOLDOWN_MS;
                }
                // Continue to next model in ladder
            } else {
                console.warn(`[NET] Error on ${model}:`, e.message);
                // For non-rate-limit errors, we might still want to try the next model just in case it's a specific model outage
            }
        }
    }

    console.error("[NET] All models failed.", lastError);
    throw lastError || new Error("All Gemini models unreachable.");
};

// Image Generation using Gemini 2.5 Flash Image (Nanobana)
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  if (typeof window !== 'undefined' && window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // Key is injected
  }
  const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const start = performance.now();

  try {
      const response = await currentAi.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio } },
      });
    
      console.debug(`[NET] Image Gen (${Math.round(performance.now() - start)}ms)`);

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("No image generated");
  } catch(e) {
      console.error(`[NET] Image Gen FAILED`, e);
      throw e;
  }
};

// Image Editing using Gemini 2.5 Flash Image
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await currentAi.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/png' } },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No edited image returned");
};

// Search Grounding using Gemini 3 Flash Preview
export const searchTrend = async (query: string): Promise<SearchResult> => {
  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text || "No results found.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const groundingUrls = groundingChunks
    .map((chunk: any) => chunk.web ? { title: chunk.web.title, url: chunk.web.uri } : null)
    .filter((item: any) => item !== null) as { title: string; url: string }[];

  return { text, groundingUrls };
};
