import React from 'react';
import { useSimpleNewsroom, NewsroomStep } from '../../hooks/useSimpleNewsroom';
import { MagazineItem } from '../../types';
import { X, Sparkles, ArrowRight, Check, Loader2 } from 'lucide-react';

interface SimpleNewsroomProps {
  onPublish: (item: MagazineItem) => void;
  onClose: () => void;
}

export const SimpleNewsroom: React.FC<SimpleNewsroomProps> = ({ onPublish, onClose }) => {
  const { step, topic, setTopic, draft, image, error, runPipeline, publish, reset } = useSimpleNewsroom(onPublish);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-50 z-50 flex flex-col font-mono">
      {/* HEADER */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-bold tracking-widest text-sm">MODUS NEWSROOM v2.0</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* BACKGROUND GRID */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        <div className="max-w-3xl w-full z-10 space-y-8">
          
          {/* INPUT STAGE */}
          {step === 'IDLE' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl font-display font-light text-center">What is the signal?</h1>
              <div className="relative">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runPipeline()}
                  placeholder="e.g. Digital Decay, Cyber-Baroque, The End of Privacy..."
                  className="w-full bg-transparent border-b-2 border-zinc-700 text-3xl py-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 text-center font-serif italic"
                  autoFocus
                />
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={runPipeline}
                  disabled={!topic.trim()}
                  className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>IGNITE AGENTS</span>
                </button>
              </div>
            </div>
          )}

          {/* PROCESSING STAGE */}
          {(step === 'WRITING' || step === 'VISUALIZING') && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {step === 'WRITING' ? 'THE COLUMNIST IS DRAFTING...' : 'THE PHOTOGRAPHER IS SHOOTING...'}
                </h2>
                <p className="text-zinc-500 font-mono text-sm">
                  {step === 'WRITING' ? 'Analyzing cultural vectors & synthesizing prose.' : 'Rendering latent space artifacts.'}
                </p>
              </div>
            </div>
          )}

          {/* REVIEW STAGE */}
          {step === 'REVIEW' && draft && image && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
              <div className="grid md:grid-cols-2 h-[600px]">
                {/* IMAGE PREVIEW */}
                <div className="relative h-full bg-black">
                  <img src={image} alt="Generated" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs border border-white/10">
                    PROMPT: {draft.suggested_visual_prompt.slice(0, 40)}...
                  </div>
                </div>

                {/* TEXT PREVIEW */}
                <div className="p-8 overflow-y-auto space-y-6 bg-zinc-900">
                  <div className="space-y-2">
                    <span className="text-emerald-500 text-xs font-bold tracking-widest uppercase">{draft.tags.join(' • ')}</span>
                    <h2 className="text-3xl font-display font-bold leading-tight">{draft.headline}</h2>
                    <p className="text-lg text-zinc-400 italic border-l-2 border-emerald-500 pl-4">{draft.deck}</p>
                  </div>
                  <div className="prose prose-invert prose-sm text-zinc-300">
                    {draft.body.split('\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="border-t border-zinc-800 p-4 flex justify-between items-center bg-zinc-950">
                <button onClick={reset} className="text-zinc-500 hover:text-white text-sm">
                  DISCARD & RESTART
                </button>
                <button 
                  onClick={publish}
                  className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-emerald-400 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>PUBLISH TO MAGAZINE</span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STAGE */}
          {step === 'PUBLISHED' && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-white">PUBLISHED</h2>
              <p className="text-zinc-500">The artifact is now live on the grid.</p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-center">
              <p className="font-bold">SYSTEM FAILURE</p>
              <p className="text-sm">{error}</p>
              <button onClick={reset} className="mt-4 underline">Try Again</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
