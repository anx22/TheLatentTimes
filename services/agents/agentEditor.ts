import { Type } from '@google/genai';
import { DraftBlock, BlockAnnotation } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentEditor = async (blocks: DraftBlock[], context: string, lens: string, globalDirective?: string): Promise<BlockAnnotation[]> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE EDITOR for The Latent Times, a high-fashion, accelerationist magazine.
    Your job is to act as a KI-Linter. Review the following draft blocks against the provided context and editorial lens.
    
    Context: "${context}"
    Lens: "${lens}"
    
    Draft Blocks:
    ${JSON.stringify(blocks, null, 2)}
    
    Identify specific blocks that need improvement. Focus on:
    1. TONE_MISMATCH: Is it too boring, too generic, or not fitting the "Vogue meets Wired" aesthetic?
    2. CLARITY: Is the technical explanation confusing or poorly phrased?
    3. FACT_CHECK: Does it contradict the provided context?
    
    Output JSON only. Return an array of annotations. If the draft is perfect, return an empty array [].
    [
      {
        "id": "anno_1",
        "blockId": "b1",
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
        type: { type: Type.STRING },
        comment: { type: Type.STRING },
        suggestion: { type: Type.STRING }
      },
      required: ['id', 'blockId', 'type', 'comment']
    }
  }, []);
};
