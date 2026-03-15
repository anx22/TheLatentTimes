import React from 'react';
import { MessageSquare, Play } from 'lucide-react';
import { DebateMessage } from '../../../types';

interface DashboardViewProps {
  topic: string;
  transcript: DebateMessage[];
  onReConvene: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ topic, transcript, onReConvene }) => {
  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto space-y-12 animate-fade-in h-full flex flex-col justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-5xl font-display font-bold text-white leading-tight">
          Editorial <span className="text-zinc-600">Board</span>
        </h1>
        {topic ? (
          <div className="space-y-4">
            <p className="text-xl text-zinc-400 font-serif italic max-w-2xl mx-auto">
              Ready to debate: <span className="text-white not-italic">"{topic}"</span>
            </p>
            {transcript.length === 0 && (
              <button 
                onClick={onReConvene}
                className="inline-flex items-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Commence Debate</span>
              </button>
            )}
          </div>
        ) : (
          <p className="text-xl text-zinc-600 font-serif italic">
            Awaiting signal from News Terminal...
          </p>
        )}
      </div>

      {transcript.length > 0 && (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-8 space-y-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Debate Transcript</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">{transcript.length} ENTRIES</span>
          </div>
          <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
             {transcript.map((msg, idx) => (
               <div key={idx} className="flex gap-4 p-4 bg-zinc-950/50 rounded border border-zinc-900">
                  <div className="w-24 shrink-0 text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest pt-1">{msg.persona}</div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-serif">"{msg.message}"</p>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
