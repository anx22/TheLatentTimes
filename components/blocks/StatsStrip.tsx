
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const StatsStrip: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ content }) => {
  const metrics = content.meta.metrics || { signals_ingested: 0, avg_confidence: 0 };

  return (
    <div className="w-full border-y border-black py-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50">
        <div className="text-center border-r border-neutral-200 last:border-0">
            <span className="block text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1">Signals Ingested</span>
            <span className="font-mono text-xl">{metrics.signals_ingested}</span>
        </div>
        <div className="text-center border-r border-neutral-200 last:border-0">
            <span className="block text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1">Avg. Confidence</span>
            <span className="font-mono text-xl">{metrics.avg_confidence}%</span>
        </div>
        <div className="text-center border-r border-neutral-200 last:border-0">
            <span className="block text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1">System Status</span>
            <span className="font-mono text-xl text-accent animate-pulse">LIVE</span>
        </div>
        <div className="text-center">
            <span className="block text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1">Grid Mode</span>
            <span className="font-mono text-xl">12-COL</span>
        </div>
    </div>
  );
};
