
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const MastheadLane: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ config, content }) => {
  // Simulating the "Latest Drop" bar
  const title = content.cover.title || "Introducing 'Nano Banana' & The Agentic Web";
  const isMinimal = config.variant === 'S';

  if (isMinimal) {
      return (
        <div className="w-full flex flex-col md:flex-row h-full items-center border-b border-black">
            <div className="bg-black text-white px-4 py-2 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-widest">Update</span>
            </div>
            <div className="flex-1 px-4 py-2">
                <h3 className="font-sans font-bold text-xs text-black truncate uppercase">{title}</h3>
            </div>
        </div>
      );
  }

  // Variant M (Standard)
  return (
    <div className="w-full flex flex-col md:flex-row h-full">
        {/* Left Label */}
        <div className="bg-black text-white px-6 py-4 md:py-0 flex items-center justify-center md:w-48 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest">Latest Drop</span>
        </div>
        
        {/* Center Title */}
        <div className="flex-1 px-6 py-4 flex items-center border-b md:border-b-0 border-black md:border-r">
            <h3 className="font-display font-medium text-lg md:text-xl text-black truncate">{title}</h3>
        </div>

        {/* Right Action */}
        <div className="px-6 py-4 flex items-center justify-center md:w-64 hover:bg-neutral-50 cursor-pointer transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest underline decoration-1 underline-offset-4">Read Cover Story</span>
        </div>
    </div>
  );
};
