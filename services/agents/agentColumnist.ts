import { GeneratedArticle } from '../../types';
import { callJsonAgent, Schemas } from '../gemini';

export const agentColumnist = async (topic: string, context: string, lens: string, wordCountTarget: string | number, globalDirective?: string, missionId?: string): Promise<GeneratedArticle> => {
  let lengthInstruction = "2-3 paragraphs";
  const targetStr = String(wordCountTarget || "");
  if (targetStr.includes("300")) lengthInstruction = "1-2 short, punchy paragraphs";
  if (targetStr.includes("1200")) lengthInstruction = "4-5 detailed paragraphs";

  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';

  const prompt = `
    ${directivePrefix}
    You are THE COLUMNIST for The Latent Times, a high-fashion, accelerationist magazine.
    
    Base Topic (The Tech Foundation): "${topic}"
    Context/Briefing: "${context}"
    
    Your task is to write an article about this technical topic, but you MUST apply the following Editorial Lens: "${lens}".
    This means you must view the hard technology through the perspective of ${lens}.
    
    CRITICAL EDITORIAL GUIDELINES:
    - Your architectural mandate is to synthesize the rigor of a systems architect with the observation of a cultural critic. 
    - Write with confidence, using precise, striking metaphors that ground abstract concepts in physical reality. 
    - Avoid the expected industry buzzwords by reaching for literary or sociological comparisons instead. Every sentence should feel curated, rhythmic, and intentional.
    - The "Wort-Bild-Schere": Ensure the tone pairs clinical technical reality with sharp, sophisticated, and slightly detached observations.
    
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

  const parsed = await callJsonAgent<any>(prompt, Schemas.Columnist, null, missionId);

  if (parsed) {
    parsed.body = parsed.blocks.map((b: any) => b.sentences.map((s: any) => s.text).join(' ')).join('\n\n');
  }
  return parsed;
};
