import { useState } from 'react';
import { NewsroomStep, ScoutedSignal, EditorialAngle, BlockAnnotation, DebateMessage, AtelierState, AspectRatio, EditorialDepartment } from '../types';

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
  const [isIngesting, setIsIngesting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

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
    isIngesting, setIsIngesting,
    isGeneratingImage, setIsGeneratingImage,
    isScouting, setIsScouting,
    isDebating, setIsDebating,
    isDrafting, setIsDrafting,
    isPolishing, setIsPolishing,
    isHydrating, setIsHydrating,
    selectedStoryId, setSelectedStoryId,
    activeMissionId, setActiveMissionId,
  };
};

