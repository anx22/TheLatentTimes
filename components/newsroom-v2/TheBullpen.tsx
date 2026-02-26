import React from 'react';
import { PenTool } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';

export const TheBullpen: React.FC = () => {
  const { step, draft } = useNewsroom();
  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {step === 'WRITING' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-full max-w-md space-y-4">
            <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ) : draft ? (
        <div className="flex-1 overflow-y-auto space-y-8 animate-fade-in bg-zinc-950 border border-zinc-800 p-8 rounded">
          <div className="space-y-4 border-b border-zinc-800 pb-6">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{draft.tags.join(' • ')}</span>
            <h2 className="text-4xl font-display font-bold leading-tight text-white">{draft.headline}</h2>
            <p className="text-xl text-zinc-400 italic border-l-2 border-emerald-500 pl-4">{draft.deck}</p>
          </div>
          <div className="prose prose-invert prose-zinc max-w-none">
            {draft.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
          <PenTool className="w-12 h-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">The Bullpen is empty. Send a signal from The Wire.</p>
        </div>
      )}
    </div>
  );
};
