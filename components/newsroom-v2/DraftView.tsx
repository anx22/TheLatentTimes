import React, { useState } from 'react';
import { PenTool, RefreshCw, Loader2, AlertTriangle, CheckCircle2, Edit3, Check } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';

export const DraftView: React.FC = () => {
  const { step, draft, image, reDraft, annotations, isLinting, isRewriting, runLinter, rewriteBlock } = useNewsroom();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [rewriteInstruction, setRewriteInstruction] = useState('');

  const handleRewriteSubmit = (blockId: string) => {
    if (!rewriteInstruction.trim()) return;
    rewriteBlock(blockId, rewriteInstruction);
    setRewriteInstruction('');
    setSelectedBlockId(null);
  };

  if (step === 'WRITING') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-md space-y-4">
          <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (draft) {
    return (
      <div className="flex gap-8 h-full">
        {/* Left: The Draft */}
        <div className="flex-1 space-y-8 animate-fade-in bg-zinc-950 border border-zinc-800 p-8 rounded mb-8 overflow-y-auto">
          {image && (
            <div className="relative w-full aspect-[21/9] bg-black rounded overflow-hidden border border-zinc-800 mb-8">
              <img src={image} alt="Header" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
            </div>
          )}
          
          <div className="space-y-4 border-b border-zinc-800 pb-6">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{draft.tags.join(' • ')}</span>
            <h2 className="text-4xl font-display font-bold leading-tight text-white">{draft.headline}</h2>
            <p className="text-xl text-zinc-400 italic border-l-2 border-emerald-500 pl-4">{draft.deck}</p>
          </div>
          <div className="prose prose-invert prose-zinc max-w-none">
            {draft.blocks ? (
              draft.blocks.map((block) => {
                const isFlagged = block.status === 'flagged';
                const isRewritingThis = isRewriting === block.id;
                const isSelected = selectedBlockId === block.id;
                
                return (
                  <div 
                    key={block.id} 
                    className={`relative group p-4 -mx-4 rounded transition-colors ${isFlagged ? 'bg-red-950/20 border-l-2 border-red-500' : isSelected ? 'bg-zinc-900 border-l-2 border-emerald-500' : 'hover:bg-zinc-900 border-l-2 border-transparent'}`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    {isRewritingThis ? (
                      <div className="flex items-center gap-4 text-zinc-400 py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                        <span className="text-sm font-bold tracking-widest">THE COLUMNIST IS REWRITING...</span>
                      </div>
                    ) : (
                      <>
                        {block.type === 'h2' && <h2 className="mt-0">{block.content}</h2>}
                        {block.type === 'h3' && <h3 className="mt-0">{block.content}</h3>}
                        {block.type === 'quote' && <blockquote className="mt-0">{block.content}</blockquote>}
                        {block.type === 'p' && <p className="mt-0 mb-0">{block.content}</p>}
                      </>
                    )}
                    
                    {/* Block Actions Overlay */}
                    {!isRewritingThis && isSelected && (
                      <div className="absolute -right-4 top-0 bottom-0 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                          className="p-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-700"
                          title="Edit Block"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              draft.body.split('\n').map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
          
          <div className="mt-8 flex justify-end border-t border-zinc-800 pt-6">
            <button 
              onClick={reDraft}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest">RE-DRAFT ENTIRE PIECE</span>
            </button>
          </div>
        </div>

        {/* Right: KI-Linter / Editor Panel */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${annotations.length === 0 ? 'text-emerald-500' : 'text-zinc-500'}`} />
                <h3 className="font-bold text-white tracking-widest text-sm">KI-LINTER</h3>
              </div>
              <button 
                onClick={runLinter}
                disabled={isLinting}
                className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded disabled:opacity-50"
                title="Run Linter"
              >
                {isLinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {annotations.length === 0 && !isLinting ? (
                <div className="text-center text-zinc-500 py-8 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm">No issues detected.</p>
                </div>
              ) : (
                annotations.map(anno => (
                  <div 
                    key={anno.id} 
                    className={`p-3 rounded border text-sm cursor-pointer transition-colors ${selectedBlockId === anno.blockId ? 'bg-red-950/40 border-red-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                    onClick={() => setSelectedBlockId(anno.blockId)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400">{anno.type}</span>
                    </div>
                    <p className="text-zinc-300 mb-2">{anno.comment}</p>
                    {anno.suggestion && (
                      <p className="text-zinc-500 italic text-xs border-l-2 border-zinc-700 pl-2">
                        Suggestion: {anno.suggestion}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Micro-Action Panel (Shows when a block is selected) */}
            {selectedBlockId && (
              <div className="mt-4 pt-4 border-t border-zinc-800 animate-fade-in">
                <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Direct The Columnist</h4>
                <textarea
                  value={rewriteInstruction}
                  onChange={(e) => setRewriteInstruction(e.target.value)}
                  placeholder="e.g., 'Make this punchier', 'Expand on the technical details', 'Fix the tone'"
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBlockId(null)}
                    className="flex-1 py-2 text-xs font-bold text-zinc-500 hover:text-white bg-zinc-900 rounded transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleRewriteSubmit(selectedBlockId)}
                    disabled={!rewriteInstruction.trim() || isRewriting === selectedBlockId}
                    className="flex-1 py-2 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRewriting === selectedBlockId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    REWRITE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-50">
      <PenTool className="w-12 h-12 text-zinc-700" />
      <p className="text-sm text-zinc-500">No draft available. Select an angle to begin writing.</p>
    </div>
  );
};
