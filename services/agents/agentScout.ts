import { Type } from '@google/genai';
import { searchTrend, callJsonAgent } from '../gemini';

export const agentScout = async (sources: { github: boolean, arxiv: boolean, techcrunch: boolean }, noiseFilter: number, globalDirective?: string): Promise<string[]> => {
  let query = "latest developments in AI models, open-source code repositories, machine learning workflows, and bleeding-edge technology";
  
  const activeSources = [];
  if (sources.github) activeSources.push("github.com");
  if (sources.arxiv) activeSources.push("arxiv.org");
  if (sources.techcrunch) activeSources.push("techcrunch.com");
  
  if (activeSources.length > 0) {
    query += ` site:\${activeSources.join(' OR site:')}`;
  }

  const strictness = noiseFilter > 70 ? "EXTREMELY STRICT: Only return highly credible, groundbreaking, and verified technical breakthroughs." : "BROAD: You can include speculative, emerging, or niche technical trends.";

  const searchResult = await searchTrend(query);
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const prompt = `
    ${directivePrefix}
    You are THE SCOUT for The Latent Times. Your job is to find 3 distinct, highly specific hard-tech topics for our next article based on current real-world signals.
    
    CRITICAL RULE: Focus ONLY on technology (AI models, code, workflows, hardware). Ignore fashion, culture, and social issues entirely at this stage. We need the raw technical foundation.
    
    FILTERING DIRECTIVE: ${strictness}
    
    Here is the raw data from the live web:
    ${searchResult.text}
    
    Synthesize this into 3 punchy topic phrases (max 5-7 words each).
    
    Output as a simple JSON array of strings:
    ["Topic 1", "Topic 2", "Topic 3"]
  `;

  return callJsonAgent<string[]>(prompt, {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  }, ["Local LLM Orchestration", "Agentic Workflow Patterns", "Synthetic Data Pipelines"]);
};
