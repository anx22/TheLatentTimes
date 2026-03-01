import React from 'react';
import { RefreshCw, Camera } from 'lucide-react';

interface DraftActionsProps {
  onReDraft: () => void;
  onSendToDarkroom: () => void;
}

export const DraftActions: React.FC<DraftActionsProps> = ({ onReDraft, onSendToDarkroom }) => {
  return (
    <div className="mt-12 flex justify-end border-t border-zinc-800 pt-8 gap-4">
      <button 
        onClick={onReDraft}
        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-zinc-800"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm font-bold tracking-widest">RE-DRAFT</span>
      </button>
      <button 
        onClick={onSendToDarkroom}
        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      >
        <Camera className="w-4 h-4" />
        <span className="text-sm font-bold tracking-widest">SEND TO DARKROOM</span>
      </button>
    </div>
  );
};
