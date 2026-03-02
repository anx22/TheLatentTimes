import React from 'react';
import { Loader2, PenTool } from 'lucide-react';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { DraftHeader } from './DraftHeader';
import { DraftBlock } from './DraftBlock';
import { DraftActions } from './DraftActions';

interface DraftViewProps {
  selectedBlockId: string | null;
  selectedSentenceId: string | null;
  onSelectBlock: (id: string) => void;
  onSelectSentence: (blockId: string, sentenceId: string | null) => void;
}

export const DraftView: React.FC<DraftViewProps> = ({
  selectedBlockId,
  selectedSentenceId,
  onSelectBlock,
  onSelectSentence
}) => {
  const { setStep, draft, image, reDraft, annotations, isRewriting, rewriteBlock, isLinting } = useNewsroom();

  const handleDismissSelection = () => {
    onSelectBlock(""); // Using empty string to clear
    onSelectSentence("", null);
  };

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
              <div className="fixed bottom-8 left-8 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in z-50">
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
                    onSelectBlock={onSelectBlock}
                    onSelectSentence={onSelectSentence}
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
