
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, SearchResult } from "../types";

// The API Key is managed via process.env.API_KEY
// We access it directly in functions to ensure we get the latest value (e.g. if updated by window.aistudio)

// Re-export Type for use in agents
export { Type };

// --- HELPER: ROBUST JSON PARSER ---
// Flash models often wrap output in markdown code blocks. This strips them.
export const cleanAndParseJSON = (text: string | undefined): any => {
    if (!text) return {};
    try {
        // Remove markdown code blocks (```json ... ```)
        const clean = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.warn("JSON Parse Failed. Raw text:", text);
        // Fallback: Try to find first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            try {
                return JSON.parse(text.substring(start, end + 1));
            } catch (e2) {
                return {};
            }
        }
        return {};
    }
};

// --- SAFE WRAPPER FOR TEXT GENERATION (Handles 429s & Transient Errors) ---
export const safeGenerateContent = async (
  params: { model: string; contents: any; config?: any }
): Promise<GenerateContentResponse> => {
    // Re-init client to ensure freshness and use latest key from process.env.API_KEY
    const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let delay = 1000; // Start with 1s wait
    const maxRetries = 5;
    
    const start = performance.now();
    const modelName = params.model.split('-')[1] || params.model; // e.g. "flash"

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await client.models.generateContent(params);
            const duration = Math.round(performance.now() - start);
            // Log successful network calls for debugging latency
            console.debug(`[NET] ${modelName} (${duration}ms)`);
            return result;
        } catch (e: any) {
            const duration = Math.round(performance.now() - start);
            
            // Check for Rate Limits (429, Resource Exhausted)
            const isRateLimit = e.status === 429 || 
                                e.code === 429 || 
                                e.message?.includes('429') || 
                                e.message?.includes('quota') || 
                                e.message?.includes('RESOURCE_EXHAUSTED');
            
            // Check for Transient Server/Network Errors (503, 500, fetch failures)
            const isTransient = e.status === 503 || 
                                e.status === 500 || 
                                e.message?.includes('503') || 
                                e.message?.includes('500') ||
                                e.message?.includes('network') || 
                                e.message?.includes('fetch failed');

            if (isRateLimit || isTransient) {
                 if (i === maxRetries - 1) {
                     console.error(`[Gemini] Max retries reached after ${duration}ms. Last error:`, e);
                     throw e; // Give up
                 }
                 
                 const reason = isRateLimit ? 'Rate Limit (429)' : 'Transient Error';
                 console.warn(`[Gemini] ${reason}. Retrying in ${delay}ms... (Attempt ${i+1}/${maxRetries})`);
                 
                 await new Promise(r => setTimeout(r, delay));
                 delay *= 2; // Exponential backoff: 1s -> 2s -> 4s -> 8s -> 16s
                 continue;
            }
            throw e; // Throw other errors (400, 403, etc.) immediately
        }
    }
    throw new Error("Gemini API Unreachable after multiple retries");
};

// Image Generation using Gemini 3 Pro Image Preview
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  // SERVER-SIDE GUARD: Check if window exists before accessing window.aistudio
  if (typeof window !== 'undefined' && window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // Ensure we use the selected key if available. 
     // The key is automatically injected into process.env.API_KEY by the environment.
  }
  
  const currentAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const start = performance.now();

  try {
      const response = await currentAi.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: "1K", 
          }
        },
      });
    
      const duration = Math.round(performance.now() - start);
      console.debug(`[NET] Image Gen (${duration}ms)`);

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated");
  } catch(e) {
      const duration = Math.round(performance.now() - start);
      console.error(`[NET] Image Gen FAILED (${duration}ms)`, e);
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
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png', 
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No edited image returned");
};

// Search Grounding using Gemini 3 Flash Preview
export const searchTrend = async (query: string): Promise<SearchResult> => {
  // Use safe wrapper here too
  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No results found.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const groundingUrls = groundingChunks
    .map((chunk: any) => chunk.web ? { title: chunk.web.title, url: chunk.web.uri } : null)
    .filter((item: any) => item !== null) as { title: string; url: string }[];

  return {
    text,
    groundingUrls,
  };
};
