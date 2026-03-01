import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

interface InlineRewritePanelProps {
  blockId: string;
  sentenceId: string | null;
  isRewriting: boolean;
  onCancel: () => void;
  onSubmit: (instruction: string) => void;
}

export const InlineRewritePanel: React.FC<InlineRewritePanelProps> = ({
  blockId,
  sentenceId,
  isRewriting,
  onCancel,
  onSubmit
}) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = () => {
    if (!instruction.trim()) return;
    onSubmit(instruction);
    setInstruction('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800 animate-fade-in" onClick={e => e.stopPropagation()}>
      <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">
        Direct The Columnist {sentenceId && <span className="text-emerald-500">(Sentence Level)</span>}
      </h4>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setInstruction("Sharpen the aesthetic. Make it more 'Vogue', focus on the texture and vibe.")} className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-2 py-1 rounded transition-colors">Sharpen Aesthetic</button>
        <button onClick={() => setInstruction("Make this more provocative and critical. Challenge the premise.")} className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-2 py-1 rounded transition-colors">Provoke</button>
        <button onClick={() => setInstruction("Clarify the technical details. Make it sound like 'Wired'.")} className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-2 py-1 rounded transition-colors">Clarify Tech</button>
        <button onClick={() => setInstruction("Make this shorter, punchier, and more impactful.")} className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-2 py-1 rounded transition-colors">Punchier</button>
      </div>

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder={sentenceId ? "e.g., 'Make this sentence punchier'" : "e.g., 'Make this block punchier', 'Expand on the technical details', 'Fix the tone'"}
        className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-xs font-bold text-zinc-500 hover:text-white bg-zinc-900 rounded transition-colors"
        >
          CANCEL
        </button>
        <button
          onClick={handleSubmit}
          disabled={!instruction.trim() || isRewriting}
          className="flex-1 py-2 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isRewriting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          REWRITE
        </button>
      </div>
    </div>
  );
};
