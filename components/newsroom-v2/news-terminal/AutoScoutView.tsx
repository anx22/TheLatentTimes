import React from 'react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { Activity, Loader2, Sparkles, ExternalLink, ArrowRight, Calendar, Globe } from 'lucide-react';

export const AutoScoutView: React.FC = () => {
  const { 
    topic, setTopic, setContext, 
    scoutTopic, scoutedTopics, isScouting,
    runDebate
  } = useNewsroom();

  const handleSelectSignal = (signal: any) => {
    setTopic(signal.headline);
    // Combine context with source/date for the Editorial Board
    const enrichedContext = `${signal.context}\n\nSOURCE: ${signal.source || 'Unknown'}\nDATE: ${signal.date || 'Recent'}\nURL: ${signal.url || 'N/A'}`;
    setContext(enrichedContext);
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between py-2 px-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-700" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">The Scout</h3>
        </div>
        <button 
          onClick={scoutTopic}
          disabled={isScouting}
          className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded font-bold hover:bg-zinc-700 transition-colors border border-zinc-700 disabled:opacity-50 text-[10px]"
        >
          {isScouting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5 text-purple-400" />}
          <span>{isScouting ? 'SCANNING...' : 'INITIATE SCOUT'}</span>
        </button>
      </div>

      {scoutedTopics.length > 0 && (
        <div className="space-y-4 animate-fade-in pb-20">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Incoming Signals</h4>
          <div className="grid grid-cols-1 gap-3">
            {scoutedTopics.map((signal) => (
              <div 
                key={signal.id}
                onClick={() => handleSelectSignal(signal)}
                className={`p-4 text-left border rounded transition-all group relative overflow-hidden cursor-pointer ${topic === signal.headline ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${topic === signal.headline ? 'text-emerald-500' : 'text-zinc-500'}`}>
                        SIGNAL DETECTED ({signal.score}%)
                      </span>
                      {signal.source && (
                        <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {signal.source}
                        </span>
                      )}
                      {signal.date && (
                        <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {signal.date}
                        </span>
                      )}
                    </div>
                    
                    <h3 className={`text-sm font-bold leading-tight ${topic === signal.headline ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                      {signal.headline}
                    </h3>
                    
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {signal.context}
                    </p>
                    
                    {signal.url && (
                      <div className="pt-2 flex items-center gap-1 text-[10px] text-zinc-600 group-hover:text-emerald-500/70 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{new URL(signal.url).hostname}</span>
                      </div>
                    )}
                  </div>
                  
                  {topic === signal.headline && (
                    <div className="flex flex-col gap-2 items-end">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Action Bar for Selected Item */}
                {topic === signal.headline && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runDebate();
                      }}
                      className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 shadow-lg shadow-emerald-900/20"
                    >
                      <span>Convene Board</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon
const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
