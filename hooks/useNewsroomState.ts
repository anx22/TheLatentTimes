import { useState, useCallback, useEffect } from 'react';
import { MagazineItem, AspectRatio, NewsroomStep, SystemLog, GeneratedArticle, TickerItem, EditorialAngle, BlockAnnotation, DebateMessage } from '../types';
import { agentScout, agentTargetedSearch, agentColumnist, agentPhotographer, agentTicker, agentDebate, agentEditor, agentRewriteBlock, agentRewriteSentence, agentConsensus, agentPersonaSpeak, agentPromptEnhancer } from '../services/agents';
import { saveNewsroomState, loadNewsroomState } from '../services/storage';

export const useNewsroomState = (onPublish: (item: MagazineItem) => void) => {
  const [step, setStep] = useState<NewsroomStep>('IDLE');
  const [topic, setTopic] = useState('');
  const [globalDirective, setGlobalDirective] = useState('');
  const [activeConsensus, setActiveConsensus] = useState<string | null>(null);
  const [debateTranscript, setDebateTranscript] = useState<DebateMessage[]>([]);
  const [context, setContext] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [draft, setDraft] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [scoutedTopics, setScoutedTopics] = useState<string[]>([]);
  const [angles, setAngles] = useState<EditorialAngle[]>([]);
  const [annotations, setAnnotations] = useState<BlockAnnotation[]>([]);
  const [isLinting, setIsLinting] = useState(false);
  const [isRewriting, setIsRewriting] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isFetchingTicker, setIsFetchingTicker] = useState(false);

  // Parameters
  const [sources, setSources] = useState({ github: true, arxiv: true, techcrunch: true });
  const [noiseFilter, setNoiseFilter] = useState(50);
  const [editorialLens, setEditorialLens] = useState('Tech-Optimist (Default)');
  const [wordCount, setWordCount] = useState('Standard (600 words)');
  const [visualStyle, setVisualStyle] = useState('Editorial Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isHydrating, setIsHydrating] = useState(true);

  // --- STATE HYDRATION ---
  useEffect(() => {
    let mounted = true;
    const loadState = async () => {
      try {
        const state = await loadNewsroomState();
        if (mounted && state) {
          if (state.step) setStep(state.step);
          if (state.topic) setTopic(state.topic);
          if (state.globalDirective) setGlobalDirective(state.globalDirective);
          if (state.activeConsensus) setActiveConsensus(state.activeConsensus);
          if (state.debateTranscript) setDebateTranscript(state.debateTranscript);
          if (state.context) setContext(state.context);
          if (state.draft) setDraft(state.draft);
          if (state.image) setImage(state.image);
          if (state.tickerItems) setTickerItems(state.tickerItems);
          if (state.scoutedTopics) setScoutedTopics(state.scoutedTopics);
          if (state.angles) setAngles(state.angles);
          if (state.annotations) setAnnotations(state.annotations);
          // Parameters
          if (state.sources) setSources(state.sources);
          if (state.noiseFilter) setNoiseFilter(state.noiseFilter);
          if (state.editorialLens) setEditorialLens(state.editorialLens);
          if (state.wordCount) setWordCount(state.wordCount);
          if (state.visualStyle) setVisualStyle(state.visualStyle);
          if (state.aspectRatio) setAspectRatio(state.aspectRatio);
        }
      } catch (e) {
        console.error("Failed to load newsroom state:", e);
      } finally {
        if (mounted) setIsHydrating(false);
      }
    };
    loadState();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (isHydrating) return;
    const stateToSave = {
      step, topic, globalDirective, activeConsensus, debateTranscript,
      context, draft, image, tickerItems, scoutedTopics, angles, annotations,
      sources, noiseFilter, editorialLens, wordCount, visualStyle, aspectRatio
    };
    saveNewsroomState(stateToSave);
  }, [
    step, topic, globalDirective, activeConsensus, debateTranscript,
    context, draft, image, tickerItems, scoutedTopics, angles, annotations,
    sources, noiseFilter, editorialLens, wordCount, visualStyle, aspectRatio,
    isHydrating
  ]);

  const addLog = useCallback((agent: string, message: string, level: SystemLog['level'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      agent,
      message,
      level
    }]);
  }, []);

  const fetchTickerData = useCallback(async () => {
    if (isFetchingTicker) return;
    setIsFetchingTicker(true);
    addLog('THE WIRE', 'Polling active sources for new signals...', 'info');
    
    try {
      const items = await agentTicker(sources, noiseFilter, globalDirective);
      setTickerItems(items);
      addLog('THE WIRE', `Intercepted ${items.length} signals from active sources.`, 'success');

      if (items.length > 0) {
        addLog('THE DIRECTOR', 'Synthesizing active consensus...', 'info');
        const consensus = await agentConsensus(items, globalDirective);
        setActiveConsensus(consensus);
        addLog('THE DIRECTOR', 'Active consensus established.', 'success');
      } else {
        setActiveConsensus(null);
      }
    } catch (e: any) {
      addLog('THE WIRE', `Failed to poll sources: ${e.message}`, 'error');
    } finally {
      setIsFetchingTicker(false);
    }
  }, [sources, noiseFilter, isFetchingTicker, addLog, globalDirective]);

  const researchTopic = async (t: string) => {
    if (!t.trim()) return;
    setIsResearching(true);
    addLog('THE SCOUT', `Conducting deep-dive research on: "${t}"...`, 'action');
    try {
      const result = await agentTargetedSearch(t, globalDirective);
      setContext(result.context);
      if (result.grounded) {
        addLog('THE SCOUT', 'Deep-dive briefing compiled from real-world signals.', 'success');
      } else {
        addLog('THE SCOUT', 'WARNING: No real-world technical grounding found. Proceeding with speculative synthesis.', 'warning');
      }
    } catch (e: any) {
      addLog('THE SCOUT', `Research failed: ${e.message}`, 'error');
    } finally {
      setIsResearching(false);
    }
  };

  const scoutTopic = async () => {
    setError(null);
    setStep('SCOUTING');
    addLog('THE SCOUT', 'Initiating global hard-tech signal sweep...', 'action');
    try {
      const topics = await agentScout(sources, noiseFilter, globalDirective);
      setScoutedTopics(topics);
      addLog('THE SCOUT', `Signal sweep complete. Found ${topics.length} potential vectors.`, 'success');
      setStep('IDLE');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Scout failure');
      addLog('SYSTEM', `Scout connection failed: ${e.message}`, 'error');
      setStep('IDLE');
    }
  };

  const runDebate = async () => {
    if (!topic.trim()) return;
    
    setError(null);
    setStep('DEBATING');
    setDebateTranscript([]);
    setAngles([]);
    addLog('THE BOARD', `Convening Editorial Board to debate: "${topic}"`, 'info');
    
    let currentContext = context;

    try {
      if (!currentContext) {
        addLog('THE SCOUT', `No context provided. Forcing emergency deep-dive on: "${topic}"...`, 'warning');
        const result = await agentTargetedSearch(topic, globalDirective);
        currentContext = result.context;
        setContext(currentContext);
        if (result.grounded) {
          addLog('THE SCOUT', 'Deep-dive briefing compiled.', 'success');
        } else {
          addLog('THE SCOUT', 'WARNING: Debating ungrounded/fictional topic.', 'warning');
        }
      }

      // Sequential Debate
      const personas = ['The Tech-Optimist', 'The Culture-Critic', 'The Fashion-Forward'];
      const transcript: DebateMessage[] = [];

      for (const persona of personas) {
        addLog('THE BOARD', `${persona} is contributing to the debate...`, 'action');
        const message = await agentPersonaSpeak(persona, topic, currentContext, transcript, globalDirective);
        transcript.push(message);
        setDebateTranscript([...transcript]);
      }

      addLog('THE BOARD', 'Synthesizing editorial angles from the debate...', 'action');
      const generatedAngles = await agentDebate(topic, currentContext, globalDirective, transcript);
      setAngles(generatedAngles.angles);
      addLog('THE BOARD', 'Debate concluded. Angles presented for selection.', 'success');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Debate failure');
      addLog('SYSTEM', `Debate failure: ${e.message}`, 'error');
      setStep('IDLE');
    }
  };

  const runPipeline = async (angle?: EditorialAngle) => {
    if (!topic.trim()) return;
    
    setError(null);
    setStep('WRITING');
    
    let currentContext = context;
    let currentLens = editorialLens;
    
    if (angle) {
      currentLens = `${angle.persona}: ${angle.angle}`;
      setEditorialLens(currentLens);
      addLog('THE EDITOR', `Commissioned piece on: "${topic}" with selected angle: "${angle.headline}"`, 'info');
    } else {
      addLog('THE EDITOR', `Commissioned piece on: "${topic}" with lens: "${editorialLens}"`, 'info');
    }

    try {
      if (!currentContext) {
        addLog('THE SCOUT', `No context provided. Forcing emergency deep-dive on: "${topic}"...`, 'warning');
        const result = await agentTargetedSearch(topic, globalDirective);
        currentContext = result.context;
        setContext(currentContext);
        if (result.grounded) {
          addLog('THE SCOUT', 'Deep-dive briefing compiled.', 'success');
        } else {
          addLog('THE SCOUT', 'WARNING: Writing on ungrounded/fictional topic.', 'warning');
        }
      }

      addLog('THE COLUMNIST', `Drafting prose (${wordCount}) and synthesizing cultural vectors...`, 'action');
      const article = await agentColumnist(topic, currentContext, currentLens, wordCount, globalDirective);
      setDraft(article);
      addLog('THE COLUMNIST', 'Draft completed and submitted to The Bullpen.', 'success');
      
      setStep('VISUALIZING');
      addLog('THE PHOTOGRAPHER', `Entering darkroom. Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
      const imgUrl = await agentPhotographer(article.suggested_visual_prompt, visualStyle, aspectRatio, globalDirective);
      setImage(imgUrl);
      addLog('THE PHOTOGRAPHER', 'Visual assets developed and attached.', 'success');
      
      setStep('REVIEW');
      addLog('THE EDITOR', 'Artifact ready for final review in The Press.', 'info');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Agent failure');
      addLog('SYSTEM', `Pipeline failure: ${e.message}`, 'error');
      setStep('IDLE');
    }
  };

  const reDraft = async () => {
    if (!topic.trim() || !context.trim()) return;
    
    setError(null);
    setStep('WRITING');
    addLog('THE EDITOR', `Re-commissioned piece on: "${topic}" with NEW lens: "${editorialLens}"`, 'info');
    
    try {
      addLog('THE COLUMNIST', `Re-drafting prose (${wordCount})...`, 'action');
      const article = await agentColumnist(topic, context, editorialLens, wordCount, globalDirective);
      setDraft(article);
      addLog('THE COLUMNIST', 'Re-draft completed and submitted to The Bullpen.', 'success');
      
      if (!image) {
        setStep('VISUALIZING');
        addLog('THE PHOTOGRAPHER', `Entering darkroom. Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
        const imgUrl = await agentPhotographer(article.suggested_visual_prompt, visualStyle, aspectRatio, globalDirective);
        setImage(imgUrl);
        addLog('THE PHOTOGRAPHER', 'Visual assets developed and attached.', 'success');
      }
      
      setStep('REVIEW');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Re-draft failure');
      addLog('SYSTEM', `Re-draft failure: ${e.message}`, 'error');
      setStep('IDLE');
    }
  };

  const reShoot = async () => {
    if (!draft) return;
    
    setError(null);
    setStep('VISUALIZING');
    addLog('THE PHOTOGRAPHER', `Re-entering darkroom with NEW Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
    
    try {
      const imgUrl = await agentPhotographer(draft.suggested_visual_prompt, visualStyle, aspectRatio, globalDirective);
      setImage(imgUrl);
      addLog('THE PHOTOGRAPHER', 'New visual assets developed and attached.', 'success');
      
      setStep('REVIEW');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Re-shoot failure');
      addLog('SYSTEM', `Re-shoot failure: ${e.message}`, 'error');
      setStep('IDLE');
    }
  };

  const runLinter = async () => {
    if (!draft || !draft.blocks) return;
    setIsLinting(true);
    addLog('THE EDITOR', 'Running KI-Linter on draft blocks...', 'action');
    try {
      const newAnnotations = await agentEditor(draft.blocks, context, editorialLens, globalDirective);
      setAnnotations(newAnnotations);
      
      if (newAnnotations.length === 0) {
        addLog('THE EDITOR', 'KI-Linter found no issues. Draft is clean.', 'success');
      } else {
        addLog('THE EDITOR', `KI-Linter flagged ${newAnnotations.length} blocks for review.`, 'warning');
        
        const updatedBlocks = draft.blocks.map(block => {
          const hasAnnotation = newAnnotations.some(a => a.blockId === block.id);
          return hasAnnotation ? { ...block, status: 'flagged' as const } : block;
        });
        setDraft({ ...draft, blocks: updatedBlocks });
      }
    } catch (e: any) {
      addLog('THE EDITOR', `KI-Linter failed: ${e.message}`, 'error');
    } finally {
      setIsLinting(false);
    }
  };

  const rewriteBlock = async (blockId: string, instruction: string, sentenceId?: string) => {
    if (!draft || !draft.blocks) return;
    const blockToRewrite = draft.blocks.find(b => b.id === blockId);
    if (!blockToRewrite) return;

    setIsRewriting(blockId);
    addLog('THE COLUMNIST', `Rewriting ${sentenceId ? 'sentence' : 'block'} ${sentenceId || blockId} per Editor instruction...`, 'action');
    try {
      let rewrittenBlock;
      if (sentenceId) {
        rewrittenBlock = await agentRewriteSentence(blockToRewrite, sentenceId, instruction, context, editorialLens, globalDirective);
      } else {
        rewrittenBlock = await agentRewriteBlock(blockToRewrite, instruction, context, editorialLens, globalDirective);
      }
      
      const updatedBlocks = draft.blocks.map(b => b.id === blockId ? rewrittenBlock : b);
      setDraft({ ...draft, blocks: updatedBlocks });
      
      setAnnotations(prev => prev.filter(a => a.blockId !== blockId || (sentenceId && a.sentenceId !== sentenceId)));
      
      addLog('THE COLUMNIST', `${sentenceId ? 'Sentence' : 'Block'} rewritten successfully.`, 'success');
    } catch (e: any) {
      addLog('THE COLUMNIST', `Rewrite failed: ${e.message}`, 'error');
    } finally {
      setIsRewriting(null);
    }
  };

  const enhancePrompt = async () => {
    if (!draft) return;
    setIsEnhancing(true);
    addLog('THE PHOTOGRAPHER', 'Applying Magic Enhance to visual prompt...', 'action');
    try {
      const enhanced = await agentPromptEnhancer(draft.suggested_visual_prompt, visualStyle, globalDirective);
      setDraft({ ...draft, suggested_visual_prompt: enhanced });
      addLog('THE PHOTOGRAPHER', 'Visual prompt enhanced with high-fidelity details.', 'success');
    } catch (e: any) {
      addLog('THE PHOTOGRAPHER', `Enhancement failed: ${e.message}`, 'error');
    } finally {
      setIsEnhancing(false);
    }
  };

  const publish = () => {
    if (!draft || !image) return;
    
    const newItem: MagazineItem = {
      id: Math.random().toString(36).substring(7),
      title: draft.headline,
      dek: draft.deck,
      published_at: new Date().toISOString(),
      tags: draft.tags,
      media_type: 'image',
      hero_image_url: image,
      status: 'published',
      featured_level: 'none',
      score: { final: 8, recency: 10, trust: 8, novelty: 8, visual_fit: 9 }
    };

    onPublish(newItem);
    setStep('PUBLISHED');
    addLog('SYSTEM', 'Artifact successfully published to the grid.', 'success');
  };

  const reset = () => {
    setStep('IDLE');
    setTopic('');
    setContext('');
    setDraft(null);
    setImage(null);
    setError(null);
    setScoutedTopics([]);
    setAngles([]);
    setAnnotations([]);
    setDebateTranscript([]);
    addLog('SYSTEM', 'Pipeline reset. Awaiting new signal.', 'info');
  };

  return {
    step, topic, setTopic, globalDirective, setGlobalDirective, activeConsensus,
    debateTranscript, draft, image, error, logs, tickerItems, scoutedTopics,
    angles, annotations, isLinting, isRewriting, isEnhancing, isFetchingTicker, fetchTickerData,
    context, setContext, isResearching, researchTopic, scoutTopic, runDebate,
    runPipeline, reDraft, reShoot, runLinter, rewriteBlock, enhancePrompt, publish, reset,
    sources, setSources, noiseFilter, setNoiseFilter, editorialLens, setEditorialLens,
    wordCount, setWordCount, visualStyle, setVisualStyle, aspectRatio, setAspectRatio
  };
};
