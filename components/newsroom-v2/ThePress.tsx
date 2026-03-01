
import React from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { Check, RefreshCw } from 'lucide-react';
import { Dossier } from './Dossier';

export const ThePress: React.FC = () => {
  const { step, draft, image, reset, reDraft, reShoot } = useNewsroom();

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6 h-full overflow-hidden">
      <Dossier
        title={draft ? draft.headline : "FINAL ARTIFACT"}
        status={step === 'PUBLISHED' ? "PUBLISHED" : (draft && image ? "READY FOR PRESS" : "PENDING")}
        classification="PUBLIC RELEASE"
      >
        <div className="flex-1 flex flex-col h-full">
          {draft && image && step !== 'PUBLISHED' ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="text-center mb-8 shrink-0">
                <h2 className="text-2xl font-bold text-white font-display">Final Review</h2>
                <p className="text-zinc-500">Artifact is ready for the grid.</p>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-8 overflow-hidden min-h-0">
                <div className="relative bg-black rounded border border-zinc-800 overflow-hidden shadow-md">
                   <img src={image} alt="Generated" className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-8 rounded overflow-y-auto shadow-sm prose prose-invert prose-sm max-w-none">
                  <h3 className="text-2xl font-bold text-white mb-2 font-display leading-tight">{draft.headline}</h3>
                  <p className="text-lg text-zinc-400 italic mb-6 border-l-4 border-emerald-500 pl-4">{draft.deck}</p>
                  
                  {draft.blocks ? (
                    draft.blocks.map((block) => (
                      <div key={block.id} className="mb-4">
                        {block.type === 'h2' && <h2 className="text-xl font-bold mt-6 mb-2 text-emerald-400">{block.sentences.map(s => s.text).join(' ')}</h2>}
                        {block.type === 'h3' && <h3 className="text-lg font-bold mt-4 mb-2 text-emerald-300">{block.sentences.map(s => s.text).join(' ')}</h3>}
                        {block.type === 'quote' && <blockquote className="border-l-2 border-zinc-700 pl-4 italic my-4 text-zinc-400">{block.sentences.map(s => s.text).join(' ')}</blockquote>}
                        {block.type === 'p' && <p className="text-zinc-300 leading-relaxed">{block.sentences.map(s => s.text).join(' ')}</p>}
                      </div>
                    ))
                  ) : (
                    draft.body.split('\n').map((p, i) => <p key={i} className="mb-4 text-zinc-300 leading-relaxed">{p}</p>)
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4 shrink-0">
                <button onClick={reset} className="px-6 py-3 text-zinc-500 hover:text-red-500 transition-colors font-bold text-xs tracking-widest">SCRAP ARTIFACT</button>
                <button onClick={reDraft} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs tracking-widest border border-zinc-800 rounded hover:bg-zinc-800">
                  <RefreshCw className="w-4 h-4" /> RE-DRAFT
                </button>
                <button onClick={reShoot} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs tracking-widest border border-zinc-800 rounded hover:bg-zinc-800">
                  <RefreshCw className="w-4 h-4" /> RE-SHOOT
                </button>
              </div>
            </div>
          ) : step === 'PUBLISHED' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in h-full">
              <div className="w-32 h-32 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                <Check className="w-16 h-16" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-display">PUBLISHED</h2>
                <p className="text-zinc-500 font-mono text-xs tracking-widest">THE ARTIFACT IS LIVE ON THE GRID.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50 h-full">
              <Check className="w-12 h-12 text-zinc-600" />
              <p className="text-sm text-zinc-500">No artifacts ready for review.</p>
            </div>
          )}
        </div>
      </Dossier>
    </div>
  );
};
