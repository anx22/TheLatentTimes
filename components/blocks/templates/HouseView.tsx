import React from 'react';

export const HouseViewBlock: React.FC = () => (
  <div className="flex flex-col h-full p-10 bg-[#111111] text-white">
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-8">The House View</div>
    <div className="text-white text-6xl font-serif leading-none mb-4">"</div>
    <h3 className="font-serif text-3xl leading-snug mb-12 max-w-md">
      We stopped asking the machine to copy reality. We started asking it to improve it.
    </h3>
    <div className="mt-auto flex justify-between items-end text-[10px] font-mono uppercase tracking-widest text-zinc-400">
      <span>From "The House View"</span>
      <span>P. 34</span>
    </div>
  </div>
);
