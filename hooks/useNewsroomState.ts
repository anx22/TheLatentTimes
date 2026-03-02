import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { MagazineItem, AspectRatio, NewsroomStep, SystemLog, GeneratedArticle, TickerItem, EditorialAngle, BlockAnnotation, DebateMessage, AtelierState } from '../types';
import { agentScout, agentTargetedSearch, agentColumnist, agentPhotographer, agentTicker, agentDebate, agentEditor, agentRewriteBlock, agentRewriteSentence, agentConsensus, agentPersonaSpeak, agentPromptEnhancer, agentArtDirector } from '../services/agents';
import { compressImage } from '../services/imageUtils';

export const useNewsroomState = (onPublish: (item: MagazineItem) => void) => {
  // --- CONVEX STATE (Real-time Database) ---
  const tickerItems = (useQuery(api.newsroom.queries.getTickerItems, {}) || []) as TickerItem[];
  const logs = (useQuery(api.newsroom.queries.getAgentLogs, {}) || []) as SystemLog[];
  
  // Local IDs for Draft/Image (Persisted)
  const [draftId, setDraftId] = useState<Id<"drafts"> | null>(null);
  const [imageId, setImageId] = useState<Id<"images"> | null>(null);

  // Fetch specific draft/image based on ID
  const draft = (useQuery(api.newsroom.queries.getDraftById, { id: draftId ?? undefined }) || null) as GeneratedArticle | null;
  const imageRecord = useQuery(api.newsroom.queries.getImageById, { id: imageId ?? undefined });
  const image = imageRecord ? imageRecord.url : null;

  const addTickerItemMutation = useMutation(api.newsroom.mutations.addTickerItem);
  const saveDraftMutation = useMutation(api.newsroom.mutations.saveDraft);
  const logMessageMutation = useMutation(api.newsroom.mutations.logMessage);
  const saveImageMutation = useMutation(api.newsroom.mutations.saveImage);
  const getUploadUrlMutation = useMutation(api.media.generateUploadUrl);
  const resetNewsroomMutation = useMutation(api.newsroom.mutations.resetNewsroom);
  const saveNewsroomStateMutation = useMutation(api.newsroom.mutations.saveNewsroomState);
  const clearLogsMutation = useMutation(api.newsroom.mutations.clearLogs);
  const persistedState = useQuery(api.newsroom.queries.getNewsroomState);

  // --- LOCAL UI STATE (Transient) ---
  const [step, setStep] = useState<NewsroomStep>('IDLE');
  const [topic, setTopic] = useState('');
  const [globalDirective, setGlobalDirective] = useState('');
  const [activeConsensus, setActiveConsensus] = useState<string | null>(null);
  const [debateTranscript, setDebateTranscript] = useState<DebateMessage[]>([]);
  const [context, setContext] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutedTopics, setScoutedTopics] = useState<string[]>([]);
  const [angles, setAngles] = useState<EditorialAngle[]>([]);
  const [annotations, setAnnotations] = useState<BlockAnnotation[]>([]);
  const [isLinting, setIsLinting] = useState(false);
  const [isRewriting, setIsRewriting] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isFetchingTicker, setIsFetchingTicker] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  // ATELIER STATE
  const [atelierState, setAtelierState] = useState<AtelierState>({
    concepts: [],
    activeConceptId: null,
    layout: 'COVER',
    activePalette: null,
    suggestedPalettes: [],
    customPrompt: '',
    modifiers: [],
    currentImageId: null,
    isGenerating: false
  });

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
    if (persistedState !== undefined && isHydrating) {
      if (persistedState) {
        const state = persistedState as any;
        
        let recoveredStep = state.step || 'IDLE';

        // --- HANGING STATE RECOVERY ---
        // If the user closed the page while an async agent was running,
        // the UI will be stuck in a loading state because the promise died.
        // We roll back to the last stable step.
        if (recoveredStep === 'NEWS_TERMINAL' && (!state.scoutedTopics || state.scoutedTopics.length === 0)) {
          recoveredStep = 'IDLE';
        } else if (recoveredStep === 'EDITORIAL_BOARD' && (!state.angles || state.angles.length === 0)) {
          recoveredStep = 'NEWS_TERMINAL';
        }

        setStep(recoveredStep);
        if (state.topic) setTopic(state.topic);
        if (state.globalDirective) setGlobalDirective(state.globalDirective);
        if (state.activeConsensus) setActiveConsensus(state.activeConsensus);
        if (state.debateTranscript) setDebateTranscript(state.debateTranscript);
        if (state.context) setContext(state.context);
        if (state.scoutedTopics) setScoutedTopics(state.scoutedTopics);
        if (state.angles) setAngles(state.angles);
        if (state.annotations) setAnnotations(state.annotations);
        if (state.draftId) setDraftId(state.draftId);
        if (state.imageId) setImageId(state.imageId);
        // Parameters
        if (state.sources) setSources(state.sources);
        if (state.noiseFilter) setNoiseFilter(state.noiseFilter);
        if (state.editorialLens) setEditorialLens(state.editorialLens);
        if (state.wordCount) setWordCount(state.wordCount);
        if (state.visualStyle) setVisualStyle(state.visualStyle);
        if (state.aspectRatio) setAspectRatio(state.aspectRatio);
        
        // Atelier Hydration (Partial)
        if (state.atelierState) {
           setAtelierState({
             ...state.atelierState,
             isGenerating: false // Always reset loading state
           });
        }
        
        // FORCE RESET ALL LOADING STATES
        // Ensure UI is never stuck in a loading state after reload
        setIsResearching(false);
        setIsScouting(false);
        setIsDebating(false);
        setIsDrafting(false);
        setIsGeneratingImage(false);
        setIsEnhancing(false);
        setIsRewriting(null);
        setIsFetchingTicker(false);
      }
      setIsHydrating(false);
    }
  }, [persistedState, isHydrating]);

  useEffect(() => {
    if (isHydrating) return;
    const stateToSave = {
      step, topic, globalDirective, activeConsensus, debateTranscript,
      context, scoutedTopics, angles, annotations, draftId, imageId,
      sources, noiseFilter, editorialLens, wordCount, visualStyle, aspectRatio,
      atelierState // Persist Atelier State
    };
    saveNewsroomStateMutation({ data: stateToSave });
  }, [
    step, topic, globalDirective, activeConsensus, debateTranscript,
    context, scoutedTopics, angles, annotations, draftId, imageId,
    sources, noiseFilter, editorialLens, wordCount, visualStyle, aspectRatio,
    atelierState,
    isHydrating, saveNewsroomStateMutation
  ]);

  const addLog = useCallback((agent: string, message: string, level: SystemLog['level'] = 'info') => {
    // We use the mutation to log to the database
    logMessageMutation({
      agentName: agent,
      message,
      step: 'UNKNOWN', // We can't easily access 'step' here due to closure, but it's fine for now
      level,
    });
  }, [logMessageMutation]);

  const fetchTickerData = useCallback(async () => {
    if (isFetchingTicker) return;
    setIsFetchingTicker(true);
    addLog('THE WIRE', 'Polling active sources for new signals...', 'info');
    
    try {
      const items = await agentTicker(sources, noiseFilter, globalDirective);
      // Save items to Convex
      for (const item of items) {
        await addTickerItemMutation({
          title: item.title,
          source: item.source,
          url: item.url,
          status: 'new'
        });
      }
      
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
  }, [sources, noiseFilter, isFetchingTicker, addLog, globalDirective, addTickerItemMutation]);

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
    setStep('NEWS_TERMINAL');
    setIsScouting(true);
    addLog('THE SCOUT', 'Initiating global hard-tech signal sweep...', 'action');
    try {
      const topics = await agentScout(sources, noiseFilter, globalDirective);
      setScoutedTopics(topics);
      addLog('THE SCOUT', `Signal sweep complete. Found ${topics.length} potential vectors.`, 'success');
      // Stay in NEWS_TERMINAL to show results
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Scout failure');
      addLog('SYSTEM', `Scout connection failed: ${e.message}`, 'error');
      setStep('IDLE');
    } finally {
      setIsScouting(false);
    }
  };

  const runDebate = async () => {
    if (!topic.trim()) return;
    
    setError(null);
    setStep('EDITORIAL_BOARD');
    setIsDebating(true);
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
    } finally {
      setIsDebating(false);
    }
  };

  const runPipeline = async (angle?: EditorialAngle, selectedHeadline?: string) => {
    if (!topic.trim()) return;
    
    setError(null);
    setIsDrafting(true);
    // Already in EDITORIAL_BOARD
    
    let currentContext = context;
    let currentLens = editorialLens;
    
    if (angle) {
      currentLens = `${angle.persona}: ${angle.angle}`;
      if (selectedHeadline) {
        currentLens += `\n\nMANDATORY HEADLINE: "${selectedHeadline}"`;
      }
      setEditorialLens(currentLens);
      addLog('THE EDITOR', `Commissioned piece on: "${topic}" with selected angle: "${selectedHeadline || angle.headline}"`, 'info');
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
      
      // Save draft to Convex
      const newDraftId = await saveDraftMutation({
        headline: article.headline,
        deck: article.deck,
        body: article.body,
        blocks: article.blocks,
        tags: article.tags,
        suggested_visual_prompt: article.suggested_visual_prompt,
        status: 'draft'
      });
      setDraftId(newDraftId);
      
      addLog('THE COLUMNIST', 'Draft completed and submitted to The Bullpen.', 'success');
      
      // Automatically run KI-Linter
      addLog('THE EDITOR', 'Running KI-Linter on new draft...', 'action');
      setIsLinting(true);
      try {
        const newAnnotations = await agentEditor(article.blocks, currentContext, currentLens, globalDirective);
        setAnnotations(newAnnotations);
        if (newAnnotations.length === 0) {
          addLog('THE EDITOR', 'KI-Linter found no issues. Draft is clean.', 'success');
        } else {
          addLog('THE EDITOR', `KI-Linter flagged ${newAnnotations.length} blocks for review.`, 'warning');
        }
      } catch (linterError: any) {
        addLog('THE EDITOR', `KI-Linter failed: ${linterError.message}`, 'error');
      } finally {
        setIsLinting(false);
      }
      
      // Stay in EDITORIAL_BOARD for review/editing
      addLog('THE EDITOR', 'Draft ready for review.', 'info');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Agent failure');
      addLog('SYSTEM', `Pipeline failure: ${e.message}`, 'error');
    } finally {
      setIsDrafting(false);
    }
  };

  const reDraft = async () => {
    if (!topic.trim() || !context.trim()) return;
    
    setError(null);
    setIsDrafting(true);
    // Stay in EDITORIAL_BOARD
    addLog('THE EDITOR', `Re-commissioned piece on: "${topic}" with NEW lens: "${editorialLens}"`, 'info');
    
    try {
      addLog('THE COLUMNIST', `Re-drafting prose (${wordCount})...`, 'action');
      const article = await agentColumnist(topic, context, editorialLens, wordCount, globalDirective);
      
      // Update draft in Convex (create new version)
      const newDraftId = await saveDraftMutation({
        headline: article.headline,
        deck: article.deck,
        body: article.body,
        blocks: article.blocks,
        tags: article.tags,
        suggested_visual_prompt: article.suggested_visual_prompt,
        status: 'draft'
      });
      setDraftId(newDraftId);
      
      addLog('THE COLUMNIST', 'Re-draft completed and submitted to The Bullpen.', 'success');
      
      // Automatically run KI-Linter
      addLog('THE EDITOR', 'Running KI-Linter on new draft...', 'action');
      setIsLinting(true);
      try {
        const newAnnotations = await agentEditor(article.blocks, context, editorialLens, globalDirective);
        setAnnotations(newAnnotations);
        if (newAnnotations.length === 0) {
          addLog('THE EDITOR', 'KI-Linter found no issues. Draft is clean.', 'success');
        } else {
          addLog('THE EDITOR', `KI-Linter flagged ${newAnnotations.length} blocks for review.`, 'warning');
        }
      } catch (linterError: any) {
        addLog('THE EDITOR', `KI-Linter failed: ${linterError.message}`, 'error');
      } finally {
        setIsLinting(false);
      }
      
      // Stay in EDITORIAL_BOARD
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Re-draft failure');
      addLog('SYSTEM', `Re-draft failure: ${e.message}`, 'error');
    } finally {
      setIsDrafting(false);
    }
  };

  const reShoot = async () => {
    if (!draft) return;
    
    setError(null);
    setStep('DARKROOM');
    setIsGeneratingImage(true);
    addLog('THE PHOTOGRAPHER', `Re-entering darkroom with NEW Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
    
    try {
      const imgUrlBase64 = await agentPhotographer(draft.suggested_visual_prompt || '', visualStyle, aspectRatio, globalDirective);
      
      addLog('THE PHOTOGRAPHER', 'Image generated. Optimizing for web (JPEG 70%)...', 'info');
      
      // Convert base64 to compressed JPEG blob
      const blob = await compressImage(imgUrlBase64, 0.7);

      // Get upload URL
      const postUrl = await getUploadUrlMutation();

      // Upload to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      const { storageId } = await result.json();

      // Save image to Convex
      const newImageId = await saveImageMutation({
        prompt: draft.suggested_visual_prompt || '',
        storageId: storageId
      });
      setImageId(newImageId);
      
      addLog('THE PHOTOGRAPHER', 'New visual assets developed and attached.', 'success');
      
      setStep('PRINTING_PRESS');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Re-shoot failure');
      addLog('SYSTEM', `Re-shoot failure: ${e.message}`, 'error');
    } finally {
      setIsGeneratingImage(false);
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
      
      // Update blocks locally
      const newBlocks = draft.blocks.map(b => b.id === blockId ? rewrittenBlock : b);
      
      // Reconstruct body from blocks
      const newBody = newBlocks.map(b => b.sentences.map(s => s.text).join(' ')).join('\n\n');

      // Save to Convex
      const newDraftId = await saveDraftMutation({
        headline: draft.headline,
        deck: draft.deck,
        body: newBody,
        blocks: newBlocks,
        tags: draft.tags,
        suggested_visual_prompt: draft.suggested_visual_prompt,
        status: (draft as any).status
      });
      setDraftId(newDraftId);
      
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
      const enhanced = await agentPromptEnhancer(draft.suggested_visual_prompt || '', visualStyle, globalDirective);
      
      // Update draft in Convex
      const newDraftId = await saveDraftMutation({
        headline: draft.headline,
        deck: draft.deck,
        body: draft.body,
        blocks: draft.blocks,
        tags: draft.tags,
        suggested_visual_prompt: enhanced,
        status: 'draft'
      });
      setDraftId(newDraftId);
      
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
      tags: draft.tags || [],
      media_type: 'image',
      hero_image_url: image,
      status: 'published',
      featured_level: 'none',
      score: { final: 8, recency: 10, trust: 8, novelty: 8, visual_fit: 9 },
      body: draft.body,
      blocks: draft.blocks
    };

    onPublish(newItem);
    setStep('PUBLISHED');
    addLog('SYSTEM', 'Artifact successfully published to the grid.', 'success');
  };

  const reset = async () => {
    setStep('IDLE');
    setTopic('');
    setContext('');
    setError(null);
    setScoutedTopics([]);
    setAngles([]);
    setAnnotations([]);
    setDebateTranscript([]);
    
    // Clear DB
    await resetNewsroomMutation({});
    
    addLog('SYSTEM', 'Pipeline reset. Awaiting new signal.', 'info');
  };

  const clearLogs = async () => {
    await clearLogsMutation({});
  };

  // --- ATELIER ACTIONS ---

  const runArtDirector = async () => {
    if (!draft) return;
    
    setIsGeneratingImage(true);
    addLog('THE ART DIRECTOR', 'Analyzing draft for visual identity...', 'action');
    
    try {
      const output = await agentArtDirector(draft);
      
      setAtelierState(prev => ({
        ...prev,
        concepts: output.concepts,
        suggestedPalettes: output.palettes,
        activeConceptId: output.concepts[0].id,
        activePalette: output.palettes[0],
        customPrompt: output.concepts[0].prompt,
        modifiers: []
      }));
      
      addLog('THE ART DIRECTOR', `Visual concepts generated: ${output.metaMeaning}`, 'success');
    } catch (e: any) {
      addLog('THE ART DIRECTOR', `Analysis failed: ${e.message}`, 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateAtelierImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    addLog('THE ATELIER', 'Developing high-fidelity asset...', 'action');
    
    try {
      // Construct final prompt with modifiers and palette
      const modifiers = atelierState.modifiers.join(', ');
      const palette = atelierState.activePalette ? `Color Palette: ${atelierState.activePalette.name} (${atelierState.activePalette.vibe})` : '';
      const layoutDirective = `Layout Optimization: ${atelierState.layout} (Ensure composition fits this format)`;
      
      const finalPrompt = `${prompt}. ${modifiers}. ${palette}. ${layoutDirective}. High resolution, masterpiece.`;
      
      // Determine Aspect Ratio based on Layout
      let ratio: AspectRatio = '16:9';
      if (atelierState.layout === 'COVER') ratio = '3:4';
      if (atelierState.layout === 'COLUMN') ratio = '1:1';
      if (atelierState.layout === 'SOCIAL') ratio = '1:1';

      const imgUrlBase64 = await agentPhotographer(finalPrompt, 'Editorial Photography', ratio, globalDirective);
      
      // Compress
      const blob = await compressImage(imgUrlBase64, 0.7);
      
      // Upload
      const postUrl = await getUploadUrlMutation();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      const { storageId } = await result.json();
      
      // Save
      const newImageId = await saveImageMutation({
        prompt: finalPrompt,
        storageId: storageId
      });
      
      setImageId(newImageId);
      
      // Update Local State for Preview
      // In a real app, we'd get the URL from the ID, but for immediate feedback we can use the base64 or blob URL
      const blobUrl = URL.createObjectURL(blob);
      setAtelierState(prev => ({
        ...prev,
        currentImageId: blobUrl
      }));

      addLog('THE ATELIER', 'Asset developed and fixed.', 'success');
    } catch (e: any) {
      addLog('THE ATELIER', `Development failed: ${e.message}`, 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    step, setStep, topic, setTopic, globalDirective, setGlobalDirective, activeConsensus,
    debateTranscript, draft, image, error, logs, tickerItems, scoutedTopics,
    angles, annotations, isLinting, isRewriting, isEnhancing, isFetchingTicker, isGeneratingImage, isScouting, isDebating, isDrafting, fetchTickerData,
    context, setContext, isResearching, researchTopic, scoutTopic, runDebate,
    runPipeline, reDraft, reShoot, rewriteBlock, enhancePrompt, publish, reset, clearLogs,
    sources, setSources, noiseFilter, setNoiseFilter, editorialLens, setEditorialLens,
    wordCount, setWordCount, visualStyle, setVisualStyle, aspectRatio, setAspectRatio,
    // Atelier Exports
    atelierState, setAtelierState, runArtDirector, generateAtelierImage
  };
};
