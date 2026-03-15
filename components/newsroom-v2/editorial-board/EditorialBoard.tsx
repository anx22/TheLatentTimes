import React, { useState, useEffect } from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { DraftView } from '../draft/DraftView';
import { Users, Settings2, Loader2, ArrowRight, ChevronRight } from 'lucide-react';
import { EditorialAngle } from '../../../types';
import { EditorPanel } from '../draft/EditorPanel';
import { DebateView } from './DebateView';
import { DashboardView } from './DashboardView';

export const EditorialBoard: React.FC = () => {
  const { 
    draft, angles, debateTranscript, isDebating, isDrafting,
    editorialLens, globalDirective, runPipeline, runDebate, topic,
    annotations, rewriteBlock
  } = useNewsroom();
  
  const [selectedAngle, setSelectedAngle] = useState<EditorialAngle | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);

  // Auto-select first angle if none selected and angles exist
  useEffect(() => {
    if (angles.length > 0 && !selectedAngle) {
      setSelectedAngle(angles[0]);
    }
  }, [angles, selectedAngle]);

  const handleSelectAngle = (angle: EditorialAngle) => {
    setSelectedAngle(angle);
  };

  const handleCommission = (angle: EditorialAngle, headline: string) => {
    runPipeline(angle, headline);
  };

  const handleSelectAnnotation = (blockId: string, sentenceId?: string) => {
    setSelectedBlockId(blockId);
    setSelectedSentenceId(sentenceId || null);
    
    const elementId = sentenceId ? `sentence-${sentenceId}` : `block-${blockId}`;
    const el = document.getElementById(elementId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#050505]">
      {/* MAIN WORKSPACE (LEFT) */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative">
        {isDebating ? (
          <DebateView topic={topic} transcript={debateTranscript} />
        ) : isDrafting ? (
          <div className="p-8 md:p-16 max-w-4xl mx-auto h-full flex flex-col items-center justify-center space-y-8 animate-fade-in">
             <div className="w-full space-y-6">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                      <span className="text-sm font-bold text-white tracking-widest uppercase">The Columnist is Drafting...</span>
                   </div>
                   <span className="text-[10px] text-zinc-500 font-mono">EST. TIME: 12-18s</span>
                </div>
                <div className="space-y-4 opacity-40">
                  <div className="h-6 bg-zinc-800 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-4/5 animate-pulse" />
                </div>
             </div>
          </div>
        ) : draft ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DraftView 
                    selectedBlockId={selectedBlockId}
                    selectedSentenceId={selectedSentenceId}
                    onSelectBlock={setSelectedBlockId}
                    onSelectSentence={setSelectedSentenceId}
                />
            </div>
          </div>
        ) : (
          <DashboardView 
            topic={topic} 
            transcript={debateTranscript} 
            onReConvene={runDebate} 
          />
        )}
      </div>

      {/* EDITORIAL SIDEBAR (RIGHT) */}
      <div className="w-[400px] border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-hidden">
        {draft ? (
          <EditorPanel 
            annotations={annotations}
            selectedBlockId={selectedBlockId}
            selectedSentenceId={selectedSentenceId}
            onSelectAnnotation={handleSelectAnnotation}
            onApplyFix={rewriteBlock}
          />
        ) : (
          <>
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Board Controls</span>
                </div>
                {isDrafting && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                    <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Current Lens</span>
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 font-serif italic">
                    {editorialLens}
                  </div>
                </div>
                {globalDirective && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Global Directive</span>
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
                      {globalDirective}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ANGLES & HEADLINES LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {angles.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Proposed Angles</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{angles.length} OPTIONS</span>
                  </div>
                  
                  <div className="space-y-3">
                    {angles.map((angle) => {
                      const isSelected = selectedAngle?.id === angle.id;
                      return (
                        <div key={angle.id} className="space-y-2">
                          <button
                            onClick={() => handleSelectAngle(angle)}
                            className={`w-full text-left p-4 rounded-lg border transition-all group ${
                              isSelected 
                                ? 'bg-purple-500/10 border-purple-500/50' 
                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-purple-400' : 'text-zinc-500'}`}>
                                {angle.persona}
                              </span>
                              {isSelected && <ChevronRight className="w-3 h-3 text-purple-400" />}
                            </div>
                            <h4 className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                              {angle.headline}
                            </h4>
                          </button>

                          {/* HEADLINES (Only show for selected angle) */}
                          {isSelected && !draft && !isDrafting && (
                            <div className="pl-4 space-y-2 animate-slide-in">
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="h-px flex-1 bg-zinc-800" />
                                 <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">Select Headline to Commission</span>
                                 <div className="h-px flex-1 bg-zinc-800" />
                              </div>
                              {[angle.headline, ...(angle.headlineOptions || [])].map((headline, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleCommission(angle, headline)}
                                  className="w-full text-left p-3 bg-zinc-900 border border-zinc-800 rounded hover:border-emerald-500 hover:bg-zinc-800 transition-all group flex items-center justify-between"
                                >
                                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors leading-snug">{headline}</span>
                                  <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-emerald-500 transition-colors shrink-0 ml-2" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
                  <Users className="w-8 h-8 text-zinc-700" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No angles debated yet</p>
                </div>
              )}
            </div>

            {/* SIDEBAR FOOTER */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 space-y-3 relative z-50">
               <button 
                 onClick={runDebate}
                 disabled={isDebating || isDrafting}
                 className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 <Users className="w-3 h-3" />
                 <span>Re-Convene Board</span>
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
