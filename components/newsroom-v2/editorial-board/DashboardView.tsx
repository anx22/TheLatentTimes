import React from 'react';
import { MessageSquare, Info } from 'lucide-react';
import { DebateMessage } from '../../../types';

interface DashboardViewProps {
  topic: string;
  transcript: DebateMessage[];
  onReConvene: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ topic, transcript, onReConvene }) => {
  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto space-y-12 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-5xl font-display font-bold text-white leading-tight">
          Editorial <span className="text-zinc-600">Dashboard</span>
        </h1>
        <p className="text-xl text-zinc-500 font-serif italic">
          Awaiting commission for topic: <span className="text-white">"{topic}"</span>
        </p>
      </div>

      {transcript.length > 0 && (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Debate Summary</span>
            </div>
            <button onClick={onReConvene} className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Re-Convene Board</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {transcript.map((msg, idx) => (
               <div key={idx} className="space-y-2">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">{msg.persona}</span>
                  <p className="text-xs text-zinc-400 line-clamp-4 leading-relaxed italic">"{msg.message}"</p>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
         <div className="flex items-center gap-3 text-zinc-600 mb-2">
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Select an angle from the sidebar to begin drafting</span>
         </div>
      </div>
    </div>
  );
};
