import { AspectRatio, GeneratedArticle } from '../types';
import { agentPhotographer } from '../services/agents';
import { compressImage } from '../services/imageUtils';

export const useVisualAgents = (
  data: any,
  ui: any,
  atelier: any,
  missionRegistry: any,
  addLog: (agent: string, message: string, level?: any) => void
) => {
  const { mutations, setImageId } = data;
  const { atelierState, setAtelierState, setStep, setError, setIsGeneratingImage, globalDirective, visualStyle, aspectRatio, setActiveMissionId } = ui;

  const runArtDirector = async () => {
    const { draft } = data;
    if (!draft) return;
    setIsGeneratingImage(true);
    const mission = await missionRegistry.start('editorial', 'Visual Strategy');
    setActiveMissionId(mission.id);
    try {
      const newState = await atelier.initializeSession(draft, mission.id);
      setAtelierState(newState);
      await mission.complete();
    } catch (e: any) {
      setError(e.message || 'Art direction failure');
      await mission.fail(e.message || 'Art direction failure');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateAtelierImage = async (prompt: string, isEdit: boolean = false) => {
    setIsGeneratingImage(true);
    const mission = await missionRegistry.start('editorial', isEdit ? 'Refine Asset' : 'Develop Asset');
    setActiveMissionId(mission.id);
    await mission.log('THE ATELIER', isEdit ? 'Refining existing asset...' : 'Developing high-fidelity asset...', 'action');
    try {
      const modifiers = atelierState.modifiers.join(', ');
      const palette = atelierState.activePalette ? `Color Palette: ${atelierState.activePalette.name} (${atelierState.activePalette.vibe})` : '';
      const layoutDirective = `Layout Optimization: ${atelierState.layout}`;
      const finalPrompt = `${prompt}. ${modifiers}. ${palette}. ${layoutDirective}. High resolution, masterpiece. No text.`;
      
      let ratio: AspectRatio = '16:9';
      if (atelierState.layout === 'COVER') ratio = '3:4';
      else if (atelierState.layout === 'COLUMN' || atelierState.layout === 'SOCIAL') ratio = '1:1';

      const base64Ref = (isEdit && atelierState.currentImageBase64) ? atelierState.currentImageBase64 : undefined;
      const imgUrlBase64 = await agentPhotographer(finalPrompt, visualStyle, ratio, globalDirective, base64Ref, mission.id);
      
      const blob = await compressImage(imgUrlBase64, 0.7);
      const postUrl = await mutations.getUploadUrl();
      const result = await fetch(postUrl, { method: "POST", body: blob, headers: { "Content-Type": blob.type } });
      const { storageId } = await result.json();
      
      const newImageId = await mutations.saveImage({ prompt: finalPrompt, storageId: storageId, missionId: mission.id });
      setImageId(newImageId);
      
      const blobUrl = URL.createObjectURL(blob);
      const historyItem = {
        id: Math.random().toString(36).substring(7),
        url: blobUrl,
        base64: imgUrlBase64,
        imageId: newImageId,
        prompt: finalPrompt,
        timestamp: Date.now(),
        layout: atelierState.layout,
        palette: atelierState.activePalette?.name
      };

      setAtelierState((prev: any) => ({
        ...prev,
        currentImageId: blobUrl,
        currentImageBase64: imgUrlBase64,
        history: [historyItem, ...(prev.history || [])].slice(0, 10)
      }));

      await mission.log('THE ATELIER', 'Asset developed and fixed.', 'success');
      await mission.complete(newImageId);
    } catch (e: any) {
      await mission.fail(e.message || 'Development failure');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const reShoot = async () => {
    const { draft } = data;
    if (!draft) return;
    setError(null);
    setStep('DARKROOM');
    setIsGeneratingImage(true);
    const mission = await missionRegistry.start('editorial', 'Reshoot');
    setActiveMissionId(mission.id);
    await mission.log('THE PHOTOGRAPHER', `Re-entering darkroom. Style: ${visualStyle}, Ratio: ${aspectRatio}.`, 'action');
    
    try {
      const imgUrlBase64 = await agentPhotographer(draft.suggested_visual_prompt || '', visualStyle, aspectRatio, globalDirective, undefined, mission.id);
      const blob = await compressImage(imgUrlBase64, 0.7);
      const postUrl = await mutations.getUploadUrl();
      const result = await fetch(postUrl, { method: "POST", body: blob });
      const { storageId } = await result.json();

      const newImageId = await mutations.saveImage({ prompt: draft.suggested_visual_prompt || '', storageId: storageId, missionId: mission.id });
      setImageId(newImageId);
      await mission.log('THE PHOTOGRAPHER', 'New visual assets developed.', 'success');
      await mission.complete(newImageId);
    } catch (e: any) {
      setError(e.message || 'Re-shoot failure');
      await mission.fail(e.message || 'Re-shoot failure');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return { runArtDirector, generateAtelierImage, reShoot };
};
