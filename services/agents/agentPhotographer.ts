import { AspectRatio } from '../../types';
import { generateImage, editImage } from './modelClient';

export const agentPhotographer = async (
  prompt: string, 
  visualStyle: string, 
  aspectRatio: AspectRatio, 
  globalDirective?: string,
  base64Image?: string,
  missionId?: string
): Promise<string> => {
  const styleMap: Record<string, string> = {
    'Editorial Photography': 'Fashion editorial exploring technological tension. Emphasize physical textures, striking compositions, and an atmosphere of refined detachment. The lighting should be deliberate, framing the subject with intention rather than noise.',
    'Surreal Object': 'A conceptually isolated object that acts as a metaphor for a complex system. Use striking lighting and curated background tones to elevate a mundane or bizarre item into an object of high artistic focus.',
    'Abstract Geometric': 'Visual representation of structural forces. Clean intersecting lines, macro-level material studies, and deliberate use of negative space to create a sense of scale and precision.',
    'Cinematic Minimal': 'A still frame that suggests an unfolding psychological narrative about technology. Subdued pacing, highly deliberate color grading that utilizes atmospheric tones with purposeful accents.'
  };
  
  const stylePrompt = styleMap[visualStyle] || styleMap['Editorial Photography'];
  const directivePrefix = globalDirective ? `[DIRECTOR'S DIRECTIVE: ${globalDirective}] ` : '';
  const enhancedPrompt = `${directivePrefix}${stylePrompt}, ${prompt}, 8k resolution, masterpiece. No text, no typography, no words, no letters.`;
  
  if (base64Image) {
    return await editImage(base64Image, enhancedPrompt, missionId);
  }
  
  return await generateImage(enhancedPrompt, aspectRatio, missionId);
};
