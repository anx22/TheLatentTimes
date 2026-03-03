
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

// --- HELPER: JSON AGENT CALLER ---
export const callJsonAgent = async <T>(prompt: string, schema: any, fallback: T): Promise<T> => {
    const response = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });
    return cleanAndParseJSON(response.text) || fallback;
};

// --- HELPER: ROBUST API KEY RETRIEVAL ---
const getApiKey = (): string => {
    let apiKey = '';
    try {
        // Direct access to process.env.GEMINI_API_KEY is required because Vite replaces it at build time.
        // The previous check `typeof process !== 'undefined'` caused it to be skipped in the browser.
        if (process.env.GEMINI_API_KEY) apiKey = process.env.GEMINI_API_KEY;
        else if (process.env.API_KEY) apiKey = process.env.API_KEY;
        // @ts-ignore
        else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        // @ts-ignore
        else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) apiKey = import.meta.env.VITE_API_KEY;
    } catch (e) {
        console.warn("[NET] Error retrieving API key from env", e);
    }

    if (!apiKey) {
        console.error("[NET] CRITICAL: No API Key found in environment variables.");
    }
    return apiKey;
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

    // Remove duplicates
    const uniqueModels = [...new Set(modelLadder)];

    const apiKey = getApiKey();
    const client = new GoogleGenAI({ apiKey: apiKey });
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
            
            // Clone config to modify it for specific models if needed
            const currentConfig = params.config ? JSON.parse(JSON.stringify(params.config)) : {};

            // Lite models do not support tools (like googleSearch)
            // If we are falling back to lite, we must strip tools to avoid 400s
            if (model.includes('lite') && currentConfig.tools) {
                console.debug(`[NET] Stripping tools for ${model}`);
                delete currentConfig.tools;
            }

            const result = await client.models.generateContent({
                ...params,
                model: model,
                config: currentConfig
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
  const apiKey = getApiKey();
  const currentAi = new GoogleGenAI({ apiKey: apiKey });
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
  const apiKey = getApiKey();
  const currentAi = new GoogleGenAI({ apiKey: apiKey });
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
  try {
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
  } catch (e) {
    console.warn("[NET] Search Grounding failed (likely auth/billing). Falling back to internal knowledge.", e);
    
    // Fallback: Ask the model to simulate the search result using its internal knowledge
    // We strip the tools config by not including it
    const fallbackResponse = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are acting as a search engine. The user queried: "${query}". 
      Since live search is unavailable, provide a detailed summary of what you know about this topic from your training data. 
      Be specific and technical.`,
    });

    return { 
      text: fallbackResponse.text || "Search unavailable and fallback failed.", 
      groundingUrls: [] 
    };
  }
};
