
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const HeroTypePlate: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ config, content }) => {
  const { cover } = content;
  const variant = config.variant || 'L';

  // "L" Variant = Massive Cover Style
  if (variant === 'L') {
    return (
      <div className="flex flex-col justify-end min-h-[60vh] md:min-h-[80vh] border-b border-black pb-8">
        <div className="flex justify-between items-end mb-4">
            <span className="bg-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]">
                {cover.eyebrow}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
                Fig. 01 — {content.meta.date}
            </span>
        </div>
        
        <h1 className="font-condensed font-bold text-[18vw] leading-[0.8] tracking-tighter uppercase text-foreground mix-blend-difference break-words">
          {cover.title}
        </h1>
        
        <div className="grid grid-cols-12 mt-8 md:mt-12 border-t border-black pt-6">
            <div className="col-span-12 md:col-span-4">
                 <p className="font-display italic text-2xl md:text-3xl leading-tight">
                    {cover.deck}
                 </p>
            </div>
            <div className="col-span-6 md:col-span-2 md:col-start-11 text-right">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Editor</span>
                <span className="font-sans text-xs font-bold">{content.meta.editor}</span>
            </div>
        </div>
      </div>
    );
  }

  return null;
};
