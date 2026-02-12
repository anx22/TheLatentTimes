
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, SearchResult } from "../types";

// The API Key is managed via process.env.API_KEY
export { Type };

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
    // Re-init client to ensure freshness
    const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let delay = 1000; 
    const maxRetries = 3; // Reduced retry count to fail faster if stuck
    
    const start = performance.now();
    const modelName = params.model.split('-')[1] || params.model; 

    for (let i = 0; i < maxRetries; i++) {
        try {
            // console.debug(`[NET] Sending request to ${modelName}...`);
            const result = await client.models.generateContent(params);
            const duration = Math.round(performance.now() - start);
            
            // Critical Performance Log
            console.debug(`[NET] ${modelName} OK in ${duration}ms`);
            
            return result;
        } catch (e: any) {
            const duration = Math.round(performance.now() - start);
            const isRateLimit = e.status === 429 || e.code === 429 || e.message?.includes('429');
            const isTransient = e.status === 503 || e.status === 500 || e.message?.includes('fetch failed');

            if (isRateLimit || isTransient) {
                 if (i === maxRetries - 1) {
                     console.error(`[NET] ${modelName} FAILED after ${duration}ms.`, e);
                     throw e; 
                 }
                 console.warn(`[NET] ${modelName} Retry ${i+1}/${maxRetries} (${isRateLimit ? 'RateLimit' : 'Error'}) in ${delay}ms`);
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
