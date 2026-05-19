import { agentRewriteBlock, agentRewriteSentence, agentCriticsCorner, agentLayoutDesigner, agentPromptEnhancer } from '../services/agents';
import { MagazineItem } from '../types';

export const usePublicationFlow = (
  data: any,
  ui: any,
  publication: any,
  onPublish: (item: MagazineItem, layout?: any[]) => void,
  missionRegistry: any,
  addLog: (agent: string, message: string, level?: any) => void
) => {
  const { mutations, setDraftId, draft, image, persistedState } = data;
  const { setError, setIsPolishing, setStep, setIsRewriting, context, editorialLens, globalDirective, setIsEnhancing, visualStyle, atelierState, setActiveMissionId } = ui;

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
    
    const mission = await missionRegistry.start('editorial', 'Final Publication');
    setActiveMissionId(mission.id);
    try {
      const prep = await publication.prepareForPublication(
        draft.headline, draft.deck, draft.body, draft.blocks,
        { url: image, aspectRatio: (atelierState.layout === 'FEATURE' ? '16:9' : '4:3') as any },
        mission.id
      );

      const publicComments = await agentCriticsCorner(draft.headline, draft.deck, draft.body.substring(0, 500), mission.id);

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
        score: { final: 8, recency: 10, trust: 8, novelty: 8, visual_fit: 9 },
        body: prep.body!,
        blocks: prep.blocks!,
        public_comments: publicComments
      };

      const currentLayout = (persistedState as any)?.latestIssue?.content?.layout || [];
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
