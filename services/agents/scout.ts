
import { Type } from "@google/genai";
import { SignalDossier } from "../../types";
import { safeGenerateContent } from "../gemini";

// 1.1 QUERY ORCHESTRATOR
export const agentQueryOrchestrator = async (topic: string): Promise<string[]> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `You are the QUERY ORCHESTRATOR. 
    Target Topic: "${topic}".
    Generate 2 distinct Google Search queries to gather comprehensive intel (reduced for efficiency):
    1. Direct retrieval (release notes, official docs)
    2. Sentiment/Analysis (reddit, twitter, hackernews discussions)
    
    Return ONLY a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(response.text || "[]");
};

// 1.2 DOSSIER COMPILER (The new Scout)
export const agentDossierCompiler = async (topic: string, searchContexts: string[]): Promise<SignalDossier> => {
  // Truncate contexts to avoid massive token usage
  // REDUCED from 15,000 to 8,000 chars per search result to prevent Rate Limiting
  const safeContexts = searchContexts.map(c => c.slice(0, 8000)); 
  const contextString = safeContexts.join("\n\n---\n\n");

  const response = await safeGenerateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as THE SCOUT. Compile a Signal Dossier for "${topic}" based on these search results:
    ${contextString}
    STRICT RULES:
    - Distinguish Primary Sources (Docs) from Secondary (News).
    - "Cultural Voltage" = Impact on taste/society.
    - "Novelty" = Is this actually new or just a version bump?
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title_candidate: { type: Type.STRING },
          what_happened: { type: Type.STRING },
          why_now: { type: Type.STRING },
          claims: { 
            type: Type.ARRAY, 
            items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, source: { type: Type.STRING }, confidence: { type: Type.NUMBER }, is_primary: { type: Type.BOOLEAN } } } 
          },
          primary_sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, url:{type:Type.STRING}, type:{type:Type.STRING} } } },
          secondary_sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, url:{type:Type.STRING}, type:{type:Type.STRING} } } },
          entities: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.OBJECT, properties: { topic_cluster: {type:Type.STRING}, format: {type:Type.STRING}, complexity: {type:Type.STRING} } },
          scores: { 
            type: Type.OBJECT, 
            properties: { novelty: { type: Type.NUMBER }, cultural_voltage: { type: Type.NUMBER }, practical_craft: { type: Type.NUMBER }, proof_strength: { type: Type.NUMBER }, heat: { type: Type.NUMBER }, longevity: { type: Type.NUMBER } } 
          },
          risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  const raw = JSON.parse(response.text || "{}");
  return {
    id: `sig_${Math.random().toString(36).substr(2,9)}`,
    topic,
    ...raw,
    source_urls: [...(raw.primary_sources?.map((s:any) => s.url) || []), ...(raw.secondary_sources?.map((s:any) => s.url) || [])],
    one_liner: raw.what_happened,
    timestamp: new Date().toISOString()
  };
};

// 1.3 ARCHIVIST
export const agentArchivist = async (dossier: SignalDossier): Promise<{ approved: boolean; reason: string; adjusted_novelty?: number }> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as THE ARCHIVIST. Evaluate this dossier for REDUNDANCY and NOVELTY.
    Dossier: ${JSON.stringify(dossier)}
    Is this "News" or "Noise"? Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { approved: { type: Type.BOOLEAN }, reason: { type: Type.STRING }, adjusted_novelty: { type: Type.NUMBER } }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
