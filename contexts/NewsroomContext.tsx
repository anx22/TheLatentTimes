import React, { createContext } from 'react';
import { MagazineItem, AspectRatio, NewsroomStep, SystemLog, GeneratedArticle, TickerItem, EditorialAngle, BlockAnnotation, DebateMessage } from '../types';
import { useNewsroomState } from '../hooks/useNewsroomState';

interface NewsroomContextType {
  step: NewsroomStep;
  setStep: (step: NewsroomStep) => void;
  topic: string;
  setTopic: (t: string) => void;
  globalDirective: string;
  setGlobalDirective: (d: string) => void;
  activeConsensus: string | null;
  debateTranscript: DebateMessage[];
  draft: GeneratedArticle | null;
  image: string | null;
  error: string | null;
  logs: SystemLog[];
  tickerItems: TickerItem[];
  scoutedTopics: string[];
  angles: EditorialAngle[];
  annotations: BlockAnnotation[];
  isLinting: boolean;
  isRewriting: string | null;
  isEnhancing: boolean;
  isFetchingTicker: boolean;
  isGeneratingImage: boolean;
  isScouting: boolean;
  isDebating: boolean;
  isDrafting: boolean;
  fetchTickerData: () => Promise<void>;
  context: string;
  setContext: (c: string) => void;
  isResearching: boolean;
  researchTopic: (t: string) => Promise<void>;
  scoutTopic: () => Promise<void>;
  runDebate: () => Promise<void>;
  runPipeline: (angle?: EditorialAngle, selectedHeadline?: string) => Promise<void>;
  reDraft: () => Promise<void>;
  reShoot: () => Promise<void>;
  rewriteBlock: (blockId: string, instruction: string, sentenceId?: string) => Promise<void>;
  enhancePrompt: () => Promise<void>;
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
  const state = useNewsroomState(onPublish);

  return (
    <NewsroomContext.Provider value={state}>
      {children}
    </NewsroomContext.Provider>
  );
};
