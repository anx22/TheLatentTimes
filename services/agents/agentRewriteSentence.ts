import { Type } from '@google/genai';
import { DraftBlock } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentRewriteSentence = async (
  block: DraftBlock, 
  sentenceId: string, 
  instruction: string, 
  context: string, 
  lens: string, 
  globalDirective?: string
): Promise<DraftBlock> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const targetSentence = block.sentences.find(s => s.id === sentenceId);
  if (!targetSentence) return block;

  const prompt = `
    ${directivePrefix}
    You are THE COLUMNIST for The Latent Times. The Editorial Board has requested a specific rewrite for a single sentence within a paragraph.
    
    Context: "${context}"
    Lens: "${lens}"
    
    Full Paragraph Context:
    "${block.sentences.map(s => s.text).join(' ')}"
    
    Target Sentence to Rewrite:
    "${targetSentence.text}"
    
    Editor's Instruction:
    "${instruction}"
    
    Rewrite ONLY the target sentence to satisfy the Editor's instruction while maintaining the intellectual, haughty, "Vogue meets Wired" tone. Ensure it still flows naturally within the surrounding paragraph.
    
    Output JSON only:
    {
      "rewritten_sentence": "The rewritten text..."
    }
  `;

  const parsed = await callJsonAgent<{rewritten_sentence: string}>(prompt, {
    type: Type.OBJECT,
    properties: {
      rewritten_sentence: { type: Type.STRING }
    },
    required: ['rewritten_sentence']
  }, { rewritten_sentence: targetSentence.text });

  return {
    ...block,
    sentences: block.sentences.map(s => 
      s.id === sentenceId ? { ...s, text: parsed.rewritten_sentence || s.text } : s
    ),
    status: 'clean'
  };
};
