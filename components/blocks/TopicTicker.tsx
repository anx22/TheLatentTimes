
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const TopicTicker: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ content }) => {
  const items = content.ticker || ["SYSTEM ONLINE"];

  return (
    <div className="w-full overflow-hidden border-y border-neutral-100 bg-neutral-50 py-3">
      <div className="animate-marquee whitespace-nowrap flex gap-12 text-[10px] font-condensed font-bold tracking-[0.2em] uppercase text-neutral-600">
        {Array(8).fill(items).flat().map((item, i) => (
           <span key={i} className="flex items-center gap-2">
             <span className="w-1 h-1 bg-accent rounded-full"></span>
             {item}
           </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
};
