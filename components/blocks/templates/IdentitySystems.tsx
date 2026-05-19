import React from 'react';
import { BlockTemplate } from '../types';
import { MagazineItem } from '../../../types';

const IdentitySystemsBlock: React.FC<{ data?: MagazineItem }> = ({ data }) => (
  <div className="flex flex-col h-full p-8 border-t border-black bg-[#faf9f6] text-black overflow-hidden min-h-0">
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[10px] font-mono uppercase tracking-widest border border-black px-2 py-0.5 rounded-full">Identity Systems</span>
    </div>
    <h2 className="font-serif text-5xl leading-[0.9] tracking-tight mb-6">
      {data?.title ? (
        <>
          {data.title.split(' ').slice(0, 2).join(' ')} <br />
          <span className="italic font-light">{data.title.split(' ').slice(2).join(' ')}</span>
        </>
      ) : (
        <>
          Wear Your <br />
          <span className="italic font-light">Ghost.</span>
        </>
      )}
    </h2>
    <p className="font-sans text-sm text-zinc-800 uppercase tracking-wide leading-relaxed mb-8">
      {data?.dek || "In the age of agentic engineering, your avatar is no longer a static image. It is a self-healing workflow, a persona wrapper that navigates the social web while you sleep. We test the latest \"identity rigs\" from the underground labs of Kyoto."}
    </p>
    <div className="mt-auto text-[10px] font-mono uppercase tracking-widest border-b border-black w-fit pb-1">
      Read The Report
    </div>
  </div>
);

export const IdentitySystemsTemplate: BlockTemplate = {
  id: 'IdentitySystems',
  title: 'Identity Systems',
  description: 'Medium-sized block with a mix of serif and sans-serif typography.',
  config: { w: 6, h: 3, minW: 4, minH: 1 },
  component: IdentitySystemsBlock
};
