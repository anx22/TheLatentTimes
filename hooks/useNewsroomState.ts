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

export const useNewsroomState = (onPublish: (item: MagazineItem, layout?: any[]) => void) => {
  useEffect(() => {
    listModels();
  }, []);

  // 1. DOMAIN STATE
  const ui = useNewsroomUIState();
  const data = useNewsroomData();

  // 2. MISSION REGISTRY
  const missionRegistry = useMemo(() => new MissionRegistry(data.mutations), [data.mutations]);

  // 3. LOGGING HELPER
  const addLog = useCallback((agent: string, message: string, level: any = 'info') => {
    data.mutations.logMessage({
      agentName: agent,
      message,
      level,
      step: ui.step,
      missionId: (ui as any).activeMissionId
    });
  }, [data.mutations, ui.step, (ui as any).activeMissionId]);

  // 4. ENGINES
  const orchestrator = useMemo(() => new EditorialOrchestrator({
    globalDirective: ui.globalDirective,
    missionId: (ui as any).activeMissionId,
    onLog: (source, msg, type, mId) => data.mutations.logMessage({ agentName: source, message: msg, level: type, step: 'EDITORIAL', missionId: mId as any })
  }), [ui.globalDirective, data.mutations, (ui as any).activeMissionId]);

  const atelier = useMemo(() => new AtelierEngine({
    globalDirective: ui.globalDirective,
    onLog: (source, msg, type) => data.mutations.logMessage({ agentName: source, message: msg, level: type, step: 'DARKROOM', missionId: (ui as any).activeMissionId as any })
  }), [ui.globalDirective, data.mutations, (ui as any).activeMissionId]);

  const publication = useMemo(() => new PublicationOrchestrator({
    globalDirective: ui.globalDirective,
    missionId: (ui as any).activeMissionId,
    onLog: (source, msg, type, mId) => data.mutations.logMessage({ agentName: source, message: msg, level: type, step: 'PRESS', missionId: mId as any })
  }), [ui.globalDirective, data.mutations, (ui as any).activeMissionId]);

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
        data.setDraftId(state.draftId || null);
        data.setImageId(state.imageId || null);
        ui.setAtelierState(state.atelierState || ui.atelierState);
        // Reset all loading
        ui.setIsResearching(false);
        ui.setIsScouting(false);
        ui.setIsDebating(false);
        ui.setIsDrafting(false);
      }
      ui.setIsHydrating(false);
    }
  }, [data.persistedState, ui]);

  useEffect(() => {
    if (ui.isHydrating) return;
    data.mutations.saveNewsroomState({
      data: {
        step: ui.step, topic: ui.topic, globalDirective: ui.globalDirective,
        context: ui.context, scoutedTopics: ui.scoutedTopics, angles: ui.angles,
        draftId: data.draftId, imageId: data.imageId, atelierState: ui.atelierState
      }
    });
  }, [ui.step, ui.topic, ui.globalDirective, ui.context, ui.scoutedTopics, ui.angles, data.draftId, data.imageId, ui.atelierState, ui.isHydrating, data.mutations]);

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
    ...editorial,
    ...visual,
    ...press,
    reset,
    publish,
    clearLogs,
    runIntegrityDrill: useCallback(() => new ArchitectureDrill().runIntegrityDrill(), [])
  };
};
