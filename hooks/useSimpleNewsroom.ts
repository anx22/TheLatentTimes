import { useState, useCallback } from 'react';
import { agentScout, agentTargetedSearch, agentColumnist, agentPhotographer, GeneratedArticle } from '../services/newsroom-agents';
import { MagazineItem } from '../types';

export type NewsroomStep = 'IDLE' | 'SCOUTING' | 'WRITING' | 'VISUALIZING' | 'REVIEW' | 'PUBLISHED';

export interface SystemLog {
  id: string;
  timestamp: Date;
  agent: string;
  message: string;
  level: 'info' | 'action' | 'success' | 'error' | 'warning';
}

export interface TickerItem {
  id: string;
  source: string;
  text: string;
  time: string;
  type: string;
}

export const useSimpleNewsroom = (onPublish: (item: MagazineItem) => void) => {
  const [step, setStep] = useState<NewsroomStep>('IDLE');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isFetchingTicker, setIsFetchingTicker] = useState(false);

  // Parameters
  const [sources, setSources] = useState({ github: true, arxiv: true, techcrunch: true });
  const [noiseFilter, setNoiseFilter] = useState(50);
  const [editorialLens, setEditorialLens] = useState('Tech-Optimist (Default)');
  const [wordCount, setWordCount] = useState('Standard (600 words)');
  const [visualStyle, setVisualStyle] = useState('Editorial Photography');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const addLog = (agent: string, message: string, level: SystemLog['level'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      agent,
      message,
      level
    }]);
  };

  const fetchTickerData = useCallback(async () => {
    setIsFetchingTicker(true);
    addLog('THE WIRE', 'Polling active sources for new signals...', 'info');
    
    try {
      const items: TickerItem[] = [];
      
      // 1. GitHub Trending (Simulated via Search API to avoid auth issues, looking for recent AI repos)
      if (sources.github) {
        try {
          const date = new Date();
          date.setDate(date.getDate() - 7);
          const dateString = date.toISOString().split('T')[0];
          const res = await fetch(`https://api.github.com/search/repositories?q=topic:ai+created:>${dateString}&sort=stars&order=desc&per_page=3`);
          if (res.ok) {
            const data = await res.json();
            data.items.forEach((repo: any) => {
              items.push({
                id: `gh-${repo.id}`,
                source: 'GitHub',
                text: `${repo.name}: ${repo.description?.substring(0, 60) || 'New AI Repository'}`,
                time: 'Just now',
                type: 'code'
              });
            });
          }
        } catch (e) {
          console.warn("GitHub fetch failed", e);
        }
      }

      // 2. Arxiv (Simulated fetch for CS.AI)
      if (sources.arxiv) {
        items.push({
          id: `ar-${Date.now()}`,
          source: 'Arxiv (CS.AI)',
          text: 'Emergent Reasoning Capabilities in Small Language Models',
          time: '1h ago',
          type: 'paper'
        });
        items.push({
          id: `ar-${Date.now()+1}`,
          source: 'Arxiv (CS.AI)',
          text: 'Optimizing Latent Space for High-Fidelity Image Generation',
          time: '3h ago',
          type: 'paper'
        });
      }

      // 3. TechCrunch (Simulated)
      if (sources.techcrunch) {
        items.push({
          id: `tc-${Date.now()}`,
          source: 'TechCrunch',
          text: 'OpenAI announces new reasoning model architecture',
          time: '2h ago',
          type: 'news'
        });
      }

      // Apply Noise Filter (simulate filtering by dropping items if filter is strict)
      const filteredItems = items.slice(0, Math.max(1, Math.floor(items.length * (100 - noiseFilter) / 100) + 1));

      setTickerItems(filteredItems);
      addLog('THE WIRE', `Intercepted ${filteredItems.length} signals from active sources.`, 'success');
    } catch (e: any) {
      addLog('THE WIRE', `Failed to poll sources: ${e.message}`, 'error');
    } finally {
      setIsFetchingTicker(false);
    }
  }, [sources, noiseFilter]);

  const scoutTopic = async () => {
    setError(null);
    setStep('SCOUTING');
    addLog('THE SCOUT', 'Initiating global hard-tech signal sweep...', 'action');
    try {
      const newTopic = await agentScout();
      setTopic(newTopic);
      setContext('Auto-scouted global tech trend.');
      addLog('THE SCOUT', `Signal intercepted: "${newTopic}"`, 'success');
      setStep('IDLE');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Scout failure');
      addLog('SYSTEM', `Scout connection failed: ${e.message}`, 'error');
      setStep('IDLE');
    }
  };

  const runPipeline = async () => {
    if (!topic.trim()) return;
    
    setError(null);
    setStep('WRITING');
    addLog('THE EDITOR', `Commissioned piece on: "${topic}" with lens: "${editorialLens}"`, 'info');
    
    let currentContext = context;

    try {
      // 0. Targeted Search (if context is empty, meaning it was manually typed or clicked from ticker without deep dive)
      if (!currentContext) {
        addLog('THE SCOUT', `Conducting deep-dive research on: "${topic}"...`, 'action');
        currentContext = await agentTargetedSearch(topic);
        setContext(currentContext);
        addLog('THE SCOUT', 'Deep-dive briefing compiled.', 'success');
      }

      // 1. Write
      addLog('THE COLUMNIST', `Drafting prose (${wordCount}) and synthesizing cultural vectors...`, 'action');
      const article = await agentColumnist(topic, currentContext, editorialLens, wordCount);
      setDraft(article);
      addLog('THE COLUMNIST', 'Draft completed and submitted to The Bullpen.', 'success');
      
      // 2. Visualize
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
    
    // Reset after a delay
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
    setError(null);
    addLog('SYSTEM', 'Manual reset triggered. Cleared all desks.', 'warning');
  };

  return {
    step,
    topic,
    setTopic,
    draft,
    image,
    error,
    logs,
    tickerItems,
    isFetchingTicker,
    fetchTickerData,
    scoutTopic,
    runPipeline,
    publish,
    reset,
    // Parameter states and setters
    sources, setSources,
    noiseFilter, setNoiseFilter,
    editorialLens, setEditorialLens,
    wordCount, setWordCount,
    visualStyle, setVisualStyle,
    aspectRatio, setAspectRatio
  };
};
