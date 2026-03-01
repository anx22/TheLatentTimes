import React, { useState } from 'react';
import { PenTool, Loader2 } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { DraftHeader } from './draft/DraftHeader';
import { DraftBlock } from './draft/DraftBlock';
import { DraftActions } from './draft/DraftActions';
import { EditorPanel } from './draft/EditorPanel';

export const DraftView: React.FC = () => {
  const { step, setStep, draft, image, reDraft, annotations, isRewriting, rewriteBlock, isLinting, isDrafting } = useNewsroom();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    setSelectedSentenceId(null);
  };

  const handleSelectSentence = (blockId: string, sentenceId: string | null) => {
    setSelectedBlockId(blockId);
    setSelectedSentenceId(sentenceId);
  };

  const handleDismissSelection = () => {
    setSelectedBlockId(null);
    setSelectedSentenceId(null);
  };

  const handleSelectAnnotation = (blockId: string, sentenceId?: string) => {
    setSelectedBlockId(blockId);
    setSelectedSentenceId(sentenceId || null);
    
    // Optional: Scroll to element logic here
    const elementId = sentenceId ? `sentence-${sentenceId}` : `block-${blockId}`;
    const el = document.getElementById(elementId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (isDrafting) {
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
      <div className="flex h-full">
        {/* Left: The Draft */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar px-8 md:px-16 py-12 animate-fade-in">
          <div className="max-w-4xl mx-auto space-y-8 pb-32">
            
            <DraftHeader 
              image={image} 
              tags={draft.tags} 
              headline={draft.headline} 
              deck={draft.deck} 
            />

            {isLinting && (
              <div className="fixed bottom-8 right-8 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in z-50">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">The Editor</span>
                  <span className="text-[10px] text-zinc-500">Reviewing draft for style & tone...</span>
                </div>
              </div>
            )}

            <div className="prose prose-invert prose-zinc prose-lg md:prose-xl max-w-none">
              {draft.blocks ? (
                draft.blocks.map((block) => (
                  <DraftBlock
                    key={block.id}
                    block={block}
                    annotations={annotations}
                    isRewritingThis={isRewriting === block.id}
                    isSelected={selectedBlockId === block.id}
                    selectedSentenceId={selectedSentenceId}
                    onSelectBlock={handleSelectBlock}
                    onSelectSentence={handleSelectSentence}
                    onRewrite={rewriteBlock}
                    onDismissSelection={handleDismissSelection}
                  />
                ))
              ) : (
                draft.body.split('\n').map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
            
            <DraftActions 
              onReDraft={reDraft} 
              onSendToDarkroom={() => setStep('DARKROOM')} 
            />

          </div>
        </div>

        {/* Right: The Editor Panel */}
        <div className="hidden xl:block h-full border-l border-zinc-800 bg-zinc-950 w-96 shrink-0">
          <EditorPanel 
            annotations={annotations}
            selectedBlockId={selectedBlockId}
            selectedSentenceId={selectedSentenceId}
            onSelectAnnotation={handleSelectAnnotation}
            onApplyFix={rewriteBlock}
          />
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
