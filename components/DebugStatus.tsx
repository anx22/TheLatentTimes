import React, { useState } from 'react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

export const DebugStatus: React.FC = () => {
  const { step, topic, logs, runIntegrityDrill } = useNewsroom();
  const [drillResults, setDrillResults] = useState<any[] | null>(null);
  const [isDrilling, setIsDrilling] = useState(false);

  const startDrill = async () => {
    setIsDrilling(true);
    try {
      const results = await runIntegrityDrill();
      setDrillResults(results);
      setTimeout(() => setDrillResults(null), 10000); // Clear after 10s
    } catch (e) {
      console.error("Drill failed", e);
    } finally {
      setIsDrilling(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-3 pointer-events-auto">
      {drillResults && (
        <div className="bg-white border border-black p-4 shadow-xl animate-in slide-in-from-left-4 duration-300">
           <div className="text-[10px] font-mono font-bold uppercase mb-3 flex items-center gap-2">
             <ShieldCheck className="w-3 h-3" /> System Integrity Report
           </div>
           <div className="space-y-2">
             {drillResults.map((r, i) => (
               <div key={i} className="flex flex-col gap-1 border-l-2 border-black pl-3 py-1">
                 <div className="flex items-center justify-between gap-4">
                   <span className="text-[9px] font-mono font-bold uppercase">{r.module}</span>
                   <span className={`text-[8px] font-mono uppercase ${r.status === 'passed' ? 'text-emerald-600' : 'text-red-500'}`}>
                     [{r.status}]
                   </span>
                 </div>
                 <div className="text-[8px] font-mono text-zinc-500 leading-tight truncate max-w-[200px]">
                   {r.message}
                 </div>
                 <div className="text-[7px] font-mono text-zinc-300 uppercase">Latency: {r.latency}ms</div>
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="bg-black/90 backdrop-blur-md border border-zinc-800 p-4 rounded-sm shadow-2xl space-y-4 min-w-[240px]">
        <div className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <Cpu className="w-3 h-3 text-zinc-500" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sys.Status.V2</span>
           </div>
           <div className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
             <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Online</span>
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Active Step</div>
            <div className="text-[10px] font-mono text-zinc-200 uppercase tracking-widest truncate">{step}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Logic Drill</div>
            <button 
              onClick={startDrill}
              disabled={isDrilling}
              className="flex items-center gap-2 text-[9px] font-mono text-zinc-400 hover:text-white uppercase transition-colors disabled:opacity-50"
            >
              {isDrilling ? <Activity className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              {isDrilling ? 'Running...' : 'Run Drill'}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Current Vector</div>
          <div className="text-[10px] font-mono text-zinc-200 uppercase tracking-widest truncate">{topic || 'Idle'}</div>
        </div>

        {logs.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-zinc-800">
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Last Pulse</div>
                <div className="text-[9px] font-mono text-emerald-500/70 truncate">{logs[logs.length-1].message}</div>
            </div>
        )}
      </div>
    </div>
  );
};
