import React from 'react';
import { MagazineItem } from '../../../types';

export const QuoteBlock: React.FC<{ quote?: string, author?: string, data?: MagazineItem }> = ({ quote, author, data }) => (
  <div className="flex flex-col justify-center h-full p-8 border-t border-black bg-white text-black overflow-hidden min-h-0">
    <h3 className="font-serif text-3xl italic leading-tight mb-4">
      "{data?.dek || quote || "The future is already here, it's just not evenly distributed."}"
    </h3>
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-700">
      — {data?.author || author || "William Gibson"}
    </div>
  </div>
);
