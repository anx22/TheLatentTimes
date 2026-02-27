import React from 'react';
import { Loader2, Image as ImageIcon, RefreshCw, Camera, Sparkles } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';

export const TheDarkroom: React.FC = () => {
  const { step, image, draft, reShoot, enhancePrompt, isEnhancing } = useNewsroom();
  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {step === 'VISUALIZING' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-full max-w-2xl aspect-[16/9] bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
          <p className="text-sm text-zinc-500 font-bold tracking-widest uppercase">Developing visual artifacts...</p>
        </div>
      ) : image ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative w-full max-w-2xl aspect-[16/9] bg-black rounded overflow-hidden border border-zinc-800 shadow-2xl">
            <img src={image} alt="Generated" className="w-full h-full object-cover" />
          </div>
          <div className="w-full max-w-2xl text-xs text-zinc-400 bg-zinc-950 p-4 rounded border border-zinc-800 relative group">
            <span className="font-bold text-emerald-500 uppercase tracking-widest block mb-2">Developed from Prompt:</span> 
            {draft?.suggested_visual_prompt}
          </div>
          
          <div className="mt-8 flex justify-end w-full max-w-2xl border-t border-zinc-800 pt-6">
            <button 
              onClick={reShoot}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest">RE-SHOOT WITH NEW PARAMETERS</span>
            </button>
          </div>
        </div>
      ) : draft ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <Camera className="w-12 h-12 text-zinc-700" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">Draft Ready for Visualization</h3>
            <p className="text-sm text-zinc-500">The Columnist has provided a visual prompt. Ready to develop.</p>
          </div>

          <div className="w-full max-w-2xl text-xs text-zinc-400 bg-zinc-950 p-6 rounded border border-zinc-800 relative">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-emerald-500 uppercase tracking-widest">Visual Prompt</span>
              <button 
                onClick={enhancePrompt}
                disabled={isEnhancing}
                className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span className="text-[10px] font-bold tracking-widest uppercase">Magic Enhance</span>
              </button>
            </div>
            <p className="italic leading-relaxed">"{draft.suggested_visual_prompt}"</p>
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
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
          <ImageIcon className="w-12 h-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">The Darkroom is empty. Awaiting editorial copy.</p>
        </div>
      )}
    </div>
  );
};
