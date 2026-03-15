import React, { createContext } from 'react';
import { MagazineItem, AspectRatio, NewsroomStep, SystemLog, GeneratedArticle, TickerItem, EditorialAngle, BlockAnnotation, DebateMessage, AtelierState, ScoutedSignal, LayoutItem } from '../types';
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
  newsClusters: any[];
  scoutedTopics: ScoutedSignal[];
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
  synthesizeCluster: (clusterId: any) => Promise<void>;
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
  runFinalPolish: () => Promise<void>;
  publish: () => void;
  reset: () => void;
  clearLogs: () => Promise<void>;
  isPolishing: boolean;
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
  
  // Atelier
  atelierState: AtelierState;
  setAtelierState: React.Dispatch<React.SetStateAction<AtelierState>>;
  runArtDirector: () => Promise<void>;
  generateAtelierImage: (prompt: string, isEdit?: boolean) => Promise<void>;

  // Layout
  layout: LayoutItem[];
  setLayout: (l: LayoutItem[]) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NewsroomContext = createContext<NewsroomContextType | undefined>(undefined);

export const NewsroomProvider: React.FC<{ children: React.ReactNode, onPublish: (item: MagazineItem, layout: LayoutItem[]) => void, initialLayout?: LayoutItem[] }> = ({ children, onPublish, initialLayout }) => {
  const state = useNewsroomState(onPublish, initialLayout);

  return (
    <NewsroomContext.Provider value={state}>
      {children}
    </NewsroomContext.Provider>
  );
};
