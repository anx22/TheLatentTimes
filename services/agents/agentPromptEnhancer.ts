import { Type } from '@google/genai';
import { callJsonAgent } from '../gemini';

export const agentPromptEnhancer = async (basePrompt: string, style: string, globalDirective?: string): Promise<string> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE PHOTOGRAPHER for The Latent Times. Your job is to take a basic visual prompt and enhance it into a highly detailed, evocative prompt for an AI image generator.
    
    Base Prompt: "${basePrompt}"
    Requested Style: "${style}"
    
    Expand this into a rich, descriptive prompt (max 3 sentences) that captures the "Vogue meets Wired" aesthetic. Include lighting, composition, and specific visual details.
    
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
  }, { enhancedPrompt: basePrompt });

  return parsed.enhancedPrompt || basePrompt;
};
