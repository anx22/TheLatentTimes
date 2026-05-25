import { useCallback, useEffect, useMemo } from 'react';
import { MagazineItem, EditorialAngle, AspectRatio } from '../types';
import { EditorialOrchestrator } from '../services/editorial';
import { AtelierEngine } from '../services/visual';
import { PublicationOrchestrator } from '../services/publication';
import { ArchitectureDrill } from '../services/testing';
import { listModels } from '../services/gemini';
import { MissionRegistry } from '../services/mission';

// Refactored Sub-Hooks
import { useNewsroomUIState } from './useNewsroomUIState';
import { useNewsroomData } from './useNewsroomData';
import { useEditorialAgents } from './useEditorialAgents';
import { useVisualAgents } from './useVisualAgents';
import { usePublicationFlow } from './usePublicationFlow';
import { useAtelier } from '../contexts/AtelierContext';
import { useParameters } from '../contexts/ParameterContext';

export const useNewsroomState = (onPublish: (item: MagazineItem, layout?: any[]) => void) => {
  useEffect(() => {
    listModels();
  }, []);

  // 1. DOMAIN STATE
  const ui = useNewsroomUIState();
  const data = useNewsroomData();
  const { atelierState, setAtelierState } = useAtelier();
  const params = useParameters();

  // 1.5 AUTO-SEED SOURCES
  useEffect(() => {
    if (data.dbSourcesResult !== undefined && data.dbSources.length === 0) {
      data.mutations.seedSources({});
    }
  }, [data.dbSourcesResult, data.dbSources, data.mutations]);

  // 2. MISSION REGISTRY
  const missionRegistry = useMemo(() => new MissionRegistry(data.mutations), [data.mutations]);

  // 3. LOGGING HELPER
  const addLog = useCallback((agent: string, message: string, level: any = 'info') => {
    data.mutations.logMessage({
      agentName: agent,
      message,
      level,
      step: ui.step,
      missionId: (ui.activeMissionId || undefined) as any
    });
  }, [data.mutations, ui]);

  // 4. ENGINES
  const orchestrator = useMemo(() => new EditorialOrchestrator({
    globalDirective: ui.globalDirective,
    missionId: ui.activeMissionId || undefined,
    onLog: (source, msg, type, mId) => data.mutations.logMessage({ agentName: source, message: msg, level: type, step: 'EDITORIAL', missionId: (mId || ui.activeMissionId || undefined) as any })
  }), [ui, data.mutations]);

  const atelier = useMemo(() => new AtelierEngine({
    globalDirective: ui.globalDirective,
    onLog: (source, msg, type) => data.mutations.logMessage({ agentName: source, message: msg, level: type, step: 'DARKROOM', missionId: (ui.activeMissionId || undefined) as any })
  }), [ui, data.mutations]);

  const publication = useMemo(() => new PublicationOrchestrator({
    globalDirective: ui.globalDirective,
    missionId: ui.activeMissionId || undefined,
    onLog: (source, msg, type, mId) => data.mutations.logMessage({ agentName: source, message: msg, level: type, step: 'PRESS', missionId: (mId || ui.activeMissionId || undefined) as any })
  }), [ui, data.mutations]);

  // 5. ACTION HOOKS
  const editorial = useEditorialAgents(data, ui, orchestrator, missionRegistry, addLog);
  const visual = useVisualAgents(data, ui, atelier, missionRegistry, addLog);
  const press = usePublicationFlow(data, ui, publication, onPublish, missionRegistry, addLog);

  // 5. HYDRATION & PERSISTENCE
  useEffect(() => {
    if (data.persistedState !== undefined && ui.isHydrating) {
      if (data.persistedState) {
        const state = data.persistedState as any;
        ui.setStep(state.step || 'IDLE');
        ui.setTopic(state.topic || '');
        ui.setGlobalDirective(state.globalDirective || '');
        ui.setContext(state.context || '');
        ui.setScoutedTopics(state.scoutedTopics || []);
        ui.setAngles(state.angles || []);
        ui.setSelectedStoryId(state.selectedStoryId || null);
        data.setDraftId(state.draftId || null);
        data.setImageId(state.imageId || null);
        setAtelierState(state.atelierState || atelierState);
        
        if (state.editorialDepartment) params.setEditorialDepartment(state.editorialDepartment);
        if (state.wordCount) params.setWordCount(state.wordCount);
        if (state.visualStyle) params.setVisualStyle(state.visualStyle);
        if (state.aspectRatio) params.setAspectRatio(state.aspectRatio);

        // Reset all loading
        ui.setIsResearching(false);
        ui.setIsScouting(false);
        ui.setIsDebating(false);
        ui.setIsDrafting(false);
      }
      ui.setIsHydrating(false);
    }
  }, [data.persistedState, ui, data]);

  useEffect(() => {
    if (ui.isHydrating) return;
    data.mutations.saveNewsroomState({
      data: {
        step: ui.step, topic: ui.topic, globalDirective: ui.globalDirective,
        context: ui.context, scoutedTopics: ui.scoutedTopics, angles: ui.angles,
        draftId: data.draftId, imageId: data.imageId, atelierState: atelierState,
        editorialDepartment: params.editorialDepartment,
        wordCount: params.wordCount,
        visualStyle: params.visualStyle,
        aspectRatio: params.aspectRatio,
        selectedStoryId: ui.selectedStoryId
      }
    });
  }, [
    ui.step, ui.topic, ui.globalDirective, ui.context, ui.scoutedTopics, ui.angles, 
    data.draftId, data.imageId, atelierState, ui.isHydrating, data.mutations, data, 
    params.editorialDepartment, params.wordCount, params.visualStyle, params.aspectRatio,
    ui.selectedStoryId
  ]);

  // 6. WRAPPER ACTIONS
  const reset = async () => {
    ui.setStep('IDLE');
    ui.setTopic('');
    ui.setContext('');
    ui.setError(null);
    await data.mutations.resetNewsroom({});
    addLog('SYSTEM', 'Pipeline reset.', 'info');
  };

  const clearLogs = async () => {
    await data.mutations.clearLogs({});
  };

  const publish = async () => {
    await press.publish();
  };

  return {
    ...ui,
    ...data,
    ...params,
    atelierState,
    setAtelierState,
    ...editorial,
    ...visual,
    ...press,
    reset,
    publish,
    clearLogs,
    runIntegrityDrill: useCallback(() => new ArchitectureDrill().runIntegrityDrill(), [])
  };
};
