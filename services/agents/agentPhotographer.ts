import { AspectRatio } from '../../types';
import { generateImage } from '../gemini';

export const agentPhotographer = async (prompt: string, visualStyle: string, aspectRatio: AspectRatio, globalDirective?: string): Promise<string> => {
  const styleMap: Record<string, string> = {
    'Editorial Photography': 'high-end editorial fashion photography, 35mm film, studio lighting, Vogue cover style',
    'Cyberpunk Render': 'cyberpunk aesthetic, neon lighting, octane render, unreal engine 5, highly detailed 3d',
    'Technical Blueprint': 'architectural blueprint style, technical drawing, wireframe, schematic, minimalist lines',
    'Abstract Latent': 'abstract latent space visualization, fluid dynamics, glitch art, surreal digital noise'
  };
  
  const stylePrompt = styleMap[visualStyle] || styleMap['Editorial Photography'];
  const directivePrefix = globalDirective ? `[DIRECTOR'S DIRECTIVE: ${globalDirective}] ` : '';
  const enhancedPrompt = `${directivePrefix}${stylePrompt}, ${prompt}, 8k resolution, masterpiece.`;
  
  return await generateImage(enhancedPrompt, aspectRatio);
};
