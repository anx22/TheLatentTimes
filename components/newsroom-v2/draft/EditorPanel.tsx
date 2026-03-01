import React from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';
import { BlockAnnotation } from '../../../types';

interface EditorPanelProps {
  annotations: BlockAnnotation[];
  selectedBlockId: string | null;
  selectedSentenceId: string | null;
  onSelectAnnotation: (blockId: string, sentenceId?: string) => void;
  onApplyFix: (blockId: string, instruction: string, sentenceId?: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  annotations,
  selectedBlockId,
  selectedSentenceId,
  onSelectAnnotation,
  onApplyFix
}) => {
  // Group annotations by type for the "Scorecard" feel, or just list them?
  // The user image showed cards like "Tone Mismatch", "Clarity".
  
  if (annotations.length === 0) {
    return (
      <div className="h-full bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-white font-bold">All Clear</h3>
          <p className="text-sm text-zinc-500 mt-1">The Editor has no notes. Your draft is clean.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col w-80 md:w-96">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 sticky top-0 z-10">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            The Editor
          </h3>
          <p className="text-white font-display font-bold text-lg mt-1">{annotations.length} Issues Found</p>
        </div>
        <div className="text-right">
             {/* Scorecard placeholder */}
             <div className="text-2xl font-display font-bold text-emerald-500">92</div>
             <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Score</div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {annotations.map((anno) => {
          const isSelected = selectedBlockId === anno.blockId && 
                             (anno.sentenceId === selectedSentenceId || !anno.sentenceId && !selectedSentenceId);
          
          let typeColor = 'text-blue-400 border-blue-500/20 bg-blue-500/5';
          if (anno.type === 'TONE_MISMATCH') typeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
          if (anno.type === 'FACT_CHECK') typeColor = 'text-red-400 border-red-500/20 bg-red-500/5';
          if (anno.type === 'STYLE') typeColor = 'text-purple-400 border-purple-500/20 bg-purple-500/5';

          return (
            <div 
              key={anno.id}
              onClick={() => onSelectAnnotation(anno.blockId, anno.sentenceId)}
              className={`
                p-4 rounded-lg border transition-all cursor-pointer group
                ${isSelected ? 'bg-zinc-900 border-zinc-700 ring-1 ring-zinc-600' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${typeColor}`}>
                  {anno.type.replace('_', ' ')}
                </span>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              
              <p className="text-sm text-zinc-300 mb-3 leading-relaxed">"{anno.comment}"</p>
              
              {anno.suggestion && (
                <div className="mt-3 pt-3 border-t border-zinc-800/50">
                  <div className="flex items-start gap-2 mb-3">
                    <Sparkles className="w-3 h-3 text-emerald-500 mt-1 shrink-0" />
                    <p className="text-xs text-zinc-400 italic">{anno.suggestion}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyFix(anno.blockId, `Apply this suggestion: ${anno.suggestion}`, anno.sentenceId);
                    }}
                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    Apply Fix
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
