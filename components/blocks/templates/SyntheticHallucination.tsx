import React from 'react';

export const SyntheticHallucinationBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-black bg-[#faf9f6] text-black">
    <h2 className="font-serif text-5xl leading-[0.9] tracking-tight mb-4">
      The <br />
      <span className="italic font-light">Synthetic</span> <br />
      Hallucination
    </h2>
    <div className="mt-8 w-48 h-48 mx-auto border border-black p-2">
      <img src="https://picsum.photos/seed/ring/200/200" alt="Ring" className="w-full h-full object-cover grayscale" />
    </div>
  </div>
);
