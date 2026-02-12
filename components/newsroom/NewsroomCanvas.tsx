
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
    <div className="flex-1 flex flex-col bg-[#080808] relative min-w-[500px]">
        {/* Context Header */}
        <div className="h-10 border-b border-neutral-900 bg-[#0A0A0A] flex justify-between items-center px-4">
            <div className="flex gap-2">
               <button 
                  onClick={() => setViewMode('INSPECT')}
                  className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded ${currentView === 'INSPECT' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
               >
                   1. Inspect
               </button>
               <span className="text-neutral-800">→</span>
               <button 
                   onClick={() => activeDebate && setViewMode('DOSSIER')}
                   disabled={!activeDebate}
                   className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded ${currentView === 'DOSSIER' ? 'bg-neutral-800 text-white' : 'text-neutral-500 disabled:opacity-30'}`}
               >
                   2. Forensics
               </button>
               <span className="text-neutral-800">→</span>
               <button 
                   onClick={() => activeStory && setViewMode('ARTIFACT')}
                   disabled={!activeStory}
                   className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded ${currentView === 'ARTIFACT' ? 'bg-neutral-800 text-white' : 'text-neutral-500 disabled:opacity-30'}`}
               >
                   3. Artifact
               </button>
            </div>
            {isProcessing && <span className="text-[9px] text-accent animate-pulse font-bold">● PROCESSING</span>}
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative">
            {currentView === 'INSPECT' && (
                selectedLead ? (
                  <div className="p-8 max-w-3xl mx-auto animate-fade-in">
                      <h2 className="text-3xl font-display font-bold text-white mb-6 leading-tight">{selectedLead.headline}</h2>
                      <div className="grid grid-cols-2 gap-8 mb-8">
                          <div className="p-4 bg-neutral-900/50 rounded border border-neutral-800">
                              <span className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">Context</span>
                              <p className="text-sm text-neutral-300 leading-relaxed">{selectedLead.why_now || selectedLead.context}</p>
                          </div>
                          <div className="p-4 bg-neutral-900/50 rounded border border-neutral-800">
                              <span className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">Metrics</span>
                              <div className="space-y-2">
                                  <div className="flex justify-between"><span className="text-neutral-500">Impact</span><span className="text-white font-mono">{selectedLead.editorial_metrics?.impact || 50}</span></div>
                                  <div className="flex justify-between"><span className="text-neutral-500">Novelty</span><span className="text-white font-mono">{selectedLead.editorial_metrics?.novelty || 50}</span></div>
                              </div>
                          </div>
                      </div>
                      <div className="flex justify-center opacity-50">
                          <span className="text-[10px] uppercase tracking-widest text-neutral-600">Waiting for Commission...</span>
                      </div>
                  </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-700">
                        <span className="text-[9px] uppercase tracking-widest">Select a lead from the wire</span>
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
