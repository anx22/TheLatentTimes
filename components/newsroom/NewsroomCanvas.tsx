
import React, { useEffect } from 'react';
import { Lead, DebateArtifact, StoryArtifact, AgentLog } from '../../types';
import { TheDossier } from '../TheDossier';
import { TheCraft } from '../TheCraft';

interface NewsroomCanvasProps {
  currentView: 'INSPECT' | 'DOSSIER' | 'ARTIFACT';
  setViewMode: (mode: 'INSPECT' | 'DOSSIER' | 'ARTIFACT') => void;
  selectedLead: Lead | undefined;
  activeDebate: DebateArtifact | null;
  activeStory: StoryArtifact | undefined;
  isProcessing?: boolean; 
  isScanning?: boolean;
  isCommissioning?: boolean;
  logs: AgentLog[];
}

export const NewsroomCanvas: React.FC<NewsroomCanvasProps> = ({
  currentView,
  setViewMode,
  selectedLead,
  activeDebate,
  activeStory,
  isScanning = false,
  isCommissioning = false,
}) => {

  // AUTO-SWITCH LOGIC
  useEffect(() => {
      if (activeStory) {
          setViewMode('ARTIFACT');
      } else if (activeDebate) {
          setViewMode('DOSSIER');
      } else {
          setViewMode('INSPECT');
      }
  }, [activeStory?.id, activeDebate?.id]);

  // Visual Helper for Tabs
  const getTabClass = (isActive: boolean, isDisabled: boolean) => {
      if (isActive) return 'text-white border-b-2 border-accent';
      if (isDisabled) return 'text-zinc-600 cursor-not-allowed';
      return 'text-zinc-400 hover:text-zinc-200';
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 relative min-w-0 h-full border-r border-zinc-200">
        
        {/* PIPELINE HEADER */}
        <div className="h-12 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center px-6 shrink-0">
            <div className="flex gap-8">
               <button 
                  onClick={() => setViewMode('INSPECT')}
                  className={`text-[10px] uppercase tracking-widest font-bold py-3 transition-all ${getTabClass(currentView === 'INSPECT', false)}`}
               >
                   1. Inspect
               </button>
               
               <button 
                   onClick={() => activeDebate && setViewMode('DOSSIER')}
                   disabled={!activeDebate}
                   className={`text-[10px] uppercase tracking-widest font-bold py-3 transition-all ${getTabClass(currentView === 'DOSSIER', !activeDebate)}`}
               >
                   2. Forensics
               </button>
               
               <button 
                   onClick={() => activeStory && setViewMode('ARTIFACT')}
                   disabled={!activeStory}
                   className={`text-[10px] uppercase tracking-widest font-bold py-3 transition-all ${getTabClass(currentView === 'ARTIFACT', !activeStory)}`}
               >
                   3. Artifact
               </button>
            </div>
            
            <div className="flex gap-4">
                {selectedLead && (
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        Active Signal: <span className="text-zinc-300">{selectedLead.headline.slice(0,30)}...</span>
                    </span>
                )}
            </div>
        </div>

        {/* MAIN VIEWPORT */}
        <div className="flex-1 overflow-hidden relative bg-zinc-900 flex flex-col">
            {currentView === 'INSPECT' && (
                selectedLead ? (
                  <div className="p-12 max-w-4xl mx-auto animate-fade-in mt-12 overflow-y-auto custom-scrollbar h-full w-full">
                      <div className="mb-8">
                          <span className="inline-block px-2 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                              {selectedLead.type} Signal
                          </span>
                          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-[1.1] tracking-tight">{selectedLead.headline}</h2>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-8 mb-12">
                          <div className="col-span-8 p-6 bg-zinc-800/50 rounded border border-zinc-700/50">
                              <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold">Editorial Context</span>
                              <p className="text-base text-zinc-300 leading-relaxed font-serif text-pretty">{selectedLead.why_now || selectedLead.context}</p>
                          </div>
                          <div className="col-span-4 p-6 bg-zinc-800/50 rounded border border-zinc-700/50">
                              <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold">Signal Metrics</span>
                              <div className="space-y-4">
                                  <div>
                                      <div className="flex justify-between mb-1"><span className="text-xs text-zinc-500 font-bold">Impact</span><span className="text-xs text-white font-mono">{selectedLead.editorial_metrics?.impact || 50}/100</span></div>
                                      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden"><div style={{width: `${selectedLead.editorial_metrics?.impact}%`}} className="h-full bg-zinc-400"></div></div>
                                  </div>
                                  <div>
                                      <div className="flex justify-between mb-1"><span className="text-xs text-zinc-500 font-bold">Novelty</span><span className="text-xs text-white font-mono">{selectedLead.editorial_metrics?.novelty || 50}/100</span></div>
                                      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden"><div style={{width: `${selectedLead.editorial_metrics?.novelty}%`}} className="h-full bg-zinc-400"></div></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-700 space-y-4">
                        <div className="w-16 h-16 border-2 border-zinc-800 rounded-full flex items-center justify-center text-2xl font-display opacity-20">M</div>
                        <span className="text-[10px] uppercase tracking-widest font-bold">Select a lead from the wire to inspect</span>
                    </div>
                )
            )}

            {currentView === 'DOSSIER' && activeDebate && (
                <div className="h-full w-full">
                    <TheDossier dossier={activeDebate.dossier} />
                </div>
            )}

            {currentView === 'ARTIFACT' && activeStory && (
                <div className="h-full w-full bg-[#F9F8F4] overflow-hidden">
                    <div className="h-full overflow-y-auto custom-scrollbar p-8">
                        <div className="max-w-4xl mx-auto shadow-sm min-h-[900px] bg-white p-12 border border-[#E5E5E5]">
                            <TheCraft story={activeStory} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
