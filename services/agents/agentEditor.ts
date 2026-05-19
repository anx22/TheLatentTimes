import { Type } from '@google/genai';
import { DraftBlock, BlockAnnotation } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentEditor = async (blocks: DraftBlock[], context: string, lens: string, globalDirective?: string, missionId?: string): Promise<BlockAnnotation[]> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE EDITORIAL BOARD for The Latent Times, a high-fashion, accelerationist magazine.
    Your job is to act as a KI-Linter. Review the following draft blocks against the provided context and editorial lens.
    
    Context: "${context}"
    Lens: "${lens}"
    
    Draft Blocks:
    ${JSON.stringify(blocks, null, 2)}
    
    Identify specific sentences (or entire blocks) that need improvement. 
    
    SIMULATE A HEATED EDITORIAL DEBATE between the following three personas:
    1. THE CRITIC: Harsh, focused on "Vogue" style, hates clichés, demands elegance.
    2. THE TECHNOLOGIST: Focused on "Wired" accuracy, demands technical depth, hates hand-wavy explanations.
    3. THE REBEL: Focused on "Accelerationism", demands provocative takes, hates playing it safe.

    For each issue found, specify which persona is raising the concern. 
    We want conflicting opinions. If one block is too technical, THE CRITIC might complain, while THE TECHNOLOGIST defends it.
    
    Focus on:
    1. TONE_MISMATCH: Too boring/generic.
    2. CLARITY: Confusing technicals.
    3. FACT_CHECK: Context contradictions.
    4. STYLE: Clunkiness.
    
    Output JSON only. Return an array of annotations.
    [
      {
        "id": "anno_1",
        "blockId": "b1",
        "sentenceId": "b1_s2",
        "persona": "The Critic",
        "type": "TONE_MISMATCH",
        "comment": "This metaphor is overly aggressive and leans into melodrama.",
        "suggestion": "Focus on the generative beauty instead."
      }
    ]
  `;

  return callJsonAgent<BlockAnnotation[]>(prompt, {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        blockId: { type: Type.STRING },
        sentenceId: { type: Type.STRING },
        persona: { type: Type.STRING },
        type: { type: Type.STRING },
        comment: { type: Type.STRING },
        suggestion: { type: Type.STRING }
      },
      required: ['id', 'blockId', 'type', 'comment']
    }
  }, [], missionId);
};
