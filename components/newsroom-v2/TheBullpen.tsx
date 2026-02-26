import React, { useState, useEffect } from 'react';
import { PenTool, RefreshCw, Loader2, Users } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';

export const TheBullpen: React.FC = () => {
  const { step, draft, reDraft, angles, runPipeline, runDebate } = useNewsroom();
  const [view, setView] = useState<'ANGLES' | 'DRAFT'>('DRAFT');

  useEffect(() => {
    if (step === 'DEBATING') setView('ANGLES');
    if (step === 'WRITING') setView('DRAFT');
  }, [step]);

  // If we don't have a draft, but we have angles, default to angles
  useEffect(() => {
    if (!draft && angles.length > 0 && view === 'DRAFT') {
      setView('ANGLES');
    }
  }, [draft, angles, view]);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Navigation Toggle */}
      <div className="flex border-b border-zinc-800 mb-6 shrink-0">
        <button 
          onClick={() => setView('ANGLES')} 
          disabled={angles.length === 0 && step !== 'DEBATING'}
          className={`px-6 py-3 text-xs font-bold tracking-widest transition-colors disabled:opacity-30 ${view === 'ANGLES' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          1. EDITORIAL BOARD (ANGLES)
        </button>
        <button 
          onClick={() => setView('DRAFT')} 
          disabled={!draft && step !== 'WRITING'}
          className={`px-6 py-3 text-xs font-bold tracking-widest transition-colors disabled:opacity-30 ${view === 'DRAFT' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          2. THE COLUMNIST (DRAFT)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        {view === 'ANGLES' ? (
          step === 'DEBATING' && angles.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-sm text-zinc-500 font-bold tracking-widest uppercase">The Editorial Board is debating angles...</p>
            </div>
          ) : angles.length > 0 ? (
            <div className="space-y-6 animate-fade-in pb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">Editorial Board Verdict</h2>
                <p className="text-zinc-500">Select an angle to commission the draft, or re-run the debate.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {angles.map((angle) => (
                  <div 
                    key={angle.id} 
                    onClick={() => runPipeline(angle)}
                    className="bg-zinc-950 border border-zinc-800 p-6 rounded hover:border-emerald-500 transition-colors group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{angle.persona}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{angle.headline}</h3>
                    <p className="text-sm text-zinc-400">{angle.angle}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end border-t border-zinc-800 pt-6">
                <button 
                  onClick={runDebate}
                  className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest">RE-CONVENE BOARD (NEW ANGLES)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-50">
              <Users className="w-12 h-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">No angles debated yet. Send a signal from The Wire.</p>
            </div>
          )
        ) : (
          // DRAFT VIEW
          step === 'WRITING' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
              <div className="w-full max-w-md space-y-4">
                <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ) : draft ? (
            <div className="space-y-8 animate-fade-in bg-zinc-950 border border-zinc-800 p-8 rounded mb-8">
              <div className="space-y-4 border-b border-zinc-800 pb-6">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{draft.tags.join(' • ')}</span>
                <h2 className="text-4xl font-display font-bold leading-tight text-white">{draft.headline}</h2>
                <p className="text-xl text-zinc-400 italic border-l-2 border-emerald-500 pl-4">{draft.deck}</p>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none">
                {draft.blocks ? (
                  draft.blocks.map((block) => (
                    <div key={block.id} className="relative group">
                      {block.type === 'h2' && <h2>{block.content}</h2>}
                      {block.type === 'h3' && <h3>{block.content}</h3>}
                      {block.type === 'quote' && <blockquote>{block.content}</blockquote>}
                      {block.type === 'p' && <p>{block.content}</p>}
                    </div>
                  ))
                ) : (
                  draft.body.split('\n').map((p, i) => <p key={i}>{p}</p>)
                )}
              </div>
              
              <div className="mt-8 flex justify-end border-t border-zinc-800 pt-6">
                <button 
                  onClick={reDraft}
                  className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest">RE-DRAFT WITH CURRENT LENS</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-50">
              <PenTool className="w-12 h-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">No draft available. Select an angle to begin writing.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
