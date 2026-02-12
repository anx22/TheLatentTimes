
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
    <div className="w-[280px] bg-[#050505] flex flex-col border-r border-neutral-900">
      {/* Scan Input */}
      <div className="p-3 border-b border-neutral-900 space-y-3">
         <input 
             value={targets} 
             onChange={e => setTargets(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && onScan()}
             placeholder="Topic (e.g. AI, Crypto)..."
             className="w-full bg-neutral-900/50 border border-neutral-800 p-2 text-[10px] focus:border-accent outline-none text-white font-mono placeholder-neutral-700"
         />
         <div className="flex gap-2">
             <button onClick={onScan} className="flex-1 bg-white hover:bg-neutral-200 text-black py-2 font-bold uppercase tracking-widest text-[9px] transition-colors">
                 Scan
             </button>
             <button onClick={onFeedScan} className="px-3 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white" title="Scan RSS Feeds">
                 ⚡
             </button>
         </div>
      </div>

      {/* Active Channels */}
      <div className="p-3 border-b border-neutral-900">
          <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Active Channels</span>
              <button 
                onClick={() => setIsAddMode(!isAddMode)} 
                className="text-neutral-500 hover:text-white text-[10px]"
              >
                  {isAddMode ? '×' : '+'}
              </button>
          </div>
          
          {isAddMode && (
              <form onSubmit={handleAddSubmit} className="mb-2">
                  <input 
                      autoFocus
                      value={newChannel} 
                      onChange={e => setNewChannel(e.target.value)}
                      placeholder="Add topic..."
                      className="w-full bg-black border border-neutral-700 p-1 text-[10px] text-white focus:border-accent outline-none"
                  />
              </form>
          )}

          <div className="flex flex-wrap gap-1.5">
              {channels.map((channel) => (
                  <button
                      key={channel}
                      onClick={() => setTargets(channel)} // Quick select
                      className="group flex items-center gap-1.5 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-[9px] font-mono text-neutral-300 border border-neutral-800 rounded-sm transition-colors"
                  >
                      {channel}
                      <span 
                          onClick={(e) => { e.stopPropagation(); onRemoveChannel(channel); }}
                          className="text-neutral-600 group-hover:text-red-500 font-bold hover:bg-neutral-900 rounded px-1"
                      >
                          ×
                      </span>
                  </button>
              ))}
          </div>
      </div>

      {/* Lead Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         <div className="p-2 sticky top-0 bg-[#050505] z-10 border-b border-neutral-900">
             <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                 Incoming Wire ({leads.length})
             </span>
         </div>
         {leads.map((lead) => {
             const isProcessed = processedLeadIds?.has(lead.id);
             return (
                 <div 
                     key={lead.id}
                     onClick={() => onSelectLead(lead.id)}
                     className={`p-3 border-b border-neutral-900/50 cursor-pointer transition-colors group ${selectedLeadId === lead.id ? 'bg-[#111]' : 'hover:bg-[#0A0A0A]'} ${isProcessed ? 'opacity-40' : 'opacity-100'}`}
                 >
                     <div className="flex justify-between items-center mb-1">
                         <RiskChip risk={lead.risk_classification} />
                         <span className={`text-[9px] font-mono px-1 rounded ${lead.score >= 8 ? 'bg-accent/10 text-accent' : 'text-neutral-600'}`}>
                             {lead.score}/10
                         </span>
                     </div>
                     <h4 className={`text-xs font-bold leading-tight mb-1 ${selectedLeadId === lead.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                         {isProcessed && <span className="text-emerald-500 mr-1">✓</span>}
                         {lead.headline}
                     </h4>
                     <span className="text-[9px] text-neutral-600 uppercase block truncate">{lead.source_ref}</span>
                 </div>
             );
         })}
         {leads.length === 0 && (
             <div className="p-8 text-center opacity-30">
                 <span className="text-[9px] uppercase tracking-widest">No Signals</span>
             </div>
         )}
      </div>
    </div>
  );
};
