import React, { useContext, useState } from 'react';
import { Search, Loader2, Globe, Rss, Github, AlertCircle, TrendingUp, Zap, Radio, Target, Sparkles, Filter } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';

export const TheWire: React.FC = () => {
  const context = useContext(NewsroomContext);
  const [localTopic, setLocalTopic] = useState('');

  if (!context) return null;

  const { 
    tickerItems, 
    newsClusters, 
    fetchTickerData, 
    isFetchingTicker,
    topic,
    setTopic,
    researchTopic,
    isResearching,
    globalDirective,
    setGlobalDirective,
    scoutTopic,
    isScouting,
    scoutedTopics,
    synthesizeCluster,
    setSelectedStoryId
  } = context;

  const handleResearch = () => {
    if (!localTopic) return;
    setTopic(localTopic);
    setSelectedStoryId(null); // Manual search clears selected story
    researchTopic(localTopic);
  };

  const handleApplyTopic = (t: string, storyId?: string) => {
    setLocalTopic(t);
    setTopic(t);
    if (storyId) setSelectedStoryId(storyId);
    researchTopic(t);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
      {/* Search Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-6 gap-4 bg-black/40">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Interrogate the search graph..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm py-2 pl-10 pr-4 text-xs font-mono font-medium focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-700"
            value={localTopic}
            onChange={(e) => setLocalTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
          />
        </div>
        <button 
          onClick={handleResearch}
          disabled={isResearching || !localTopic}
          className="bg-zinc-100 text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isResearching ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Search'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Signals List */}
        <div className="flex-1 flex flex-col border-r border-zinc-800">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/20">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Radio className="w-3 h-3" />
              Live Signals
            </h3>
            <button 
              onClick={() => fetchTickerData()}
              disabled={isFetchingTicker}
              className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              {isFetchingTicker ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              {isFetchingTicker ? 'Intercepting...' : 'Poll Sources'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {tickerItems.length > 0 ? (
                tickerItems.slice().sort((a, b) => (b.innovation_score || 0) - (a.innovation_score || 0)).map((item) => (
                    <div 
                        key={item._id} 
                        className="p-4 hover:bg-zinc-900/50 transition-colors cursor-default group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                    {item.source}
                                </span>
                                {item.innovation_score !== undefined && (
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                        item.innovation_score > 80 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-zinc-800 text-zinc-600'
                                    }`}>
                                        <Target className="w-2.5 h-2.5" />
                                        INN: {item.innovation_score}%
                                    </span>
                                )}
                            </div>
                            <span className="text-[8px] font-mono text-zinc-600">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <h4 className="text-[11px] leading-relaxed text-zinc-200 group-hover:text-emerald-400 transition-colors font-medium mb-2">
                            {item.title}
                        </h4>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleApplyTopic(item.title, item.storyId)}
                                className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors underline decoration-zinc-800 underline-offset-4"
                            >
                                Investigate
                            </button>
                            {item.url && (
                                <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    View Source
                                </a>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                    <AlertCircle className="w-8 h-8 text-zinc-800 mb-4" />
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">No signals intercepted</p>
                    <button 
                        onClick={() => fetchTickerData()}
                        className="mt-6 border border-zinc-800 px-4 py-2 text-[10px] font-mono uppercase tracking-widest hover:border-zinc-600 transition-all text-zinc-400"
                    >
                        Scan Web-Mesh
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* Right: Clusters/Trending */}
        <div className="w-80 flex flex-col bg-black/40">
           <div className="p-4 border-b border-zinc-800 bg-black/40">
             <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Cluster Intelligence
             </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {newsClusters.map((cluster) => (
                <div key={cluster._id} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-sm space-y-3">
                   <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase tracking-widest ${
                         cluster.status === 'trending' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                         {cluster.status}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-600">
                        {cluster.keyEntities?.length || 0} Entities
                      </span>
                   </div>
                   <h5 className="text-[10px] font-bold text-zinc-100 leading-tight">
                     {cluster.title}
                   </h5>
                   <p className="text-[9px] text-zinc-400 font-mono leading-relaxed italic">
                     {cluster.summary || "Pending synthesis..."}
                   </p>
                   
                   <div className="pt-2 flex gap-2">
                      <button 
                         onClick={() => synthesizeCluster(cluster._id)}
                         className="flex-1 border border-zinc-800 text-[8px] font-mono uppercase tracking-widest py-1.5 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                      >
                         Synthesize
                      </button>
                      <button 
                         onClick={() => handleApplyTopic(cluster.title, cluster._id)}
                         className="flex-1 bg-zinc-800 text-[8px] font-mono uppercase tracking-widest py-1.5 hover:bg-zinc-700 transition-colors text-white"
                      >
                         Deep Dive
                      </button>
                   </div>
                </div>
              ))}
              
              {newsClusters.length === 0 && (
                <div className="text-center py-12 opacity-30">
                  <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">Semantic clustering inactive</p>
                </div>
              )}
           </div>

           {/* Global Directive / Filter */}
           <div className="p-4 border-t border-zinc-800 space-y-4 mt-auto">
              <button 
                 onClick={() => scoutTopic()}
                 disabled={isScouting}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 flex items-center justify-center gap-3 transition-all rounded-sm group overflow-hidden relative"
              >
                 <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                 {isScouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Initiate Deep Sweep</span>
              </button>

              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Scout Directive</label>
                <textarea 
                   className="w-full bg-zinc-900 border border-zinc-800 p-2 text-[10px] font-mono focus:outline-none focus:border-zinc-700 h-20 resize-none text-zinc-300"
                   placeholder="Enter global research parameters..."
                   value={globalDirective}
                   onChange={(e) => setGlobalDirective(e.target.value)}
                />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
