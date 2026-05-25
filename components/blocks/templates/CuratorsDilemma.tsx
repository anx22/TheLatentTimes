import React from 'react';

export const CuratorsDilemmaBlock: React.FC = () => (
  <div className="flex flex-col h-full p-10 bg-[#111111] text-white border-l border-zinc-800">
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 mb-6">Feature</div>
    <h2 className="font-serif text-6xl leading-none tracking-tight mb-8">
      The Curator's <br /> Dilemma
    </h2>
    <p className="font-sans text-sm text-zinc-400 uppercase tracking-widest mb-12 max-w-xl leading-relaxed">
      When every frame is possible, the only scarce material is judgement. Inside the new economy of taste.
    </p>
    <div className="grid grid-cols-2 gap-12">
      <p className="font-serif text-sm text-zinc-200 leading-relaxed">
        <span className="float-left text-5xl font-serif text-white leading-[0.8] mr-3 mt-1">I</span>
        t begins with a choice. Not of pixels, but of weights. The modern creative director does not hold a camera; they hold a seed. In the ateliers of Milan, screens have replaced sketchpads.
      </p>
      <p className="font-serif text-sm text-zinc-200 leading-relaxed">
        This shift is not merely technical—it is philosophical. If the machine can generate infinite variations of beauty, the value of the image collapses. The only thing that remains scarce is taste. Authority returns to the editor.
      </p>
    </div>
    <div className="mt-auto flex justify-between items-end pt-12">
      <div className="text-[10px] font-mono uppercase tracking-widest font-bold border-b border-white pb-1">Continue Reading</div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Read Time: 9 Min • The New Canon</div>
    </div>
  </div>
);
