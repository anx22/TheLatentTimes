import React, { useContext } from 'react';
import { X, Radio, MessageSquare, Image, Printer, Terminal, Activity, ShieldAlert } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { TheWire } from './TheWire';
import { TheBullpen } from './TheBullpen';
import { TheDarkroom } from './TheDarkroom';
import { PrintingPress } from './printing-press/PrintingPress';
import { ObservabilityDashboard } from './ObservabilityDashboard';
import { NewsroomButton, NewsroomLabel, NewsroomPanel, ClusterCard } from './NewsroomUI';
import { cn } from '../../lib/utils';

interface NewsroomFloorProps {
  onClose: () => void;
}

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onClose }) => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { step, setStep, logs, error, setError } = context;

  const renderActiveDepartment = () => {
    switch (step) {
      case 'NEWS_TERMINAL':
        return <TheWire />;
      case 'OBSERVABILITY':
        return <ObservabilityDashboard />;
      case 'EDITORIAL_BOARD':
        return <TheBullpen />;
      case 'DARKROOM':
        return <TheDarkroom />;
      case 'PRINTING_PRESS':
      case 'PUBLISHED':
        return <PrintingPress onClose={onClose} />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
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
      {/* Dynamic Pipeline Exception Banner */}
      {error && (
        <div className="absolute top-16 right-8 z-[200] max-w-sm bg-red-950/90 border border-red-500/50 p-4 text-xs font-mono text-red-200 shadow-2xl backdrop-blur-md flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-bold uppercase tracking-wider text-red-400">Pipeline Exception</div>
            <p className="leading-relaxed opacity-95">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white transition-colors uppercase font-bold text-[9px] border border-red-500/25 px-1.5 py-0.5"
          >
            Clear
          </button>
        </div>
      )}

      {/* Top Bar - Tactical Command Header */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-8 shrink-0 bg-zinc-950 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="font-mono text-[14px] uppercase tracking-[0.4em] font-black">
              LNT.Newsroom <span className="text-zinc-700 ml-1">v2.5</span>
            </span>
          </div>

          {/* Super Switch for Autonomy */}
          <div className="hidden md:flex items-center gap-3 border-l border-zinc-800 pl-6 py-1">
            <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-black">Engine Autonomy</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={context.activeMethodology === 'autonomous'}
                onChange={(e) => {
                  const checkVal = e.target.checked;
                  context.setActiveMethodology(checkVal ? 'autonomous' : 'three-zone');
                  context.logMessage('SYSTEM', `Global Autonomy Switch toggled ${checkVal ? 'ON' : 'OFF'}. Automatic pipeline is ${checkVal ? 'ENABLED' : 'DISABLED'}.`, 'info');
                }}
                className="sr-only peer" 
              />
              <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-black after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#ccff00]"></div>
            </label>
            <span className={cn(
              "font-mono text-[9px] font-black uppercase tracking-widest transition-colors duration-200",
              context.activeMethodology === 'autonomous' ? "text-[#ccff00]" : "text-zinc-600"
            )}>
              {context.activeMethodology === 'autonomous' ? "RUNNING" : "STANDBY"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-hidden px-4">
           {[
             { id: 'NEWS_TERMINAL', name: 'TERMINAL', icon: Radio },
             { id: 'OBSERVABILITY', name: 'OBSERVE', icon: Activity },
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

      {/* Sub-navbar */}
      <div className="h-12 border-b border-zinc-600 bg-zinc-900 flex items-center px-8 shrink-0 z-40 relative">
        {step === 'NEWS_TERMINAL' && (
          <>
            <div className="absolute left-8 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-500/70 font-medium whitespace-nowrap">Global Workflow Engine</span>
            </div>
            <div className="flex-1 flex justify-center gap-2">
              {(['three-zone', 'autonomous', 'chronological'] as any[]).map((method) => (
                  <button
                      key={method}
                      onClick={() => context.setActiveMethodology(method)}
                      className={cn(
                          "px-6 py-2.5 text-[11px] font-mono uppercase tracking-widest transition-all border",
                          context.activeMethodology === method 
                              ? "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/50 font-bold" 
                              : "bg-zinc-900 text-zinc-400 border-zinc-600 hover:text-zinc-200 hover:border-zinc-700 font-medium"
                      )}
                  >
                      {method.replace('-', ' ')}
                  </button>
              ))}
            </div>
          </>
        )}
        {step === 'EDITORIAL_BOARD' && (
          <>
            <div className="absolute left-8 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ccff00]/70 font-medium whitespace-nowrap">Board Directive</span>
            </div>
            <div className="flex-1 flex justify-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#ccff00] bg-[#ccff00]/10 px-4 py-1.5 border border-[#ccff00]/20">Active Debate Session</span>
            </div>
          </>
        )}
        {step === 'DARKROOM' && (
          <>
            <div className="absolute left-8 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-500/70 font-medium whitespace-nowrap">Visual Atelier</span>
            </div>
            <div className="flex-1 flex justify-center gap-2">
               <span className="text-[11px] font-mono uppercase tracking-widest text-purple-500 bg-purple-500/10 px-4 py-1.5 border border-purple-500/20">Studio Operations</span>
            </div>
          </>
        )}
        {step === 'PRINTING_PRESS' && (
          <>
            <div className="absolute left-8 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-orange-500/70 font-medium whitespace-nowrap">Editorial Press</span>
            </div>
            <div className="flex-1 flex justify-center gap-2">
               <span className="text-[11px] font-mono uppercase tracking-widest text-orange-500 bg-orange-500/10 px-4 py-1.5 border border-orange-500/20">Publishing Pipeline</span>
            </div>
          </>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Department Content */}
        <NewsroomPanel className="flex-1">
          {renderActiveDepartment()}
        </NewsroomPanel>

        {/* Right Sidebar: Operational Terminal */}
        <NewsroomPanel side="right" width="w-80" className="hidden lg:flex">
          <div className="p-4 bg-emerald-500/5 shrink-0 overflow-y-auto max-h-[60%]">
              <div className="mt-2">
                <NewsroomLabel type="header" className="text-[12px] mb-3 block">Related Topics</NewsroomLabel>
                <div className="space-y-2">
                  {context.newsClusters.slice(0, 3).map((cluster) => (
                    <ClusterCard 
                      key={cluster._id} 
                      cluster={cluster} 
                      onSelect={(t) => context.setTopic(t)}
                      className="p-3 bg-zinc-800 border-zinc-600"
                    />
                  ))}
               </div>
             </div>
          </div>

          <div className="p-4 border-b border-zinc-700 flex items-center justify-between bg-zinc-800 shrink-0">
            <NewsroomLabel type="header" className="flex items-center gap-2 text-[14px]">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Operational Log [Newest First]
            </NewsroomLabel>
            <button 
              onClick={() => context.clearLogs()}
              className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 font-mono">
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
                <div className="text-[14px] leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors border-l border-zinc-700 pl-4 py-1">
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
      <div className="h-8 border-t border-zinc-600 bg-black text-zinc-800 flex items-center justify-between px-8 shrink-0">
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

