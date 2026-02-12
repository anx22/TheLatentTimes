
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const BlackManifestoPanel: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ config }) => {
  const text = config.data_binding.static_content?.text || "NO MANIFESTO DATA";
  const label = config.data_binding.static_content?.label || "STATEMENT";

  return (
    <div className="bg-black text-white p-8 md:p-12 min-h-[400px] flex flex-col justify-between group hover:bg-accent transition-colors duration-500">
        <div className="flex justify-between items-start border-b border-white/20 pb-4 mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
            <span className="text-2xl font-display italic">M</span>
        </div>
        
        <p className="font-condensed font-bold text-4xl md:text-6xl leading-[0.9] uppercase tracking-tight max-w-2xl">
            {text}
        </p>

        <div className="mt-12 flex justify-end">
             <button className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors">
                 Read Manifesto
             </button>
        </div>
    </div>
  );
};
