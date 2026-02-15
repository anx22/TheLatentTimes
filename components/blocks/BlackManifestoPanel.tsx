
import React from 'react';
import { BlockInstance, IssueContent } from '../../types';

export const BlackManifestoPanel: React.FC<{ config: BlockInstance, content: IssueContent }> = ({ config }) => {
  const label = config.data_binding.static_content?.label || "SYSTEM";
  const title = config.data_binding.static_content?.text || "The Index";
  const desc = "Access the full library of 2,000+ verified prompts. Filter by media, operation, and maturity.";

  // VARIANT XL: Full Impact, Centered
  if (config.variant === 'XL') {
      return (
        <div className="bg-black text-white p-12 md:p-24 h-full flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-8 border border-accent px-3 py-1 rounded-full">{label}</span>
            <h2 className="font-display font-bold text-6xl md:text-8xl leading-[0.85] tracking-tighter mb-8 max-w-5xl">
                {title}
            </h2>
            <p className="font-sans text-base md:text-lg text-gray-400 max-w-xl leading-relaxed">
                {desc}
            </p>
        </div>
      );
  }

  // VARIANT L: Horizontal Split
  if (config.variant === 'L') {
      return (
        <div className="bg-black text-white h-full flex flex-col md:flex-row">
            <div className="p-8 md:p-12 flex-1 border-b md:border-b-0 md:border-r border-white/20">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 block">{label}</span>
                <h2 className="font-display font-medium text-5xl leading-[0.9] tracking-tight">
                    {title}
                </h2>
            </div>
            <div className="p-8 md:p-12 w-full md:w-1/3 flex flex-col justify-between bg-neutral-900">
                <p className="font-sans text-sm text-gray-400 leading-relaxed">
                    {desc}
                </p>
                <button className="mt-6 self-start text-[10px] font-bold uppercase tracking-widest border-b border-white hover:text-accent hover:border-accent transition-colors">
                    Execute Protocol →
                </button>
            </div>
        </div>
      );
  }

  // VARIANT M: Standard Card (Default)
  return (
    <div className="bg-black text-white p-8 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
            <span className="text-[9px] font-mono text-gray-600">06</span>
        </div>
        
        <div>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-tight">{title}</h2>
            <p className="font-sans text-sm text-gray-400 leading-relaxed max-w-sm">
                {desc}
            </p>
        </div>

        <div className="mt-8">
             <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                 →
             </button>
        </div>
    </div>
  );
};
