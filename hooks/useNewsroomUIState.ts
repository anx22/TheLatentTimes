import { useState } from 'react';
import { NewsroomStep, ScoutedSignal, EditorialAngle, BlockAnnotation, DebateMessage, EditorialMethodology, SourcingStrategy, Signal, Claim, SimilarityReport, EvidencePack } from '../types';

export const useNewsroomUIState = () => {
  const [step, setStep] = useState<NewsroomStep>('IDLE');
  const [activeMethodology, setActiveMethodology] = useState<EditorialMethodology>('three-zone');
  const [topic, setTopic] = useState('');
  const [globalDirective, setGlobalDirective] = useState('');
  const [activeConsensus, setActiveConsensus] = useState<string | null>(null);
  const [debateTranscript, setDebateTranscript] = useState<DebateMessage[]>([]);
  const [context, setContext] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutedTopics, setScoutedTopics] = useState<ScoutedSignal[]>([]);
  const [angles, setAngles] = useState<EditorialAngle[]>([]);
  const [annotations, setAnnotations] = useState<BlockAnnotation[]>([]);
  const [isRewriting, setIsRewriting] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

  // Seed Article & Legal Guardrails
  const [seedArticle, setSeedArticle] = useState<Signal | null>(null);
  const [isLegalGuardrailsEnabled, setIsLegalGuardrailsEnabled] = useState<boolean>(true);
  const [extractedClaims, setExtractedClaims] = useState<Claim[]>([]);
  const [evidencePack, setEvidencePack] = useState<EvidencePack | null>(null);
  const [similarityReport, setSimilarityReport] = useState<SimilarityReport | null>(null);
  const [isExtractingClaims, setIsExtractingClaims] = useState(false);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);

  return {
    step, setStep,
    activeMethodology, setActiveMethodology,
    topic, setTopic,
    globalDirective, setGlobalDirective,
    activeConsensus, setActiveConsensus,
    debateTranscript, setDebateTranscript,
    context, setContext,
    isResearching, setIsResearching,
    error, setError,
    scoutedTopics, setScoutedTopics,
    angles, setAngles,
    annotations, setAnnotations,
    isRewriting, setIsRewriting,
    isEnhancing, setIsEnhancing,
    isIngesting, setIsIngesting,
    isGeneratingImage, setIsGeneratingImage,
    isScouting, setIsScouting,
    isDebating, setIsDebating,
    isDrafting, setIsDrafting,
    isPolishing, setIsPolishing,
    isHydrating, setIsHydrating,
    selectedStoryId, setSelectedStoryId,
    activeMissionId, setActiveMissionId,

    // Seed/Compliance states
    seedArticle, setSeedArticle,
    isLegalGuardrailsEnabled, setIsLegalGuardrailsEnabled,
    extractedClaims, setExtractedClaims,
    evidencePack, setEvidencePack,
    similarityReport, setSimilarityReport,
    isExtractingClaims, setIsExtractingClaims,
    isCheckingSimilarity, setIsCheckingSimilarity,
  };
};

