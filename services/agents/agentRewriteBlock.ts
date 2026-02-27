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
    "${block.content}"
    
    Editor's Instruction:
    "${instruction}"
    
    Rewrite the block to satisfy the Editor's instruction while maintaining the intellectual, haughty, "Vogue meets Wired" tone.
    
    Output JSON only:
    {
      "content": "The rewritten text..."
    }
  `;

  const parsed = await callJsonAgent<{content: string}>(prompt, {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING }
    },
    required: ['content']
  }, { content: block.content });

  return {
    ...block,
    content: parsed.content || block.content,
    status: 'clean'
  };
};
