import { GeneratedArticle, VisualConcept, ColorPalette } from '../../types';
import { callJsonAgent } from '../gemini';

interface ArtDirectorOutput {
  concepts: VisualConcept[];
  palettes: ColorPalette[];
  metaMeaning: string;
}

export const agentArtDirector = async (article: GeneratedArticle, missionId?: string): Promise<ArtDirectorOutput> => {
  const prompt = `
    You are THE ART DIRECTOR for a high-end, avant-garde magazine (think Wired meets Vogue meets The New Yorker).
    
    Your task is to analyze the following article and develop a VISUAL IDENTITY for it.
    Do not just illustrate the text. Capture the subtext, the mood, and the "meta-meaning".
    Your artistic mandate is "The Elegant Machine": an aesthetic space where high-end fashion editorial sensibilities are applied to abstract technical concepts.
    Your goal is the "Wort-Bild-Schere" (text-image dissonance) – an arresting, highly polished visual disconnect that forces the reader to think deeper about the text. 
    Rather than merely illustrating the text, capture the hidden tension between human intention and systemic execution. Think in terms of high-fashion photography directing a technical shoot.

    ARTICLE HEADLINE: "${article.headline}"
    ARTICLE DECK: "${article.deck}"
    ARTICLE CONTENT SAMPLE: "${article.blocks.slice(0, 3).map(b => b.sentences.map(s => s.text).join(' ')).join(' ')}..."

    ---------------------------------------------------------
    TASK 1: VISUAL CONCEPTS (Generate 3 Distinct Directions)
    1. "THE AVANT-GARDE PORTRAIT": A sleek, highly curated representation capturing the psychological posture of the subject. Use piercing lighting, sculptural staging, or unexpected textures.
    2. "THE SURREAL METAPHOR": An isolated object or peculiar scenario that acts as a brilliant, unexpected metaphorical stand-in for the systemic issue described in the text.
    3. "THE MACRO SYSTEM": An extreme close-up of structural forces, abstract geometry, or physical material that feels imposing, precise, and deeply intentional.

    CRITICAL CONSTRAINT: All prompts MUST explicitly state "No text, no typography, no magazine titles, no layout elements". The generated image should be a PURE VISUAL without any words or letters. Avoid obvious, literal sci-fi styling; lean heavily into contemporary art and editorial curation.

    TASK 2: COLOR PALETTES (Generate 3 Distinct Palettes)
    Create 3 highly intentional color palettes (5 hex codes each) that balance sophisticated foundational tones with vivid, unexpected accents that provide visual shock or editorial intrigue.
    Give them atmospheric, luxury/editorial names (e.g., "Velvet & Chrome", "Clinical Porcelain", "Oxidized Suburbia").

    TASK 3: META MEANING
    Write a 1-sentence analysis of the "meta-meaning" or "hidden truth" of this article that the visuals should convey.
    ---------------------------------------------------------

    OUTPUT FORMAT (JSON):
    {
      "concepts": [
        {
          "id": "concept_1",
          "name": "THE LITERAL: [Name]",
          "description": "Short description of the visual approach.",
          "prompt": "Full, detailed Midjourney/DALL-E style prompt. Include subject, lighting, composition, style, and mood. NO aspect ratios.",
          "rationale": "Why this fits the article."
        },
        ... (3 concepts total)
      ],
      "palettes": [
        {
          "id": "palette_1",
          "name": "Palette Name",
          "colors": ["#hex", "#hex", "#hex", "#hex", "#hex"],
          "vibe": "Description of the mood this palette creates."
        },
        ... (3 palettes total)
      ],
      "metaMeaning": "The deep, underlying theme..."
    }
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      concepts: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            name: { type: "STRING" },
            description: { type: "STRING" },
            prompt: { type: "STRING" },
            rationale: { type: "STRING" }
          },
          required: ["id", "name", "description", "prompt", "rationale"]
        }
      },
      palettes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            name: { type: "STRING" },
            colors: { type: "ARRAY", items: { type: "STRING" } },
            vibe: { type: "STRING" }
          },
          required: ["id", "name", "colors", "vibe"]
        }
      },
      metaMeaning: { type: "STRING" }
    },
    required: ["concepts", "palettes", "metaMeaning"]
  };

  const fallback: ArtDirectorOutput = {
    concepts: [
      {
        id: "fallback_1",
        name: "THE LITERAL: Default",
        description: "Standard editorial illustration.",
        prompt: "High quality editorial illustration of the subject.",
        rationale: "Fallback."
      }
    ],
    palettes: [
      {
        id: "fallback_p1",
        name: "Monochrome",
        colors: ["#000000", "#333333", "#666666", "#999999", "#ffffff"],
        vibe: "Clean."
      }
    ],
    metaMeaning: "The article discusses complex themes."
  };

  return await callJsonAgent<ArtDirectorOutput>(prompt, schema, fallback, missionId);
};
