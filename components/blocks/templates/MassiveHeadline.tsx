import React from 'react';

export const MassiveHeadlineBlock: React.FC = () => (
  <div className="flex h-full border-b border-black bg-[#faf9f6] text-black">
    <div className="flex-1 p-12 border-r border-black flex items-center justify-center">
      <h1 className="font-serif text-8xl leading-[0.85] tracking-tighter">
        The Engine <br /> of Dreams.
      </h1>
    </div>
    <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
      <h2 className="font-serif text-6xl italic leading-none tracking-tight mb-8">
        Create <span className="not-italic">Everything.</span>
      </h2>
      <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest font-bold">
        <span className="text-black">Subscribe</span>
        <span>Twitter</span>
        <span>Instagram</span>
      </div>
    </div>
  </div>
);
