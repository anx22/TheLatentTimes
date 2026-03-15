import React from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { Search, Terminal, RefreshCw, Loader2 } from 'lucide-react';

export const TargetedSearchView: React.FC = () => {
  const { 
    topic, setTopic, context, setContext, 
    isResearching, researchTopic
  } = useNewsroom();

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center gap-2 py-2 px-4 border-b border-zinc-800 shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
          <Search className="w-3 h-3 text-zinc-600" />
          <input 
            type="text" 
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setContext('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && topic.trim()) {
                researchTopic(topic);
              }
            }}
            placeholder="Target specific topic..."
            className="flex-1 bg-transparent border-none text-[10px] text-white focus:outline-none placeholder-zinc-700"
          />
        </div>
        <button
          onClick={() => researchTopic(topic)}
          disabled={!topic.trim() || isResearching}
          className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded font-bold hover:bg-zinc-700 transition-colors border border-zinc-700 disabled:opacity-50 text-[10px] flex items-center gap-2"
        >
          {isResearching ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Search className="w-2.5 h-2.5" />}
          <span>SEARCH</span>
        </button>
      </div>

      {/* RESEARCH BRIEFING (GROUNDING) */}
      <div className="flex-1 overflow-y-auto p-4">
        {topic && (
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-emerald-500" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Intelligence Briefing</h4>
              </div>
            </div>

            {isResearching ? (
              <div className="space-y-2 py-2">
                <div className="h-1.5 bg-zinc-900 rounded w-full animate-pulse" />
                <div className="h-1.5 bg-zinc-900 rounded w-5/6 animate-pulse" />
                <div className="h-1.5 bg-zinc-900 rounded w-4/6 animate-pulse" />
              </div>
            ) : context ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {context}
                </p>
                <div className="flex items-center gap-4 pt-2 border-t border-zinc-900">
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${context.includes('speculative') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">
                        {context.includes('speculative') ? 'Unverified' : 'Verified Signal'}
                      </span>
                   </div>
                   <button 
                     onClick={() => researchTopic(topic)}
                     className="text-[9px] text-zinc-600 hover:text-zinc-400 flex items-center gap-1"
                   >
                     <RefreshCw className="w-2 h-2" />
                     RE-SCAN
                   </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-zinc-900 rounded">
                <p className="text-[10px] text-zinc-600 italic">No briefing available. Run search to verify signal.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
