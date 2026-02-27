
import React from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { Check, RefreshCw } from 'lucide-react';

export const ThePress: React.FC = () => {
  const { step, draft, image, publish, reset, reDraft, reShoot } = useNewsroom();

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {draft && image && step !== 'PUBLISHED' ? (
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Final Review</h2>
            <p className="text-zinc-500">Artifact is ready for the grid.</p>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-8">
            <div className="relative bg-black rounded border border-zinc-800 overflow-hidden">
               <img src={image} alt="Generated" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-2">{draft.headline}</h3>
              <p className="text-sm text-zinc-400 italic mb-4">{draft.deck}</p>
              <div className="text-xs text-zinc-500 space-y-2">
                {draft.blocks ? (
                  draft.blocks.slice(0, 2).map((block) => (
                    <div key={block.id}>
                      {block.type === 'h2' && <h2>{block.sentences.map(s => s.text).join(' ')}</h2>}
                      {block.type === 'h3' && <h3>{block.sentences.map(s => s.text).join(' ')}</h3>}
                      {block.type === 'quote' && <blockquote>{block.sentences.map(s => s.text).join(' ')}</blockquote>}
                      {block.type === 'p' && <p>{block.sentences.map(s => s.text).join(' ')}</p>}
                    </div>
                  ))
                ) : (
                  draft.body.split('\n').slice(0, 2).map((p, i) => <p key={i}>{p}</p>)
                )}
                <p>...</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button onClick={reset} className="px-6 py-3 text-zinc-500 hover:text-white transition-colors">SCRAP ARTIFACT</button>
            <button onClick={reDraft} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> RE-DRAFT
            </button>
            <button onClick={reShoot} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> RE-SHOOT
            </button>
            <button 
              onClick={publish}
              className="flex items-center gap-2 bg-emerald-500 text-black px-8 py-3 rounded font-bold hover:bg-emerald-400 transition-colors"
            >
              <Check className="w-5 h-5" />
              <span>SEND TO PRESS (PUBLISH)</span>
            </button>
          </div>
        </div>
      ) : step === 'PUBLISHED' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-widest">PUBLISHED</h2>
            <p className="text-zinc-500">The artifact is now live on the grid.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
          <Check className="w-12 h-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">No artifacts ready for review.</p>
        </div>
      )}
    </div>
  );
};
