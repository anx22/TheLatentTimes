import { agentPersonaSpeak, agentDebate, agentColumnist, agentEditor, agentTargetedSearch } from '../agents';
import { DebateMessage, EditorialAngle, GeneratedArticle, BlockAnnotation } from '../../types';

export interface EditorialOrchestratorConfig {
  globalDirective?: string;
  missionId?: string;
  onLog?: (source: string, message: string, type: 'info' | 'action' | 'success' | 'warning' | 'error', missionId?: string) => void;
}

/**
 * EditorialOrchestrator
 * 
 * A DEEP module that encapsulates the multi-agent coordination logic of the newsroom.
 * It provides high-leverage entry points for long-running editorial processes.
 */
export class EditorialOrchestrator {
  private config: EditorialOrchestratorConfig;

  constructor(config: EditorialOrchestratorConfig = {}) {
    this.config = config;
  }

  private log(source: string, message: string, type: 'info' | 'action' | 'success' | 'warning' | 'error' = 'info', missionId?: string) {
    this.config.onLog?.(source, message, type, missionId || this.config.missionId);
  }

  /**
   * Ensures context is available for a topic. If missing, runs targeted search.
   */
  async ensureContext(topic: string, existingContext?: string, missionId?: string): Promise<string> {
    if (existingContext) return existingContext;
    
    this.log('THE SCOUT', `No context provided. Forcing emergency deep-dive on: "${topic}"...`, 'warning', missionId);
    const result = await agentTargetedSearch(topic, this.config.globalDirective, missionId || this.config.missionId);
    
    if (result.grounded) {
      this.log('THE SCOUT', 'Deep-dive briefing compiled.', 'success', missionId);
    } else {
      this.log('THE SCOUT', 'WARNING: Grounding uncertain for this topic.', 'warning', missionId);
    }
    
    return result.context;
  }

  /**
   * Conducts a multi-perspective debate and generates editorial angles.
   */
  async conductDebate(topic: string, context?: string, missionId?: string): Promise<{ transcript: DebateMessage[], angles: EditorialAngle[], context: string }> {
    const activeContext = await this.ensureContext(topic, context, missionId);
    
    const personas = ['The Tech-Optimist', 'The Culture-Critic', 'The Fashion-Forward'];
    const transcript: DebateMessage[] = [];

    this.log('THE BOARD', `Convening Editorial Board to debate: "${topic}"`, 'info', missionId);

    for (const persona of personas) {
      this.log('THE BOARD', `${persona} is contributing to the debate...`, 'action', missionId);
      const message = await agentPersonaSpeak(persona, topic, activeContext, transcript, this.config.globalDirective, missionId || this.config.missionId);
      transcript.push(message);
    }

    this.log('THE BOARD', 'Synthesizing editorial angles from the debate...', 'action', missionId);
    const debateResult = await agentDebate(topic, activeContext, this.config.globalDirective, transcript, missionId || this.config.missionId);
    
    this.log('THE BOARD', 'Debate concluded. Angles presented for selection.', 'success', missionId);
    
    return {
      transcript,
      angles: debateResult.angles,
      context: activeContext
    };
  }

  /**
   * Produces a clean draft and automatically runs the KI-Linter.
   */
  async produceDraft(
    topic: string, 
    context: string, 
    lens: string, 
    wordCount: string,
    missionId?: string
  ): Promise<{ article: GeneratedArticle, annotations: BlockAnnotation[] }> {
    const activeContext = await this.ensureContext(topic, context, missionId);
    
    this.log('THE COLUMNIST', `Drafting prose (${wordCount}) and synthesizing cultural vectors...`, 'action', missionId);
    
    const article = await agentColumnist(topic, activeContext, lens, wordCount, this.config.globalDirective, missionId || this.config.missionId);
    
    this.log('THE COLUMNIST', 'Draft completed and submitted to The Bullpen.', 'success', missionId);
    
    this.log('THE EDITOR', 'Running KI-Linter on new draft...', 'action', missionId);
    let annotations: BlockAnnotation[] = [];
    
    try {
      annotations = await agentEditor(article.blocks, context, lens, this.config.globalDirective, missionId || this.config.missionId);
      if (annotations.length === 0) {
        this.log('THE EDITOR', 'KI-Linter found no issues. Draft is clean.', 'success', missionId);
      } else {
        this.log('THE EDITOR', `KI-Linter flagged ${annotations.length} blocks for review.`, 'warning', missionId);
      }
    } catch (e: any) {
      this.log('THE EDITOR', `KI-Linter failed: ${e.message}`, 'error', missionId);
    }

    return { article, annotations };
  }
}
