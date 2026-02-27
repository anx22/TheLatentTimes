import React from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { RefreshCw } from 'lucide-react';

export const TickerView: React.FC = () => {
  const { 
    topic, setTopic, setContext, 
    tickerItems, isFetchingTicker, fetchTickerData,
    activeConsensus
  } = useNewsroom();

  return (
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
  );
};
