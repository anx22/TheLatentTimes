import React from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { Search, Terminal, RefreshCw } from 'lucide-react';

export const TargetedSearchView: React.FC = () => {
  const { 
    topic, setTopic, context, setContext, 
    isResearching, researchTopic
  } = useNewsroom();

  return (
    <>
      <div className="max-w-xl mx-auto mt-12 space-y-6">
        <div className="space-y-2 text-center">
          <Search className="w-8 h-8 text-zinc-700 mx-auto" />
          <h3 className="text-lg font-bold text-white">Targeted Signal</h3>
          <p className="text-sm text-zinc-500">Manually inject a topic into the editorial pipeline.</p>
        </div>
        <input 
          type="text" 
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setContext('');
          }}
          placeholder="e.g. Synthetic Biology..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-4 text-lg focus:outline-none focus:border-emerald-500 transition-colors text-center"
        />
      </div>

      {/* RESEARCH BRIEFING (GROUNDING) */}
      {topic && (
        <div className="mt-12 p-6 bg-zinc-950 border border-zinc-800 rounded-lg animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Research Briefing</h4>
            </div>
            {!context && !isResearching && (
              <button 
                onClick={() => researchTopic(topic)}
                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                INITIATE DEEP-DIVE
              </button>
            )}
          </div>

          {isResearching ? (
            <div className="space-y-3 py-4">
              <div className="h-2 bg-zinc-900 rounded w-full animate-pulse" />
              <div className="h-2 bg-zinc-900 rounded w-5/6 animate-pulse" />
              <div className="h-2 bg-zinc-900 rounded w-4/6 animate-pulse" />
            </div>
          ) : context ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                {context}
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-zinc-900">
                 <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${context.includes('speculative') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                      {context.includes('speculative') ? 'Unverified / Speculative' : 'Grounded Signal'}
                    </span>
                 </div>
                 <button 
                   onClick={() => researchTopic(topic)}
                   className="text-[10px] text-zinc-600 hover:text-zinc-400 flex items-center gap-1"
                 >
                   <RefreshCw className="w-2.5 h-2.5" />
                   RE-SCAN
                 </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded">
              <p className="text-xs text-zinc-600">No briefing available. Run deep-dive to verify signal.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
