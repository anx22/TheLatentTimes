import { useCallback } from 'react';
import { Id } from "../convex/_generated/dataModel";
import { EditorialAngle, GeneratedArticle, ScoutedSignal, NewsCluster } from '../types';
import { agentScout, agentTargetedSearch, agentTicker, agentConsensus, agentCulturalGrounding, agentSynthesis } from '../services/agents';
import { SignalBroker, RSSAdapter, GitHubAdapter } from '../services/signals';
import { UsageTracker } from '../services/mission';

export const useEditorialAgents = (
  data: any, 
  ui: any, 
  orchestrator: any,
  missionRegistry: any,
  addLog: (agent: string, message: string, level?: any) => void
) => {
  const { mutations, actions, dbSources, tickerItems } = data;
  const { noiseFilter, globalDirective, setContext, setScoutedTopics, setIsScouting, setIsResearching, setAngles, setDebateTranscript, setDraftId, setActiveMissionId, setIsDebating, setError, setIsDrafting, editorialLens, wordCount, setEditorialLens, setAnnotations, setSelectedStoryId, newsClusters } = ui;

  const fetchTickerData = useCallback(async () => {
    if (ui.isFetchingTicker) return;
    ui.setIsFetchingTicker(true);
    addLog('THE WIRE', 'Polling active sources for new signals via SignalBroker...', 'info');
    
    // fetchTickerData can also be a mission
    const mission = await missionRegistry.start('scout', 'Wire Ingestion');
    ui.setActiveMissionId(mission.id);

    try {
      const adapters = (dbSources as any[] || [])
        .filter(s => s.isActive)
        .map(s => {
          if (s.type === 'rss') return new RSSAdapter(s._id, s.name, s.url, s.lastFetchedAt, actions.fetchRss);
          if (s.type === 'github') return new GitHubAdapter(s._id, s.name, s.lastFetchedAt);
          return null;
        })
        .filter(Boolean) as any[];

      const broker = new SignalBroker(adapters);
      let items = await broker.broadcastIngestion(10, noiseFilter);
      
      if (items.length === 0) {
        await mission.log('THE WIRE', 'No active sources returned signals. Running search-fallback...', 'info');
        items = await agentTicker([], noiseFilter, globalDirective, actions.fetchRss);
      }

      let ingestedCount = 0;
      for (const item of items) {
        let assignedStoryId: Id<"stories"> | undefined = undefined;
        let culturalVectors: any[] = [];
        
        try {
          culturalVectors = await agentCulturalGrounding(item.title, item.content || item.title, globalDirective);
        } catch (e) {
          console.warn("Grounding fail", e);
        }

        if (item.embedding && item.embedding.length > 0) {
          const { storyId, similarId } = await actions.checkSemanticSimilarity({
            embedding: item.embedding,
            title: item.title
          });

          if (storyId) {
            assignedStoryId = storyId as Id<"stories">;
          } else if (similarId) {
            assignedStoryId = await mutations.addNewsCluster({
              title: item.title,
              summary: "Emerging cluster of related signals.",
              keyEntities: []
            });
            await mutations.updateTickerItemStory({
              id: similarId as Id<"ticker_items">,
              storyId: assignedStoryId
            });
          }
        }

        await mutations.addTickerItem({
          title: item.title,
          source: item.source,
          sourceId: item.sourceId as Id<"sources">,
          url: item.url,
          content: item.content,
          embedding: item.embedding,
          storyId: assignedStoryId,
          innovation_score: (item as any).innovation_score,
          cultural_vectors: culturalVectors,
          status: 'new'
        });
        ingestedCount++;
      }
      
      for (const source of dbSources as any[]) {
        if (source.isActive) {
          await mutations.updateSourceFetchTime({ sourceId: source._id, timestamp: Date.now() });
        }
      }
      
      const successMsg = ingestedCount > 0 ? `Intercepted ${ingestedCount} new signals.` : `No new signals found.`;
      await mission.log('THE WIRE', successMsg, ingestedCount > 0 ? 'success' : 'info');

      if (ingestedCount > 0) {
        const consensus = await agentConsensus(items, globalDirective);
        ui.setActiveConsensus(consensus);
      }
      await mission.complete();
    } catch (e: any) {
      addLog('THE WIRE', `Ingestion failure: ${e.message}`, 'error');
      await mission.fail(e.message);
    } finally {
      ui.setIsFetchingTicker(false);
    }
  }, [dbSources, noiseFilter, ui.isFetchingTicker, addLog, globalDirective, mutations, actions, ui, missionRegistry]);

  const scoutTopic = async () => {
    ui.setError(null);
    ui.setStep('NEWS_TERMINAL');
    ui.setIsScouting(true);
    const mission = await missionRegistry.start('scout', 'Global Sweep');
    ui.setActiveMissionId(mission.id);
    await mission.log('THE SCOUT', 'Initiating global hard-tech signal sweep...', 'action');
    try {
      const topics = await agentScout(dbSources as any[], noiseFilter, globalDirective);
      ui.setScoutedTopics(topics);
      await mission.log('THE SCOUT', `Signal sweep complete. Found ${topics.length} potential vectors.`, 'success');
      await mission.complete();
    } catch (e: any) {
      ui.setError(e.message || 'Scout failure');
      await mission.fail(e.message || 'Scout failure');
      ui.setStep('IDLE');
    } finally {
      ui.setIsScouting(false);
    }
  };

  const researchTopic = async (t: string) => {
    if (!t.trim()) return;
    ui.setIsResearching(true);
    const mission = await missionRegistry.start('scout', `Research: ${t}`);
    ui.setActiveMissionId(mission.id);
    await mission.log('THE SCOUT', `Conducting deep-dive research on: "${t}"...`, 'action');
    try {
      const result = await agentTargetedSearch(t, globalDirective);
      ui.setContext(result.context);
      await mission.log('THE SCOUT', result.grounded ? 'Deep-dive briefing compiled.' : 'Briefing compiled (speculative).', 'success');
      await mission.complete();
    } catch (e: any) {
      await mission.fail(e.message || 'Research failure');
    } finally {
      ui.setIsResearching(false);
    }
  };

  const runDebate = async () => {
    const { topic, context } = ui;
    if (!topic.trim()) return;
    ui.setError(null);
    ui.setStep('EDITORIAL_BOARD');
    ui.setIsDebating(true);
    ui.setDebateTranscript([]);
    ui.setAngles([]);
    ui.setDraftId(null);
    
    const mission = await missionRegistry.start('editorial', topic);
    ui.setActiveMissionId(mission.id);

    try {
      const result = await orchestrator.conductDebate(topic, context, mission.id);
      ui.setContext(result.context);
      ui.setDebateTranscript(result.transcript);
      ui.setAngles(result.angles);
      await mission.complete();
    } catch (e: any) {
      ui.setError(e.message || 'Debate failure');
      await mission.fail(e.message || 'Debate failure');
    } finally {
      ui.setIsDebating(false);
    }
  };

  const runPipeline = async (angle?: EditorialAngle, selectedHeadline?: string) => {
    const { topic, context } = ui;
    if (!topic.trim()) return;
    ui.setError(null);
    ui.setIsDrafting(true);
    
    let currentLens = ui.editorialLens;
    if (angle) {
      currentLens = `${angle.persona}: ${angle.angle}${selectedHeadline ? `\n\nMANDATORY HEADLINE: "${selectedHeadline}"` : ''}`;
      ui.setEditorialLens(currentLens);
    }

    const mission = await missionRegistry.start('editorial', topic);
    ui.setActiveMissionId(mission.id);

    try {
      const result = await orchestrator.produceDraft(topic, context, currentLens, ui.wordCount, mission.id);
      const newDraftId = await mutations.saveDraft({
        storyId: ui.selectedStoryId || undefined,
        headline: result.article.headline,
        deck: result.article.deck,
        body: result.article.body,
        blocks: result.article.blocks,
        tags: result.article.tags,
        suggested_visual_prompt: result.article.suggested_visual_prompt,
        status: 'draft'
      });
      ui.setDraftId(newDraftId);
      ui.setAnnotations(result.annotations);
      await mission.complete(newDraftId);
    } catch (e: any) {
      ui.setError(e.message || 'Pipeline failure');
      await mission.fail(e.message || 'Pipeline failure');
    } finally {
      ui.setIsDrafting(false);
    }
  };

  const synthesizeCluster = async (clusterId: Id<"stories">) => {
    const cluster = (newsClusters as NewsCluster[]).find(c => c._id === clusterId);
    if (!cluster) return;

    const items = tickerItems.filter((i: any) => i.storyId === clusterId);
    if (items.length === 0) return;

    addLog('THE WIRE', `Synthesizing story cluster: ${cluster.title}`, 'info');
    try {
      const { summary, keyEntities } = await agentSynthesis(cluster.title, items);
      await mutations.updateNewsCluster({ clusterId, summary, keyEntities, status: items.length > 2 ? 'trending' : 'emerging' });
      addLog('THE WIRE', `Synthesis complete for: ${cluster.title}`, 'success');
    } catch (e: any) {
      addLog('THE WIRE', `Synthesis failed: ${e.message}`, 'error');
    }
  };

  const reDraft = async () => {
    const { topic, context } = ui;
    if (!topic.trim() || !context.trim()) return;
    ui.setError(null);
    ui.setIsDrafting(true);
    const mId = await mutations.startMission({ topic, type: 'editorial' });
    ui.setActiveMissionId(mId);
    try {
      const result = await orchestrator.produceDraft(topic, context, ui.editorialLens, ui.wordCount);
      const newDraftId = await mutations.saveDraft({
        headline: result.article.headline,
        deck: result.article.deck,
        body: result.article.body,
        blocks: result.article.blocks,
        tags: result.article.tags,
        suggested_visual_prompt: result.article.suggested_visual_prompt,
        status: 'draft'
      });
      ui.setDraftId(newDraftId);
      ui.setAnnotations(result.annotations);
      await mutations.completeMission({ missionId: mId, resultId: newDraftId, tokenUsage: UsageTracker.get(mId) ?? undefined });
      UsageTracker.clear(mId);
    } catch (e: any) {
      ui.setError(e.message || 'Re-draft failure');
      await mutations.failMission({ missionId: mId, error: e.message || 'Re-draft failure' });
    } finally {
      ui.setIsDrafting(false);
    }
  };

  return {
    fetchTickerData,
    scoutTopic,
    researchTopic,
    runDebate,
    runPipeline,
    synthesizeCluster,
    reDraft
  };
};
