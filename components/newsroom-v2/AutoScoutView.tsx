import React from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { Activity, Loader2, Sparkles } from 'lucide-react';

export const AutoScoutView: React.FC = () => {
  const { 
    topic, setTopic, setContext, 
    scoutTopic, scoutedTopics, step, isScouting
  } = useNewsroom();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 border-b border-zinc-800">
        <Activity className="w-12 h-12 text-zinc-700" />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Deploy The Scout</h3>
          <p className="text-sm text-zinc-500 max-w-md">Command the Scout agent to scan the global network for emerging trends in technology, AI models, and code.</p>
        </div>
        <button 
          onClick={scoutTopic}
          disabled={isScouting}
          className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-6 py-3 rounded font-bold hover:bg-zinc-700 transition-colors border border-zinc-700 disabled:opacity-50"
        >
          {isScouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
          <span>{isScouting ? 'SCANNING THE WIRE...' : 'INITIATE SCOUT'}</span>
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
  );
};
