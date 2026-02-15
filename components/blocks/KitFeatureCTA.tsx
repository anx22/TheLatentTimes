
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

interface KitFeatureCTAProps {
    config: BlockInstance;
    data?: MagazineItem;
}

export const KitFeatureCTA: React.FC<KitFeatureCTAProps> = ({ config, data }) => {
    // If no data is bound, show a default promo
    const title = data?.title || "Agentic Patterns V1";
    const desc = data?.dek || "Download the raw source code for the engines powering this issue.";
    const label = data?.tags?.[0] || "Architecture";

    // VARIANT S: Minimal Bar
    if (config.variant === 'S') {
        return (
            <div className="bg-neutral-900 text-white h-full flex flex-col justify-center px-6 py-4 group cursor-pointer hover:bg-black transition-colors border-l border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">DOWNLOAD ⬇</span>
                </div>
            </div>
        );
    }

    // VARIANT L: Expanded Context
    if (config.variant === 'L') {
        return (
            <div className="bg-neutral-900 text-white p-8 h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                <div className="relative z-10">
                    <span className="inline-block px-2 py-1 border border-white/20 text-[9px] font-bold uppercase tracking-widest mb-6">
                        {label}
                    </span>
                    <h3 className="font-display text-4xl md:text-5xl leading-tight mb-6">
                        {title}
                    </h3>
                    <ul className="space-y-3 mb-8">
                        {['Source Code (TS)', 'Prompt Library (JSON)', 'Architecture Diagram (PDF)'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
                                <span className="text-neutral-600">0{i+1}</span>
                                <span className="text-white border-b border-neutral-700 pb-1 w-full">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative z-10 text-right">
                    <button className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                        Access Kit
                    </button>
                </div>
            </div>
        );
    }

    // VARIANT M: Standard Card (Default)
    return (
        <div className="bg-neutral-900 text-white p-8 h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className="relative z-10">
                <span className="inline-block px-2 py-1 border border-white/20 text-[9px] font-bold uppercase tracking-widest mb-4">
                    {label}
                </span>
                <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4 text-balance">
                    {title}
                </h3>
                <p className="font-sans text-sm text-neutral-400 leading-relaxed max-w-sm">
                    {desc}
                </p>
            </div>

            <div className="relative z-10 flex justify-between items-end mt-8 border-t border-white/20 pt-6">
                <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">File Type</span>
                    <span className="text-xs font-bold">JSON / TS</span>
                </div>
                <button className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                    Access
                </button>
            </div>
        </div>
    );
};
