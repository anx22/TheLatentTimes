import React from 'react';
import { BlockTemplate } from '../types';
import { MagazineItem } from '../../../types';

const GlamourBlock: React.FC<{ data?: MagazineItem }> = ({ data }) => (
  <div className="flex flex-col h-full p-6 border-t border-l border-black bg-[#faf9f6] text-black overflow-hidden min-h-0">
    <div className="text-[10px] font-mono uppercase tracking-widest text-black mb-4">Cover Story</div>
    <h2 className="font-serif text-4xl leading-[0.9] tracking-tight mb-4 uppercase">
      {data ? data.title : <>Glamour <br />In The <br />Machine.</>}
    </h2>
    <p className="font-serif text-sm italic leading-tight text-zinc-800">
      {data?.dek || "The new aesthetic is generated, not found. A deep dive into the algorithmic beauty standard."}
    </p>
  </div>
);

export const GlamourTemplate: BlockTemplate = {
  id: 'Glamour',
  title: 'Glamour Block',
  description: 'Vertical block with large serif typography.',
  config: { w: 6, h: 6, minW: 2, minH: 1 },
  component: GlamourBlock
};
