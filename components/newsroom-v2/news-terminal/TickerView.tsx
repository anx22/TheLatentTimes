import React, { useState } from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { RefreshCw, ChevronDown, ChevronRight, Layers, Sparkles } from 'lucide-react';

export const TickerView: React.FC = () => {
  const { 
    topic, setTopic, setContext, 
    tickerItems, newsClusters, isFetchingTicker, fetchTickerData,
    activeConsensus, synthesizeCluster
  } = useNewsroom();

  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  // Group items by storyId
  const itemsByStory = tickerItems.reduce((acc, item) => {
    if (item.storyId) {
      if (!acc[item.storyId]) acc[item.storyId] = [];
      acc[item.storyId].push(item);
    }
    return acc;
  }, {} as Record<string, typeof tickerItems>);

  const unclusteredItems = tickerItems.filter(item => !item.storyId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-zinc-500">Semantic Story Clustering active.</p>
        <button 
          onClick={fetchTickerData} 
          disabled={isFetchingTicker}
          className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isFetchingTicker ? 'animate-spin' : ''}`} />
          POLL SOURCES
        </button>
      </div>

      {/* Active Consensus */}
      {activeConsensus && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4 mb-4">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Consensus</h4>
          <p className="text-sm text-zinc-300 italic">"{activeConsensus}"</p>
        </div>
      )}

      {tickerItems.length === 0 && !isFetchingTicker && (
        <div className="text-center py-12 text-zinc-500">
          No signals found. Adjust your noise filter or enable more sources.
        </div>
      )}

      <div className="space-y-4">
        {/* Clustered Stories */}
        {newsClusters.map(cluster => {
          const items = itemsByStory[cluster._id] || [];
          if (items.length === 0) return null; // Hide empty clusters
          
          const isExpanded = expandedCluster === cluster._id;
          
          return (
            <div key={cluster._id} className="border border-zinc-800 rounded bg-zinc-950/50 overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors flex items-start gap-3"
                onClick={() => setExpandedCluster(isExpanded ? null : cluster._id)}
              >
                <div className="mt-1">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">STORY CLUSTER ({items.length} SIGNALS)</span>
                  </div>
                  <h3 className="text-base text-white font-medium">{cluster.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{cluster.summary}</p>
                </div>
              </div>
              
              {isExpanded && (
                <div className="bg-zinc-900/30 border-t border-zinc-800 p-3 space-y-2">
                  <div className="flex justify-end mb-2 gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        synthesizeCluster(cluster._id);
                      }}
                      className="text-[10px] bg-purple-500/10 text-purple-500 px-3 py-1 rounded hover:bg-purple-500/20 transition-colors font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Synthesize
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTopic(cluster.title);
                        setContext(items.map(i => i.content || i.title).join('\n\n'));
                      }}
                      className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded hover:bg-emerald-500/20 transition-colors font-bold uppercase tracking-wider"
                    >
                      Investigate Story
                    </button>
                  </div>
                  {items.map(item => (
                    <div key={item._id} className="p-3 border border-zinc-800/50 rounded bg-zinc-950/50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.source}</span>
                        <span className="text-[10px] text-zinc-600">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-zinc-300">{item.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Unclustered Items */}
        {unclusteredItems.length > 0 && (
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Raw Signals</h4>
            <div className="space-y-3">
              {unclusteredItems.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => {
                    setTopic(item.title);
                    setContext(item.content || '');
                  }}
                  className={`p-4 border rounded cursor-pointer transition-colors group ${topic === item.title ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{item.source}</span>
                    <span className="text-[10px] text-zinc-600">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-base text-zinc-300 group-hover:text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
