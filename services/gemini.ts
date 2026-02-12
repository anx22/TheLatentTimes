
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, SearchResult } from "../types";

// The API Key is managed via process.env.API_KEY
export { Type };

// --- CIRCUIT BREAKER STATE ---
// If we hit a rate limit on Pro, we downgrade to Flash for this duration.
let proCooldownUntil = 0;
const PRO_COOLDOWN_MS = 60000; // 1 Minute

// --- HELPER: ROBUST JSON PARSER ---
export const cleanAndParseJSON = (text: string | undefined): any => {
    if (!text) return {};
    try {
        // 1. Try direct parse
        return JSON.parse(text);
    } catch (e) {
        // 2. Try stripping markdown code blocks
        try {
            const clean = text.replace(/```json\n?|```/g, '').trim();
            return JSON.parse(clean);
        } catch (e2) {
            // 3. Robust substring finder (Find first { or [ and last } or ])
            try {
                const firstOpen = text.search(/[{[]/);
                const lastClose = text.search(/[}\]](?!.*[}\]])/);
                
                if (firstOpen !== -1 && lastClose !== -1) {
                    const potentialJson = text.substring(firstOpen, lastClose + 1);
                    return JSON.parse(potentialJson);
                }
            } catch (e3) {
                console.warn("[Parser] JSON Parse Failed. Raw text preview:", text.slice(0, 100));
            }
            return {};
        }
    }
};

// --- SAFE WRAPPER FOR TEXT GENERATION (Handles 429s & Transient Errors) ---
export const safeGenerateContent = async (
  params: { model: string; contents: any; config?: any }
): Promise<GenerateContentResponse> => {
    // 1. DETERMINE MODEL STRATEGY
    let currentModel = params.model;
    const isPro = currentModel.includes('pro') && !currentModel.includes('image'); // Don't downgrade image models
    
    // Check Circuit Breaker
    if (isPro && Date.now() < proCooldownUntil) {
        const fallbackModel = currentModel.replace('pro', 'flash');
        console.debug(`[NET] Circuit Open (Quota): Downgrading ${currentModel} -> ${fallbackModel}`);
        currentModel = fallbackModel;
    }

    // Re-init client to ensure freshness
    const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let delay = 1000;
    const maxRetries = 3; 
    
    const start = performance.now();

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await client.models.generateContent({
                ...params,
                model: currentModel
            });
            const duration = Math.round(performance.now() - start);
            
            // Critical Performance Log
            console.debug(`[NET] ${currentModel} OK in ${duration}ms`);
            
            return result;
        } catch (e: any) {
            const duration = Math.round(performance.now() - start);
            const isRateLimit = e.status === 429 || e.code === 429 || e.message?.includes('429');
            const isTransient = e.status === 503 || e.status === 500 || e.message?.includes('fetch failed');

            // 2. SMART FALLBACK: If Pro fails with Quota, switch to Flash immediately
            if (isRateLimit && currentModel.includes('pro') && !currentModel.includes('image')) {
                console.warn(`[NET] Rate Limit on ${currentModel}. Activating Circuit Breaker.`);
                
                // Trip the breaker for future requests
                proCooldownUntil = Date.now() + PRO_COOLDOWN_MS;
                
                // Downgrade THIS request immediately
                currentModel = currentModel.replace('pro', 'flash');
                console.warn(`[NET] Retrying immediately with ${currentModel}`);
                
                // Reset loop counter to give Flash a fair chance (optional, but safer to just continue)
                // We just continue to the next iteration which uses the new `currentModel`
                continue; 
            }

            // 3. STANDARD RETRY: For Flash limits or server errors
            if (isRateLimit || isTransient) {
                 if (i === maxRetries - 1) {
                     console.error(`[NET] ${currentModel} FAILED after ${duration}ms.`, e);
                     throw e; 
                 }
                 console.warn(`[NET] ${currentModel} Retry ${i+1}/${maxRetries} (${isRateLimit ? 'RateLimit' : 'Error'}) in ${delay}ms`);
                 await new Promise(r => setTimeout(r, delay));
                 delay *= 2; 
                 continue;
            }
            throw e; 
        }
    }
    throw new Error("Gemini API Unreachable");
};

// Image Generation using Gemini 2.5 Flash Image (Nanobana)
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  if (typeof window !== 'undefined' && window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // Key is injected
  }
  const currentAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const currentAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
