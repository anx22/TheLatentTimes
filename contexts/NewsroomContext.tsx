import React, { createContext } from 'react';
import { MagazineItem, AspectRatio, NewsroomStep, SystemLog, GeneratedArticle, Signal, EditorialAngle, BlockAnnotation, DebateMessage, AtelierState, ScoutedSignal, EditorialDepartment } from '../types';
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
  drafts: GeneratedArticle[];
  setDraftId: (id: any) => void;
  image: string | null;
  error: string | null;
  logs: SystemLog[];
  signals: Signal[];
  newsClusters: any[];
  scoutedTopics: ScoutedSignal[];
  angles: EditorialAngle[];
  annotations: BlockAnnotation[];
  isRewriting: string | null;
  isEnhancing: boolean;
  isIngesting: boolean;
  isGeneratingImage: boolean;
  isScouting: boolean;
  isDebating: boolean;
  isDrafting: boolean;
  ingestSignals: () => Promise<void>;
  synthesizeCluster: (clusterId: any) => Promise<void>;
  context: string;
  setContext: (c: string) => void;
  isResearching: boolean;
  researchTopic: (t: string) => Promise<void>;
  scoutTopic: () => Promise<void>;
  runDeepDiscovery: () => Promise<void>;
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
  selectedStoryId: string | null;
  setSelectedStoryId: (id: string | null) => void;
  runIntegrityDrill: () => Promise<Array<{ module: string; status: 'passed' | 'failed'; message: string; latency: number }>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NewsroomContext = createContext<NewsroomContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useNewsroom = () => {
  const context = React.useContext(NewsroomContext);
  if (context === undefined) {
    throw new Error('useNewsroom must be used within a NewsroomProvider');
  }
  return context;
};

import { AtelierProvider } from './AtelierContext';
import { ParameterProvider } from './ParameterContext';

export const NewsroomProvider: React.FC<{ children: React.ReactNode, onPublish: (item: MagazineItem, layout?: any[]) => void }> = ({ children, onPublish }) => {
  return (
    <AtelierProvider>
      <ParameterProvider>
        <NewsroomInternalProvider onPublish={onPublish}>
          {children}
        </NewsroomInternalProvider>
      </ParameterProvider>
    </AtelierProvider>
  );
};

const NewsroomInternalProvider: React.FC<{ children: React.ReactNode, onPublish: (item: MagazineItem, layout?: any[]) => void }> = ({ children, onPublish }) => {
  const state = useNewsroomState(onPublish);

  return (
    <NewsroomContext.Provider value={state}>
      {children}
    </NewsroomContext.Provider>
  );
};

