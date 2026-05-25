import React, { useContext } from 'react';
import { X, Radio, MessageSquare, Image, Printer, Terminal, Activity } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { TheWire } from './TheWire';
import { TheBullpen } from './TheBullpen';
import { TheDarkroom } from './TheDarkroom';
import { PrintingPress } from './printing-press/PrintingPress';
import { NewsroomButton, NewsroomLabel, NewsroomPanel, ClusterCard } from './NewsroomUI';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface NewsroomFloorProps {
  onClose: () => void;
}

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onClose }) => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { step, setStep, logs } = context;

  const renderActiveDepartment = () => {
    switch (step) {
      case 'NEWS_TERMINAL':
        return <TheWire />;
      case 'EDITORIAL_BOARD':
        return <TheBullpen />;
      case 'DARKROOM':
        return <TheDarkroom />;
      case 'PRINTING_PRESS':
      case 'PUBLISHED':
        return <PrintingPress onClose={onClose} />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#060606] text-zinc-500">
            <Terminal className="w-12 h-12 mb-6 opacity-10" />
            <h2 className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-500/50">System Standby</h2>
            <NewsroomButton 
                variant="tactical"
                onClick={() => setStep('NEWS_TERMINAL')}
                className="mt-8"
            >
                Initialize Terminal
            </NewsroomButton>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-fade-in text-white font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar - Tactical Command Header */}
      <div className="h-14 border-b border-zinc-800/80 flex items-center justify-between px-8 shrink-0 bg-[#080808] z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="font-mono text-[14px] uppercase tracking-[0.4em] font-black">
              LNT.Newsroom <span className="text-zinc-700 ml-1">v2.5</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-hidden px-4">
           {[
             { id: 'NEWS_TERMINAL', name: 'TERMINAL', icon: Radio },
             { id: 'EDITORIAL_BOARD', name: 'EDITORIAL', icon: MessageSquare },
             { id: 'DARKROOM', name: 'VISUAL', icon: Image },
             { id: 'PRINTING_PRESS', name: 'PUBLISH', icon: Printer },
           ].map((dept) => (
             <button
               key={dept.id}
               onClick={() => setStep(dept.id as any)}
               className={cn(
                 "flex items-center gap-2.5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative group shrink-0",
                 step === dept.id ? 'text-[#ccff00]' : 'text-zinc-600 hover:text-zinc-400'
               )}
             >
               <dept.icon className={cn("w-3.5 h-3.5", step === dept.id ? 'text-[#ccff00]' : 'text-zinc-900 group-hover:text-zinc-600')} />
               <span className="hidden xl:inline">{dept.name}</span>
               
               {step === dept.id && (
                 <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-[19px] left-0 right-0 h-0.5 bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.5)]" 
                 />
               )}
             </button>
           ))}
        </div>

           <button 
             onClick={onClose}
             className="text-zinc-600 hover:text-white transition-all p-1.5 hover:rotate-90 duration-300 ml-4"
           >
             <X className="w-5 h-5" />
           </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Department Content */}
        <NewsroomPanel className="flex-1">
          {renderActiveDepartment()}
        </NewsroomPanel>

        {/* Right Sidebar: Operational Terminal */}
        <NewsroomPanel side="right" width="w-80" className="hidden lg:flex">
          {step === 'NEWS_TERMINAL' && (
            <div className="border-b border-zinc-900 shrink-0">
                <div className="p-4 bg-emerald-500/5">
                  <NewsroomLabel type="header" className="text-[14px] mb-3 block">Related Topics</NewsroomLabel>
                  <div className="space-y-2">
                    {context.newsClusters.slice(0, 2).map((cluster) => (
                       <ClusterCard 
                         key={cluster._id} 
                         cluster={cluster} 
                         onSelect={(t) => context.setTopic(t)}
                         className="p-3 bg-black/40 border-zinc-800/50"
                       />
                    ))}
                 </div>
               </div>
               <div className="p-4 border-t border-zinc-900">
                  <NewsroomLabel type="header" className="text-[14px] mb-3 block">Director's Directive</NewsroomLabel>
                  <textarea 
                    className="w-full bg-black border border-zinc-800 p-3 text-[12px] font-mono focus:outline-none focus:border-emerald-500/30 h-24 resize-none text-emerald-500/80 transition-all placeholder:text-zinc-700 leading-relaxed"
                    placeholder="Enter an overarching narrative bias or strategic focus (e.g., 'Focus heavily on the geopolitical consequences'). This directive influences all agents in the pipeline."
                    value={context.globalDirective}
                    onChange={(e) => context.setGlobalDirective(e.target.value)}
                  />
               </div>
            </div>
          )}

          <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-black/40 shrink-0">
            <NewsroomLabel type="header" className="flex items-center gap-2 text-[14px]">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Operational Log [Newest First]
            </NewsroomLabel>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide">
            {logs.slice().sort((a,b) => b.timestamp - a.timestamp).map((log, i) => (
              <div key={log._id || i} className="group space-y-2 animate-in slide-in-from-right-2 duration-300">
                <div className="flex justify-between items-center text-[14px]">
                  <span className={cn(
                    "font-bold uppercase tracking-widest",
                    log.agentName === 'SYSTEM' ? 'text-red-500/70' : 'text-emerald-500/70'
                  )}>
                    [{log.agentName}]
                  </span>
                  <span className="text-zinc-800">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="text-[14px] leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors border-l border-zinc-900 pl-4 py-1">
                  {log.message}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center pt-20">
                    <NewsroomLabel type="key">Terminal Idle</NewsroomLabel>
                </div>
            )}
          </div>
        </NewsroomPanel>
      </div>
      
      {/* Bottom Status Bar - Minimal */}
      <div className="h-8 border-t border-zinc-800/20 bg-black text-zinc-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6 text-[12px] font-mono uppercase tracking-[0.2em] font-medium">
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500/50 rounded-full"></span>
                Status: Operational
              </span>
          </div>
          <div className="text-[12px] font-mono uppercase tracking-[0.3em] font-medium italic opacity-30">
              LNT.OS_MESH
          </div>
      </div>
    </div>
  );
};

