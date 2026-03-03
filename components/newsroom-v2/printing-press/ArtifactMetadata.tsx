import React from 'react';
import { GeneratedArticle } from '../../../types';
import { FileText, Hash, Clock, AlignLeft } from 'lucide-react';

interface ArtifactMetadataProps {
  draft: GeneratedArticle;
}

export const ArtifactMetadata: React.FC<ArtifactMetadataProps> = ({ draft }) => {
  const wordCount = draft.body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50 overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FileText className="w-3 h-3" /> ARTIFACT BRIEF
        </h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Headline</span>
            <p className="text-sm font-bold text-white leading-tight font-display">{draft.headline}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Deck</span>
            <p className="text-xs text-zinc-400 italic font-serif leading-relaxed">{draft.deck}</p>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Hash className="w-3 h-3" /> TAXONOMY
        </h3>
        <div className="flex flex-wrap gap-2">
          {draft.tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-500 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlignLeft className="w-3 h-3" /> METRICS
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded">
            <div className="flex items-center gap-2 text-zinc-600 mb-1">
              <AlignLeft className="w-3 h-3" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Words</span>
            </div>
            <span className="text-lg font-bold text-white font-mono">{wordCount}</span>
          </div>
          <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded">
            <div className="flex items-center gap-2 text-zinc-600 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Read</span>
            </div>
            <span className="text-lg font-bold text-white font-mono">{readingTime}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
