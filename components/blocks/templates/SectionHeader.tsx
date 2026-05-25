import React from 'react';

export const SectionHeaderBlock: React.FC<{ text?: React.ReactNode }> = ({ text }) => (
  <div className="flex items-center justify-center h-full p-12 border-t border-b border-black bg-[#faf9f6] text-black text-center overflow-hidden min-h-0">
    <h2 className="font-serif text-4xl leading-tight max-w-4xl">
      {text || "The New Synthetic Era"}
    </h2>
  </div>
);
