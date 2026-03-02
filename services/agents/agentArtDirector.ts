import { GeneratedArticle, VisualConcept, ColorPalette } from '../../types';
import { callJsonAgent } from '../gemini';

interface ArtDirectorOutput {
  concepts: VisualConcept[];
  palettes: ColorPalette[];
  metaMeaning: string;
}

export const agentArtDirector = async (article: GeneratedArticle): Promise<ArtDirectorOutput> => {
  const prompt = `
    You are THE ART DIRECTOR for a high-end, avant-garde magazine (think Wired meets Vogue meets The New Yorker).
    
    Your task is to analyze the following article and develop a VISUAL IDENTITY for it.
    Do not just illustrate the text. Capture the subtext, the mood, and the "meta-meaning".

    ARTICLE HEADLINE: "${article.headline}"
    ARTICLE DECK: "${article.deck}"
    ARTICLE CONTENT SAMPLE: "${article.blocks.slice(0, 3).map(b => b.sentences.map(s => s.text).join(' ')).join(' ')}..."

    ---------------------------------------------------------
    TASK 1: VISUAL CONCEPTS (Generate 3 Distinct Directions)
    1. "THE LITERAL": A direct, high-fidelity representation of the subject matter, but styled (e.g., Editorial Photography).
    2. "THE METAPHOR": An abstract, symbolic, or surreal interpretation of the core theme (e.g., 3D Render, Abstract Art).
    3. "THE VIBE": A mood-based, atmospheric approach that captures the feeling of the piece (e.g., Cinematic, Lo-fi, Glitch).

    TASK 2: COLOR PALETTES (Generate 3 Distinct Palettes)
    Create 3 color palettes (5 hex codes each) that reinforce these concepts.
    Give them evocative names (e.g., "Neon Noir", "Rust & Chrome", "Digital Ether").

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

  return await callJsonAgent<ArtDirectorOutput>(prompt, schema, fallback);
};
