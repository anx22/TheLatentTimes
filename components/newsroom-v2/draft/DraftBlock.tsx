import React from 'react';
import { Loader2, Edit3 } from 'lucide-react';
import { BlockAnnotation } from '../../../types';
import { InlineRewritePanel } from './InlineRewritePanel';

interface DraftBlockProps {
  block: any; // Using any for now, ideally should be GeneratedBlock
  annotations: BlockAnnotation[];
  isRewritingThis: boolean;
  isSelected: boolean;
  selectedSentenceId: string | null;
  onSelectBlock: (blockId: string) => void;
  onSelectSentence: (blockId: string, sentenceId: string | null) => void;
  onRewrite: (blockId: string, instruction: string, sentenceId?: string) => void;
  onDismissSelection: () => void;
}

export const DraftBlock: React.FC<DraftBlockProps> = ({
  block,
  annotations,
  isRewritingThis,
  isSelected,
  selectedSentenceId,
  onSelectBlock,
  onSelectSentence,
  onRewrite,
  onDismissSelection
}) => {
  const isFlagged = block.status === 'flagged';

  return (
    <div 
      id={`block-${block.id}`}
      className={`relative group p-4 -mx-4 rounded transition-colors ${isFlagged ? 'bg-red-950/20 border-l-2 border-red-500' : isSelected ? 'bg-zinc-900 border-l-2 border-emerald-500' : 'hover:bg-zinc-900 border-l-2 border-transparent'}`}
      onClick={() => onSelectSentence(block.id, null)}
    >
      {isRewritingThis ? (
        <div className="flex items-center gap-4 text-zinc-400 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-sm font-bold tracking-widest">THE COLUMNIST IS REWRITING...</span>
        </div>
      ) : (
        <>
          {block.type === 'h2' && <h2 className="mt-0">{block.sentences.map((s: any) => s.text).join(' ')}</h2>}
          {block.type === 'h3' && <h3 className="mt-0">{block.sentences.map((s: any) => s.text).join(' ')}</h3>}
          {block.type === 'quote' && <blockquote className="mt-0">{block.sentences.map((s: any) => s.text).join(' ')}</blockquote>}
          {block.type === 'p' && (
            <p className="mt-0 mb-0">
              {block.sentences.map((sentence: any) => {
                const sentenceAnnotations = annotations.filter(a => a.sentenceId === sentence.id);
                const isSentenceAnnotated = sentenceAnnotations.length > 0;
                const isSentenceSelected = selectedSentenceId === sentence.id;
                
                let highlightClass = '';
                if (isSentenceAnnotated) {
                  const primaryType = sentenceAnnotations[0].type;
                  if (primaryType === 'STYLE') highlightClass = 'bg-emerald-950/40 border-b border-emerald-500/50';
                  else if (primaryType === 'TONE_MISMATCH') highlightClass = 'bg-amber-950/40 border-b border-amber-500/50';
                  else if (primaryType === 'FACT_CHECK') highlightClass = 'bg-red-950/40 border-b border-red-500/50';
                  else highlightClass = 'bg-blue-950/40 border-b border-blue-500/50';
                }

                return (
                  <span 
                    key={sentence.id}
                    id={`sentence-${sentence.id}`}
                    className={`transition-colors relative ${highlightClass} ${isSentenceSelected ? 'bg-zinc-800 text-white border-b-2' : ''} ${isSentenceAnnotated ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSentence(block.id, sentence.id);
                    }}
                  >
                    {sentence.text}{' '}
                  </span>
                );
              })}
            </p>
          )}
        </>
      )}
      
      {/* Block Actions Overlay */}
      {!isRewritingThis && isSelected && (
        <div className="absolute -right-4 top-0 bottom-0 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
            className="p-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-700"
            title="Edit Block"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Inline Rewrite Panel */}
      {isSelected && !isRewritingThis && (
        <InlineRewritePanel
          blockId={block.id}
          sentenceId={selectedSentenceId}
          isRewriting={isRewritingThis}
          onCancel={onDismissSelection}
          onSubmit={(instruction) => onRewrite(block.id, instruction, selectedSentenceId || undefined)}
        />
      )}
    </div>
  );
};
