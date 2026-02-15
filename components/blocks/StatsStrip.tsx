
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const StatsStrip: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ config, content }) => {
  const metrics = content.meta.metrics || { signals_ingested: 0, avg_confidence: 0 };
  const isDark = config.variant === 'M';

  const containerClass = isDark 
    ? "bg-black text-white border-white/20" 
    : "bg-neutral-50 text-black border-black";
    
  const borderClass = isDark ? "border-zinc-800" : "border-neutral-200";
  const labelClass = isDark ? "text-zinc-500" : "text-neutral-400";

  return (
    <div className={`w-full border-y py-4 grid grid-cols-2 md:grid-cols-4 gap-4 ${containerClass}`}>
        <div className={`text-center border-r last:border-0 ${borderClass}`}>
            <span className={`block text-[9px] font-sans font-bold uppercase tracking-widest mb-1 ${labelClass}`}>Signals Ingested</span>
            <span className="font-mono text-xl">{metrics.signals_ingested}</span>
        </div>
        <div className={`text-center border-r last:border-0 ${borderClass}`}>
            <span className={`block text-[9px] font-sans font-bold uppercase tracking-widest mb-1 ${labelClass}`}>Avg. Confidence</span>
            <span className="font-mono text-xl">{metrics.avg_confidence}%</span>
        </div>
        <div className={`text-center border-r last:border-0 ${borderClass}`}>
            <span className={`block text-[9px] font-sans font-bold uppercase tracking-widest mb-1 ${labelClass}`}>System Status</span>
            <span className="font-mono text-xl text-accent animate-pulse">LIVE</span>
        </div>
        <div className="text-center">
            <span className={`block text-[9px] font-sans font-bold uppercase tracking-widest mb-1 ${labelClass}`}>Grid Mode</span>
            <span className="font-mono text-xl">12-COL</span>
        </div>
    </div>
  );
};
