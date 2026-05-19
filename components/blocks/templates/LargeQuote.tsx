import React from 'react';
import { BlockTemplate } from '../types';

const LargeQuoteBlock: React.FC = () => (
  <div className="flex items-center justify-center h-full p-12 border-t border-b border-black bg-white text-black">
    <div className="flex items-center gap-8">
      <div className="w-32 h-32 rounded-full overflow-hidden border border-black shrink-0">
        <img src="https://picsum.photos/seed/brain/200/200" alt="Brain" className="w-full h-full object-cover grayscale contrast-150" />
      </div>
      <div className="flex flex-col">
        <h2 className="font-serif text-5xl italic leading-tight mb-4">
          "Prompting is the art of <br /> curating possibility."
        </h2>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-700 font-bold text-center">
          — The Editors
        </div>
      </div>
    </div>
  </div>
);

export const LargeQuoteTemplate: BlockTemplate = {
  id: 'LargeQuote',
  title: 'Large Quote',
  description: 'Full-width quote block with a circular image.',
  config: { w: 12, h: 4, minW: 8, minH: 1 },
  component: LargeQuoteBlock
};
