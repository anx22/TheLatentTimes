import React, { useContext } from 'react';
import { X, Radio, MessageSquare, Image, Printer, Terminal, Activity, ShieldAlert } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { TheWire } from './TheWire';
import { TheBullpen } from './TheBullpen';
import { TheDarkroom } from './TheDarkroom';
import { PrintingPress } from './printing-press/PrintingPress';
import { ObservabilityDashboard } from './ObservabilityDashboard';
import { NewsroomButton, NewsroomLabel, NewsroomPanel, ClusterCard, EmptyState } from './NewsroomUI';
import { NewsroomAuthBar } from './NewsroomAuthBar';
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
          <div className="flex-1 flex items-center justify-center bg-paper p-12">
            <EmptyState
              icon={Terminal}
              title="The floor is quiet"
              hint="Open the Wire to start ingesting signals for the next issue."
              action={
                <NewsroomButton variant="primary" onClick={() => setStep('NEWS_TERMINAL')}>
                  Enter the Wire
                </NewsroomButton>
              }
            />
          </div>
        );
    }
  };

  // Per-room sub-navbar kicker (editorial restraint: single crimson accent).
  const roomMeta: Record<string, { kicker: string; tag: string }> = {
    NEWS_TERMINAL: { kicker: 'Global Workflow Engine', tag: '' },
    EDITORIAL_BOARD: { kicker: 'The Bullpen', tag: 'Active Debate Session' },
    DARKROOM: { kicker: 'The Darkroom', tag: 'Visual Atelier' },
    PRINTING_PRESS: { kicker: 'The Printing Press', tag: 'Publishing Pipeline' },
  };

  return (
    <div className="fixed inset-0 z-[150] bg-paper flex flex-col animate-fade-in text-ink font-sans selection:bg-crimson selection:text-paper">
      {/* Dynamic Pipeline Exception Banner */}
      {error && (
        <div role="alert" className="absolute top-16 right-8 z-[200] max-w-sm bg-paper border border-crimson/50 p-4 text-xs text-ink shadow-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldAlert className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-semibold uppercase tracking-[0.18em] text-crimson text-[11px]">Pipeline Exception</div>
            <p className="leading-relaxed text-ink-soft font-sans">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="text-crimson hover:text-ink transition-colors uppercase font-bold text-[9px] border border-crimson/30 px-1.5 py-0.5"
          >
            Clear
          </button>
        </div>
      )}

      {/* Masthead — Command Header */}
      <div className="h-16 border-b border-hairline flex items-center justify-between px-8 shrink-0 bg-paper z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[22px] text-ink leading-none">The Latent Times</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-ink-faint hidden sm:inline">Newsroom</span>
          </div>

          {/* Super Switch for Autonomy */}
          <div className="hidden md:flex items-center gap-3 border-l border-hairline pl-6 py-1">
            <span className="font-mono text-[9px] tracking-[0.2em] text-ink-faint uppercase">Engine Autonomy</span>
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
              <div className="w-8 h-[18px] bg-hairline peer-focus-visible:ring-2 peer-focus-visible:ring-crimson/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-paper after:border after:border-ink-faint after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-crimson peer-checked:after:border-paper"></div>
            </label>
            <span className={cn(
              "font-mono text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-200",
              context.activeMethodology === 'autonomous' ? "text-crimson" : "text-ink-faint"
            )}>
              {context.activeMethodology === 'autonomous' ? "RUNNING" : "STANDBY"}
            </span>
          </div>
        </div>

        <nav aria-label="Newsroom sections" className="flex items-center gap-1 overflow-hidden px-4">
           {[
             { id: 'NEWS_TERMINAL', name: 'TERMINAL', icon: Radio },
             { id: 'OBSERVABILITY', name: 'OBSERVE', icon: Activity },
             { id: 'EDITORIAL_BOARD', name: 'EDITORIAL', icon: MessageSquare },
             { id: 'DARKROOM', name: 'VISUAL', icon: Image },
             { id: 'PRINTING_PRESS', name: 'PUBLISH', icon: Printer },
           ].map((dept) => {
             const active = step === dept.id;
             return (
             <button
               key={dept.id}
               onClick={() => setStep(dept.id as any)}
               aria-current={active ? 'page' : undefined}
               aria-label={dept.name}
               className={cn(
                 "flex items-center gap-2.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all relative group shrink-0 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40",
                 active ? 'text-ink border-crimson' : 'text-ink-faint border-transparent hover:text-ink'
               )}
             >
               <dept.icon className={cn("w-3.5 h-3.5", active ? 'text-crimson' : 'text-ink-faint group-hover:text-ink')} />
               <span className="hidden xl:inline">{dept.name}</span>
             </button>
             );
           })}
        </nav>

           <div className="ml-4 flex items-center gap-3">
             <NewsroomAuthBar />
             <button
               onClick={onClose}
               aria-label="Close newsroom"
               className="text-ink-faint hover:text-ink transition-all p-1.5 hover:rotate-90 duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40"
             >
               <X className="w-5 h-5" />
             </button>
           </div>
      </div>

      {/* Sub-navbar */}
      <div className="h-12 border-b border-hairline bg-paper-warm flex items-center px-8 shrink-0 z-40 relative">
        {roomMeta[step] && (
          <div className="absolute left-8 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint whitespace-nowrap">{roomMeta[step].kicker}</span>
          </div>
        )}
        {step === 'NEWS_TERMINAL' && (
          <div className="flex-1 flex justify-center gap-2">
            {(['three-zone', 'autonomous', 'chronological'] as any[]).map((method) => (
                <button
                    key={method}
                    onClick={() => context.setActiveMethodology(method)}
                    aria-pressed={context.activeMethodology === method}
                    className={cn(
                        "px-6 py-2 text-[11px] font-mono uppercase tracking-[0.15em] transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40",
                        context.activeMethodology === method
                            ? "bg-ink text-paper border-ink font-bold"
                            : "bg-paper text-ink-soft border-hairline hover:text-ink hover:border-ink/40"
                    )}
                >
                    {method.replace('-', ' ')}
                </button>
            ))}
          </div>
        )}
        {step !== 'NEWS_TERMINAL' && roomMeta[step]?.tag && (
          <div className="flex-1 flex justify-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-crimson bg-crimson/[0.06] px-4 py-1.5 border border-crimson/20">{roomMeta[step].tag}</span>
          </div>
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
          <div className="p-4 bg-paper-warm shrink-0 overflow-y-auto max-h-[60%] border-b border-hairline">
              <div className="mt-2">
                <NewsroomLabel type="header" className="mb-3 block">Related Topics</NewsroomLabel>
                <div className="space-y-2">
                  {context.newsClusters.slice(0, 3).map((cluster) => (
                    <ClusterCard
                      key={cluster._id}
                      cluster={cluster}
                      onSelect={(t) => context.setTopic(t)}
                      className="p-3"
                    />
                  ))}
                  {context.newsClusters.length === 0 && (
                    <NewsroomLabel type="key" className="block">No active clusters</NewsroomLabel>
                  )}
               </div>
             </div>
          </div>

          <div className="p-4 border-b border-hairline flex items-center justify-between bg-paper-dim shrink-0">
            <NewsroomLabel type="header" className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-signal" />
              Operational Log
            </NewsroomLabel>
            <button
              onClick={() => context.clearLogs()}
              className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-faint hover:text-crimson transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 font-mono">
            {logs.slice().sort((a,b) => b.timestamp - a.timestamp).map((log, i) => (
              <div key={log._id || i} className="group space-y-1.5 animate-in slide-in-from-right-2 duration-300">
                <div className="flex justify-between items-center text-[11px]">
                  <span className={cn(
                    "font-bold uppercase tracking-[0.15em]",
                    log.agentName === 'SYSTEM' ? 'text-crimson' : 'text-signal'
                  )}>
                    [{log.agentName}]
                  </span>
                  <span className="text-ink-faint">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="text-[12px] leading-relaxed text-ink-soft group-hover:text-ink transition-colors border-l border-hairline pl-4 py-0.5">
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

      {/* Bottom Status Bar */}
      <div className="h-8 border-t border-hairline bg-paper-dim text-ink-faint flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6 text-[11px] font-mono uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-signal rounded-full"></span>
                Status: Operational
              </span>
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.3em] italic text-ink-faint/60">
              The Latent Times
          </div>
      </div>
    </div>
  );
};
