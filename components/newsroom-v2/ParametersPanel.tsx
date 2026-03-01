import React from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';

interface ParametersPanelProps {
  activeDept: string;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({ activeDept }) => {
  const { 
    sources, setSources, noiseFilter, setNoiseFilter, 
    editorialLens, setEditorialLens, wordCount, setWordCount, 
    visualStyle, setVisualStyle, aspectRatio, setAspectRatio 
  } = useNewsroom();

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <span className="font-bold text-xs tracking-widest text-emerald-500 uppercase">{activeDept} SETTINGS</span>
      </div>
      
      {activeDept === 'THE NEWS TERMINAL' && (
        <>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Sources</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-xs text-zinc-400 cursor-pointer hover:text-white">
                <input type="checkbox" checked={sources.github} onChange={(e) => setSources({...sources, github: e.target.checked})} className="accent-emerald-500" />
                GitHub Trending
              </label>
              <label className="flex items-center gap-3 text-xs text-zinc-400 cursor-pointer hover:text-white">
                <input type="checkbox" checked={sources.arxiv} onChange={(e) => setSources({...sources, arxiv: e.target.checked})} className="accent-emerald-500" />
                Arxiv (CS.AI)
              </label>
              <label className="flex items-center gap-3 text-xs text-zinc-400 cursor-pointer hover:text-white">
                <input type="checkbox" checked={sources.techcrunch} onChange={(e) => setSources({...sources, techcrunch: e.target.checked})} className="accent-emerald-500" />
                TechCrunch
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Noise Filter</h4>
            <input 
              type="range" 
              min="0" max="100" 
              value={noiseFilter} 
              onChange={(e) => setNoiseFilter(parseInt(e.target.value))}
              className="w-full accent-emerald-500" 
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Broad</span>
              <span>Strict</span>
            </div>
          </div>
        </>
      )}

      {activeDept === 'THE EDITORIAL BOARD' && (
        <>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Editorial Lens</h4>
            <select 
              value={editorialLens}
              onChange={(e) => setEditorialLens(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-emerald-500 outline-none"
            >
              <option>Tech-Optimist (Default)</option>
              <option>Culture-Critic</option>
              <option>Fashion-Forward</option>
              <option>Dystopian</option>
            </select>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Word Count Target</h4>
            <select 
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-emerald-500 outline-none"
            >
              <option>Short (300 words)</option>
              <option>Standard (600 words)</option>
              <option>Deep Dive (1200 words)</option>
            </select>
          </div>
        </>
      )}

      {activeDept === 'THE DARKROOM' && (
        <>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Visual Style</h4>
            <select 
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-emerald-500 outline-none"
            >
              <option>Editorial Photography</option>
              <option>Cyberpunk Render</option>
              <option>Technical Blueprint</option>
              <option>Abstract Latent</option>
            </select>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aspect Ratio</h4>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setAspectRatio('16:9')} className={`py-2 rounded text-xs transition-colors ${aspectRatio === '16:9' ? 'bg-zinc-800 text-white font-bold border border-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-transparent'}`}>16:9</button>
              <button onClick={() => setAspectRatio('1:1')} className={`py-2 rounded text-xs transition-colors ${aspectRatio === '1:1' ? 'bg-zinc-800 text-white font-bold border border-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-transparent'}`}>1:1</button>
              <button onClick={() => setAspectRatio('3:4')} className={`py-2 rounded text-xs transition-colors ${aspectRatio === '3:4' ? 'bg-zinc-800 text-white font-bold border border-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-transparent'}`}>3:4</button>
            </div>
          </div>
        </>
      )}

      {activeDept === 'THE PRINTING PRESS' && (
        <div className="text-xs text-zinc-500 italic">
          No parameters for final review.
        </div>
      )}
    </div>
  );
};
