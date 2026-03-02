import React, { useState, useEffect } from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { AtelierLayoutMode } from '../../../types';
import { Loader2, Sparkles, Camera, Palette, Layout, Wand2, History } from 'lucide-react';
import { ConceptCard } from './ConceptCard';
import { PaletteSwatch } from './PaletteSwatch';
import { ModifierPill } from './ModifierPill';

// --- MAIN COMPONENT ---

export const TheAtelier: React.FC = () => {
  const { 
    draft, 
    atelierState, 
    setAtelierState, 
    runArtDirector, 
    generateAtelierImage,
    isGeneratingImage 
  } = useNewsroom();

  const [promptInput, setPromptInput] = useState(atelierState?.customPrompt || '');
  const [customModifier, setCustomModifier] = useState('');

  // Sync local prompt with global state when concept changes
  useEffect(() => {
    if (atelierState?.customPrompt) {
      setPromptInput(atelierState.customPrompt);
    }
  }, [atelierState?.activeConceptId, atelierState?.customPrompt]);

  // Initial Run Check
  useEffect(() => {
    if (draft && (!atelierState || atelierState.concepts.length === 0) && !isGeneratingImage) {
      runArtDirector();
    }
  }, [draft, atelierState, isGeneratingImage, runArtDirector]);

  if (!draft) return <div className="p-12 text-center text-zinc-500 font-mono text-xs">AWAITING DRAFT...</div>;

  if (!atelierState || (atelierState.concepts.length === 0 && isGeneratingImage)) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-pulse">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-sm font-bold tracking-widest uppercase text-emerald-500">THE ART DIRECTOR IS THINKING</p>
          <p className="text-xs text-zinc-500">Analyzing subtext, metaphors, and visual identity...</p>
        </div>
      </div>
    );
  }

  const handleConceptSelect = (id: string) => {
    const concept = atelierState.concepts.find(c => c.id === id);
    if (concept) {
      setAtelierState({
        ...atelierState,
        activeConceptId: id,
        customPrompt: concept.prompt
      });
    }
  };

  const handleModifierToggle = (mod: string) => {
    const current = atelierState.modifiers || [];
    const next = current.includes(mod) 
      ? current.filter(m => m !== mod)
      : [...current, mod];
    
    setAtelierState({ ...atelierState, modifiers: next });
  };

  const handleGenerate = () => {
    generateAtelierImage(promptInput);
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-300 font-mono overflow-hidden">
      
      {/* LEFT PANEL: BRIEFING & CONCEPTS */}
      <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">VISUAL CONCEPTS</h3>
          <div className="space-y-3">
            {atelierState.concepts.map(concept => (
              <ConceptCard 
                key={concept.id}
                concept={concept}
                isActive={atelierState.activeConceptId === concept.id}
                onClick={() => handleConceptSelect(concept.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Palette className="w-3 h-3" /> COLOR HARMONY
          </h3>
          <div className="space-y-1">
            {atelierState.suggestedPalettes.map(palette => (
              <PaletteSwatch 
                key={palette.id}
                palette={palette}
                isActive={atelierState.activePalette?.id === palette.id}
                onClick={() => setAtelierState({ ...atelierState, activePalette: palette })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CENTER PANEL: CANVAS & PROMPT */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/30">
        
        {/* CANVAS */}
        <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden group">
          {/* Layout Guides Overlay (Optional) */}
          <div className={`absolute inset-0 pointer-events-none border-2 border-dashed border-zinc-800/50 m-8 z-10 ${atelierState.layout === 'COVER' ? 'w-[400px]' : 'w-full'}`} />
          
          {atelierState.currentImageId ? (
             <div className="relative shadow-2xl max-h-full max-w-full">
               <img 
                 src={atelierState.currentImageId} // This will be a blob URL or base64 in practice
                 alt="Generated" 
                 className="max-h-full max-w-full object-contain"
               />
               {/* Headline Overlay Preview */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                 <h1 className="text-4xl font-serif font-bold text-white leading-tight drop-shadow-lg line-clamp-3">
                   {draft.headline}
                 </h1>
               </div>
             </div>
          ) : (
            <div className="text-center space-y-4 opacity-50">
              <Camera className="w-16 h-16 mx-auto text-zinc-700" />
              <p className="text-sm text-zinc-500 tracking-widest uppercase">CANVAS READY</p>
            </div>
          )}

          {isGeneratingImage && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-bold tracking-widest text-emerald-500 uppercase animate-pulse">RENDERING...</p>
              </div>
            </div>
          )}
        </div>

        {/* PROMPT EDITOR */}
        <div className="h-48 border-t border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
              <Wand2 className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">PROMPT ENGINEER</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleGenerate}
                disabled={isGeneratingImage}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition-colors text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                <span>DEVELOP</span>
              </button>
            </div>
          </div>
          <textarea 
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
            placeholder="Describe the visual..."
          />
        </div>
      </div>

      {/* RIGHT PANEL: TOOLS & MODIFIERS */}
      <div className="w-64 border-l border-zinc-800 bg-zinc-950/50 flex flex-col">
        
        {/* LAYOUT MODE */}
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Layout className="w-3 h-3" /> LAYOUT MODE
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(['COVER', 'FEATURE', 'COLUMN', 'SOCIAL'] as AtelierLayoutMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setAtelierState({ ...atelierState, layout: mode })}
                className={`
                  px-2 py-2 text-[9px] font-bold uppercase tracking-wider border rounded transition-all
                  ${atelierState.layout === mode 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'
                  }
                `}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* MODIFIERS */}
        <div className="p-4 border-b border-zinc-800 flex-1 overflow-y-auto">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> MODIFIERS
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Minimalist', 'Cinematic', 'High Contrast', 'Grainy', 'Neon', 'Pastel', 'Dark', 'Bright'].map(mod => (
              <ModifierPill 
                key={mod}
                label={mod}
                isActive={(atelierState.modifiers || []).includes(mod)}
                onClick={() => handleModifierToggle(mod)}
              />
            ))}
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              value={customModifier}
              onChange={(e) => setCustomModifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customModifier.trim()) {
                  handleModifierToggle(customModifier.trim());
                  setCustomModifier('');
                }
              }}
              placeholder="+ ADD CUSTOM MODIFIER"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[10px] text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* HISTORY (Placeholder) */}
        <div className="p-4 h-1/3 border-t border-zinc-800 bg-zinc-900/20">
           <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <History className="w-3 h-3" /> HISTORY
          </h3>
          <div className="text-center text-zinc-600 text-[10px] italic mt-8">
            No history yet.
          </div>
        </div>

      </div>
    </div>
  );
};
