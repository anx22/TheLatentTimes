import React, { useContext } from 'react';
import { Image as ImageIcon, Loader2, RefreshCw, Zap, Maximize2, Download, CheckCircle, Sliders } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';

export const TheDarkroom: React.FC = () => {
  const context = useContext(NewsroomContext);

  if (!context) return null;

  const { 
    image, 
    isGeneratingImage, 
    reShoot, 
    draft, 
    visualStyle, 
    setVisualStyle, 
    aspectRatio, 
    setAspectRatio,
    publish,
    tickerItems
  } = context;

  const relevantItems = tickerItems.filter(i => i.storyId === draft?.storyId);
  const culturalMoodData = relevantItems.flatMap(i => i.cultural_vectors || []);

  const visualStyles = [
    'Editorial Photography',
    'Swiss Modernist',
    'Glitch Art / Data-Mosh',
    'Brutalist UI Render',
    'Cinematic 35mm',
    'Abstract Vector'
  ];

  const aspectRatios = [
    { id: '16:9', name: 'Widescreen (16:9)' },
    { id: '4:3', name: 'Technical (4:3)' },
    { id: '1:1', name: 'Square (1:1)' },
    { id: '9:16', name: 'Vertical (9:16)' }
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] overflow-hidden">
      {/* Darkroom Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-6 gap-6 bg-black/40 shrink-0">
        <div className="flex-1 overflow-hidden">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 truncate">Asset Production</div>
            <h2 className="text-sm font-bold text-emerald-400 font-mono truncate uppercase tracking-widest">The Darkroom</h2>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={reShoot}
            disabled={isGeneratingImage || !draft}
            className="flex items-center gap-2 border border-zinc-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {image ? 'Re-Shoot' : 'Develop Asset'}
          </button>
          
          {image && (
            <button 
              onClick={publish}
              className="flex items-center gap-2 bg-zinc-100 text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Send to Press
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Controls */}
        <div className="w-80 flex flex-col border-r border-zinc-800 bg-black/20 shrink-0">
           <div className="flex-1 overflow-y-auto p-6 space-y-10">
              {/* Style Selector */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <Sliders className="w-3 h-3" />
                    Art Direction
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 block">Visual Style</label>
                    <div className="grid grid-cols-1 gap-2">
                       {visualStyles.map((style) => (
                         <button
                           key={style}
                           onClick={() => setVisualStyle(style)}
                           className={`text-left px-3 py-2 text-[10px] font-mono uppercase border transition-all ${
                             visualStyle === style 
                             ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' 
                             : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                           }`}
                         >
                           {style}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-4">
                 <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 block">Aspect Ratio</label>
                 <div className="grid grid-cols-1 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setAspectRatio(ratio.id as any)}
                        className={`text-left px-3 py-2 text-[10px] font-mono uppercase border transition-all ${
                          aspectRatio === ratio.id
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' 
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                      >
                        {ratio.name}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Prompt Preview */}
              {draft && (
                <div className="space-y-3">
                   <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 block">Latent Blueprint</label>
                   <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm text-[10px] font-mono text-zinc-400 italic leading-relaxed">
                     {draft.suggested_visual_prompt}
                   </div>
                </div>
              )}

              {/* Mood Board (Cultural Vectors) */}
              {culturalMoodData.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <Zap className="w-3 h-3" />
                      Cultural Mood Board
                   </div>
                   <div className="space-y-3">
                      {culturalMoodData.slice(0, 4).map((vector, idx) => (
                        <div key={idx} className="group relative">
                           <div className="flex justify-between items-end mb-1">
                              <span className="text-[9px] font-mono uppercase text-emerald-500/80 font-bold">{vector.trend}</span>
                              <span className="text-[8px] font-mono text-zinc-600">{vector.resonance}%</span>
                           </div>
                           <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500/40 transition-all duration-1000" 
                                style={{ width: `${vector.resonance}%` }}
                              />
                           </div>
                           <div className="mt-2 text-[9px] text-zinc-500 leading-relaxed font-mono opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 right-0 bg-black/90 p-3 border border-zinc-800 z-10 pointer-events-none">
                              {vector.connection}
                           </div>
                        </div>
                      ))}
                   </div>
                   <p className="text-[8px] font-mono text-zinc-700 italic">These vectors are cross-connected from decoded signals.</p>
                </div>
              )}
           </div>
        </div>

        {/* Center: Image Viewport */}
        <div className="flex-1 bg-[#111] flex flex-col items-center justify-center relative p-12">
            {isGeneratingImage ? (
                <div className="flex flex-col items-center animate-pulse">
                   <div className="w-24 h-24 border border-emerald-500/30 flex items-center justify-center mb-8 bg-emerald-500/5">
                      <Zap className="w-10 h-10 text-emerald-500 animate-bounce" />
                   </div>
                   <h3 className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-400 mb-2">Synthesizing Latent Artifact</h3>
                   <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Coalescing probability fields into visual form...</p>
                </div>
            ) : image ? (
                <div className="w-full h-full flex flex-col items-center justify-center group">
                    <div className="relative max-w-full max-h-full shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-zinc-800 overflow-hidden">
                        <img 
                          src={image} 
                          alt="Generated" 
                          className="max-w-full max-h-[70vh] object-contain grayscale group-hover:grayscale-0 transition-all duration-1000"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all"></div>
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="bg-black/80 p-2 border border-zinc-800 hover:bg-black transition-colors" title="View Full">
                              <Maximize2 className="w-4 h-4 text-white" />
                           </button>
                           <button className="bg-black/80 p-2 border border-zinc-800 hover:bg-black transition-colors" title="Download">
                              <Download className="w-4 h-4 text-white" />
                           </button>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="flex gap-4">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">FORMAT: PNG</span>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">TYPE: LATENT_ARTIFACT_v3</span>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">STATUS: VERIFIED</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-zinc-800 opacity-20">
                    <ImageIcon className="w-24 h-24 mb-6" />
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] mb-2">Visual Engine Offline</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Asset generation pending commission</p>
                </div>
            )}

            {/* Grid Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-zinc-800/50"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-zinc-800/50"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-zinc-800/50"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-zinc-800/50"></div>
        </div>
      </div>
    </div>
  );
};
