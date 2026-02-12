
import React, { useState, useEffect, useRef } from 'react';
import { Lead } from '../../types';
import { RiskChip } from './ui-primitives';

interface NewsroomSidebarProps {
  targets: string;
  setTargets: (val: string) => void;
  onScan: (override?: string) => void;
  onFeedScan: () => void;
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  useDemo?: boolean;
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
  const [hasScanned, setHasScanned] = useState(false);
  const prevScanning = useRef(isScanning);

  useEffect(() => {
    if (prevScanning.current && !isScanning) {
        setHasScanned(true);
    }
    prevScanning.current = isScanning;
  }, [isScanning]);

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newChannel.trim()) {
         onAddChannel(newChannel.trim());
         setNewChannel('');
         setIsAddMode(false);
      }
  };

  const handleScanClick = () => {
      setHasScanned(false);
      if (!targets.trim() && channels.length > 0) {
          const randomChannel = channels[Math.floor(Math.random() * channels.length)];
          setTargets(randomChannel);
          onScan(randomChannel);
      } else {
          onScan();
      }
  };

  return (
    <div className="flex flex-col h-full">
        {/* SECTION 1: CONTROLS */}
        <div className="p-4 border-b border-zinc-200 bg-white space-y-3">
            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Wire Signal</h3>
            
            <div className="flex gap-2">
                <input 
                    value={targets}
                    onChange={(e) => setTargets(e.target.value)}
                    placeholder="Search wire..."
                    className="flex-1 bg-white border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 outline-none transition-all placeholder:text-zinc-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                />
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={handleScanClick}
                    disabled={isScanning}
                    className="flex-1 bg-zinc-900 hover:bg-black text-white py-2 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {isScanning ? 'Scanning...' : 'Scan'}
                </button>
                <button 
                    onClick={onFeedScan}
                    disabled={isScanning}
                    className="px-3 border border-zinc-300 hover:border-zinc-400 text-zinc-700 rounded text-xs font-medium transition-colors disabled:opacity-50 bg-white"
                    title="RSS Ingest"
                >
                    RSS
                </button>
            </div>
        </div>

        {/* SECTION 2: CHANNELS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="p-4">
                 <div className="flex justify-between items-center mb-3">
                     <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Channels</span>
                     <button onClick={() => setIsAddMode(!isAddMode)} className="text-zinc-400 hover:text-zinc-900 text-xs font-bold">+</button>
                 </div>
                 
                 {isAddMode && (
                     <form onSubmit={handleAddSubmit} className="mb-3">
                         <input 
                            value={newChannel}
                            onChange={(e) => setNewChannel(e.target.value)}
                            className="w-full border border-zinc-300 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
                            placeholder="Add channel..."
                            autoFocus
                         />
                     </form>
                 )}

                 <div className="space-y-1">
                     {channels.map(c => (
                         <div 
                            key={c} 
                            className="group flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-zinc-100 cursor-pointer transition-colors"
                            onClick={() => setTargets(c)}
                         >
                             <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-zinc-400"></div>
                                 <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{c}</span>
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveChannel(c); }} 
                                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 text-xs px-1 transition-opacity"
                             >
                                ×
                             </button>
                         </div>
                     ))}
                 </div>
             </div>

             {/* SECTION 3: INCOMING LEADS */}
             <div className="border-t border-zinc-200">
                <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Live Feed</span>
                    <span className="text-[10px] font-mono bg-zinc-200 px-1.5 rounded text-zinc-600">{leads.length}</span>
                </div>
                
                <div className="p-2 space-y-2">
                    {leads.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 text-xs italic">
                            {isScanning ? 'Acquiring targets...' : 'No active signals'}
                        </div>
                    ) : (
                        leads.map((lead) => {
                            const isSelected = selectedLeadId === lead.id;
                            const isProcessed = processedLeadIds?.has(lead.id);
                            
                            return (
                                <div 
                                    key={lead.id}
                                    onClick={() => onSelectLead(lead.id)}
                                    className={`
                                        p-3 rounded-md cursor-pointer border transition-all relative
                                        ${isSelected 
                                            ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/10 z-10' 
                                            : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                                        }
                                        ${isProcessed ? 'opacity-50' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${lead.type === 'BREAKING' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
                                            {lead.type}
                                        </span>
                                        <span className={`text-[10px] font-mono font-semibold ${lead.score > 8 ? 'text-emerald-600' : 'text-zinc-400'}`}>{lead.score}</span>
                                    </div>
                                    <h4 className={`text-sm font-medium leading-snug line-clamp-2 ${isSelected ? 'text-indigo-900' : 'text-zinc-800'}`}>
                                        {lead.headline}
                                    </h4>
                                </div>
                            );
                        })
                    )}
                </div>
             </div>
        </div>
    </div>
  );
};
