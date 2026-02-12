
import { Type } from "@google/genai";
import { Lead, RetrievalSnapshot } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";
import { SYSTEM_SEEDS } from "../curation-seed";

// PHASE 0.5: SCANNER AGENT (Efficient, Low-Cost)
export const agentScanner = async (target: string, snapshot: RetrievalSnapshot): Promise<Lead[]> => {
  
  // PHASE 1: STRUCTURED SEED BYPASS
  if (target === "SYSTEM_SEED") {
      // Simulate "scanning" delay for realism
      await new Promise(r => setTimeout(r, 800));
      return SYSTEM_SEEDS;
  }

  // 1. Flatten Snapshot to dense text (Save tokens)
  const denseContext = snapshot.items.map(i => 
    `HEADLINE: ${i.title}\nDOMAIN: ${i.source_domain}\nURL: ${i.url}\nSUMMARY: ${i.snippet.slice(0, 100)}`
  ).join('\n---\n');

  const response = await safeGenerateContent({
    model: "gemini-flash-lite-latest",
    contents: `Act as THE WIRE SERVICE for a High-Fashion AI Magazine ("MODUS"). 
    
    MISSION: Find signals about "The Synthetic Era". 
    - We care about: Model Weights, Latent Space, Agentic Patterns, Digital Aesthetics, Prompt Engineering, Glitch Art.
    - We DO NOT care about: Stock prices, CEO gossip, generic "AI is the future" fluff, Copilot features.

    SIGNALS:
    ${denseContext}

    Identify distinct "Leads". 
    
    SCORING RULES (0-10):
    10 = Paradigm Shift (e.g. "Sora released", "New Architecture found")
    9 = Cultural Aesthetic Shift (e.g. "Glitch is back", "Lo-Fi Beats workflows")
    8 = Engineering Pattern (e.g. "Self-healing code prompts", "Reasoning loops")
    5 = Standard Tool Update
    0 = Corporate Press Release / Stock News (FILTER THESE OUT)

    Return JSON array.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['BREAKING', 'ANALYSIS', 'FEATURE', 'NOISE'] },
            score: { type: Type.NUMBER },
            context: { type: Type.STRING, description: "One sentence summary" },
            why_now: { type: Type.STRING, description: "Max 120 chars: Why is this urgent?" },
            source_ref: { type: Type.STRING },
            detected_topic: { type: Type.STRING, enum: ['CREATIVE', 'ENGINEERING', 'BUSINESS', 'CULTURE'] },
            detected_format: { type: Type.STRING, enum: ['ESSAY', 'TOOL', 'CASE_STUDY', 'TUTORIAL', 'MANIFESTO'] },
            risk_classification: { type: Type.STRING, enum: ['LEGAL', 'MEDICAL', 'MARKET', 'BRAND', 'NONE'] },
            editorial_metrics: {
                type: Type.OBJECT,
                properties: {
                    trust: { type: Type.NUMBER, description: "0-100" },
                    novelty: { type: Type.NUMBER, description: "0-100" },
                    impact: { type: Type.NUMBER, description: "0-100" },
                    editorial_fit: { type: Type.NUMBER, description: "0-100" }
                }
            }
          }
        }
      }
    }
  });

  const raw = cleanAndParseJSON(response.text);
  
  return (raw || []).map((item: any, i: number) => ({
    ...item,
    id: `lead_${Date.now()}_${i}`,
    target_topic: target,
    // Default fallback metrics if model hallucinates or omits
    editorial_metrics: item.editorial_metrics || { trust: 50, novelty: 50, impact: 50, editorial_fit: 50 },
    risk_classification: item.risk_classification || 'NONE'
  })).filter((l: Lead) => l.score > 4); // Basic filter
};
