import { Type } from '@google/genai';
import { GeneratedArticle } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentColumnist = async (topic: string, context: string, lens: string, wordCountTarget: string, globalDirective?: string, missionId?: string): Promise<GeneratedArticle> => {
  let lengthInstruction = "2-3 paragraphs";
  if (wordCountTarget.includes("300")) lengthInstruction = "1-2 short, punchy paragraphs";
  if (wordCountTarget.includes("1200")) lengthInstruction = "4-5 detailed paragraphs";

  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';

  const prompt = `
    ${directivePrefix}
    You are THE COLUMNIST for The Latent Times, a high-fashion, accelerationist magazine.
    
    Base Topic (The Tech Foundation): "${topic}"
    Context/Briefing: "${context}"
    
    Your task is to write an article about this technical topic, but you MUST apply the following Editorial Lens: "${lens}".
    This means you must view the hard technology through the perspective of ${lens}.
    
    Tone: Intellectual, haughty, insightful, "Vogue meets Wired".
    Length: ${lengthInstruction}.
    
    Output JSON only:
    {
      "headline": "A 3-5 word striking title (UPPERCASE)",
      "deck": "A provocative subtitle.",
      "blocks": [
        {
          "id": "b1",
          "type": "p",
          "sentences": [
            { "id": "b1_s1", "text": "First sentence of the paragraph." },
            { "id": "b1_s2", "text": "Second sentence of the paragraph." }
          ],
          "status": "clean"
        }
      ],
      "tags": ["Tag1", "Tag2"],
      "suggested_visual_prompt": "A detailed description for an AI image generator that captures the mood."
    }
  `;

  const parsed = await callJsonAgent<any>(prompt, {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      deck: { type: Type.STRING },
      blocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
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
            },
            status: { type: Type.STRING }
          },
          required: ['id', 'type', 'sentences', 'status']
        }
      },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggested_visual_prompt: { type: Type.STRING }
    },
    required: ['headline', 'deck', 'blocks', 'tags', 'suggested_visual_prompt']
  }, null, missionId);

  if (parsed) {
    parsed.body = parsed.blocks.map((b: any) => b.sentences.map((s: any) => s.text).join(' ')).join('\n\n');
  }
  return parsed;
};
