import React, { createContext } from 'react';
import { MagazineItem, NewsroomStep, SystemLog, GeneratedArticle, Signal, EditorialAngle, BlockAnnotation, DebateMessage, ScoutedSignal, EditorialMethodology, WorkbenchSession, StoryAngle, SourcingStrategy, Claim, SimilarityReport, EvidencePack } from '../types';
import { useNewsroomState } from '../hooks/useNewsroomState';
import { useAuth } from './AuthContext';

interface NewsroomContextType {
  step: NewsroomStep;
  setStep: (step: NewsroomStep) => void;
  activeMethodology: EditorialMethodology;
  setActiveMethodology: (m: EditorialMethodology) => void;
  topic: string;
  setTopic: (t: string) => void;
  globalDirective: string;
  setGlobalDirective: (d: string) => void;
  activeWorkbenchSession: WorkbenchSession | null | undefined;
  storyAngles: StoryAngle[];
  initializeWorkbench: (signalIds: string[]) => Promise<void>;
  generateWorkbenchAngles: (context?: string) => Promise<void>;
  toggleStoryAngle: (id: string, selected: boolean) => Promise<void>;
  executeDraftFromWorkbench: () => Promise<void>;
  activeConsensus: string | null;
  debateTranscript: DebateMessage[];
  draft: GeneratedArticle | null;
  drafts: GeneratedArticle[];
  setDraftId: (id: any) => void;
  image: string | null;
  error: string | null;
  setError: (err: string | null) => void;
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
  runDeepDiscovery: () => Promise<{ processed: number, newStories: number, newStoryIds: any[] }>;
  runDebate: () => Promise<void>;
  runPipeline: (angle?: EditorialAngle, selectedHeadline?: string) => Promise<void>;
  reDraft: () => Promise<void>;
  reShoot: () => Promise<void>;
  rewriteBlock: (blockId: string, instruction: string, sentenceId?: string) => Promise<void>;
  enhancePrompt: () => Promise<void>;
  runFinalPolish: () => Promise<void>;
  publish: () => Promise<any>;
  reset: () => Promise<any>;
  clearLogs: () => Promise<any>;
  logMessage: (agent: string, message: string, level?: string) => Promise<any>;
  isPolishing: boolean;
  selectedStoryId: string | null;
  setSelectedStoryId: (id: string | null) => void;
  runIntegrityDrill: () => Promise<Array<{ module: string; status: 'passed' | 'failed'; message: string; latency: number }>>;
  engineSchedule: { morning: string; midday: string; evening: string; enabled: boolean };
  setEngineSchedule: (s: { morning: string; midday: string; evening: string; enabled: boolean }) => void;
  isSaving: boolean;
  noiseFilter: number;
  setNoiseFilter: (n: number) => void;
  dbSources: any[];
  mutations: any;

  // Seed Article & Legal Guardrails
  seedArticle: Signal | null;
  setSeedArticle: (s: Signal | null) => void;
  isLegalGuardrailsEnabled: boolean;
  setIsLegalGuardrailsEnabled: (b: boolean) => void;
  extractedClaims: Claim[];
  setExtractedClaims: (c: Claim[]) => void;
  evidencePack: EvidencePack | null;
  setEvidencePack: (p: EvidencePack | null) => void;
  similarityReport: SimilarityReport | null;
  setSimilarityReport: (r: SimilarityReport | null) => void;
  isExtractingClaims: boolean;
  isCheckingSimilarity: boolean;
  extractClaimsFromSeed: () => Promise<Claim[]>;
  gatherIndependentEvidence: () => Promise<EvidencePack | null>;
  runSimilarityAudit: (draftText: string) => Promise<SimilarityReport | null>;

  // Auth / read-only state (populated by the read-only guard below).
  readOnly?: boolean;
  canEdit?: boolean;
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

/**
 * READ-ONLY GUARD — the single choke-point that enforces the auth soft wall.
 *
 * Deny-by-default: when the session is not editable, EVERY function on the context
 * is replaced with a no-op that surfaces a read-only notice — EXCEPT local UI
 * setters (keys starting with "set"), which stay live so anonymous visitors can
 * still navigate the rooms. Because the rule is "guard everything that is not a
 * setter", any action added to the newsroom in the future is gated automatically
 * without touching this code. The raw `mutations` object is likewise neutralised.
 */
const applyReadOnlyGuard = (state: any, canEdit: boolean): NewsroomContextType => {
  if (canEdit) {
    return { ...state, canEdit: true, readOnly: false } as NewsroomContextType;
  }
  const notify = () => {
    try {
      state.setError?.('🔒 Read-only-Modus — bitte im Newsroom einloggen, um Aktionen auszuführen.');
    } catch { /* ignore */ }
  };
  const guarded: any = {};
  for (const key of Object.keys(state)) {
    const val = state[key];
    if (typeof val === 'function' && !key.startsWith('set')) {
      guarded[key] = (..._args: any[]) => { notify(); return Promise.resolve(undefined); };
    } else {
      guarded[key] = val;
    }
  }
  // Neutralise direct mutation access too (any property -> async no-op).
  guarded.mutations = new Proxy({}, { get: () => () => Promise.resolve(undefined) });
  guarded.canEdit = false;
  guarded.readOnly = true;
  return guarded as NewsroomContextType;
};

const NewsroomInternalProvider: React.FC<{ children: React.ReactNode, onPublish: (item: MagazineItem, layout?: any[]) => void }> = ({ children, onPublish }) => {
  const state = useNewsroomState(onPublish);
  const { canEdit } = useAuth();
  const value = applyReadOnlyGuard(state, canEdit);

  return (
    <NewsroomContext.Provider value={value}>
      {children}
    </NewsroomContext.Provider>
  );
};

