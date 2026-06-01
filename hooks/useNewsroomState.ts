import { useCallback, useEffect, useMemo } from 'react';
import { MagazineItem, EditorialAngle, AspectRatio } from '../types';
import { EditorialOrchestrator } from '../services/editorial';
import { AtelierEngine } from '../services/visual';
import { PublicationOrchestrator } from '../services/publication';
import { ArchitectureDrill } from '../services/testing';
import { MissionRegistry } from '../services/mission';
import { agentExtractSeedClaims, agentSearchIndependentSources, agentCheckSeedSimilarity } from '../services/agents';

// Refactored Sub-Hooks
import { useNewsroomUIState } from './useNewsroomUIState';
import { useNewsroomData } from './useNewsroomData';
import { useEditorialAgents } from './useEditorialAgents';
import { useVisualAgents } from './useVisualAgents';
import { usePublicationFlow } from './usePublicationFlow';
import { useAtelier } from '../contexts/AtelierContext';
import { useParameters } from '../contexts/ParameterContext';
import { useAuth } from '../contexts/AuthContext';

// Strip the heavy base64 payloads before persisting atelier state. A single
// full-res `currentImageBase64` (plus up to 10 in `history`) can be several MB
// and push the newsroom_state document past Convex's ~1 MB limit, which would
// throw inside saveNewsroomState and silently kill ALL persistence — including
// the draftId/imageId that the Darkroom needs to re-show the developed asset on
// reload. The asset itself is durable via the persisted imageId (Convex
// storage), so the base64 is purely transient (only used as an img2img ref
// within a live session) and safe to drop.
const sanitizeAtelierForPersist = (atelierState: any) => {
  if (!atelierState) return atelierState;
  const { currentImageBase64, history, ...rest } = atelierState;
  return {
    ...rest,
    history: Array.isArray(history)
      ? history.slice(0, 10).map(({ base64, ...item }: any) => item)
      : [],
  };
};

export const useNewsroomState = (onPublish: (item: MagazineItem, layout?: any[]) => void, isActive: boolean = false) => {
  // 1. DOMAIN STATE
  const ui = useNewsroomUIState();
  const data = useNewsroomData(isActive);
  const { atelierState, setAtelierState } = useAtelier();
  const params = useParameters();
  // Read-only sessions must not seed sources or persist shared UI state — that
  // would let anonymous viewers clobber the editors' newsroom_state["current"].
  const { canEdit } = useAuth();

  // 1.5 AUTO-SEED SOURCES (editors only)
  useEffect(() => {
    if (!canEdit) return;
    if (data.dbSourcesResult !== undefined) {
      const needsSeed = data.dbSources.length === 0 || data.dbSources.some((s: any) => !s.pack);
      if (needsSeed) {
        data.mutations.seedSources({});
      }
    }
  }, [canEdit, data.dbSourcesResult, data.dbSources, data.mutations]);

  // 2. MISSION REGISTRY
  const missionRegistry = useMemo(() => new MissionRegistry(data.mutations), [data.mutations]);

  // 3. LOGGING HELPER
  const addLog = useCallback(async (agent: string, message: string, level: any = 'info') => {
    return await data.mutations.logMessage({
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
  const allUi = { ...ui, ...params, atelierState, setAtelierState };
  const editorial = useEditorialAgents(data, allUi, orchestrator, missionRegistry, addLog);
  const visual = useVisualAgents(data, allUi, atelier, missionRegistry, addLog);
  const press = usePublicationFlow(data, allUi, publication, onPublish, missionRegistry, addLog);

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
        if (state.atelierState) setAtelierState(prev => ({ ...prev, ...state.atelierState }));
        if (state.activeMethodology) ui.setActiveMethodology(state.activeMethodology);
        
        // Reset all loading
        ui.setIsResearching(false);
        ui.setIsScouting(false);
        ui.setIsDebating(false);
        ui.setIsDrafting(false);
      }
      ui.setIsHydrating(false);
    }
  }, [data.persistedState, ui, data, setAtelierState]);

  useEffect(() => {
    if (ui.isHydrating || !canEdit) return;
    data.mutations.saveNewsroomState({
      key: "current",
      data: {
        step: ui.step, 
        topic: ui.topic, 
        globalDirective: ui.globalDirective,
        context: ui.context, 
        scoutedTopics: ui.scoutedTopics, 
        angles: ui.angles,
        draftId: data.draftId,
        imageId: data.imageId,
        atelierState: sanitizeAtelierForPersist(atelierState),
        selectedStoryId: ui.selectedStoryId,
        activeMethodology: ui.activeMethodology,
      }
    });
  }, [
    canEdit,
    ui.step, ui.topic, ui.globalDirective, ui.context, ui.scoutedTopics, ui.angles,
    data.draftId, data.imageId, atelierState, ui.isHydrating, data.mutations,
    ui.selectedStoryId, ui.activeMethodology
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

  const toggleStoryAngle = async (id: string, selected: boolean) => {
    await data.mutations.toggleStoryAngle({ id: id as any, selected });
  };

  const extractClaimsFromSeed = async () => {
    if (!ui.seedArticle) {
      addLog('THE SCOUT', 'No seed article nominated yet.', 'warning');
      return [];
    }
    ui.setIsExtractingClaims(true);
    addLog('THE SCOUT', `Deconstructing seed article to raw, atomic facts...`, 'action');
    try {
      const claims = await agentExtractSeedClaims(
        ui.seedArticle.title,
        ui.seedArticle.content || '',
        ui.seedArticle.sourcePack || ui.seedArticle.sourceType || 'Wire',
        ui.seedArticle.url || '',
        ui.activeMissionId || undefined
      );
      ui.setExtractedClaims(claims);
      addLog('THE SCOUT', `Extraction completed. ${claims.length} fact claims isolated from protected phrasing.`, 'success');
      return claims;
    } catch (e: any) {
      addLog('THE SCOUT', `Fact claim extraction failed: ${e.message}`, 'error');
      return [];
    } finally {
      ui.setIsExtractingClaims(false);
    }
  };


  const gatherIndependentEvidence = async () => {
    if (ui.extractedClaims.length === 0) {
      addLog('THE SCOUT', 'No atomic fact claims available. Run extraction first.', 'warning');
      return null;
    }
    ui.setIsResearching(true);
    addLog('THE SCOUT', `Launching targeted web searches to gather independent evidence & confirmations...`, 'action');
    try {
      const pack = await agentSearchIndependentSources(ui.extractedClaims, ui.activeMissionId || undefined);
      ui.setEvidencePack(pack);
      addLog('THE SCOUT', `Evidence Pack synthesized successfully! ${pack.sources.length} independent sources analyzed.`, 'success');
      return pack;
    } catch (e: any) {
      addLog('THE SCOUT', `Independent search exploration failed: ${e.message}`, 'error');
      return null;
    } finally {
      ui.setIsResearching(false);
    }
  };

  const runSimilarityAudit = async (draftText: string) => {
    if (!ui.seedArticle) {
      addLog('THE EDITOR', 'No seed article is defined to run compliance checks against.', 'warning');
      return null;
    }
    ui.setIsCheckingSimilarity(true);
    addLog('THE EDITOR', `Auditing copy structure & literal phrasing distance...`, 'action');
    try {
      const report = await agentCheckSeedSimilarity(
        draftText,
        ui.seedArticle.content || '',
        ui.activeMissionId || undefined
      );
      ui.setSimilarityReport(report);
      if (report.score >= 70) {
        addLog('THE COMPLIANCE', `UrhG Clearance Approved: Safety Distance is ${report.score}% (PASSED). No copycat phrasing.`, 'success');
      } else {
        addLog('THE COMPLIANCE', `UrhG Compliance Alert: High copycat risk. Safety Distance is ${report.score}% (FAILED).`, 'warning');
      }
      return report;
    } catch (e: any) {
      addLog('THE EDITOR', `Similarity validation failed: ${e.message}`, 'error');
      return null;
    } finally {
      ui.setIsCheckingSimilarity(false);
    }
  };


  const publish = async () => {
    await press.publish();
  };

  const executeFullPipeline = async (prompt: string, aspectRatio: AspectRatio) => {
    addLog('SYSTEM', 'Initiating full editorial-visual-publication pipeline...', 'action');
    
    try {
      // 1. Polish
      addLog('EDITORIAL', 'Applying final polish...', 'action');
      await press.runFinalPolish();
      
      // 2. Generate Visual
      addLog('DARKROOM', `Generating assets for: ${prompt}...`, 'action');
      await visual.generateAtelierImage(prompt);
      
      // 3. Publish
      addLog('PRESS', 'Submitting to final distribution...', 'action');
      await press.publish();
      
      addLog('SYSTEM', 'Pipeline completed successfully!', 'success');
    } catch (e: any) {
      addLog('SYSTEM', `Pipeline FAILED: ${e.message}`, 'error');
      console.error(e);
    }
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
    executeFullPipeline,
    clearLogs,
    logMessage: addLog,
    toggleStoryAngle,
    extractClaimsFromSeed,
    gatherIndependentEvidence,
    runSimilarityAudit,
    runIntegrityDrill: useCallback(() => new ArchitectureDrill().runIntegrityDrill(), [])
  };
};
