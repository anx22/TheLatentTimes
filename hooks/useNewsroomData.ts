import { useMemo, useState } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../frontendApi";
type Id<T extends string> = string;
import { Signal, SystemLog, GeneratedArticle } from '../types';

export const useNewsroomData = () => {
  // Queries
  const rawSignals = useQuery(api.newsroom.queries.getSignals, {});
  const signals = useMemo(() => (rawSignals || []) as Signal[], [rawSignals]);
  const newsClusters = useQuery(api.newsroom.queries.getNewsClusters, {}) || [];
  const logs = (useQuery(api.newsroom.queries.getAgentLogs, {}) || []) as SystemLog[];
  const dbSourcesResult = useQuery(api.newsroom.queries.getSources, {});
  const dbSources = useMemo(() => dbSourcesResult || [], [dbSourcesResult]);
  const persistedState = useQuery(api.newsroom.queries.getNewsroomStateByKey, { key: "current" });
  const latestIssue = useQuery(api.newsroom.queries.getLatestIssue);
  const drafts = useQuery(api.newsroom.queries.getAllDrafts, {}) || [];
  const activeWorkbenchSession = useQuery(api.newsroom.queries.getActiveWorkbenchSession, {});
  const storyAngles = useQuery(api.newsroom.queries.getStoryAngles, { workbenchId: activeWorkbenchSession?._id }) || [];

  // Local IDs for Draft/Image (Persisted)
  const [draftId, setDraftId] = useState<Id<"drafts"> | null>(null);
  const [imageId, setImageId] = useState<Id<"images"> | null>(null);

  // Detail Queries
  const draft = (useQuery(api.newsroom.queries.getDraftById, { id: draftId ?? undefined }) || null) as GeneratedArticle | null;
  const imageRecord = useQuery(api.newsroom.queries.getImageById, { id: imageId ?? undefined });
  const image = imageRecord ? imageRecord.url : null;

  // Mutations
  const seedSourcesMutation = useMutation(api.newsroom.mutations.seedSources);
  const addSignalMutation = useMutation(api.newsroom.mutations.addSignal);
  const saveDraftMutation = useMutation(api.newsroom.mutations.saveDraft);
  const logMessageMutation = useMutation(api.newsroom.mutations.logMessage);
  const saveImageMutation = useMutation(api.newsroom.mutations.saveImage);
  const resetNewsroomMutation = useMutation(api.newsroom.mutations.resetNewsroom);
  const saveNewsroomStateMutation = useMutation(api.newsroom.mutations.saveNewsroomState);
  const clearLogsMutation = useMutation(api.newsroom.mutations.clearLogs);
  const updateSourceFetchTimeMutation = useMutation(api.newsroom.mutations.updateSourceFetchTime);
  const addNewsClusterMutation = useMutation(api.newsroom.mutations.addNewsCluster);
  const updateSignalStoryMutation = useMutation(api.newsroom.mutations.updateSignalStory);
  const updateNewsClusterMutation = useMutation(api.newsroom.mutations.updateNewsCluster);
  const startMissionMutation = useMutation(api.newsroom.mutations.startMission);
  const completeMissionMutation = useMutation(api.newsroom.mutations.completeMission);
  const failMissionMutation = useMutation(api.newsroom.mutations.failMission);
  const getUploadUrlMutation = useMutation(api.media.generateUploadUrl);
  const createWorkbenchSessionMutation = useMutation(api.newsroom.mutations.createWorkbenchSession);
  const updateWorkbenchSessionMutation = useMutation(api.newsroom.mutations.updateWorkbenchSession);
  const saveStoryAnglesMutation = useMutation(api.newsroom.mutations.saveStoryAngles);
  const toggleStoryAngleMutation = useMutation(api.newsroom.mutations.toggleStoryAngle);
  const toggleSourceMutation = useMutation(api.newsroom.mutations.toggleSource);
  const updateSourceMutation = useMutation(api.newsroom.mutations.updateSource);
  const deleteSourceMutation = useMutation(api.newsroom.mutations.deleteSource);
  const updateDraftStatusMutation = useMutation(api.newsroom.mutations.updateDraftStatus);
  const deleteDraftMutation = useMutation(api.newsroom.mutations.deleteDraft);

  // Actions
  const fetchRssAction = useAction(api.newsroom.actions.fetchRss);
  const fetchGitHubAction = useAction(api.newsroom.actions.fetchGitHub);
  const checkSemanticSimilarityAction = useAction(api.newsroom.actions.checkSemanticSimilarity);
  const discoverStoriesAction = useAction(api.newsroom.actions.discoverStories);

  // Mutations
  const mutations = useMemo(() => ({
    seedSources: seedSourcesMutation,
    addSignal: addSignalMutation,
    saveDraft: saveDraftMutation,
    logMessage: logMessageMutation,
    saveImage: saveImageMutation,
    resetNewsroom: resetNewsroomMutation,
    saveNewsroomState: saveNewsroomStateMutation,
    clearLogs: clearLogsMutation,
    updateSourceFetchTime: updateSourceFetchTimeMutation,
    addNewsCluster: addNewsClusterMutation,
    updateSignalStory: updateSignalStoryMutation,
    updateNewsCluster: updateNewsClusterMutation,
    startMission: startMissionMutation,
    completeMission: completeMissionMutation,
    failMission: failMissionMutation,
    getUploadUrl: getUploadUrlMutation,
    createWorkbenchSession: createWorkbenchSessionMutation,
    updateWorkbenchSession: updateWorkbenchSessionMutation,
    saveStoryAngles: saveStoryAnglesMutation,
    toggleStoryAngle: toggleStoryAngleMutation,
    toggleSource: toggleSourceMutation,
    updateSource: updateSourceMutation,
    deleteSource: deleteSourceMutation,
    updateDraftStatus: updateDraftStatusMutation,
    deleteDraft: deleteDraftMutation,
  }), [
    seedSourcesMutation, addSignalMutation, saveDraftMutation, logMessageMutation,
    saveImageMutation, resetNewsroomMutation, saveNewsroomStateMutation,
    clearLogsMutation, updateSourceFetchTimeMutation, addNewsClusterMutation,
    updateSignalStoryMutation, updateNewsClusterMutation, startMissionMutation,
    completeMissionMutation, failMissionMutation, getUploadUrlMutation,
    createWorkbenchSessionMutation, updateWorkbenchSessionMutation,
    saveStoryAnglesMutation, toggleStoryAngleMutation, toggleSourceMutation, updateSourceMutation, deleteSourceMutation,
    updateDraftStatusMutation, deleteDraftMutation
  ]);

  // Actions
  const actions = useMemo(() => ({
    fetchRss: fetchRssAction,
    fetchGitHub: fetchGitHubAction,
    checkSemanticSimilarity: checkSemanticSimilarityAction,
    discoverStories: discoverStoriesAction
  }), [fetchRssAction, fetchGitHubAction, checkSemanticSimilarityAction, discoverStoriesAction]);

  return {
    signals,
    newsClusters,
    logs,
    dbSources,
    dbSourcesResult,
    persistedState,
    latestIssue,
    draft,
    drafts,
    activeWorkbenchSession,
    storyAngles,
    image,
    draftId, setDraftId,
    imageId, setImageId,
    mutations,
    actions
  };
};
