import { useState } from 'react';
import { agentColumnist, agentPhotographer, GeneratedArticle } from '../services/newsroom-agents';
import { MagazineItem } from '../types';

export type NewsroomStep = 'IDLE' | 'WRITING' | 'VISUALIZING' | 'REVIEW' | 'PUBLISHED';

export const useSimpleNewsroom = (onPublish: (item: MagazineItem) => void) => {
  const [step, setStep] = useState<NewsroomStep>('IDLE');
  const [topic, setTopic] = useState('');
  const [draft, setDraft] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = async () => {
    if (!topic.trim()) return;
    
    setError(null);
    setStep('WRITING');
    
    try {
      // 1. Write
      const article = await agentColumnist(topic);
      setDraft(article);
      
      // 2. Visualize
      setStep('VISUALIZING');
      const imgUrl = await agentPhotographer(article.suggested_visual_prompt);
      setImage(imgUrl);
      
      setStep('REVIEW');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Agent failure');
      setStep('IDLE');
    }
  };

  const publish = () => {
    if (!draft || !image) return;
    
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
    
    // Reset after a delay
    setTimeout(() => {
      setStep('IDLE');
      setTopic('');
      setDraft(null);
      setImage(null);
    }, 2000);
  };

  const reset = () => {
    setStep('IDLE');
    setTopic('');
    setDraft(null);
    setImage(null);
    setError(null);
  };

  return {
    step,
    topic,
    setTopic,
    draft,
    image,
    error,
    runPipeline,
    publish,
    reset
  };
};
