import { Type } from '@google/genai';
import { DraftBlock } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentRewriteBlock = async (
  block: DraftBlock, 
  instruction: string, 
  context: string, 
  lens: string, 
  fullArticleContext: string,
  globalDirective?: string,
  missionId?: string
): Promise<DraftBlock> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE COLUMNIST for The Latent Times. The Editor has requested a specific rewrite for a single paragraph/block.
    
    NARRATIVE SKELETON (Full Article Context):
    """
    ${fullArticleContext}
    """

    Context: "${context}"
    Lens: "${lens}"
    
    Original Block:
    "${block.sentences.map(s => s.text).join(' ')}"
    
    Editor's Instruction:
    "${instruction}"
    
    Rewrite the block to satisfy the Editor's instruction.
    MANDATE: Ensure the rewritten block fits perfectly into the overall flow of the NARRATIVE SKELETON above. Apply our editorial voice: highly analytical, stylistically confident, and free of expected industry jargon. Use precise, evocative language.
    
    Output JSON only:
    {
      "sentences": [
        { "id": "b1_s1", "text": "First rewritten sentence." },
        { "id": "b1_s2", "text": "Second rewritten sentence." }
      ]
    }
  `;

  const parsed = await callJsonAgent<{sentences: {id: string, text: string}[]}>(prompt, {
    type: Type.OBJECT,
    properties: {
      sentences: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ['id', 'text']
        }
      }
    },
    required: ['sentences']
  }, { sentences: block.sentences }, missionId);

  return {
    ...block,
    sentences: parsed.sentences || block.sentences,
    status: 'clean'
  };
};
