import { useCallback } from 'react';
import { Id } from "../convex/_generated/dataModel";
import { NewsCluster, EditorialAngle, EditorialDepartment } from '../types';
import { EDITORIAL_LENSES } from '../constants';
import { agentScout, agentTargetedSearch, agentConsensus, agentCulturalGrounding, agentSynthesis, agentWorkbench } from '../services/agents';
import { SourceFetcher } from '../services/signals/SourceFetcher';

export const useEditorialAgents = (
  data: any, 
  ui: any, 
  orchestrator: any,
  missionRegistry: any,
  addLog: (agent: string, message: string, level?: any) => void
) => {
  const { mutations, actions, dbSources, signals, activeWorkbenchSession, setDraftId } = data;
  const { noiseFilter, globalDirective, newsClusters, activeMethodology } = ui;

  // WORKBENCH METHODS (Methodology 1)
  const initializeWorkbench = async (signalIds: string[]) => {
    try {
      addLog('SYSTEM', 'Initializing Workbench Session...', 'action');
      await mutations.createWorkbenchSession({ signals: signalIds });
      ui.setContext(''); // Reset context for the new workbench
      addLog('SYSTEM', 'Workbench configured. Awaiting narrative extraction trigger in Zone 2.', 'success');
    } catch (error: any) {
      addLog('SYSTEM', `Failed to initialize workbench: ${error.message}`, 'error');
    }
  };

  const generateWorkbenchAngles = async (overrideContext?: string) => {
    if (!activeWorkbenchSession) return;
    try {
      const mission = await missionRegistry.start('editorial', 'Angle Synthesis');
      ui.setActiveMissionId(mission.id);

      await mutations.updateWorkbenchSession({
        id: activeWorkbenchSession._id,
        status: 'processing',
        context: overrideContext || activeWorkbenchSession.context,
      });

      const sessionSignals = signals.filter((s: any) => activeWorkbenchSession.signals.includes(s._id));
      const jsonAngles = await agentWorkbench(sessionSignals, overrideContext || activeWorkbenchSession.context, (log) => mission.log(log.agentName, log.message, log.level));

      await mutations.saveStoryAngles({
        angles: jsonAngles.map(a => ({
          workbenchId: activeWorkbenchSession._id,
          title: a.title,
          summary: a.summary,
          selected: false,
        })),
      });

      await mutations.updateWorkbenchSession({
        id: activeWorkbenchSession._id,
        status: 'active',
      });
      
      await mission.complete();
    } catch (error: any) {
      await mutations.updateWorkbenchSession({ id: activeWorkbenchSession._id, status: 'active' }); // Revert
      addLog('Workbench', `Angle generation failed: ${error.message}`, 'error');
    }
  };

  const executeDraftFromWorkbench = async () => {
    if (!activeWorkbenchSession) return;
    const { storyAngles } = data;
    const selectedAngles = storyAngles.filter((a: any) => a.selected);
    if (selectedAngles.length === 0) {
      addLog('Workbench', 'No angles selected for drafting.', 'warning');
      return;
    }

    try {
      const mission = await missionRegistry.start('editorial', 'Workbench Draft Execution');
      ui.setActiveMissionId(mission.id);
      
      const topic = selectedAngles.map((a: any) => a.title).join(' & ');
      const angleDesc = selectedAngles.map((a: any) => a.summary).join('\n');
      
      let finalContext = '';
      
      // Enforce Seed Mode & Legal Compliance if Enabled
      if (ui.isLegalGuardrailsEnabled && ui.seedArticle) {
        addLog('COMPLIANCE', 'Legal compliance & safe-seed mode active. Routing through Claim-Evidence Pack flow.', 'info');
        
        // 1. Check if claims are already extracted
        let claims = ui.extractedClaims;
        if (claims.length === 0) {
          claims = await ui.extractClaimsFromSeed();
        }
        
        // 2. Discover independent sources
        let pack = ui.evidencePack;
        if (!pack) {
          pack = await ui.gatherIndependentEvidence();
        }
        
        if (pack) {
          finalContext = `[LEGAL MODE: COMPLIANT EVIDENCE PACK]
Seed Origin: ${ui.seedArticle.title} (${ui.seedArticle.sourcePack || ui.seedArticle.sourceType || 'Wire'})
Extracted Facts: ${claims.map((c: any) => `- ${c.claimText} [Entity: ${c.entities.join(', ')}]`).join('\n')}

Multi-Source Exploratory Evidence:
${pack.synthesizedEvidence}

Citations Identified: 
${pack.sources.map((s: any) => `- ${s.title}: ${s.url}`).join('\n')}

DIRECTOR COMPLIANCE INSTRUCTION: You are strictly forbidden from reusing the lexical structures or phrases of the Seed. Cite facts based on the exploratory multi-source evidence instead.`;
        } else {
          addLog('COMPLIANCE', 'Evidence Pack aggregation incomplete, falling back to basic factual context.', 'warning');
          const sessionSignals = (signals || []).filter((s: any) => activeWorkbenchSession.signals.includes(s._id));
          finalContext = sessionSignals.map((s: any) => `Signal: ${s.title}\nSource: ${s.sourceType || s.sourcePack || 'RSS'}\nContent: ${s.content || s.summary || ''}`).join('\n\n---\n\n');
        }
      } else {
        const sessionSignals = (signals || []).filter((s: any) => activeWorkbenchSession.signals.includes(s._id));
        const signalsContext = sessionSignals.map((s: any) => `Signal: ${s.title}\nSource: ${s.sourceType || s.sourcePack || 'RSS'}\nContent: ${s.content || s.summary || ''}`).join('\n\n---\n\n');
        const workbenchDirective = activeWorkbenchSession.context ? `Workbench Strategic Directive: ${activeWorkbenchSession.context}\n\n` : '';
        finalContext = `${workbenchDirective}Raw Signals Context:\n${signalsContext}`;
      }

      ui.setStep('EDITORIAL_BOARD');
      ui.setIsDrafting(true);
      ui.setContext(finalContext);
      
      const currentLens = `Synthesize the provided research into a cohesive narrative covering the following specific editorial angles:\n\n${angleDesc}`;
      
      const result = await orchestrator.produceDraft(topic, finalContext, currentLens, ui.wordCount || 500, mission.id);
      
      const newDraftId = await mutations.saveDraft({
        missionId: mission.id,
        headline: result.article.headline,
        deck: result.article.deck,
        body: result.article.body,
        blocks: result.article.blocks,
        tags: result.article.tags,
        status: 'draft'
      });
      
      setDraftId(newDraftId);
      ui.setTopic(topic);
      
      // Autosimilarity check if seed was active!
      if (ui.seedArticle) {
        const draftText = result.article.body || result.article.blocks.map((b: any) => b.sentences.map((s: any) => s.text).join(' ')).join('\n\n');
        await ui.runSimilarityAudit(draftText);
      }

      
      await mutations.updateWorkbenchSession({ id: activeWorkbenchSession._id, status: 'completed' });
      await mission.complete();
    } catch (e: any) {
      addLog('Workbench', `Draft execution failed: ${e.message}`, 'error');
    } finally {
      ui.setIsDrafting(false);
    }
  };

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

      await mission.log('FETCHER', 'Dispatching specialized workers to diverse technical feeds...', 'action');
      
      const items = await SourceFetcher.fetchAll(activeSources, 20, mission.id, actions, (s, m, t) => mission.log(s, m, t));
      
      if (items.length === 0) {
        await mission.log('FETCHER', 'Passive intake returned zero signals. Retrying with high-value scan...', 'warning');
        // Optional fallback logic
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
          }
        }

        await mutations.addSignal({
          title: item.title,
          source: item.source || "Unknown",
          sourceType: item.sourceType || 'rss',
          sourceId: item.sourceId as Id<"sources">,
          sourcePack: item.sourcePack,
          sourceTrustTier: item.sourceTrustTier,
          url: item.url || "",
          content: item.content || undefined,
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
    setDraftId(null);
    
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
      setDraftId(newDraftId);
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
      const { processed, newStories, newStoryIds } = await actions.discoverStories({ missionId: mission.id });
      await mission.log('THE WIRE', `Synthesis finished. Processed: ${processed} | New Pillars: ${newStories}`, processed > 0 ? 'success' : 'info');
      await mission.complete();
      return { processed, newStories, newStoryIds };
    } catch (e: any) {
      await mission.fail(e.message || 'Synthesis failure');
      return { processed: 0, newStories: 0, newStoryIds: [] };
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
      setDraftId(newDraftId);
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
    initializeWorkbench,
    generateWorkbenchAngles,
    executeDraftFromWorkbench,
    reDraft
  };
};
