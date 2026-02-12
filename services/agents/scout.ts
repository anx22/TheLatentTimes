
import { Type } from "@google/genai";
import { SignalDossier, RetrievalSnapshot, SourceMix } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";

// 1.1 QUERY ORCHESTRATOR (Updated for Source Mix)
export const agentQueryOrchestrator = async (topic: string, sourceMix?: SourceMix): Promise<string[]> => {
  let instructions = "Generate 2 distinct Google Search queries to gather comprehensive intel.";
  
  if (sourceMix) {
      const biases = [];
      if (sourceMix.academic) biases.push("site:.edu OR site:arxiv.org OR 'white paper'");
      if (sourceMix.indie) biases.push("site:substack.com OR site:medium.com OR 'blog'");
      if (sourceMix.mainstream) biases.push("site:bloomberg.com OR site:nytimes.com OR site:wired.com");
      if (sourceMix.social) biases.push("site:reddit.com OR site:twitter.com OR site:ycombinator.com");
      
      if (biases.length > 0) {
          instructions += `\nPRIORITIZE these source vectors: ${biases.join(' AND ')}. Ensure queries target these domains.`;
      }
  }

  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `You are the QUERY ORCHESTRATOR. 
    Target Topic: "${topic}".
    ${instructions}
    
    Return ONLY a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return cleanAndParseJSON(response.text);
};

// 1.2 DOSSIER COMPILER (The new Scout)
export const agentDossierCompiler = async (topic: string, snapshot: RetrievalSnapshot): Promise<SignalDossier> => {
  // Convert Snapshot to Context with indices for referencing
  const contextString = snapshot.items.map((i, idx) => 
    `[SOURCE_ID:${idx}]
     DOMAIN: ${i.source_domain}
     TITLE: ${i.title}
     CONTENT: ${i.snippet}`
  ).join("\n\n");

  const response = await safeGenerateContent({
    // OPTIMIZATION: Switched to Flash for speed. The schema is strict enough to constrain it.
    model: "gemini-3-flash-preview", 
    contents: `Act as THE SCOUT (Forensic Analyst). Compile a Signal Dossier for "${topic}" based on these verified signals.
    
    INPUT SIGNALS:
    ${contextString}
    
    TASKS:
    1. Extract "Claims" (atomic facts). 
       - STATUS: 'VERIFIED', 'DISPUTED', or 'SPECULATIVE'.
       - SUPPORTING_SOURCES: List [SOURCE_ID]s.
       - EVIDENCE: Extract quote.
    
    2. FIND THE TENSION:
       - In 'what_happened', do not just summarize. Explain the *conflict* or *breakthrough*.
       - Why is this happening *now*? (The catalyst).
    
    3. Score Risk & Novelty.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title_candidate: { type: Type.STRING },
          what_happened: { type: Type.STRING, description: "The core narrative conflict or event." },
          why_now: { type: Type.STRING, description: "The specific catalyst." },
          claims: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                text: { type: Type.STRING }, 
                status: { type: Type.STRING, enum: ['VERIFIED', 'DISPUTED', 'SPECULATIVE'] },
                confidence: { type: Type.NUMBER, description: "0-100" },
                supporting_sources: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                evidence_snippet: { type: Type.STRING },
                explanation: { type: Type.STRING }
              } 
            } 
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
  
  const raw = cleanAndParseJSON(response.text);
  
  // Post-process to ensure IDs
  const claims = (raw.claims || []).map((c: any, i: number) => ({
      id: `claim_${i}`,
      ...c
  }));

  return {
    id: `sig_${Math.random().toString(36).substr(2,9)}`,
    topic,
    retrieval_snapshot: snapshot, // AUDIT TRAIL
    ...raw,
    claims,
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
  return cleanAndParseJSON(response.text);
};
