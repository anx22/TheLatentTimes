
import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { RefreshCw, Activity, Loader2, Sparkles, Search, Terminal, ArrowRight } from 'lucide-react';

export const TheWire: React.FC = () => {
  const { 
    topic, setTopic, context, setContext, isResearching, researchTopic, 
    tickerItems, isFetchingTicker, fetchTickerData,
    scoutTopic, scoutedTopics, step, runDebate, draft
  } = useNewsroom();

  const [ingestionMode, setIngestionMode] = useState<'TICKER' | 'RESEARCH' | 'SPECIFIC'>('TICKER');

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      <div className="flex border-b border-zinc-800 text-xs mb-6">
        <button onClick={() => setIngestionMode('TICKER')} className={`px-6 py-3 transition-colors ${ingestionMode === 'TICKER' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>THE TICKER</button>
        <button onClick={() => setIngestionMode('RESEARCH')} className={`px-6 py-3 transition-colors ${ingestionMode === 'RESEARCH' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>AUTO-SCOUT</button>
        <button onClick={() => setIngestionMode('SPECIFIC')} className={`px-6 py-3 transition-colors ${ingestionMode === 'SPECIFIC' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>TARGETED SEARCH</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ingestionMode === 'TICKER' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-zinc-500">Zero-token passive aggregation.</p>
              <button 
                onClick={fetchTickerData} 
                disabled={isFetchingTicker}
                className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingTicker ? 'animate-spin' : ''}`} />
                POLL SOURCES
              </button>
            </div>
            {tickerItems.length === 0 && !isFetchingTicker && (
              <div className="text-center py-12 text-zinc-500">
                No signals found. Adjust your noise filter or enable more sources.
              </div>
            )}
            <div className="space-y-3">
              {tickerItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setTopic(item.text);
                    setContext('');
                  }}
                  className={`p-4 border rounded cursor-pointer transition-colors group ${topic === item.text ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{item.source}</span>
                    <span className="text-[10px] text-zinc-600">{item.timestamp}</span>
                  </div>
                  <p className="text-base text-zinc-300 group-hover:text-white">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {ingestionMode === 'RESEARCH' && (
          <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 border-b border-zinc-800">
              <Activity className="w-12 h-12 text-zinc-700" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Deploy The Scout</h3>
                <p className="text-sm text-zinc-500 max-w-md">Command the Scout agent to scan the global network for emerging trends in technology, AI models, and code.</p>
              </div>
              <button 
                onClick={scoutTopic}
                disabled={step === 'SCOUTING'}
                className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-6 py-3 rounded font-bold hover:bg-zinc-700 transition-colors border border-zinc-700 disabled:opacity-50"
              >
                {step === 'SCOUTING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                <span>{step === 'SCOUTING' ? 'SCANNING THE WIRE...' : 'INITIATE SCOUT'}</span>
              </button>
            </div>

            {scoutedTopics.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scouted Signal Vectors</h4>
                <div className="grid grid-cols-1 gap-3">
                  {scoutedTopics.map((t, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setTopic(t);
                        setContext('');
                      }}
                      className={`p-4 text-left border rounded transition-all group ${topic === t ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-800">0{i+1}</div>
                        <p className="text-sm text-zinc-300 group-hover:text-white">{t}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {ingestionMode === 'SPECIFIC' && (
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
        )}

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
