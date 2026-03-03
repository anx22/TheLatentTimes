import React from 'react';
import { LayoutTemplate, RefreshCw, Trash2, Send, Sparkles } from 'lucide-react';
import { BlockType } from '../../../types';

interface PressControlsProps {
  previewLayout: BlockType;
  setPreviewLayout: (type: BlockType) => void;
  onPublish: () => void;
  onReDraft: () => void;
  onReShoot: () => void;
  onScrap: () => void;
  onFinalPolish: () => void;
  isPublishing?: boolean;
  isPolishing?: boolean;
}

const PREVIEW_OPTIONS: { label: string; type: BlockType }[] = [
  { label: 'Hero Plate', type: 'HeroTypePlate' },
  { label: 'Feature Card', type: 'FeatureCard' },
  { label: 'Manifesto', type: 'BlackManifestoPanel' },
  { label: 'Quote', type: 'QuotePlate' },
];

export const PressControls: React.FC<PressControlsProps> = ({
  previewLayout,
  setPreviewLayout,
  onPublish,
  onReDraft,
  onReShoot,
  onScrap,
  onFinalPolish,
  isPublishing,
  isPolishing
}) => {
  return (
    <div className="w-64 border-l border-zinc-800 bg-zinc-950/50 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <LayoutTemplate className="w-3 h-3" /> LAYOUT ENGINE
        </h3>
        <div className="space-y-2">
          {PREVIEW_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setPreviewLayout(opt.type)}
              className={`
                w-full px-4 py-3 text-[10px] font-bold uppercase tracking-wider border rounded transition-all flex items-center justify-between
                ${previewLayout === opt.type 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'
                }
              `}
            >
              {opt.label}
              {previewLayout === opt.type && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
          <RefreshCw className="w-3 h-3" /> REFINEMENT
        </h3>
        <button 
          onClick={onFinalPolish}
          disabled={isPolishing}
          className="w-full px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/40 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3"
        >
          {isPolishing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          FINAL POLISH
        </button>
        <button 
          onClick={onReDraft}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3"
        >
          <RefreshCw className="w-3 h-3" /> RE-DRAFT TEXT
        </button>
        <button 
          onClick={onReShoot}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3"
        >
          <RefreshCw className="w-3 h-3" /> RE-SHOOT IMAGE
        </button>
        <button 
          onClick={onScrap}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-900/50 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 mt-auto"
        >
          <Trash2 className="w-3 h-3" /> SCRAP ARTIFACT
        </button>
      </div>

      <div className="p-6 bg-zinc-950 border-t border-zinc-800">
        <button 
          onClick={onPublish}
          disabled={isPublishing || isPolishing}
          className="w-full px-4 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          PUBLISH TO GRID
        </button>
      </div>
    </div>
  );
};
