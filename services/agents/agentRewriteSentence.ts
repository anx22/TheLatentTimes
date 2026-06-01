import { Type } from '@google/genai';
import { DraftBlock } from '../../types';
import { callJsonAgent } from './modelClient';

export const agentRewriteSentence = async (
  block: DraftBlock, 
  sentenceId: string, 
  instruction: string, 
  context: string, 
  lens: string, 
  fullArticleContext: string,
  globalDirective?: string,
  missionId?: string
): Promise<DraftBlock> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const targetSentence = block.sentences.find(s => s.id === sentenceId);
  if (!targetSentence) return block;

  const prompt = `
    ${directivePrefix}
    You are THE COLUMNIST for The Latent Times. The Editorial Board has requested a specific rewrite for a single sentence within a paragraph.
    
    NARRATIVE SKELETON (Full Article Context):
    """
    ${fullArticleContext}
    """

    Context: "${context}"
    Lens: "${lens}"
    
    Target Paragraph Context:
    "${block.sentences.map(s => s.text).join(' ')}"
    
    Target Sentence to Rewrite:
    "${targetSentence.text}"
    
    Editor's Instruction:
    "${instruction}"
    
    Rewrite ONLY the target sentence. 
    MANDATE: Ensure the rewritten sentence fits perfectly into the overall flow of the NARRATIVE SKELETON above. Apply our editorial voice: highly analytical, stylistically confident, and free of expected industry jargon. Use precise, evocative language.
    
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
  }, { rewritten_sentence: targetSentence.text }, missionId);

  return {
    ...block,
    sentences: block.sentences.map(s => 
      s.id === sentenceId ? { ...s, text: parsed.rewritten_sentence || s.text } : s
    ),
    status: 'clean'
  };
};
