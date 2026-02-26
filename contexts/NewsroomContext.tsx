
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { agentScout, agentTargetedSearch, agentColumnist, agentPhotographer, agentTicker, agentDebate } from '../services/newsroom-agents';
import { MagazineItem, AspectRatio, NewsroomStep, SystemLog, GeneratedArticle, TickerItem, EditorialAngle } from '../types';

interface NewsroomContextType {
  step: NewsroomStep;
  topic: string;
  setTopic: (t: string) => void;
  draft: GeneratedArticle | null;
  image: string | null;
  error: string | null;
  logs: SystemLog[];
  tickerItems: TickerItem[];
  scoutedTopics: string[];
  angles: EditorialAngle[];
  isFetchingTicker: boolean;
  fetchTickerData: () => Promise<void>;
  context: string;
  setContext: (c: string) => void;
  isResearching: boolean;
  researchTopic: (t: string) => Promise<void>;
  scoutTopic: () => Promise<void>;
  runDebate: () => Promise<void>;
  runPipeline: (angle?: EditorialAngle) => Promise<void>;
  reDraft: () => Promise<void>;
  reShoot: () => Promise<void>;
  publish: () => void;
  reset: () => void;
  // Parameters
  sources: { github: boolean; arxiv: boolean; techcrunch: boolean };
  setSources: (s: { github: boolean; arxiv: boolean; techcrunch: boolean }) => void;
  noiseFilter: number;
  setNoiseFilter: (n: number) => void;
  editorialLens: string;
  setEditorialLens: (l: string) => void;
  wordCount: string;
  setWordCount: (w: string) => void;
  visualStyle: string;
  setVisualStyle: (s: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
}

export const NewsroomContext = createContext<NewsroomContextType | undefined>(undefined);

export const NewsroomProvider: React.FC<{ children: React.ReactNode, onPublish: (item: MagazineItem) => void }> = ({ children, onPublish }) => {
  const [step, setStep] = useState<NewsroomStep>('IDLE');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [draft, setDraft] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [scoutedTopics, setScoutedTopics] = useState<string[]>([]);
  const [angles, setAngles] = useState<EditorialAngle[]>([]);
  const [isFetchingTicker, setIsFetchingTicker] = useState(false);

  // Parameters
  const [sources, setSources] = useState({ github: true, arxiv: true, techcrunch: true });
  const [noiseFilter, setNoiseFilter] = useState(50);
  const [editorialLens, setEditorialLens] = useState('Tech-Optimist (Default)');
  const [wordCount, setWordCount] = useState('Standard (600 words)');
  const [visualStyle, setVisualStyle] = useState('Editorial Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

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
      const items = await agentTicker(sources, noiseFilter);
      setTickerItems(items);
      addLog('THE WIRE', `Intercepted ${items.length} signals from active sources.`, 'success');
    } catch (e: any) {
      addLog('THE WIRE', `Failed to poll sources: ${e.message}`, 'error');
    } finally {
      setIsFetchingTicker(false);
    }
  }, [sources, noiseFilter, isFetchingTicker, addLog]);

  const researchTopic = async (t: string) => {
    if (!t.trim()) return;
    setIsResearching(true);
    addLog('THE SCOUT', `Conducting deep-dive research on: "${t}"...`, 'action');
    try {
      const result = await agentTargetedSearch(t);
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
      const topics = await agentScout(sources, noiseFilter);
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
    addLog('THE BOARD', `Convening Editorial Board to debate: "${topic}"`, 'info');
    
    let currentContext = context;

    try {
      if (!currentContext) {
        addLog('THE SCOUT', `No context provided. Forcing emergency deep-dive on: "${topic}"...`, 'warning');
        const result = await agentTargetedSearch(topic);
        currentContext = result.context;
        setContext(currentContext);
        if (result.grounded) {
          addLog('THE SCOUT', 'Deep-dive briefing compiled.', 'success');
        } else {
          addLog('THE SCOUT', 'WARNING: Debating ungrounded/fictional topic.', 'warning');
        }
      }

      addLog('THE BOARD', 'Generating distinct editorial angles...', 'action');
      const generatedAngles = await agentDebate(topic, currentContext);
      setAngles(generatedAngles);
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
        const result = await agentTargetedSearch(topic);
        currentContext = result.context;
        setContext(currentContext);
        if (result.grounded) {
          addLog('THE SCOUT', 'Deep-dive briefing compiled.', 'success');
        } else {
          addLog('THE SCOUT', 'WARNING: Writing on ungrounded/fictional topic.', 'warning');
        }
      }

      addLog('THE COLUMNIST', `Drafting prose (${wordCount}) and synthesizing cultural vectors...`, 'action');
      const article = await agentColumnist(topic, currentContext, currentLens, wordCount);
      setDraft(article);
      addLog('THE COLUMNIST', 'Draft completed and submitted to The Bullpen.', 'success');
      
      setStep('VISUALIZING');
      addLog('THE PHOTOGRAPHER', `Entering darkroom. Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
      const imgUrl = await agentPhotographer(article.suggested_visual_prompt, visualStyle, aspectRatio);
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
      const article = await agentColumnist(topic, context, editorialLens, wordCount);
      setDraft(article);
      addLog('THE COLUMNIST', 'Re-draft completed and submitted to The Bullpen.', 'success');
      
      // If we don't have an image yet, we should probably generate one to complete the pipeline
      if (!image) {
        setStep('VISUALIZING');
        addLog('THE PHOTOGRAPHER', `Entering darkroom. Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
        const imgUrl = await agentPhotographer(article.suggested_visual_prompt, visualStyle, aspectRatio);
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
      const imgUrl = await agentPhotographer(draft.suggested_visual_prompt, visualStyle, aspectRatio);
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

  const publish = () => {
    if (!draft || !image) return;
    
    addLog('THE PRESS', 'Initiating print sequence...', 'action');
    const newItem: MagazineItem = {
      id: `item_${Date.now()}`,
      title: draft.headline,
      dek: draft.deck,
      published_at: new Date().toISOString(),
      tags: draft.tags,
      media_type: 'image',
      hero_image_url: image,
      status: 'published',
      featured_level: 'featured',
      score: { final: 10, recency: 10, trust: 10, novelty: 10, visual_fit: 10 }
    };
    
    onPublish(newItem);
    setStep('PUBLISHED');
    addLog('THE PRESS', `Artifact published to the grid. ID: ${newItem.id}`, 'success');
    
    setTimeout(() => {
      setStep('IDLE');
      setTopic('');
      setContext('');
      setDraft(null);
      setImage(null);
      addLog('SYSTEM', 'Newsroom floor reset for next cycle.', 'info');
    }, 3000);
  };

  const reset = () => {
    setStep('IDLE');
    setTopic('');
    setContext('');
    setDraft(null);
    setImage(null);
    setAngles([]);
    setError(null);
    addLog('SYSTEM', 'Manual reset triggered. Cleared all desks.', 'warning');
  };

  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchTickerData();
      initialFetchDone.current = true;
    }
  }, [fetchTickerData]);

  return (
    <NewsroomContext.Provider value={{
      step, topic, setTopic, context, setContext, isResearching, researchTopic, draft, image, error, logs, tickerItems, scoutedTopics, angles, isFetchingTicker,
      fetchTickerData, scoutTopic, runDebate, runPipeline, reDraft, reShoot, publish, reset,
      sources, setSources, noiseFilter, setNoiseFilter, editorialLens, setEditorialLens,
      wordCount, setWordCount, visualStyle, setVisualStyle, aspectRatio, setAspectRatio
    }}>
      {children}
    </NewsroomContext.Provider>
  );
};

