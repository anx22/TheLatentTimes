import React from 'react';

export const SyntheticEraBlock: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 border-t border-l border-black bg-white text-black text-center overflow-hidden min-h-0">
    <div className="font-sans font-bold text-2xl tracking-widest uppercase mb-2">The New</div>
    <div className="font-sans font-black text-6xl tracking-tighter uppercase italic">
      Synthetic <span className="not-italic">Era</span>
    </div>
  </div>
);
