import React, { useState } from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { Target, Radio, Globe, Search, Hash } from 'lucide-react';
import { TickerView } from './TickerView';
import { AutoScoutView } from './AutoScoutView';
import { TargetedSearchView } from './TargetedSearchView';

export const NewsTerminal: React.FC = () => {
  const { 
    step,
    globalDirective, setGlobalDirective
  } = useNewsroom();

  const [ingestionMode, setIngestionMode] = useState<'TICKER' | 'RESEARCH' | 'SPECIFIC'>('TICKER');

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-300 font-mono overflow-hidden">
      {/* LEFT RAIL: STRATEGIC DIRECTIVE */}
      <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Strategic Directive</h3>
          </div>
          <textarea 
            value={globalDirective}
            onChange={(e) => setGlobalDirective(e.target.value)}
            placeholder="e.g. 'Focus on the aesthetic implications of AI', 'Adopt a highly skeptical tone'"
            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
          />
          <p className="mt-2 text-[10px] text-zinc-600">
            This directive guides all agents in the News Terminal.
          </p>
        </div>
      </div>

      {/* CENTER: CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/30">
        
        {/* TOP BAR: SIGNAL SOURCE TABS */}
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/50 shrink-0 backdrop-blur-sm gap-6">
          <div className="flex items-center gap-2 mr-6">
             <Hash className="w-4 h-4 text-emerald-500" />
             <span className="font-bold text-sm text-white tracking-tight uppercase">SIGNAL SOURCE</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50">
            <button 
              onClick={() => setIngestionMode('TICKER')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${ingestionMode === 'TICKER' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Radio className="w-3 h-3" />
              <span>THE TICKER</span>
            </button>

            <button 
              onClick={() => setIngestionMode('RESEARCH')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${ingestionMode === 'RESEARCH' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Globe className="w-3 h-3" />
              <span>AUTO-SCOUT</span>
            </button>

            <button 
              onClick={() => setIngestionMode('SPECIFIC')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${ingestionMode === 'SPECIFIC' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Search className="w-3 h-3" />
              <span>TARGETED SEARCH</span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold tracking-widest uppercase text-zinc-400">
            <div className={`w-1.5 h-1.5 rounded-full ${step === 'NEWS_TERMINAL' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {step === 'NEWS_TERMINAL' ? "SCANNING" : "STANDBY"}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 relative overflow-hidden">
          {/* Grid Background Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
          
          <div className="relative z-10 h-full overflow-y-auto custom-scrollbar p-8">
            {ingestionMode === 'TICKER' && <TickerView />}
            {ingestionMode === 'RESEARCH' && <AutoScoutView />}
            {ingestionMode === 'SPECIFIC' && <TargetedSearchView />}
          </div>
        </div>
      </div>
    </div>
  );
};
