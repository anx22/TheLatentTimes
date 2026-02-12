
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

// --- SAFE WRAPPER FOR TEXT GENERATION (Handles 429s) ---
export const safeGenerateContent = async (
  params: { model: string; contents: any; config?: any }
): Promise<GenerateContentResponse> => {
    // Re-init client to ensure freshness and use latest key from process.env.API_KEY
    const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let delay = 500; // OPTIMIZATION: Start with 500ms (was 2000ms). Flash is fast; errors are usually transient bursts.
    
    for (let i = 0; i < 4; i++) { // 4 Retries
        try {
            return await client.models.generateContent(params);
        } catch (e: any) {
            // Check for 429 or Quota errors
            if (e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
                 if (i === 3) throw e; // Give up
                 console.warn(`[Gemini] Hit Rate Limit. Retrying in ${delay}ms...`);
                 await new Promise(r => setTimeout(r, delay));
                 delay *= 2; // Exponential backoff: 0.5s -> 1s -> 2s -> 4s
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
     // The key is automatically injected into process.env.API_KEY by the environment.
  }
  const currentAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
