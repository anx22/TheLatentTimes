import React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { DebateMessage } from '../../../types';

interface DebateViewProps {
  topic: string;
  transcript: DebateMessage[];
}

export const DebateView: React.FC<DebateViewProps> = ({ topic, transcript }) => {
  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">The Board is in Session</h2>
          <p className="text-zinc-500 text-sm mt-2">Debating editorial vectors for: "{topic}"</p>
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Transcript</span>
          </div>
          <div className="space-y-8">
            {transcript.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-2 animate-slide-in max-w-2xl">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{msg.persona}</span>
                <p className="text-lg text-zinc-300 italic leading-relaxed font-serif">"{msg.message}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
