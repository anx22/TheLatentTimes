import { Type } from "@google/genai";
import { GeneratedArticle } from "../../types";
import { callJsonAgent } from "./modelClient";

export const agentPolisher = async (draft: GeneratedArticle, missionId?: string): Promise<GeneratedArticle> => {
  const prompt = `
    You are the Final Polish Editor for a high-end tech/culture magazine ("Vogue meets Wired").
    Your job is to perform a final review of the following article and elevate it to our editorial standard—a space where deep technical analysis meets the sophisticated pacing of a luxury cultural magazine.
    1. Perfect flow between paragraphs, maintaining an elegant, authoritative rhythm.
    2. Lexical Curation: Ensure the vocabulary is sharp, unexpected, and avoids standard tech-industry tropes by replacing them with precise, grounded observations.
    3. The "Wort-Bild-Schere": Ensure the tone feels like modern sleek fascination—a high-fashion critique of a hard-tech reality.
    4. Impactful headline and deck (must be intellectually stimulating and stylistically bold).
    
    ARTICLE DATA:
    Headline: ${draft.headline}
    Deck: ${draft.deck}
    Body: ${draft.body}
    
    Return the polished article in JSON format with the following structure:
    {
      "headline": "...",
      "deck": "...",
      "blocks": [
        {
          "id": "b1",
          "type": "p",
          "sentences": [
            { "id": "b1_s1", "text": "First sentence..." }
          ],
          "status": "clean"
        }
      ],
      "tags": ["...", "..."]
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
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['headline', 'deck', 'blocks', 'tags']
  }, null, missionId);

  if (parsed) {
    parsed.body = parsed.blocks.map((b: any) => b.sentences.map((s: any) => s.text).join(' ')).join('\n\n');
    // Preserve the original visual prompt as the polisher doesn't change it
    parsed.suggested_visual_prompt = draft.suggested_visual_prompt;
  }
  
  return parsed || draft;
};
