import React, { useState } from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { Target, Radio, Globe, Search } from 'lucide-react';
import { TickerView } from './TickerView';
import { AutoScoutView } from './AutoScoutView';
import { TargetedSearchView } from './TargetedSearchView';
import { Dossier } from '../Dossier';

export const TheWire: React.FC = () => {
  const { 
    topic, step,
    globalDirective, setGlobalDirective
  } = useNewsroom();

  const [ingestionMode, setIngestionMode] = useState<'TICKER' | 'RESEARCH' | 'SPECIFIC'>('TICKER');

  return (
    <div className="flex-1 flex gap-6 p-6 h-full overflow-hidden">
      {/* LEFT RAIL: SIGNAL CONTROLS */}
      <div className="w-80 shrink-0 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-20">
        
        {/* Strategic Directive */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Strategic Directive</h3>
          </div>
          <textarea 
            value={globalDirective}
            onChange={(e) => setGlobalDirective(e.target.value)}
            placeholder="e.g. 'Focus on the aesthetic implications of AI', 'Adopt a highly skeptical tone'"
            className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Ingestion Mode Selection */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-2 shadow-lg flex flex-col gap-1">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 py-2">Signal Source</h3>
          
          <button 
            onClick={() => setIngestionMode('TICKER')}
            className={`flex items-center gap-3 px-3 py-3 rounded text-left transition-all ${ingestionMode === 'TICKER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'}`}
          >
            <Radio className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">THE TICKER</span>
          </button>

          <button 
            onClick={() => setIngestionMode('RESEARCH')}
            className={`flex items-center gap-3 px-3 py-3 rounded text-left transition-all ${ingestionMode === 'RESEARCH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'}`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">AUTO-SCOUT</span>
          </button>

          <button 
            onClick={() => setIngestionMode('SPECIFIC')}
            className={`flex items-center gap-3 px-3 py-3 rounded text-left transition-all ${ingestionMode === 'SPECIFIC' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'}`}
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">TARGETED SEARCH</span>
          </button>
        </div>

        {/* Active Signal Indicator */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4 shadow-lg mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${topic ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Signal</span>
          </div>
          <p className={`text-sm font-bold leading-snug ${topic ? 'text-white' : 'text-zinc-600 italic'}`}>
            {topic || 'No signal locked.'}
          </p>
        </div>
      </div>

      {/* CENTER: THE DOSSIER (Content) */}
      <div className="flex-1 h-full overflow-hidden">
        <Dossier 
          title={ingestionMode === 'TICKER' ? "LIVE WIRE FEED" : (ingestionMode === 'RESEARCH' ? "SCOUT REPORT" : "SEARCH RESULTS")}
          status={step === 'NEWS_TERMINAL' ? "SCANNING" : "STANDBY"} 
          classification="UNCLASSIFIED"
        >
          <div className="h-full overflow-y-auto custom-scrollbar pr-2">
            {ingestionMode === 'TICKER' && <TickerView />}
            {ingestionMode === 'RESEARCH' && <AutoScoutView />}
            {ingestionMode === 'SPECIFIC' && <TargetedSearchView />}
          </div>
        </Dossier>
      </div>
    </div>
  );
};
