import React from 'react';
import { BlockTemplate } from '../types';
import { MagazineItem } from '../../../types';

const NewCanonBlock: React.FC<{ data?: MagazineItem }> = ({ data }) => (
  <div className="flex flex-col h-full p-6 border-t border-l border-black bg-[#faf9f6] text-black overflow-hidden min-h-0">
    <div className="text-[10px] font-mono uppercase tracking-widest text-black mb-4">The New Canon</div>
    <h3 className="font-serif text-2xl leading-tight mb-4">{data?.title || "The Death of the Prompt"}</h3>
    <p className="font-mono text-xs text-zinc-800 uppercase tracking-wider leading-relaxed">
      {data?.dek || "Why agentic drift is the only metric that matters now."}
    </p>
  </div>
);

export const NewCanonTemplate: BlockTemplate = {
  id: 'NewCanon',
  title: 'The New Canon',
  description: 'Small informational block.',
  config: { w: 4, h: 4, minW: 2, minH: 1 },
  component: NewCanonBlock
};
