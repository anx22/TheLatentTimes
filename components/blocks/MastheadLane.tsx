
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const MastheadLane: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ content }) => {
  return (
    <header className="w-full py-6 border-b border-black flex justify-between items-baseline mb-12">
      <div className="flex gap-8 items-baseline">
        <h1 className="font-condensed font-bold text-4xl tracking-tighter uppercase">Modus</h1>
        <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            {content.meta.theme}
        </span>
      </div>
      
      <div className="flex gap-6 text-[10px] font-mono uppercase text-neutral-500">
        <span>{content.meta.vol}</span>
        <span>{content.meta.status}</span>
      </div>
    </header>
  );
};
