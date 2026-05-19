import React from 'react';
import { BlockTemplate } from '../types';
import { MagazineItem } from '../../../types';

const CoverStoryBlock: React.FC<{ data?: MagazineItem }> = ({ data }) => (
  <div className="flex flex-col h-full p-6 border-t border-black bg-[#faf9f6] text-black overflow-hidden min-h-0">
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[10px] font-mono uppercase tracking-widest border border-black px-2 py-0.5 rounded-full">The Cover Story</span>
    </div>
    <h1 className="font-serif text-5xl leading-[0.9] tracking-tight mb-6">
      {data ? data.title : <>The <br /><span className="italic font-light">Synthetic</span> <br />Sublime</>}
    </h1>
    <p className="font-mono text-xs text-zinc-800 uppercase tracking-wider leading-relaxed max-w-xs">
      {data?.dek || "When the model begins to dream, does it dream of us? An investigation into the latent space of identity, desire, and digital couture."}
    </p>
  </div>
);

export const CoverStoryTemplate: BlockTemplate = {
  id: 'CoverStory',
  title: 'Cover Story',
  description: 'High-impact square block for the main feature.',
  config: { w: 6, h: 6, minW: 2, minH: 1 },
  component: CoverStoryBlock
};
