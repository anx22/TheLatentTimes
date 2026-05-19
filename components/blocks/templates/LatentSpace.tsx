import React from 'react';
import { BlockTemplate } from '../types';

const LatentSpaceBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-l border-black bg-white text-black">
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-700 mb-4">The Issue</div>
    <h2 className="font-serif text-6xl leading-[0.85] tracking-tight mb-6">
      The <br />
      <span className="italic">Latent</span> <br />
      Space.
    </h2>
    <p className="font-serif text-sm text-zinc-800 leading-relaxed mb-8 max-w-xs">
      When artificial intelligence begins to hallucinate, it does not dream of sheep. It dreams of us. An editorial investigation into the new digital subconscious.
    </p>
    <div className="mt-auto text-[10px] font-mono uppercase tracking-widest text-zinc-700">
      [ Read The Cover Story ]
    </div>
  </div>
);

export const LatentSpaceTemplate: BlockTemplate = {
  id: 'LatentSpace',
  title: 'Latent Space',
  description: 'Graphic block with large serif typography.',
  config: { w: 6, h: 3, minW: 4, minH: 1 },
  component: LatentSpaceBlock
};
