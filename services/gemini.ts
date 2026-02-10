
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatio, SearchResult } from "../types";

// The API Key is polyfilled in vite.config.ts from VITE_GEMINI_API_KEY
// This adheres to the strict SDK requirement of using process.env.API_KEY
const API_KEY = process.env.API_KEY;

// --- SAFE WRAPPER FOR TEXT GENERATION (Handles 429s) ---
export const safeGenerateContent = async (
  params: { model: string; contents: any; config?: any }
): Promise<GenerateContentResponse> => {
    // Re-init client to ensure freshness and use latest key from process.env.API_KEY
    const client = new GoogleGenAI({ apiKey: API_KEY });
    let delay = 2000; // Start with 2s delay
    
    for (let i = 0; i < 5; i++) { // 5 Retries
        try {
            return await client.models.generateContent(params);
        } catch (e: any) {
            // Check for 429 or Quota errors
            if (e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
                 if (i === 4) throw e; // Give up after 5 tries
                 console.warn(`[Gemini] Hit Rate Limit. Retrying in ${delay}ms...`);
                 await new Promise(r => setTimeout(r, delay));
                 delay *= 2; // Exponential backoff: 2s -> 4s -> 8s -> 16s
                 continue;
            }
            throw e;
        }
    }
    throw new Error("Gemini API Unreachable");
};

// Image Generation using Gemini 3 Pro Image Preview
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // Ensure we use the selected key if available. 
     // The key is automatically injected into process.env.API_KEY by the environment,
     // but in this app structure, we rely on the polyfill or the window selection.
  }
  const currentAi = new GoogleGenAI({ apiKey: API_KEY });

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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// Image Editing using Gemini 2.5 Flash Image
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const currentAi = new GoogleGenAI({ apiKey: API_KEY });
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
    .filter((item: any) => item !== null);

  return {
    text,
    groundingUrls,
  };
};
