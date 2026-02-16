
import React from 'react';
import { BlockInstance, IssueContent, MagazineItem } from '../../types';

export const HeroTypePlate: React.FC<{ config: BlockInstance, content: IssueContent, data?: MagazineItem }> = ({ config, content, data }) => {
  const staticData = config.data_binding.static_content || {};
  
  const title = staticData.text || data?.title || content.cover.title;
  const subtitle = staticData.deck || data?.dek || content.cover.deck;
  const label = staticData.label || "Section";
  
  // VARIANT S: Section Header (Minimal)
  if (config.variant === 'S') {
      return (
        <div className="flex flex-col justify-end p-6 border-b border-black h-full min-h-[200px] bg-white">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">{label}</span>
            <h2 className="font-display font-medium text-4xl leading-none uppercase tracking-tight text-black">
                {title}
            </h2>
        </div>
      );
  }

  // VARIANT M: Left Aligned, Editorial
  if (config.variant === 'M') {
      return (
        <div className="flex flex-col justify-center h-full min-h-[400px] p-8 md:p-12 bg-white">
            <h1 className="font-display font-medium text-6xl md:text-7xl leading-[0.9] tracking-tighter uppercase text-black mb-6 max-w-4xl">
              {title}
            </h1>
            {subtitle && (
                <p className="font-sans text-lg md:text-xl font-medium leading-relaxed max-w-xl text-neutral-600 border-l-2 border-accent pl-4">
                    {subtitle}
                </p>
            )}
        </div>
      );
  }

  // VARIANT L: Massive Centered (Default/Cover)
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[500px] md:min-h-[700px] bg-white p-8 md:p-12 text-center">
        <h1 className="font-display font-medium text-[5rem] md:text-[10rem] leading-[0.8] tracking-tighter uppercase text-black max-w-7xl mx-auto break-words text-balance">
          {title}
        </h1>
        {subtitle && (
            <div className="mt-8 max-w-lg mx-auto">
                <p className="font-sans text-sm md:text-base font-bold uppercase tracking-widest text-neutral-400">
                    {subtitle}
                </p>
            </div>
        )}
    </div>
  );
};
