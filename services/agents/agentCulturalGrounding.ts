import { callJsonAgent } from '../gemini';

export interface CulturalVector {
  trend: string;
  resonance: number;
  connection: string;
}

export const agentCulturalGrounding = async (
  title: string, 
  content: string, 
  globalDirective?: string,
  missionId?: string
): Promise<CulturalVector[]> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const prompt = `
    ${directivePrefix}
    You are THE CULTURAL GROUNDING AGENT for The Latent Times.
    Your mission: Find the non-obvious, avant-garde cultural and philosophical connections to the following technical signal.
    
    Technical Signal:
    Title: "${title}"
    Content: "${content}"
    
    PHILOSOPHY: 
    We don't look for the obvious (e.g. "AI will change how we work"). 
    We look for the sub-currents and deep aesthetics: 
    - Does this tech resonate with a specific historical or architectural movement? 
    - Does it create a shift in how we perceive "The Self", "Scale", or "Time"?
    - Is there a parallel in contemporary art, high-fashion structural design, or sociological systems?
    
    Think like an avant-garde cultural critic and systems sociologist. Give us 2-3 "Cultural Vectors".
    
    Output JSON only:
    [
      {
        "trend": "The name of the cultural/philosophical trend (e.g., 'Metamodernist Solipsism', 'Clinical Brutalism')",
        "resonance": 0-100 (How strongly it connects),
        "connection": "A precise, culturally observant explanation of WHY this technical shift embodies this concept."
      }
    ]
  `;

  return await callJsonAgent<CulturalVector[]>(prompt, {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        trend: { type: 'string' },
        resonance: { type: 'number' },
        connection: { type: 'string' }
      },
      required: ['trend', 'resonance', 'connection']
    }
  }, [], missionId);
};
