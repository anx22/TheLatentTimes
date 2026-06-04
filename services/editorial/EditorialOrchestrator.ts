import { agentDebate, agentColumnist, agentEditor, agentTargetedSearch, agentPersonaSpeak, DEBATE_PERSONAS } from '../agents';
import { DebateMessage, EditorialAngle, GeneratedArticle, BlockAnnotation } from '../../types';

// How many full rounds the board debates. 2 = each persona gets to react to the
// others' opening positions → genuine friction, not a one-shot fabrication (T-2.3.1).
export const DEBATE_ROUNDS = 2;

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
  async conductDebate(topic: string, context?: string, missionId?: string): Promise<{ transcript: DebateMessage[], angles: EditorialAngle[], context: string, rounds: number }> {
    const activeContext = await this.ensureContext(topic, context, missionId);
    const mId = missionId || this.config.missionId;

    this.log('THE BOARD', `Convening Editorial Board to debate: "${topic}"`, 'info', missionId);

    // T-2.3.1: REAL multi-round friction. Each persona actually speaks in turn,
    // reacting to the accumulating transcript — no single fabricated JSON dump.
    const transcript: DebateMessage[] = [];
    for (let round = 1; round <= DEBATE_ROUNDS; round++) {
      for (const persona of DEBATE_PERSONAS) {
        this.log('THE BOARD', `${persona.name} weighs in (round ${round}/${DEBATE_ROUNDS})...`, 'action', missionId);
        const turn = await agentPersonaSpeak(
          persona.name, persona.lens, topic, activeContext, transcript, this.config.globalDirective, mId
        );
        transcript.push({ persona: turn.persona || persona.name, message: turn.message });
      }
    }

    // The LLM now only SYNTHESIZES angles from the REAL transcript (transcript
    // branch of agentDebate); it does not invent the debate.
    this.log('THE BOARD', 'Synthesizing the debate into curated angles...', 'action', missionId);
    const synth = await agentDebate(topic, activeContext, this.config.globalDirective, transcript, mId);

    this.log('THE BOARD', `Debate concluded — ${transcript.length} turns over ${DEBATE_ROUNDS} rounds.`, 'success', missionId);

    return {
      transcript,
      angles: synth.angles,
      context: activeContext,
      rounds: DEBATE_ROUNDS,
    };
  }

  /**
   * Produces a clean draft and automatically runs the KI-Linter.
   */
  async produceDraft(
    topic: string, 
    context: string, 
    lens: string, 
    wordCount: string | number,
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
