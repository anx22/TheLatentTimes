import { Type } from '@google/genai';
import { searchTrend, callJsonAgent } from '../gemini';
import { ScoutedSignal, Source } from '../../types';

export const agentScout = async (sources: Source[], noiseFilter: number, globalDirective?: string): Promise<ScoutedSignal[]> => {
  let query = "latest developments in AI models, open-source code repositories, machine learning workflows, and bleeding-edge technology";
  
  const activeSources = sources.filter(s => s.isActive).map(s => {
    try { return new URL(s.url).hostname; } catch { return s.url; }
  });
  
  if (activeSources.length > 0) {
    query += ` site:${activeSources.join(' OR site:')}`;
  }

  const strictness = noiseFilter > 70 ? "EXTREMELY STRICT: Only return highly credible, groundbreaking, and verified technical breakthroughs." : "BROAD: You can include speculative, emerging, or niche technical trends.";
  const vision = "AVANT-GARDE: We are the spearhead of the tech-cultural AI Revolution. We want to reveal thoughts and philosophies that others miss. Give weight to 'small voices'—proper technical thoughts that may be poorly written but contain high-signal innovation. We want to elevate them to the big stage with professional research and staging.";

  const searchResult = await searchTrend(query);
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const prompt = `
    ${directivePrefix}
    You are THE SCOUT for The Latent Times. Your job is to find 3 distinct, highly specific hard-tech topics for our next article based on current real-world signals.
    
    ${vision}

    CRITICAL RULE: Focus ONLY on technology (AI models, code, workflows, hardware). Ignore fashion, culture, and social issues entirely at this stage. We need the raw technical foundation.
    
    FILTERING DIRECTIVE: ${strictness}
    
    Here is the raw data from the live web:
    ${searchResult.text}
    
    Synthesize this into 3 punchy, concrete signals.
    For each signal, provide:
    - headline: A short, punchy title (max 7 words).
    - context: A brief summary of WHY this matters and what the technical detail is (max 2 sentences).
    - url: The most relevant source URL found in the text (or empty string if none).
    - source: The name of the publication or domain (e.g., "TechCrunch", "GitHub").
    - date: The publication date if available (e.g., "Oct 24, 2025"), otherwise "Recent".
    - score: A relevance score from 0-100 based on the directive.
    
    Output as a JSON array of objects.
  `;

  return callJsonAgent<ScoutedSignal[]>(prompt, {
    type: Type.ARRAY,
    items: { 
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        headline: { type: Type.STRING },
        context: { type: Type.STRING },
        url: { type: Type.STRING },
        source: { type: Type.STRING },
        date: { type: Type.STRING },
        score: { type: Type.NUMBER }
      },
      required: ["headline", "context", "score"]
    }
  }, [
    { id: "1", headline: "Local LLM Orchestration", context: "New frameworks allow running complex agent swarms on consumer hardware.", url: "https://github.com/example", source: "GitHub", date: "Oct 24, 2025", score: 95 },
    { id: "2", headline: "Synthetic Data Pipelines", context: "Major shift towards using AI-generated data to train smaller, more efficient models.", url: "", source: "ArXiv", date: "Recent", score: 88 }
  ]);
};
