
import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { ArrowRight, Target } from 'lucide-react';
import { TickerView } from './TickerView';
import { AutoScoutView } from './AutoScoutView';
import { TargetedSearchView } from './TargetedSearchView';

export const TheWire: React.FC = () => {
  const { 
    topic, step, runDebate, draft,
    globalDirective, setGlobalDirective
  } = useNewsroom();

  const [ingestionMode, setIngestionMode] = useState<'TICKER' | 'RESEARCH' | 'SPECIFIC'>('TICKER');

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Strategic Directive */}
      <div className="mb-6 bg-zinc-950 border border-emerald-500/30 rounded p-4 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Director's Strategic Directive</h3>
        </div>
        <input 
          type="text" 
          value={globalDirective}
          onChange={(e) => setGlobalDirective(e.target.value)}
          placeholder="e.g. 'Focus on the aesthetic implications of AI', 'Adopt a highly skeptical tone'"
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="flex border-b border-zinc-800 text-xs mb-6">
        <button onClick={() => setIngestionMode('TICKER')} className={`px-6 py-3 transition-colors ${ingestionMode === 'TICKER' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>THE TICKER</button>
        <button onClick={() => setIngestionMode('RESEARCH')} className={`px-6 py-3 transition-colors ${ingestionMode === 'RESEARCH' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>AUTO-SCOUT</button>
        <button onClick={() => setIngestionMode('SPECIFIC')} className={`px-6 py-3 transition-colors ${ingestionMode === 'SPECIFIC' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>TARGETED SEARCH</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ingestionMode === 'TICKER' && <TickerView />}
        {ingestionMode === 'RESEARCH' && <AutoScoutView />}
        {ingestionMode === 'SPECIFIC' && <TargetedSearchView />}
      </div>

      {/* ACTION BAR */}
      <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Active Signal:</span>
          <span className="text-sm font-bold text-emerald-400">{topic || 'NONE'}</span>
        </div>
        <button 
          onClick={runDebate}
          disabled={!topic.trim() || step === 'DEBATING' || step === 'WRITING' || step === 'VISUALIZING'}
          className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-6 py-2 rounded font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{draft ? 'START NEW STORY' : 'SEND TO BULLPEN'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
