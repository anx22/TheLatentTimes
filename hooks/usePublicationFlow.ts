import { agentRewriteBlock, agentRewriteSentence, agentCriticsCorner, agentLayoutDesigner, agentPromptEnhancer } from '../services/agents';
import { MagazineItem, ArticleProvenance, ProvenanceSource, ProvenanceClaim, Claim } from '../types';

export const usePublicationFlow = (
  data: any,
  ui: any,
  publication: any,
  onPublish: (item: MagazineItem, layout?: any[]) => void,
  missionRegistry: any,
  addLog: (agent: string, message: string, level?: any) => void
) => {
  const { mutations, setDraftId, draft, image, persistedState, latestIssue } = data;
  const { setError, setIsPolishing, setStep, setIsRewriting, context, editorialLens, globalDirective, setIsEnhancing, visualStyle, atelierState, setActiveMissionId, isLegalGuardrailsEnabled, seedArticle, similarityReport, extractedClaims, evidencePack } = ui;

  const rewriteBlock = async (blockId: string, instruction: string, sentenceId?: string) => {
    if (!draft || !draft.blocks) return;
    const blockToRewrite = draft.blocks.find((b: any) => b.id === blockId);
    if (!blockToRewrite) return;

    setIsRewriting(blockId);
    const mission = await missionRegistry.start('editorial', 'Refinement');
    setActiveMissionId(mission.id);
    await mission.log('THE COLUMNIST', `Rewriting ${sentenceId ? 'sentence' : 'block'}...`, 'action');
    try {
      let rewrittenBlock;
      if (sentenceId) {
        rewrittenBlock = await agentRewriteSentence(blockToRewrite, sentenceId, instruction, context, editorialLens, draft.body, globalDirective, mission.id);
      } else {
        rewrittenBlock = await agentRewriteBlock(blockToRewrite, instruction, context, editorialLens, draft.body, globalDirective, mission.id);
      }
      
      const newBlocks = draft.blocks.map((b: any) => b.id === blockId ? rewrittenBlock : b);
      const newBody = newBlocks.map((b: any) => b.sentences.map((s: any) => s.text).join(' ')).join('\n\n');

      const newDraftId = await mutations.saveDraft({
        storyId: draft.storyId,
        missionId: mission.id,
        headline: draft.headline,
        deck: draft.deck,
        body: newBody,
        blocks: newBlocks,
        tags: draft.tags,
        suggested_visual_prompt: draft.suggested_visual_prompt,
        status: (draft as any).status
      });
      setDraftId(newDraftId);
      await mission.log('THE COLUMNIST', 'Rewrite complete.', 'success');
      await mission.complete(newDraftId);
    } catch (e: any) {
      await mission.fail(e.message || 'Rewrite failure');
    } finally {
      setIsRewriting(null);
    }
  };

  const enhancePrompt = async () => {
    if (!draft) return;
    setIsEnhancing(true);
    const mission = await missionRegistry.start('editorial', 'Magic Enhance');
    setActiveMissionId(mission.id);
    await mission.log('THE PHOTOGRAPHER', 'Applying Magic Enhance...', 'action');
    try {
      const enhanced = await agentPromptEnhancer(draft.suggested_visual_prompt || '', visualStyle, globalDirective, mission.id);
      const newDraftId = await mutations.saveDraft({
        ...draft,
        missionId: mission.id,
        suggested_visual_prompt: enhanced,
        status: 'draft'
      });
      setDraftId(newDraftId);
      await mission.log('THE PHOTOGRAPHER', 'Prompt enhanced.', 'success');
      await mission.complete(newDraftId);
    } catch (e: any) {
      await mission.fail(e.message || 'Enhancement failure');
    } finally {
      setIsEnhancing(false);
    }
  };

  const runFinalPolish = async () => {
    if (!draft) return;
    setIsPolishing(true);
    const mission = await missionRegistry.start('editorial', 'Final Polish');
    setActiveMissionId(mission.id);
    try {
      const polished = await publication.runFinalPolish(draft, mission.id);
      const newDraftId = await mutations.saveDraft({
        ...draft,
        ...polished,
        missionId: mission.id,
        status: (draft as any).status
      });
      setDraftId(newDraftId);
      await mission.complete(newDraftId);
    } catch (e: any) {
      setError(e.message || 'Polish failed');
      await mission.fail(e.message || 'Polish failed');
    } finally {
      setIsPolishing(false);
    }
  };

  const publish = async () => {
    if (!draft || !image) {
      setError("Cannot publish: Draft or Image missing.");
      return;
    }

    // Legal gate (U3): when guardrails are on AND this draft was built from a
    // seed source, the UrhG copy-distance audit must have actually passed before
    // we publish. Previously the audit only logged PASSED/FAILED and never
    // blocked anything. Drafts with no seed have no source to copy, so the gate
    // does not apply; the guardrails toggle is the human's explicit opt-out.
    if (isLegalGuardrailsEnabled && seedArticle) {
      if (!similarityReport) {
        setError("Legal gate: run the UrhG similarity audit before publishing a seed-based draft.");
        return;
      }
      if (similarityReport.score < 70) {
        addLog('THE COMPLIANCE', `Publication BLOCKED — UrhG safety distance ${similarityReport.score}% (FAILED).`, 'error');
        setError(`Legal gate blocked publication: copycat safety distance ${similarityReport.score}% (< 70%). ${similarityReport.recommendation || 'Refine the draft to raise originality, then re-run the audit.'}`);
        return;
      }
    }

    const mission = await missionRegistry.start('editorial', 'Final Publication');
    setActiveMissionId(mission.id);
    try {
      const prep = await publication.prepareForPublication(
        draft.headline, draft.deck, draft.body, draft.blocks,
        { url: image, aspectRatio: (atelierState?.layout === 'FEATURE' ? '16:9' : '4:3') as any },
        mission.id
      );

      const publicComments = await agentCriticsCorner(draft.headline, draft.deck, draft.body.substring(0, 500), mission.id);

      // Provenance snapshot (T-1.3.1): the real seed + independent sources and the
      // atomic claims this draft was built on. Never fabricated — only what the
      // ThreeZone flow actually gathered. Absent fields stay absent (honest).
      const provenanceSources: ProvenanceSource[] = [];
      if (seedArticle) {
        provenanceSources.push({
          name: seedArticle.source || seedArticle.sourcePack || 'Seed source',
          url: seedArticle.url,
          kind: 'seed',
          trustTier: seedArticle.sourceTrustTier,
        });
      }
      for (const s of evidencePack?.sources || []) {
        if (s?.title || s?.url) provenanceSources.push({ name: s.title || s.url, url: s.url, kind: 'independent' });
      }
      const provenanceClaims: ProvenanceClaim[] = (extractedClaims || []).map((c: Claim) => ({
        text: c.claimText,
        sourceName: c.sourceName,
        sourceUrl: c.sourceUrl,
        confidence: c.confidence,
        claimType: c.claimType,
      }));
      const provenance: ArticleProvenance | undefined =
        (provenanceSources.length || provenanceClaims.length)
          ? { sources: provenanceSources, claims: provenanceClaims, capturedAt: new Date().toISOString() }
          : undefined;

      const newItem: MagazineItem = {
        id: Math.random().toString(36).substring(7),
        title: prep.title!,
        dek: prep.dek!,
        published_at: new Date().toISOString(),
        tags: draft.tags || [],
        media_type: 'image',
        hero_image_url: prep.hero_image_url!,
        status: 'published',
        featured_level: 'none',
        body: prep.body!,
        blocks: prep.blocks!,
        public_comments: publicComments,
        ...(provenance ? { provenance } : {}),
      };

      const currentLayout = latestIssue?.content?.layout || [];
      await mission.log('THE ART DIRECTOR', 'Calculating optimal grid placement...', 'action');
      const newLayout = await agentLayoutDesigner(newItem, currentLayout, mission.id);
      
      onPublish(newItem, newLayout);
      setStep('PUBLISHED');
      await mission.log('SYSTEM', 'Artifact successfully published.', 'success');
      await mission.complete();
    } catch (e: any) {
      setError(e.message || 'Publication failed');
      await mission.fail(e.message || 'Publication failed');
    }
  };

  return { rewriteBlock, enhancePrompt, runFinalPolish, publish };
};
