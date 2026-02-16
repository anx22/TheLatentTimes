
import React, { useState } from 'react';
import { TeamStream } from './ui-primitives';
import { AgentLog } from '../../types';
import { FEED_REGISTRY } from '../../services/rss';

interface NewsroomSidebarProps {
  targets: string;
  setTargets: (val: string) => void;
  onScan: (override?: string) => void;
  onFeedScan: () => void;
  channels: string[];
  onAddChannel: (t: string) => void;
  onRemoveChannel: (t: string) => void;
  isScanning?: boolean;
  logs: AgentLog[];
}

export const NewsroomSidebar: React.FC<NewsroomSidebarProps> = ({
  targets,
  setTargets,
  onScan,
  onFeedScan,
  channels,
  onAddChannel,
  onRemoveChannel,
  isScanning = false,
  logs
}) => {
  const [newChannel, setNewChannel] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newChannel.trim()) {
         onAddChannel(newChannel.trim());
         setNewChannel('');
         setIsAddMode(false);
      }
  };

  const handleScanClick = () => {
      if (!targets.trim() && channels.length > 0) {
          const randomChannel = channels[Math.floor(Math.random() * channels.length)];
          setTargets(randomChannel);
          onScan(randomChannel);
      } else {
          onScan();
      }
  };

  return (
    <div className="flex flex-col h-full relative">
        {/* TOP: Signal Controls */}
        <div className="p-5 border-b border-zinc-200 bg-white shrink-0">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Targeting</h3>
            
            <div className="flex flex-col gap-3">
                <input 
                    value={targets}
                    onChange={(e) => setTargets(e.target.value)}
                    placeholder="Enter keywords..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-400 focus:ring-0 outline-none transition-all placeholder:text-zinc-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                />
                
                <div className="flex gap-2">
                    <button 
                        onClick={handleScanClick}
                        disabled={isScanning}
                        className="flex-1 bg-zinc-900 hover:bg-black text-white py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {isScanning ? 'Scanning...' : 'Scan Wire'}
                    </button>
                    <button 
                        onClick={onFeedScan}
                        onMouseEnter={() => setShowSources(true)}
                        onMouseLeave={() => setShowSources(false)}
                        disabled={isScanning}
                        className="px-4 border border-zinc-200 hover:border-zinc-300 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-widest transition-colors bg-white relative"
                        title="Ingest RSS Feeds"
                    >
                        RSS
                    </button>
                </div>
            </div>
        </div>

        {/* SOURCES POPUP (Hover) */}
        {showSources && (
            <div className="absolute top-[130px] right-4 z-50 bg-black text-white p-4 rounded shadow-2xl w-64 animate-fade-in pointer-events-none">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-800 pb-2">Active Feed Registry</h4>
                <div className="space-y-2">
                    {FEED_REGISTRY.map(f => (
                        <div key={f.id} className="flex justify-between items-center text-[10px]">
                            <span className="font-bold">{f.name}</span>
                            <span className="text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded uppercase text-[9px]">{f.category}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* MIDDLE: Channel List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border-b border-zinc-200">
             <div className="p-5">
                 <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Channels</span>
                     <button onClick={() => setIsAddMode(!isAddMode)} className="text-zinc-400 hover:text-zinc-900 text-xs px-1 hover:bg-zinc-100 rounded transition-colors">+</button>
                 </div>
                 
                 {isAddMode && (
                     <form onSubmit={handleAddSubmit} className="mb-3 animate-fade-in">
                         <input 
                            value={newChannel}
                            onChange={(e) => setNewChannel(e.target.value)}
                            className="w-full border border-zinc-300 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                            placeholder="Add channel..."
                            autoFocus
                         />
                     </form>
                 )}

                 <div className="space-y-1">
                     {channels.map(c => (
                         <div 
                            key={c} 
                            className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-white hover:shadow-sm hover:border-zinc-200 border border-transparent cursor-pointer transition-all"
                            onClick={() => setTargets(c)}
                         >
                             <div className="flex items-center gap-2.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors"></div>
                                 <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900">{c}</span>
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveChannel(c); }} 
                                className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 text-xs transition-all"
                             >
                                ×
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
        </div>

        {/* BOTTOM: Team Comms (Always Visible) */}
        <div className="h-[40%] min-h-[250px] bg-zinc-50 flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-200 bg-white flex justify-between items-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Team Comms</span>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-mono text-zinc-300">LIVE</span>
                </div>
            </div>
            <TeamStream logs={logs.slice(-50)} className="flex-1" />
        </div>
    </div>
  );
};
