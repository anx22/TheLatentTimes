import { useMemo, useState } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { TickerItem, SystemLog, GeneratedArticle } from '../types';

export const useNewsroomData = () => {
  // Queries
  const rawTickerItems = useQuery(api.newsroom.queries.getTickerItems, {});
  const tickerItems = useMemo(() => (rawTickerItems || []) as TickerItem[], [rawTickerItems]);
  const newsClusters = useQuery(api.newsroom.queries.getNewsClusters, {}) || [];
  const logs = (useQuery(api.newsroom.queries.getAgentLogs, {}) || []) as SystemLog[];
  const dbSourcesResult = useQuery(api.newsroom.queries.getSources, {});
  const dbSources = useMemo(() => dbSourcesResult || [], [dbSourcesResult]);
  const persistedState = useQuery(api.newsroom.queries.getNewsroomState);

  // Local IDs for Draft/Image (Persisted)
  const [draftId, setDraftId] = useState<Id<"drafts"> | null>(null);
  const [imageId, setImageId] = useState<Id<"images"> | null>(null);

  // Detail Queries
  const draft = (useQuery(api.newsroom.queries.getDraftById, { id: draftId ?? undefined }) || null) as GeneratedArticle | null;
  const imageRecord = useQuery(api.newsroom.queries.getImageById, { id: imageId ?? undefined });
  const image = imageRecord ? imageRecord.url : null;

  // Mutations
  const mutations = {
    seedSources: useMutation(api.newsroom.mutations.seedSources),
    addTickerItem: useMutation(api.newsroom.mutations.addTickerItem),
    saveDraft: useMutation(api.newsroom.mutations.saveDraft),
    logMessage: useMutation(api.newsroom.mutations.logMessage),
    saveImage: useMutation(api.newsroom.mutations.saveImage),
    resetNewsroom: useMutation(api.newsroom.mutations.resetNewsroom),
    saveNewsroomState: useMutation(api.newsroom.mutations.saveNewsroomState),
    clearLogs: useMutation(api.newsroom.mutations.clearLogs),
    updateSourceFetchTime: useMutation(api.newsroom.mutations.updateSourceFetchTime),
    addNewsCluster: useMutation(api.newsroom.mutations.addNewsCluster),
    updateTickerItemStory: useMutation(api.newsroom.mutations.updateTickerItemStory),
    updateNewsCluster: useMutation(api.newsroom.mutations.updateNewsCluster),
    startMission: useMutation(api.newsroom.mutations.startMission),
    completeMission: useMutation(api.newsroom.mutations.completeMission),
    failMission: useMutation(api.newsroom.mutations.failMission),
    getUploadUrl: useMutation(api.media.generateUploadUrl)
  };

  // Actions
  const actions = {
    fetchRss: useAction(api.newsroom.actions.fetchRss),
    checkSemanticSimilarity: useAction(api.newsroom.actions.checkSemanticSimilarity)
  };

  return {
    tickerItems,
    newsClusters,
    logs,
    dbSources,
    dbSourcesResult,
    persistedState,
    draft,
    image,
    draftId, setDraftId,
    imageId, setImageId,
    mutations,
    actions
  };
};
