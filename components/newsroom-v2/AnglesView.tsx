import React, { useState } from 'react';
import { Loader2, Users, MessageSquare, ArrowRight, X } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { EditorialAngle } from '../../types';

export const AnglesView: React.FC = () => {
  const { step, angles, runPipeline, runDebate, debateTranscript, isDebating } = useNewsroom();
  const [selectedAngle, setSelectedAngle] = useState<EditorialAngle | null>(null);

  if (isDebating) {
    return (
      <div className="space-y-6 animate-fade-in py-12 px-8 md:px-16 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
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

  // HEADLINE SELECTION OVERLAY
  if (selectedAngle) {
    const allHeadlines = [selectedAngle.headline, ...(selectedAngle.headlineOptions || [])];
    
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
        <div className="max-w-3xl w-full space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Select Headline</h2>
              <p className="text-zinc-500">Choose the framing for the <span className="text-purple-400">{selectedAngle.persona}</span> angle.</p>
            </div>
            <button 
              onClick={() => setSelectedAngle(null)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-zinc-500" />
            </button>
          </div>

          <div className="grid gap-4">
            {allHeadlines.map((headline, idx) => (
              <button
                key={idx}
                onClick={() => runPipeline(selectedAngle, headline)}
                className="text-left p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-emerald-500 hover:bg-zinc-800 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all" />
                <h3 className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {headline}
                </h3>
                <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <span>Commission Draft</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
          
          <div className="text-center">
             <p className="text-xs text-zinc-600">The Columnist will write the piece based on this headline and the selected angle.</p>
          </div>
        </div>
      </div>
    );
  }

  if (angles.length > 0) {
    return (
      <div className="space-y-6 animate-fade-in py-12 px-8 md:px-16 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar pb-32">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-4">Editorial Board Verdict</h2>
          <p className="text-xl text-zinc-500">Select an angle to proceed to headline selection.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {angles.map((angle) => (
            <button 
              key={angle.id} 
              onClick={() => setSelectedAngle(angle)}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded flex flex-col relative overflow-hidden text-left hover:border-purple-500/50 transition-colors group h-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{angle.persona}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{angle.headline}</h3>
              <p className="text-sm text-zinc-400 mb-6 flex-1 leading-relaxed">{angle.angle}</p>
              
              <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between w-full">
                <span className="text-[10px] text-zinc-600 font-mono">
                  {angle.headlineOptions?.length ? `+${angle.headlineOptions.length} Variants` : 'Single Headline'}
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-12 flex justify-end border-t border-zinc-800 pt-8">
          <button 
            onClick={runDebate}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest">RE-CONVENE BOARD (NEW ANGLES)</span>
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
