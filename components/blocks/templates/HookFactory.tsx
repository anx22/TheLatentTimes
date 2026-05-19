import React from 'react';
import { BlockTemplate } from '../types';

const HookFactoryBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-black bg-white text-black">
    <div className="text-[10px] font-mono uppercase tracking-widest text-black mb-2">Dispatch • Social Mechanics</div>
    <h2 className="font-serif text-4xl leading-none tracking-tight mb-8 uppercase">
      The Hook Factory
    </h2>
    <p className="font-sans text-sm font-bold uppercase tracking-wide mb-4">
      We live in the era of the nano banana.
    </p>
    <p className="font-serif text-sm text-zinc-800 leading-relaxed mb-4">
      It's small, it's yellow, and it stops the scroll. The modern hook factory is not a writer's room—it's a parameter sweep. Thousands of micro-narratives tested against the friction of the thumb. The winners are not the smartest; they are the stickiest.
    </p>
    <p className="font-serif text-sm text-zinc-800 leading-relaxed">
      "We don't write jokes anymore," says one anonymous prompt engineer from a basement in Berlin. "We architect dopamine spikes." This is the industrialization of wit.
    </p>
  </div>
);

export const HookFactoryTemplate: BlockTemplate = {
  id: 'HookFactory',
  title: 'Hook Factory',
  description: 'Text-heavy block for analytical dispatches.',
  config: { w: 6, h: 3, minW: 4, minH: 1 },
  component: HookFactoryBlock
};
