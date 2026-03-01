import React from 'react';
import { Loader2, Users, MessageSquare } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';

export const AnglesView: React.FC = () => {
  const { step, angles, runPipeline, runDebate, debateTranscript } = useNewsroom();

  if (step === 'EDITORIAL_BOARD' && angles.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in pb-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-zinc-500 font-bold tracking-widest uppercase">The Editorial Board is debating...</p>
        </div>

        {debateTranscript.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Live Debate
            </h3>
            <div className="space-y-4">
              {debateTranscript.map((msg, idx) => (
                <div key={idx} className="flex flex-col gap-1 animate-slide-in">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{msg.persona}</span>
                  <p className="text-sm text-zinc-300 italic">"{msg.message}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (angles.length > 0) {
    return (
      <div className="space-y-6 animate-fade-in pb-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Editorial Board Verdict</h2>
          <p className="text-zinc-500">Select an angle to commission the draft, or re-run the debate.</p>
        </div>

        {/* Visible Debate Transcript */}
        {debateTranscript && debateTranscript.length > 0 && (
          <div className="mb-12 bg-zinc-950 border border-zinc-800 rounded p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Debate Transcript
            </h3>
            <div className="space-y-4">
              {debateTranscript.map((msg, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{msg.persona}</span>
                  <p className="text-sm text-zinc-300 italic">"{msg.message}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {angles.map((angle) => (
            <div 
              key={angle.id} 
              onClick={() => runPipeline(angle)}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded hover:border-emerald-500 transition-colors group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{angle.persona}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{angle.headline}</h3>
              <p className="text-sm text-zinc-400">{angle.angle}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end border-t border-zinc-800 pt-6">
          <button 
            onClick={runDebate}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">RE-CONVENE BOARD (NEW ANGLES)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-50">
      <Users className="w-12 h-12 text-zinc-700" />
      <p className="text-sm text-zinc-500">No angles debated yet. Send a signal from The Wire.</p>
    </div>
  );
};
