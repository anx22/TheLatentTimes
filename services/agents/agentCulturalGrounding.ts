import { callJsonAgent } from '../gemini';

export interface CulturalVector {
  trend: string;
  resonance: number;
  connection: string;
}

export const agentCulturalGrounding = async (
  title: string, 
  content: string, 
  globalDirective?: string
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
    We don't look for the obvious (e.g. "AI will make people lose jobs"). 
    We look for the sub-currents: 
    - Does this tech resonate with "Acid-Marxism"? 
    - Does it parallel a specific 19th-century architectural movement? 
    - Does it create a shift in how we perceive "The Self" or "The Void"?
    - Is there a parallel in Berlin's underground club scene or Swiss Modernism?
    
    Think like a philosopher-cyberpunk-designer. Give us 2-3 "Cultural Vectors".
    
    Output JSON only:
    [
      {
        "trend": "The name of the cultural/philosophical trend (e.g., 'Metamodernist Solipsism')",
        "resonance": 0-100 (How strongly it connects),
        "connection": "A punchy, intellectual explanation of WHY this tech connects to this trend."
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
  }, []);
};
