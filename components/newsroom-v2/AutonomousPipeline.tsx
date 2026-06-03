import React, { useContext, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Activity, Zap, Layers, PauseCircle, PlayCircle, Terminal, FileText, Cpu, Network, ShieldAlert } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { api } from '../../frontendApi';
import { cn } from '../../lib/utils';
import { SystemLog } from '../../types';

export const AutonomousPipeline: React.FC = () => {
  const context = useContext(NewsroomContext);
  // Real, persistent pause switch (U2): the circadian Convex cron reads this flag
  // and skips sweeps while paused. Was previously local-only state that paused
  // nothing.
  const autonomyControl = useQuery(api.newsroom.queries.getNewsroomStateByKey, { key: 'autonomy_control' });
  const setAutonomyPaused = useMutation(api.newsroom.mutations.setAutonomyPaused);
  const enginePaused = !!(autonomyControl as any)?.paused;
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Pipeline status tracking
  const [activeStage, setActiveStage] = useState<'IDLE' | 'INGEST' | 'DISCOVER' | 'DEBATE' | 'DRAFT'>('IDLE');
  
  useEffect(() => {
    if (!context) return;
    if (context.isIngesting) setActiveStage('INGEST');
    else if (context?.isResearching) setActiveStage('DISCOVER');
    else if (context.isDebating) setActiveStage('DEBATE');
    else if (context.isDrafting) setActiveStage('DRAFT');
    else setActiveStage('IDLE');
  }, [context?.isIngesting, context?.isResearching, context?.isDebating, context?.isDrafting]);

  useEffect(() => {
     if (logEndRef.current) {
         logEndRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [context?.logs]);

  // The Autonomous Engine Heartbeat
  const params = useContext(NewsroomContext)?.engineSchedule;
  const lastTriggeredSlot = useRef<string | null>(null);

  // NOTE: The browser-side circadian heartbeat that used to re-run the FULL
  // ingest -> discover -> debate -> draft pipeline here has been removed. It
  // duplicated the canonical Convex cron (convex/crons.ts +
  // runScheduledAutonomousRun), doubling ingest/embedding/token cost whenever
  // an Ops tab was left open. Scheduling now lives exclusively server-side; the
  // manual "Force" buttons below remain for on-demand runs.
  // (lastTriggeredSlot / params retained intentionally to avoid wider churn.)
  void lastTriggeredSlot;
  void params;

  if (!context) return null;

  const { signals, drafts, isIngesting, logs = [] } = context;
  const recentSignals = (signals || []).slice(0, 12);
  const clusters = (context.newsClusters || []).slice(0, 8);
  const recentDrafts = (drafts || []).slice(0, 5);
  
  // Filter for debate/intelligent logs (excluding raw signal ingest noise for the boardroom)
  const boardroomLogs = logs.filter(l => l.agentName !== 'The Scout').slice(-50);
  const hasMandate = !!context.globalDirective;

  return (
    <div className="flex-1 bg-zinc-950 p-6 overflow-hidden flex flex-col h-full font-sans">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Autonomous Core Engine</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Self-Driving Editorial Operation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* FLOW MONITOR */}
          <div className="flex gap-1">
            {[
              { id: 'INGEST', label: 'In' },
              { id: 'DISCOVER', label: 'Ds' },
              { id: 'DEBATE', label: 'Db' },
              { id: 'DRAFT', label: 'Dr' }
            ].map(s => (
              <div 
                key={s.id} 
                className={cn(
                  "w-6 h-6 flex items-center justify-center text-[8px] font-mono font-bold border",
                  activeStage === s.id ? "bg-[#ccff00] border-[#ccff00] text-black animate-pulse" : "bg-black border-zinc-700 text-zinc-500"
                )}
                title={`Stage: ${s.id}`}
              >
                {s.label}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-600 bg-black">
             <div className={cn("w-2 h-2 rounded-full", enginePaused ? "bg-amber-500" : "bg-[#ccff00] animate-pulse")} />
             <span className={cn("text-[10px] font-mono uppercase tracking-widest font-bold", enginePaused ? "text-amber-500" : "text-[#ccff00]")}>
               {enginePaused ? 'Engine Paused' : 'Engine Running'}
             </span>
          </div>
          <button 
            onClick={() => setAutonomyPaused({ paused: !enginePaused })}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors"
          >
            {enginePaused ? <PlayCircle className="w-4 h-4 text-[#ccff00]" /> : <PauseCircle className="w-4 h-4 text-amber-500" />}
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest">{enginePaused ? 'Resume Core' : 'Interrupt Flow'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-4 min-h-0 overflow-hidden">
        
        {/* NETWORK INGESTOR (Left Column, Full Height) */}
        <div className="col-span-3 row-span-2 bg-zinc-900 border border-zinc-700 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
             <Network className="w-32 h-32" />
          </div>
          <div className="p-4 border-b border-zinc-700 bg-zinc-800 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Zap className={cn("w-3.5 h-3.5", isIngesting ? "text-emerald-500" : "text-zinc-600")} />
              1. Signal Subsystem
            </h2>
            {hasMandate && <ShieldAlert className="w-3 h-3 text-amber-500 animate-pulse" />}
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
             {recentSignals.map((sig, i) => (
               <div key={i} className="flex gap-3 items-start opacity-70 hover:opacity-100 transition-opacity">
                 <div className="text-[9px] font-mono text-zinc-600 mt-0.5 shrink-0">{new Date(Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</div>
                 <div>
                   <div className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest mb-0.5">{sig.sourceType || 'FEED'}</div>
                   <div className="text-xs text-white leading-snug font-medium line-clamp-3">{sig.title}</div>
                 </div>
               </div>
             ))}
             {recentSignals.length === 0 && <div className="text-xs font-mono text-zinc-600">Awaiting signals...</div>}
             <div className="pt-4 flex justify-center sticky bottom-0 bg-zinc-900">
               <button onClick={context.ingestSignals} disabled={context.isIngesting} className="text-[10px] uppercase font-mono tracking-widest text-[#ccff00] hover:bg-[#ccff00]/10 px-4 py-2 border border-[#ccff00]/20 transition-colors w-full disabled:opacity-50 mt-2 bg-zinc-900">
                 {context.isIngesting ? 'Scanning...' : 'Force Manual Scan'}
               </button>
             </div>
          </div>
        </div>

        {/* SEMANTIC MATRIX & CORE ORCHESTRATOR */}
        <div className="col-span-6 row-span-1 border border-zinc-700 bg-zinc-900 flex flex-col">
          <div className="p-4 border-b border-zinc-700 bg-zinc-800 flex items-center justify-between">
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              2. Semantic Clustering Matrix
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={async () => {
                   context.logMessage('SYSTEM', 'Manual clustering initiated...', 'action');
                   const discoveryResult = await context.runDeepDiscovery();
                   if (discoveryResult && discoveryResult.newStories > 0 && discoveryResult.newStoryIds.length > 0) {
                     const targetId = discoveryResult.newStoryIds[0];
                     const story = (context.newsClusters || []).find(c => c._id === targetId);
                     if (story) {
                       context.logMessage('SYSTEM', `Resonance detected: ${story.title}. Initializing pipeline...`, 'success');
                       context.setSelectedStoryId(targetId);
                       context.setTopic(story.title);
                       
                       // Small delay to ensure state updates
                       setTimeout(async () => {
                         context.logMessage('SYSTEM', `Initiating debate for: ${story.title}`, 'action');
                         await context.runDebate();
                         context.logMessage('SYSTEM', `Generating draft...`, 'action');
                         await context.runPipeline();
                         context.logMessage('SYSTEM', `Manual loop completed.`, 'success');
                       }, 2000);
                     }
                   }
                }} 
                disabled={context.isResearching}
                className="text-[9px] uppercase tracking-widest font-mono text-zinc-300 hover:text-[#ccff00] border border-zinc-600 px-2 py-1 transition-colors disabled:opacity-50"
              >
                {context.isResearching ? 'Clustering...' : 'Force Clustering'}
              </button>
              {hasMandate && <ShieldAlert className="w-3 h-3 text-amber-500" />}
              <div className="text-[9px] uppercase tracking-widest font-mono text-zinc-500">Auto-organizing active vectors</div>
            </div>
          </div>
          <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar">
             {clusters.length === 0 ? (
               <div className="col-span-full flex flex-col items-center justify-center text-center opacity-50 py-4 h-full border-2 border-dashed border-zinc-800">
                  <Activity className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Awaiting Semantic Crystallization</span>
                  <p className="text-[9px] text-zinc-600 mt-2 max-w-[200px]">Signal density insufficient for Narrative Pillar formation.</p>
                  <p className="text-[9px] text-zinc-600 mt-2">DEBUG: {signals.filter(s => !s.storyId).length} orphaned signals detected.</p>
                  <button 
                    onClick={context.runDeepDiscovery} 
                    disabled={context.isResearching}
                    className="text-[9px] uppercase tracking-widest font-mono text-zinc-300 hover:text-[#ccff00] border border-zinc-600 px-2 py-1 mt-4 transition-colors disabled:opacity-50"
                  >
                    {context.isResearching ? 'Clustering...' : 'Trigger Clustering Manualy'}
                  </button>
               </div>
             ) : (
               clusters.map((c, i) => (
                 <div 
                   key={i} 
                   onClick={() => {
                     context.setSelectedStoryId(c._id);
                     context.setTopic(c.title);
                     context.logMessage('SYSTEM', `Pillar selected: ${c.title}. Ready for editorial focus.`, 'info');
                   }}
                   className="border border-zinc-700 bg-black p-3 flex flex-col relative overflow-hidden group hover:border-[#ccff00]/30 transition-all cursor-pointer"
                 >
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00]/20 group-hover:bg-[#ccff00]/50 transition-all"></div>
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex gap-1.5 items-center">
                       <div className="text-[9px] uppercase tracking-widest font-mono text-[#ccff00] bg-[#ccff00]/5 px-1.5 py-0.5 border border-[#ccff00]/10">PILLAR {i+1}</div>
                       {c.summary?.includes('primary') && (
                         <div className="text-[8px] bg-blue-500/10 text-blue-400 px-1 border border-blue-500/20 font-mono">PRIMARY</div>
                       )}
                     </div>
                     <div className="text-[9px] font-mono text-zinc-500">{c.articleCount || '??'} NODES</div>
                   </div>
                   <div className="text-[12px] text-white font-bold mb-1 leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-[#ccff00] transition-colors">{c.title}</div>
                   <div className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed font-mono mb-2">{c.summary}</div>
                   
                   {/* Resonance indicators */}
                   <div className="mt-auto flex items-center gap-3 pt-2 border-t border-zinc-900">
                     <div className="flex flex-col">
                       <span className="text-[7px] text-zinc-600 uppercase font-mono">Resonance</span>
                       <div className="flex gap-0.5 mt-0.5">
                         {Array.from({ length: 5 }).map((_, idx) => (
                           <div
                             key={idx}
                             className={cn(
                               "w-1.5 h-1.5",
                               idx < ((c.articleCount || 1) > 5 ? 5 : (c.articleCount || 1)) ? "bg-[#ccff00]" : "bg-zinc-800"
                             )}
                           />
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* RESONANCE METRICS (Top Right) */}
        <div className="col-span-3 row-span-1 border border-zinc-700 bg-zinc-950 flex flex-col">
           <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Activity className="w-3.5 h-3.5 text-blue-500" />
               <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest">Resonance Metrics</h2>
             </div>
             {hasMandate && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
           </div>
           <div className="p-4 flex-1 space-y-4 font-mono">
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-zinc-600 uppercase tracking-widest">Signal Velocity</span>
               <span className="text-emerald-500">{signals.length > 0 ? (signals.length / 24).toFixed(1) : 0} p/h</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-zinc-600 uppercase tracking-widest">Cluster Density</span>
               <span className="text-blue-500">{clusters.length} Pillars</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-zinc-600 uppercase tracking-widest">Neural Accuracy</span>
               <span className="text-purple-500">92.4%</span>
             </div>
             <div className="pt-2 border-t border-zinc-800">
               <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Active Directive</div>
               <div className="text-[10px] text-zinc-400 italic">
                 {context.globalDirective ? `Mandate: ${context.globalDirective.slice(0, 40)}...` : 'None active (Autonomous)'}
               </div>
             </div>
           </div>
        </div>

        {/* AGENT DEBATE (Bottom Center, spans 5) */}
        <div className="col-span-5 row-span-1 border border-zinc-700 bg-zinc-900 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.05),transparent_70%)] pointer-events-none"></div>
          <div className="p-4 border-b border-zinc-700 bg-zinc-800 flex items-center justify-between relative z-10">
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-purple-500" />
              3. Agent Boardroom (Live Debate)
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => context.clearLogs()}
                className="text-[9px] uppercase tracking-widest font-mono text-zinc-500 hover:text-red-500 transition-colors"
              >
                Clear Logs
              </button>
              {hasMandate && <ShieldAlert className="w-3 h-3 text-amber-500" />}
            </div>
          </div>
          <div className="flex-1 p-4 bg-zinc-950 flex flex-col overflow-y-auto custom-scrollbar space-y-3 relative z-10">
             {boardroomLogs.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                   <Terminal className="w-8 h-8 text-zinc-700 mb-3" />
                   <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest text-center max-w-[200px] leading-relaxed">
                     Awaiting directives from Core...
                   </div>
                 </div>
             ) : (
                boardroomLogs.map((log) => (
                  <div key={log._id} className="text-[11px] font-mono leading-relaxed border-l-2 border-zinc-600 pl-3 py-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-bold uppercase tracking-widest",
                        log.agentName === 'The Board' ? 'text-purple-400' :
                        log.agentName === 'The Scout' ? 'text-blue-400' :
                        log.agentName === 'The Editor' ? 'text-orange-400' : 'text-zinc-400'
                      )}>[{log.agentName}]</span>
                      <span className="text-zinc-600 text-[9px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-zinc-300 break-words">{log.message}</div>
                  </div>
                ))
             )}
             <div ref={logEndRef} />
          </div>
        </div>

        {/* PUBLISHING QUEUE (Bottom Right, spans 4) */}
        <div className="col-span-4 row-span-1 border border-zinc-700 bg-zinc-900 flex flex-col relative">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
          <div className="p-4 border-b border-zinc-700 bg-zinc-800 flex items-center justify-between relative z-10">
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              4. Automated Press Queue
            </h2>
            {hasMandate && <ShieldAlert className="w-3 h-3 text-amber-500" />}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 relative z-10 custom-scrollbar">
            {recentDrafts.length === 0 ? (
               <div className="text-center pt-8 text-[11px] uppercase tracking-widest font-mono text-zinc-600">No autonomous drafts dispatched yet.</div>
            ) : (
               recentDrafts.map((d, i) => (
                 <div key={d._id} className="p-3 border border-zinc-600 bg-zinc-800 flex gap-3 items-center group cursor-pointer hover:border-orange-500/30 transition-colors">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-orange-500/10 flex items-center justify-center overflow-hidden">
                       <span className="text-[9px] font-mono font-bold text-orange-500">#{i+1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="text-xs text-white tracking-tight truncate group-hover:text-orange-400 transition-colors">{d.headline}</div>
                       <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest font-bold">Pending Review</div>
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
