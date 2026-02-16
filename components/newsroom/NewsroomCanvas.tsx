
import React, { useEffect } from 'react';
import { Lead, DebateArtifact, StoryArtifact, AgentLog } from '../../types';
import { TheDossier } from '../TheDossier';
import { TheCraft } from '../TheCraft';
import { AssetCard } from './AssetCard';

interface NewsroomCanvasProps {
  currentView: 'INSPECT' | 'DOSSIER' | 'ARTIFACT';
  setViewMode: (mode: 'INSPECT' | 'DOSSIER' | 'ARTIFACT') => void;
  selectedLead: Lead | undefined;
  activeDebate: DebateArtifact | null;
  activeStory: StoryArtifact | undefined;
  
  // Wire Data
  leads: Lead[];
  working: StoryArtifact[];
  basket: StoryArtifact[];
  onSelectLead: (id: string | null) => void;
  onSelectStory: (id: string | null) => void;

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
  leads,
  working,
  basket,
  onSelectLead,
  onSelectStory,
  isScanning = false,
  isCommissioning = false,
}) => {

  // AUTO-SWITCH LOGIC
  useEffect(() => {
      if (activeStory) {
          setViewMode('ARTIFACT');
      } else if (activeDebate) {
          setViewMode('DOSSIER');
      } else if (selectedLead) {
          setViewMode('INSPECT');
      }
  }, [activeStory?.id, activeDebate?.id, selectedLead?.id]);

  // Tab Styling Helper
  const getTabClass = (isActive: boolean, isDisabled: boolean) => {
      if (isActive) return 'text-zinc-900 border-b-2 border-zinc-900 bg-zinc-50';
      if (isDisabled) return 'text-zinc-300 cursor-not-allowed';
      return 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50';
  };

  const hasActiveWork = !!selectedLead || !!activeStory;

  return (
    <div className="flex-1 flex flex-col bg-white relative min-w-0 h-full">
        
        {/* PIPELINE HEADER (Only visible when working) */}
        {hasActiveWork ? (
            <div className="h-14 border-b border-zinc-200 bg-white flex justify-between items-center px-6 shrink-0">
                <div className="flex h-full">
                   <button 
                      onClick={() => setViewMode('INSPECT')}
                      className={`px-6 h-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all ${getTabClass(currentView === 'INSPECT', false)}`}
                   >
                       <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">1</span>
                       Inspect
                   </button>
                   
                   <button 
                       onClick={() => activeDebate && setViewMode('DOSSIER')}
                       disabled={!activeDebate}
                       className={`px-6 h-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all ${getTabClass(currentView === 'DOSSIER', !activeDebate)}`}
                   >
                       <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">2</span>
                       Forensics
                   </button>
                   
                   <button 
                       onClick={() => activeStory && setViewMode('ARTIFACT')}
                       disabled={!activeStory}
                       className={`px-6 h-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all ${getTabClass(currentView === 'ARTIFACT', !activeStory)}`}
                   >
                       <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">3</span>
                       Artifact
                   </button>
                </div>
                
                <div className="flex gap-4">
                    <button onClick={() => { onSelectLead(null); onSelectStory(null); }} className="text-zinc-400 hover:text-zinc-900 text-xs font-medium px-3 py-1 rounded hover:bg-zinc-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        ) : (
            // WIRE HEADER
            <div className="h-14 border-b border-zinc-200 bg-white flex justify-between items-center px-8 shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900">The Wire</h2>
                <div className="flex gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>{leads.length} Signals</span>
                    <span>{working.length} In Progress</span>
                    <span>{basket.length} Ready</span>
                </div>
            </div>
        )}

        {/* MAIN VIEWPORT */}
        <div className="flex-1 overflow-hidden relative bg-zinc-50/30 flex flex-col">
            
            {/* STATE 0: WIRE GRID (Idle) */}
            {!hasActiveWork && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {/* SECTION: LIVE WIRE */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6 opacity-60">
                            <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Incoming Signals</span>
                        </div>
                        {leads.length === 0 ? (
                            <div className="border-2 border-dashed border-zinc-200 rounded-lg h-32 flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest">
                                {isScanning ? 'Scanning Wire...' : 'No Signals Detected'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leads.map(lead => (
                                    <AssetCard 
                                        key={lead.id} 
                                        type="LEAD" 
                                        data={lead} 
                                        onClick={() => onSelectLead(lead.id)} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECTION: IN PROGRESS */}
                    {working.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6 opacity-60">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Production Line</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {working.map(story => (
                                    <AssetCard 
                                        key={story.id} 
                                        type="STORY" 
                                        data={story} 
                                        onClick={() => onSelectStory(story.id)} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STATE 1: INSPECT */}
            {hasActiveWork && currentView === 'INSPECT' && (
                selectedLead ? (
                  <div className="p-12 max-w-4xl mx-auto animate-fade-in mt-4 overflow-y-auto custom-scrollbar h-full w-full bg-white shadow-sm border-x border-zinc-100">
                      <div className="mb-8">
                          <span className="inline-block px-2 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-600 rounded">
                              {selectedLead.type} Signal
                          </span>
                          <h2 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 mb-6 leading-[1.1] tracking-tight">{selectedLead.headline}</h2>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-8 mb-12">
                          <div className="col-span-8 p-6 bg-zinc-50 rounded border border-zinc-100">
                              <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3 font-bold">Editorial Context</span>
                              <p className="text-base text-zinc-700 leading-relaxed font-serif text-pretty">{selectedLead.why_now || selectedLead.context}</p>
                          </div>
                          <div className="col-span-4 p-6 bg-zinc-50 rounded border border-zinc-100">
                              <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3 font-bold">Signal Metrics</span>
                              <div className="space-y-4">
                                  <div>
                                      <div className="flex justify-between mb-1"><span className="text-xs text-zinc-500 font-bold">Impact</span><span className="text-xs text-zinc-900 font-mono">{selectedLead.editorial_metrics?.impact || 50}/100</span></div>
                                      <div className="h-1 bg-zinc-200 rounded-full overflow-hidden"><div style={{width: `${selectedLead.editorial_metrics?.impact}%`}} className="h-full bg-zinc-500"></div></div>
                                  </div>
                                  <div>
                                      <div className="flex justify-between mb-1"><span className="text-xs text-zinc-500 font-bold">Novelty</span><span className="text-xs text-zinc-900 font-mono">{selectedLead.editorial_metrics?.novelty || 50}/100</span></div>
                                      <div className="h-1 bg-zinc-200 rounded-full overflow-hidden"><div style={{width: `${selectedLead.editorial_metrics?.novelty}%`}} className="h-full bg-zinc-500"></div></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                        <span className="text-[10px] uppercase tracking-widest font-bold">No Lead Selected</span>
                    </div>
                )
            )}

            {/* STATE 2: DOSSIER */}
            {hasActiveWork && currentView === 'DOSSIER' && activeDebate && (
                <div className="h-full w-full">
                    <TheDossier dossier={activeDebate.dossier} />
                </div>
            )}

            {/* STATE 3: ARTIFACT */}
            {hasActiveWork && currentView === 'ARTIFACT' && activeStory && (
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
