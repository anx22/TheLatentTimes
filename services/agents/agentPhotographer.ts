import { AspectRatio } from '../../types';
import { generateImage, editImage } from '../gemini';

export const agentPhotographer = async (
  prompt: string, 
  visualStyle: string, 
  aspectRatio: AspectRatio, 
  globalDirective?: string,
  base64Image?: string
): Promise<string> => {
  const styleMap: Record<string, string> = {
    'Editorial Photography': 'high-end editorial fashion photography, 35mm film, studio lighting, clean composition',
    'Cyberpunk Render': 'cyberpunk aesthetic, neon lighting, octane render, unreal engine 5, highly detailed 3d',
    'Technical Blueprint': 'architectural blueprint style, technical drawing, wireframe, schematic, minimalist lines',
    'Abstract Latent': 'abstract latent space visualization, fluid dynamics, glitch art, surreal digital noise'
  };
  
  const stylePrompt = styleMap[visualStyle] || styleMap['Editorial Photography'];
  const directivePrefix = globalDirective ? `[DIRECTOR'S DIRECTIVE: ${globalDirective}] ` : '';
  const enhancedPrompt = `${directivePrefix}${stylePrompt}, ${prompt}, 8k resolution, masterpiece. No text, no typography, no words, no letters.`;
  
  if (base64Image) {
    return await editImage(base64Image, enhancedPrompt);
  }
  
  return await generateImage(enhancedPrompt, aspectRatio);
};
