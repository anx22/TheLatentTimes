import React, { useState } from 'react';
import { Lead } from '../../types';
import { RiskChip } from './ui-primitives';

interface NewsroomSidebarProps {
  targets: string;
  setTargets: (val: string) => void;
  onScan: () => void;
  onFeedScan: () => void;
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  useDemo?: boolean;
  
  // Channels
  channels: string[];
  onAddChannel: (t: string) => void;
  onRemoveChannel: (t: string) => void;
  processedLeadIds?: Set<string>;
  isScanning?: boolean;
}

export const NewsroomSidebar: React.FC<NewsroomSidebarProps> = ({
  targets,
  setTargets,
  onScan,
  onFeedScan,
  leads,
  selectedLeadId,
  onSelectLead,
  channels,
  onAddChannel,
  onRemoveChannel,
  processedLeadIds,
  isScanning = false
}) => {
  const [newChannel, setNewChannel] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newChannel.trim()) {
         onAddChannel(newChannel.trim());
         setNewChannel('');
         setIsAddMode(false);
      }
  };

  return (
    <div className="w-[320px] bg-[#050505] flex flex-col border-r border-neutral-900 shrink-0">
        {/* SECTION 1: WIRE CONTROLS */}
        <div className="p-5 border-b border-neutral-900">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Signal Intercept</span>
            
            <div className="mb-4">
                <input 
                    value={targets}
                    onChange={(e) => setTargets(e.target.value)}
                    placeholder="Targets (csv)..."
                    className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs text-white focus:border-accent outline-none font-mono placeholder-neutral-600 mb-2 rounded-sm"
                />
                <button 
                    onClick={onScan}
                    disabled={isScanning || !targets}
                    className="w-full bg-white hover:bg-neutral-200 text-black py-2 font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
                >
                    {isScanning ? 'Scanning...' : 'Scan Targets'}
                </button>
            </div>

            <button 
                onClick={onFeedScan}
                disabled={isScanning}
                className="w-full border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white py-2 font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 rounded-sm flex justify-center gap-2"
            >
                <span>RSS INGEST</span>
            </button>
        </div>

        {/* SECTION 2: CHANNELS */}
        <div className="p-5 border-b border-neutral-900 max-h-[200px] overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Active Channels</span>
                 <button onClick={() => setIsAddMode(!isAddMode)} className="text-neutral-500 hover:text-white text-xs">+</button>
             </div>
             
             {isAddMode && (
                 <form onSubmit={handleAddSubmit} className="mb-3">
                     <input 
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-1 text-xs text-white focus:border-accent outline-none"
                        placeholder="New channel..."
                        autoFocus
                     />
                 </form>
             )}

             <div className="flex flex-wrap gap-2">
                 {channels.map(c => (
                     <div key={c} className="group flex items-center gap-2 px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-sm">
                         <span className="text-[10px] font-mono text-neutral-300">{c}</span>
                         <button onClick={() => onRemoveChannel(c)} className="text-neutral-600 hover:text-red-500 text-[10px]">×</button>
                     </div>
                 ))}
             </div>
        </div>

        {/* SECTION 3: INCOMING LEADS */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-[#0A0A0A] border-b border-neutral-900 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">Live Wire</span>
                <span className="text-[10px] font-mono text-neutral-600">{leads.length} Signals</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {leads.length === 0 ? (
                    <div className="p-8 text-center opacity-30">
                        <span className="block text-2xl mb-2">⚡</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold">No Signals Detected</span>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-900">
                        {leads.map((lead) => {
                            const isSelected = selectedLeadId === lead.id;
                            const isProcessed = processedLeadIds?.has(lead.id);
                            
                            return (
                                <div 
                                    key={lead.id}
                                    onClick={() => onSelectLead(lead.id)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-neutral-900/50 group ${isSelected ? 'bg-neutral-900 border-l-2 border-accent' : 'border-l-2 border-transparent'} ${isProcessed ? 'opacity-50 grayscale' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${lead.type === 'BREAKING' ? 'bg-red-900/20 text-red-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                            {lead.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-600 font-bold">{lead.score}/10</span>
                                    </div>
                                    <h4 className={`text-sm font-medium leading-snug mb-2 line-clamp-2 ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                                        {lead.headline}
                                    </h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase text-neutral-600 tracking-wider truncate max-w-[120px]">{lead.target_topic}</span>
                                        <RiskChip risk={lead.risk_classification} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
