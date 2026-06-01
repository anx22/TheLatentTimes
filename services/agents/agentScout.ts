import { Type } from '@google/genai';
import { searchTrend, callJsonAgent } from './modelClient';
import { ScoutedSignal, Source } from '../../types';

export const agentScout = async (sources: Source[], noiseFilter: number, globalDirective?: string, missionId?: string): Promise<ScoutedSignal[]> => {
  let query = "latest developments in AI models, open-source code repositories, machine learning workflows, and bleeding-edge technology";
  
  const activeSources = sources.filter(s => s.isActive).map(s => {
    try { return new URL(s.url).hostname; } catch { return s.url; }
  });
  
  if (activeSources.length > 0) {
    query += ` site:${activeSources.join(' OR site:')}`;
  }

  const strictness = noiseFilter > 70 ? "EXTREMELY STRICT: Only return high-impact, mainstream-ready technical breakthroughs with massive disruption potential." : "BROAD: Include emerging trends, but always weight them by their potential to scale into the mainstream.";
  const vision = "MAINSTREAM POWERHOUSE: We are the authority on the AI Revolution. We reveal the big movements and massive disruptions before they hit the headlines. High-signal signals from niche sources are Lead Indicators—early warnings of what will soon dominate. We prioritize scale, impact, and technical disruption that changes entire industries.";

  const mission = missionId ? { log: (s: string, m: string, t: any) => Promise.resolve() } : null; // Fallback mock if needed
  
  const searchResult = await searchTrend(query, missionId);
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

    const results = await callJsonAgent<ScoutedSignal[]>(prompt, {
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
  }, [], missionId);

  return results.map(r => ({
    ...r,
    id: r.id || Math.random().toString(36).substring(7)
  }));
};
