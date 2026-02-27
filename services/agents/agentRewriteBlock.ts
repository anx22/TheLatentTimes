import { Type } from '@google/genai';
import { DraftBlock } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentRewriteBlock = async (block: DraftBlock, instruction: string, context: string, lens: string, globalDirective?: string): Promise<DraftBlock> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE COLUMNIST for The Latent Times. The Editor has requested a specific rewrite for a single paragraph/block.
    
    Context: "${context}"
    Lens: "${lens}"
    
    Original Block:
    "${block.sentences.map(s => s.text).join(' ')}"
    
    Editor's Instruction:
    "${instruction}"
    
    Rewrite the block to satisfy the Editor's instruction while maintaining the intellectual, haughty, "Vogue meets Wired" tone.
    Break the rewritten block down into individual sentences.
    
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
  }, { sentences: block.sentences });

  return {
    ...block,
    sentences: parsed.sentences || block.sentences,
    status: 'clean'
  };
};
