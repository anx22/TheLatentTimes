import React from 'react';

export const IndexListBlock: React.FC = () => (
  <div className="flex flex-col h-full border-t border-l border-black bg-white text-black">
    {[
      { num: '01', title: 'NANO BANANA: THE TINY GIANT MODEL' },
      { num: '02', title: 'AGENTIC ENGINEERING PATTERNS' },
      { num: '03', title: 'SOCIAL HOOK FACTORIES' },
      { num: '04', title: 'IDENTITY SYSTEMS & AVATARS' },
      { num: '05', title: 'SELF-HEALING WORKFLOWS' },
      { num: '06', title: 'THE KLING 3 EFFECT' },
    ].map((item, i) => (
      <div key={i} className="flex flex-col p-4 border-b border-black last:border-b-0">
        <div className="text-[9px] font-mono text-zinc-700 mb-1">{item.num}</div>
        <div className="font-sans text-xs font-bold uppercase tracking-widest">{item.title}</div>
      </div>
    ))}
  </div>
);
