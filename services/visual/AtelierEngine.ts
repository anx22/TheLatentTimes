import { DraftBlock, AtelierState, ColorPalette, VisualConcept, ImageHistoryItem, GeneratedArticle, AspectRatio } from '../../types';
import { agentArtDirector, agentPhotographer, agentPromptEnhancer } from '../agents';

export interface AtelierEngineConfig {
  onLog?: (source: string, message: string, type: 'info' | 'action' | 'success' | 'warning' | 'error', missionId?: string) => void;
  globalDirective?: string;
  missionId?: string;
}

/**
 * AtelierEngine
 * 
 * A DEEP module representing the visual production department.
 * It manages the transformation of editorial drafts into stylized visual assets.
 */
export class AtelierEngine {
  private config: AtelierEngineConfig;

  constructor(config: AtelierEngineConfig = {}) {
    this.config = config;
  }

  private log(source: string, message: string, type: 'info' | 'action' | 'success' | 'warning' | 'error' = 'info', missionId?: string) {
    this.config.onLog?.(source, message, type, missionId || this.config.missionId);
  }

  /**
   * Initializes a design session based on a draft.
   */
  async initializeSession(draft: GeneratedArticle, missionId?: string): Promise<AtelierState> {
    this.log('THE ART DIRECTOR', 'Analyzing draft for visual identity and color story...', 'action', missionId);
    
    const output = await agentArtDirector(draft, missionId || this.config.missionId);
    
    this.log('THE ART DIRECTOR', 'Visual strategy established.', 'success');

    return {
      concepts: output.concepts,
      suggestedPalettes: output.palettes,
      activeConceptId: output.concepts[0].id,
      activePalette: output.palettes[0],
      layout: 'FEATURE',
      customPrompt: output.concepts[0].prompt,
      modifiers: [],
      currentImageId: null,
      isGenerating: false,
      history: []
    };
  }

  /**
   * Generates a primary visual asset using the active configuration.
   */
  async developAsset(
    prompt: string, 
    palette: ColorPalette | null, 
    visualStyle: string,
    aspectRatio: AspectRatio,
    missionId?: string
  ): Promise<{ base64: string }> {
    this.log('THE PHOTOGRAPHER', `Developing latent space artifact...`, 'action', missionId);
    
    // Construct refined prompt
    const fullPrompt = palette 
      ? `${prompt} --palette: ${palette.colors.join(', ')} --vibe: ${palette.vibe}`
      : prompt;

    const base64 = await agentPhotographer(fullPrompt, visualStyle, aspectRatio, this.config.globalDirective, undefined, missionId || this.config.missionId);
    
    this.log('THE PHOTOGRAPHER', 'Artifact developed and registered in history.', 'success', missionId);
    
    return {
      base64
    };
  }

  /**
   * Enhances a prompt using the Magic Enhance agent.
   */
  async enhanceVisualPrompt(prompt: string, style: string, missionId?: string): Promise<string> {
    this.log('THE PHOTOGRAPHER', 'Applying Magic Enhance to prompt logic...', 'action', missionId);
    const enhanced = await agentPromptEnhancer(prompt, style, this.config.globalDirective, missionId || this.config.missionId);
    this.log('THE PHOTOGRAPHER', 'Prompt optimized for the render engine.', 'success', missionId);
    return enhanced;
  }
}
