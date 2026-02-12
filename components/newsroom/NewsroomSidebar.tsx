
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
  processedLeadIds
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
    <div className="w-[340px] bg-[#050505] flex flex-col border-r border-neutral-900 shrink-0">
      {/* Scan Input */}
      <div className="p-4 border-b border-neutral-900 space-y-4 bg-[#080808]">
         <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Signal Wire Targets</label>
             <input 
                 value={targets} 
                 onChange={e => setTargets(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && onScan()}
                 placeholder="Search topics (e.g. AI, Crypto)..."
                 className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs focus:border-accent outline-none text-white font-mono placeholder-neutral-600 rounded-sm"
             />
         </div>
         <div className="flex gap-3">
             <button 
                 onClick={onScan} 
                 className="flex-1 bg-white hover:bg-neutral-200 text-black py-2.5 font-bold uppercase tracking-widest text-[10px] transition-colors rounded-sm shadow-sm"
             >
                 Initiate Scan
             </button>
             <button 
                 onClick={onFeedScan} 
                 className="px-4 border border-neutral-800 bg-neutral-900 hover:border-neutral-600 text-neutral-400 hover:text-white rounded-sm transition-colors" 
                 title="Scan RSS Feeds"
             >
                 ⚡
             </button>
         </div>
      </div>

      {/* Active Channels */}
      <div className="p-4 border-b border-neutral-900">
          <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Monitor Channels</span>
              <button 
                onClick={() => setIsAddMode(!isAddMode)} 
                className="text-neutral-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-neutral-900"
              >
                  {isAddMode ? 'Close' : 'Add'}
              </button>
          </div>
          
          {isAddMode && (
              <form onSubmit={handleAddSubmit} className="mb-3 animate-fade-in">
                  <input 
                      autoFocus
                      value={newChannel} 
                      onChange={e => setNewChannel(e.target.value)}
                      placeholder="New channel name..."
                      className="w-full bg-black border border-neutral-700 p-2 text-xs text-white focus:border-accent outline-none mb-2"
                  />
              </form>
          )}

          <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                  <button
                      key={channel}
                      onClick={() => setTargets(channel)} // Quick select
                      className="group flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono font-medium text-neutral-300 border border-neutral-800 rounded-sm transition-all hover:border-neutral-600"
                  >
                      {channel}
                      <span 
                          onClick={(e) => { e.stopPropagation(); onRemoveChannel(channel); }}
                          className="text-neutral-600 group-hover:text-red-500 font-bold ml-1 hover:bg-neutral-950 px-1 rounded"
                      >
                          ×
                      </span>
                  </button>
              ))}
          </div>
      </div>

      {/* Lead Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505]">
         <div className="px-4 py-3 sticky top-0 bg-[#050505]/95 backdrop-blur-sm z-10 border-b border-neutral-900 flex justify-between items-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                 Incoming Wire
             </span>
             <span className="text-[10px] font-mono text-neutral-600">{leads.length} Signals</span>
         </div>
         
         <div className="pb-8">
             {leads.map((lead) => {
                 const isProcessed = processedLeadIds?.has(lead.id);
                 return (
                     <div 
                         key={lead.id}
                         onClick={() => onSelectLead(lead.id)}
                         className={`px-4 py-4 border-b border-neutral-900 cursor-pointer transition-all group relative ${selectedLeadId === lead.id ? 'bg-[#111] border-l-2 border-l-accent' : 'hover:bg-[#0A0A0A] border-l-2 border-l-transparent'} ${isProcessed ? 'opacity-50' : 'opacity-100'}`}
                     >
                         <div className="flex justify-between items-center mb-2">
                             <RiskChip risk={lead.risk_classification} />
                             <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${lead.score >= 8 ? 'bg-accent/10 text-accent' : 'text-neutral-600 bg-neutral-900'}`}>
                                 {lead.score}/10
                             </span>
                         </div>
                         <h4 className={`text-sm font-bold leading-snug mb-2 ${selectedLeadId === lead.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                             {isProcessed && <span className="text-emerald-500 mr-2" title="Processed">✓</span>}
                             {lead.headline}
                         </h4>
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] text-neutral-600 uppercase font-mono truncate max-w-[180px]">{lead.source_ref}</span>
                            {lead.type === 'BREAKING' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                         </div>
                     </div>
                 );
             })}
             {leads.length === 0 && (
                 <div className="p-12 text-center opacity-40">
                     <span className="text-[10px] uppercase tracking-widest block mb-2">No Signals Detected</span>
                     <p className="text-xs text-neutral-600">Run a scan to populate the wire.</p>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};
