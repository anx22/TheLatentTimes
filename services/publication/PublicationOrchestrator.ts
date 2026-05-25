import { agentPolisher } from '../agents';
import { GeneratedArticle, MagazineItem, AspectRatio } from '../../types';

export interface PublicationOrchestratorConfig {
  onLog?: (source: string, message: string, type: 'info' | 'action' | 'success' | 'warning' | 'error', missionId?: string) => void;
  missionId?: string;
  globalDirective?: string;
}

/**
 * PublicationOrchestrator
 * 
 * A DEEP module responsible for the final synthesis, layout assignment, 
 * and publication of refined drafts to the magazine.
 */
export class PublicationOrchestrator {
  private config: PublicationOrchestratorConfig;

  constructor(config: PublicationOrchestratorConfig = {}) {
    this.config = config;
  }

  private log(source: string, message: string, type: 'info' | 'action' | 'success' | 'warning' | 'error' = 'info', missionId?: string) {
    this.config.onLog?.(source, message, type, missionId || this.config.missionId);
  }

  /**
   * Performs a final multi-agent polish of the draft.
   */
  async runFinalPolish(article: GeneratedArticle, missionId?: string): Promise<GeneratedArticle> {
    this.log('THE POLISHER', 'Applying narrative varnish and cross-checking facts...', 'action', missionId);
    
    // agentPolisher now takes (article, missionId)
    const polished = await agentPolisher(article, missionId || this.config.missionId);
    
    this.log('THE POLISHER', 'Draft polished. Narrative friction minimized.', 'success');
    return polished;
  }

  /**
   * Synthesizes the final magazine artifact.
   */
  async prepareForPublication(
    headline: string,
    deck: string,
    body: string,
    blocks: any[],
    image: { url: string; aspectRatio: AspectRatio } | null,
    missionId?: string,
    author: string = "The Newsroom"
  ): Promise<Partial<MagazineItem>> {
    this.log('THE PRESS', 'Assigning layout and synthesizing final artifact metadata...', 'action', missionId);
    
    this.log('THE PRESS', 'Publication artifact ready for distribution.', 'success', missionId);

    return {
      title: headline,
      dek: deck,
      body: body,
      blocks: blocks,
      author: author,
      published_at: new Date().toISOString(),
      hero_image_url: image?.url,
      tags: [],
      status: 'published'
    };
  }
}
