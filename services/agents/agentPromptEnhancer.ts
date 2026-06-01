import { Type } from '@google/genai';
import { callJsonAgent } from './modelClient';

export const agentPromptEnhancer = async (basePrompt: string, style: string, globalDirective?: string, missionId?: string): Promise<string> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE PHOTOGRAPHER for The Latent Times. Your job is to take a basic visual prompt and enhance it into a highly detailed, evocative prompt for an AI image generator.
    
    Base Prompt: "${basePrompt}"
    Requested Style: "${style}"
    
    Expand this into a rich, descriptive prompt (max 3 sentences) that captures our visual mandate: "The Elegant Machine". Pair high-end fashion/editorial photography sensibilities with the subject matter. Describe the atmosphere, the direction of the light, the texture of the materials, and the intentionality of the composition.
    
    CRITICAL CONSTRAINT: Leave room for unexpected creative accents and colors. Do not rely on literal sci-fi styling. Move the aesthetic into the realm of conceptual art, high-fashion editorial, or striking minimalism. Ensure it explicitly states "No text, no typography".
    
    Output JSON only:
    {
      "enhancedPrompt": "The highly detailed prompt..."
    }
  `;

  const parsed = await callJsonAgent<{enhancedPrompt: string}>(prompt, {
    type: Type.OBJECT,
    properties: {
      enhancedPrompt: { type: Type.STRING }
    },
    required: ['enhancedPrompt']
  }, { enhancedPrompt: basePrompt }, missionId);

  return parsed.enhancedPrompt || basePrompt;
};
