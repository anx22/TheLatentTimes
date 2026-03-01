import React from 'react';
import { Loader2, Image as ImageIcon, RefreshCw, Camera, Sparkles } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { Dossier } from './Dossier';

export const TheDarkroom: React.FC = () => {
  const { step, image, draft, reShoot, enhancePrompt, isEnhancing, isGeneratingImage } = useNewsroom();
  
  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6 h-full overflow-hidden">
      <Dossier
        title={draft ? draft.headline : "VISUAL ASSETS"}
        status={isGeneratingImage ? "DEVELOPING" : (image ? "DEVELOPED" : "PENDING")}
        classification="CONFIDENTIAL"
      >
        <div className="flex-1 flex flex-col items-center justify-center h-full space-y-6">
          {isGeneratingImage ? (
            <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
              <div className="w-full max-w-2xl aspect-[16/9] bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              </div>
              <p className="text-sm text-zinc-500 font-bold tracking-widest uppercase">Developing visual artifacts...</p>
            </div>
          ) : image ? (
            <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in w-full">
              <div className="relative w-full max-w-3xl aspect-[16/9] bg-black rounded overflow-hidden border border-zinc-800 shadow-2xl group">
                <img src={image} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={reShoot}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded hover:scale-105 transition-transform border border-zinc-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>RE-SHOOT</span>
                  </button>
                </div>
              </div>
              <div className="w-full max-w-3xl text-xs text-zinc-400 bg-zinc-900/50 p-4 rounded border border-zinc-800">
                <span className="font-bold text-emerald-500 uppercase tracking-widest block mb-2">Developed from Prompt:</span> 
                {draft?.suggested_visual_prompt}
              </div>
            </div>
          ) : draft ? (
            <div className="flex flex-col items-center justify-center space-y-6 max-w-2xl w-full">
              <Camera className="w-16 h-16 text-zinc-700" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white font-display">Ready for Development</h3>
                <p className="text-zinc-500">The Columnist has provided a visual prompt. Review and enhance before developing.</p>
              </div>

              <div className="w-full bg-zinc-900/50 p-6 rounded border border-zinc-800 shadow-sm relative group">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">Visual Prompt</span>
                  <button 
                    onClick={enhancePrompt}
                    disabled={isEnhancing}
                    className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                  >
                    {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span className="text-[10px] font-bold tracking-widest uppercase">Magic Enhance</span>
                  </button>
                </div>
                <p className="italic leading-relaxed text-zinc-300">"{draft.suggested_visual_prompt}"</p>
              </div>

              <button 
                onClick={reShoot}
                disabled={isEnhancing}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span className="tracking-widest uppercase">DEVELOP IMAGE</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
              <ImageIcon className="w-12 h-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">The Darkroom is empty. Awaiting editorial copy.</p>
            </div>
          )}
        </div>
      </Dossier>
    </div>
  );
};
