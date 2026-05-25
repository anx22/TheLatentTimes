import { useCallback } from 'react';
import { Id } from "../convex/_generated/dataModel";
import { NewsCluster, EditorialAngle, EditorialDepartment } from '../types';
import { EDITORIAL_LENSES } from '../constants';
import { agentScout, agentTargetedSearch, agentConsensus, agentCulturalGrounding, agentSynthesis } from '../services/agents';
import { SignalBroker, RSSAdapter, GitHubAdapter, SearchAdapter } from '../services/signals';

export const useEditorialAgents = (
  data: any, 
  ui: any, 
  orchestrator: any,
  missionRegistry: any,
  addLog: (agent: string, message: string, level?: any) => void
) => {
  const { mutations, actions, dbSources, signals } = data;
  const { noiseFilter, globalDirective, newsClusters } = ui;

  const ingestSignals = useCallback(async () => {
    if (ui.isIngesting) return;
    ui.setIsIngesting(true);
    
    // Start Mission
    const mission = await missionRegistry.start('scout', 'Wire Ingestion');
    ui.setActiveMissionId(mission.id);
    await mission.log('THE WIRE', 'Initializing Neural Ingestion Pipeline...', 'action');

    try {
      if (!dbSources || dbSources.length === 0) {
        await mission.log('THE WIRE', 'No sources found in database. Running emergency seed...', 'warning');
        await mutations.seedSources();
        // We'd ideally re-query here, but for now we'll rely on the query to update state
      }

      const activeSources = (dbSources as any[] || []).filter(s => s.isActive);
      await mission.log('SYSTEM', `Neural Intake: ${activeSources.length} active boundaries identified.`, 'info');

      const adapters = activeSources
        .map(s => {
          if (s.type === 'rss') return new RSSAdapter(s._id, s.name, s.url, s.lastFetchedAt, actions.fetchRss);
          if (s.type === 'github') return new GitHubAdapter(s._id, s.name, s.lastFetchedAt);
          return null;
        })
        .filter(Boolean) as any[];

      const broker = new SignalBroker(adapters);
      
      await mission.log('BROKER', 'Dispatching specialized workers to diverse technical feeds...', 'action');
      
      let items = await broker.broadcastIngestion(10, noiseFilter, mission.id, (s, m, t) => mission.log(s, m, t));
      
      if (items.length === 0) {
        await mission.log('BROKER', 'Passive intake returned zero signals. Triggering Active Deep Scout...', 'warning');
        const searchAdapter = new SearchAdapter(globalDirective || "latest technical breakthroughs", globalDirective);
        items = await searchAdapter.fetch(5, (s, m, t) => mission.log(s, m, t));
      }

      await mission.log('SYSTEM', `Pool Stabilized: ${items.length} raw signals ingested. Initializing semantic synthesis...`, 'info');

      let ingestedCount = 0;
      let duplicateCount = 0;

      for (const item of items) {
        await mission.log('THE WIRE', `Inhaling signal: ${item.title.slice(0, 40)}...`, 'action');
        
        let assignedStoryId: Id<"stories"> | undefined = undefined;
        
        if (item.embedding && item.embedding.length > 0) {
          const simResult = await actions.checkSemanticSimilarity({
            embedding: item.embedding,
            title: item.title
          });

          if (simResult.isDuplicate) {
            duplicateCount++;
            continue; 
          }

          if (simResult.storyId) {
            assignedStoryId = simResult.storyId as Id<"stories">;
            await mission.log('THE WIRE', `Resonance: Signal absorbed into Pillar ${assignedStoryId.slice(-4)}`, 'success');
          } else if (simResult.similarId) {
            // Check if it's a different source from the similar item
            const similarItem: any = await data.queries.getSignal({ id: simResult.similarId });
            const isCrossSource = similarItem && similarItem.source !== item.source;

            if (isCrossSource) {
              assignedStoryId = await mutations.addNewsCluster({
                title: item.title,
                summary: "Source Inception: Multi-dimensional resonance detected across independent channels.",
                keyEntities: [],
                missionId: mission.id
              });
              await mutations.updateSignalStory({
                id: simResult.similarId as Id<"signals">,
                storyId: assignedStoryId
              });
              await mission.log('THE WIRE', `SOURCE INCEPTION: Narrative Pillar Crystallized from ${item.source} + ${similarItem.source}`, 'success');
            }
          }
        }

        // Robust check for sourceId validity
        let finalSourceId: Id<"sources"> | undefined = undefined;
        let finalSourceType = 'api';
        
        if (item.sourceId && typeof item.sourceId === 'string') {
          const dbSource = (dbSources as any[] || []).find(s => s._id === item.sourceId);
          if (dbSource) {
            finalSourceId = dbSource._id;
            finalSourceType = dbSource.type;
          } else if (item.sourceId === 'search_fallback') {
            finalSourceType = 'api';
          }
        }

        await mutations.addSignal({
          title: item.title,
          source: item.source,
          sourceType: finalSourceType,
          sourceId: finalSourceId,
          url: item.url || "",
          content: item.content,
          embedding: item.embedding && item.embedding.length > 0 ? item.embedding : undefined,
          storyId: assignedStoryId,
          innovation_score: (item as any).innovation_score || 50,
          status: 'new',
          missionId: mission.id
        });
        ingestedCount++;
      }
      
      // Update fetch times
      await Promise.all(activeSources.map(s => 
        mutations.updateSourceFetchTime({ sourceId: s._id, timestamp: Date.now() })
      ));
      
      const summary = `Ingestion Finished. New: ${ingestedCount} | Duplicates: ${duplicateCount}`;
      await mission.log('THE WIRE', summary, ingestedCount > 0 ? 'success' : 'info');

      if (ingestedCount > 0) {
        await mission.log('THE WIRE', 'Synthesizing global consensus from new signals...', 'action');
        const consensus = await agentConsensus(items, globalDirective, mission.id);
        ui.setActiveConsensus(consensus);
      }
      
      await mission.complete();
    } catch (e: any) {
      addLog('THE WIRE', `CRITICAL INGESTION ERROR: ${e.message}`, 'error');
      await mission.fail(e.message);
    } finally {
      ui.setIsIngesting(false);
    }
  }, [dbSources, noiseFilter, addLog, globalDirective, mutations, actions, ui, missionRegistry]);

  const scoutTopic = async () => {
    ui.setError(null);
    ui.setStep('NEWS_TERMINAL');
    ui.setIsScouting(true);
    const mission = await missionRegistry.start('scout', 'Global Sweep');
    ui.setActiveMissionId(mission.id);
    await mission.log('THE SCOUT', 'Initiating global hard-tech signal sweep...', 'action');
    try {
      const topics = await agentScout(dbSources as any[], noiseFilter, globalDirective, mission.id);
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
      const result = await agentTargetedSearch(t, globalDirective, mission.id);
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
    
    let currentLens = EDITORIAL_LENSES[ui.editorialDepartment as EditorialDepartment];
    if (angle) {
      currentLens = `${angle.persona}: ${angle.angle}${selectedHeadline ? `\n\nMANDATORY HEADLINE: "${selectedHeadline}"` : ''}`;
      // ui.setEditorialLens(currentLens); // No longer exists or needed
    }

    const mission = await missionRegistry.start('editorial', topic);
    ui.setActiveMissionId(mission.id);

    try {
      const result = await orchestrator.produceDraft(topic, context, currentLens, ui.wordCount, mission.id);
      const newDraftId = await mutations.saveDraft({
        storyId: ui.selectedStoryId || undefined,
        missionId: mission.id,
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

    const items = signals.filter((i: any) => i.storyId === clusterId);
    if (items.length === 0) return;

    const mission = await missionRegistry.start('scout', `Synthesis: ${cluster.title}`);
    await mission.log('THE WIRE', `Synthesizing story cluster: ${cluster.title}`, 'info');
    try {
      const { summary, keyEntities } = await agentSynthesis(cluster.title, items, mission.id);
      await mutations.updateNewsCluster({ clusterId, summary, keyEntities, status: items.length > 2 ? 'trending' : 'emerging' });
      await mission.log('THE WIRE', `Synthesis complete for: ${cluster.title}`, 'success');
      await mission.complete();
    } catch (e: any) {
      await mission.fail(e.message || 'Synthesis failure');
    }
  };

  const runDeepDiscovery = async () => {
    const mission = await missionRegistry.start('scout', 'Signal Synthesis');
    ui.setActiveMissionId(mission.id);
    await mission.log('THE WIRE', 'Initializing Neural Intake Synthesis: Scanning latent signal pool for unmapped resonance...', 'action');
    try {
      const { processed, newStories } = await actions.discoverStories({ missionId: mission.id });
      await mission.log('THE WIRE', `Synthesis finished. Processed: ${processed} | New Pillars: ${newStories}`, processed > 0 ? 'success' : 'info');
      await mission.complete();
    } catch (e: any) {
      await mission.fail(e.message || 'Synthesis failure');
    }
  };

  const reDraft = async () => {
    const { topic, context } = ui;
    if (!topic.trim() || !context.trim()) return;
    ui.setError(null);
    ui.setIsDrafting(true);
    
    const mission = await missionRegistry.start('editorial', topic);
    ui.setActiveMissionId(mission.id);
    
    try {
      const result = await orchestrator.produceDraft(topic, context, EDITORIAL_LENSES[ui.editorialDepartment as EditorialDepartment], ui.wordCount, mission.id);
      const newDraftId = await mutations.saveDraft({
        storyId: ui.selectedStoryId || undefined,
        missionId: mission.id,
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
      ui.setError(e.message || 'Re-draft failure');
      await mission.fail(e.message || 'Re-draft failure');
    } finally {
      ui.setIsDrafting(false);
    }
  };

  return {
    ingestSignals,
    scoutTopic,
    researchTopic,
    runDebate,
    runPipeline,
    synthesizeCluster,
    runDeepDiscovery,
    reDraft
  };
};
