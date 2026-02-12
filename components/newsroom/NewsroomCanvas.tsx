
import React from 'react';
import { Lead, DebateArtifact, StoryArtifact, IssueContent } from '../../types';
import { TheDossier } from '../TheDossier';
import { TheCraft } from '../TheCraft';

interface NewsroomCanvasProps {
  currentView: 'INSPECT' | 'DOSSIER' | 'ARTIFACT';
  setViewMode: (mode: 'INSPECT' | 'DOSSIER' | 'ARTIFACT') => void;
  selectedLead: Lead | undefined;
  activeDebate: DebateArtifact | null;
  activeStory: StoryArtifact | undefined;
  isProcessing: boolean;
}

export const NewsroomCanvas: React.FC<NewsroomCanvasProps> = ({
  currentView,
  setViewMode,
  selectedLead,
  activeDebate,
  activeStory,
  isProcessing
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#080808] relative min-w-[600px]">
        {/* Context Header */}
        <div className="h-12 border-b border-neutral-900 bg-[#0A0A0A] flex justify-between items-center px-6 shrink-0">
            <div className="flex gap-4">
               <button 
                  onClick={() => setViewMode('INSPECT')}
                  className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded transition-all ${currentView === 'INSPECT' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'}`}
               >
                   1. Inspect
               </button>
               <span className="text-neutral-800 self-center">→</span>
               <button 
                   onClick={() => activeDebate && setViewMode('DOSSIER')}
                   disabled={!activeDebate}
                   className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded transition-all ${currentView === 'DOSSIER' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 disabled:opacity-30 hover:text-neutral-300 hover:bg-neutral-900'}`}
               >
                   2. Forensics
               </button>
               <span className="text-neutral-800 self-center">→</span>
               <button 
                   onClick={() => activeStory && setViewMode('ARTIFACT')}
                   disabled={!activeStory}
                   className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded transition-all ${currentView === 'ARTIFACT' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 disabled:opacity-30 hover:text-neutral-300 hover:bg-neutral-900'}`}
               >
                   3. Artifact
               </button>
            </div>
            {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-accent font-bold tracking-wider">PROCESSING</span>
                </div>
            )}
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative">
            {currentView === 'INSPECT' && (
                selectedLead ? (
                  <div className="p-12 max-w-4xl mx-auto animate-fade-in mt-12">
                      <div className="mb-8">
                          <span className="inline-block px-2 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest bg-neutral-900 text-neutral-400 rounded border border-neutral-800">
                              {selectedLead.type} Signal
                          </span>
                          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-[1.1] tracking-tight">{selectedLead.headline}</h2>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-8 mb-12">
                          <div className="col-span-8 p-6 bg-neutral-900/40 rounded border border-neutral-800/60">
                              <span className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-3 font-bold">Editorial Context</span>
                              <p className="text-base text-neutral-300 leading-relaxed font-serif text-pretty">{selectedLead.why_now || selectedLead.context}</p>
                          </div>
                          <div className="col-span-4 p-6 bg-neutral-900/40 rounded border border-neutral-800/60">
                              <span className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-3 font-bold">Signal Metrics</span>
                              <div className="space-y-4">
                                  <div>
                                      <div className="flex justify-between mb-1"><span className="text-xs text-neutral-500 font-bold">Impact</span><span className="text-xs text-white font-mono">{selectedLead.editorial_metrics?.impact || 50}/100</span></div>
                                      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden"><div style={{width: `${selectedLead.editorial_metrics?.impact}%`}} className="h-full bg-neutral-500"></div></div>
                                  </div>
                                  <div>
                                      <div className="flex justify-between mb-1"><span className="text-xs text-neutral-500 font-bold">Novelty</span><span className="text-xs text-white font-mono">{selectedLead.editorial_metrics?.novelty || 50}/100</span></div>
                                      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden"><div style={{width: `${selectedLead.editorial_metrics?.novelty}%`}} className="h-full bg-neutral-500"></div></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="flex justify-center opacity-40">
                          <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-mono">Awaiting Commission Configuration...</span>
                      </div>
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-700 space-y-4">
                        <div className="w-16 h-16 border-2 border-neutral-800 rounded-full flex items-center justify-center text-2xl font-display opacity-20">M</div>
                        <span className="text-[10px] uppercase tracking-widest font-bold">Select a lead from the wire to inspect</span>
                    </div>
                )
            )}

            {currentView === 'DOSSIER' && activeDebate && (
                <TheDossier dossier={activeDebate.dossier} />
            )}

            {currentView === 'ARTIFACT' && activeStory && (
                <TheCraft story={activeStory} />
            )}
        </div>
    </div>
  );
};
