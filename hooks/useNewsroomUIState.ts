import { useState } from 'react';
import { NewsroomStep, ScoutedSignal, EditorialAngle, BlockAnnotation, DebateMessage, AtelierState, AspectRatio } from '../types';

export const useNewsroomUIState = () => {
  const [step, setStep] = useState<NewsroomStep>('IDLE');
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
  const [isFetchingTicker, setIsFetchingTicker] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

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
    isGenerating: false,
    history: []
  });

  // Parameters
  const [sources, setSources] = useState({ github: true, arxiv: true, techcrunch: true });
  const [noiseFilter, setNoiseFilter] = useState(50);
  const [editorialLens, setEditorialLens] = useState('Tech-Optimist (Default)');
  const [wordCount, setWordCount] = useState('Standard (600 words)');
  const [visualStyle, setVisualStyle] = useState('Editorial Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  return {
    step, setStep,
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
    isFetchingTicker, setIsFetchingTicker,
    isGeneratingImage, setIsGeneratingImage,
    isScouting, setIsScouting,
    isDebating, setIsDebating,
    isDrafting, setIsDrafting,
    isPolishing, setIsPolishing,
    isHydrating, setIsHydrating,
    selectedStoryId, setSelectedStoryId,
    atelierState, setAtelierState,
    sources, setSources,
    noiseFilter, setNoiseFilter,
    editorialLens, setEditorialLens,
    wordCount, setWordCount,
    visualStyle, setVisualStyle,
    aspectRatio, setAspectRatio
  };
};
