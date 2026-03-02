
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';
import { useNewsroom } from '../../hooks/useNewsroom';

export const TopicTicker: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ config }) => {
  const { tickerItems } = useNewsroom();
  const items = tickerItems.length > 0 
    ? tickerItems.map(item => `${item.source}: ${item.title}`)
    : ["THE LATENT TIMES V1.0", "GRID LOCKED", "NOISE FILTER: ACTIVE", "SIGNAL: HIGH"];
    
  const isDark = config.variant === 'M';

  return (
    <div className={`w-full overflow-hidden py-3 flex items-center border-y border-black ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="animate-marquee whitespace-nowrap flex gap-16 text-[10px] font-bold uppercase tracking-[0.15em]">
        {Array(8).fill(items).flat().map((item, i) => (
           <span key={i} className="flex items-center gap-16">
             {item}
             <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}></span>
           </span>
        ))}
      </div>
    </div>
  );
};
